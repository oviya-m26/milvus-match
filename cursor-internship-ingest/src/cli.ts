#!/usr/bin/env node
import { Command } from "commander"
import fs from "node:fs"
import path from "node:path"
import Papa from "papaparse"
import { config, datasets, ensureFolders } from "./config.js"
import { downloadDataset } from "./download/kaggleDownloader.js"
import { loadStructuredFiles } from "./loaders/csvLoader.js"
import { normalizeListings } from "./normalizers/listingsNormalizer.js"
import { normalizeCompanies } from "./normalizers/companiesNormalizer.js"
import { normalizeSkills } from "./normalizers/skillsNormalizer.js"
import { normalizeResumes } from "./normalizers/resumesNormalizer.js"
import { SkillMapper } from "./skillMatching/skillMapper.js"
import { chunkText } from "./chunks/chunker.js"
import { EmbeddingsClient } from "./embeddings/embeddingsClient.js"
import { saveVectors } from "./vectorstore/faissStore.js"
import { getDb, saveDb } from "./db/sqliteClient.js"
import { writeReport } from "./report/reportGenerator.js"
import { logger } from "./utils/logger.js"

const program = new Command()

const ensureDirs = () => {
  ensureFolders().forEach((folder) => {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
  })
}

const writeCsv = (file: string, rows: any[]) => {
  const csv = Papa.unparse(rows)
  fs.writeFileSync(file, csv)
}

const parquetPath = path.join(config.cleanDir, "chunks.parquet")
const chunksCsvPath = path.join(config.cleanDir, "chunks.csv")

const state = {
  datasets: {} as Record<string, { rowsRead: number; rowsIngested: number; duplicates: number }>,
  parseFailures: { locations: 0, stipend: 0, postedDate: 0 },
  skillMappings: [] as string[],
  locationSamples: [] as string[],
  sampleListings: [] as any[],
}
const stateFile = path.join(config.dataDir, "reports", "state.json")

const persistState = () => {
  const dir = path.dirname(stateFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2))
}

const loadState = () => {
  if (!fs.existsSync(stateFile)) return
  const saved = JSON.parse(fs.readFileSync(stateFile, "utf8"))
  state.datasets = saved.datasets || {}
  state.parseFailures = saved.parseFailures || state.parseFailures
  state.skillMappings = saved.skillMappings || []
  state.locationSamples = saved.locationSamples || []
  state.sampleListings = saved.sampleListings || []
}

program
  .name("cursor-internship-ingest")
  .description("AI-powered internship ingestion CLI")

program
  .command("download")
  .description("Download all Kaggle datasets")
  .action(async () => {
    ensureDirs()
    for (const dataset of datasets) {
      await downloadDataset(dataset)
    }
    logger.info("Download step complete.")
  })

program
  .command("clean")
  .description("Normalize and clean datasets")
  .action(async () => {
    ensureDirs()
    const listingRows: any[] = []
    const skillRows: any[] = []
    const companyRows: any[] = []
    const resumeRows: any[] = []

    for (const dataset of datasets) {
      const folder = path.join(config.rawDir, dataset.alias)
      const rows = await loadStructuredFiles(folder)
      state.datasets[dataset.alias] = {
        rowsRead: rows.length,
        rowsIngested: rows.length,
        duplicates: 0,
      }
      switch (dataset.type) {
        case "listings":
          listingRows.push(...rows)
          break
        case "skills":
          skillRows.push(...rows)
          break
        case "companies":
          companyRows.push(...rows)
          break
        case "resumes":
          resumeRows.push(...rows)
          break
      }
    }

    const skills = normalizeSkills(skillRows)
    const skillMapper = new SkillMapper(skills)
    const { listings, mappings } = normalizeListings(listingRows, skills)
    const dedupedListings = deduplicateListings(listings)
    mappings.forEach((sample) => state.skillMappings.push(sample))

    const companies = normalizeCompanies(companyRows)
    const resumes = normalizeResumes(resumeRows)

    writeCsv(path.join(config.cleanDir, "skills.csv"), skills)
    writeCsv(path.join(config.cleanDir, "companies.csv"), companies)
    writeCsv(path.join(config.cleanDir, "resumes.csv"), resumes)
    writeCsv(path.join(config.cleanDir, "listings.csv"), dedupedListings)

    const chunks = buildChunks(dedupedListings, resumes, skillMapper)
    writeCsv(chunksCsvPath, chunks)
    fs.writeFileSync(parquetPath, JSON.stringify(chunks, null, 2))
    state.sampleListings = dedupedListings.slice(0, 20)
    persistState()
    logger.info("Clean step complete.")
  })

program
  .command("embed")
  .description("Create embeddings and store vector index")
  .action(async () => {
    ensureDirs()
    if (!fs.existsSync(chunksCsvPath)) {
      logger.error("Chunks file missing. Run clean first.")
      return
    }
    const text = fs.readFileSync(chunksCsvPath, "utf8")
    const rows = Papa.parse(text, { header: true }).data as any[]
    const client = new EmbeddingsClient()
    const vectors = await client.embed(rows.map((row) => row.text))
    const records = rows.map((row, idx) => ({
      chunk_id: row.chunk_id,
      vector: vectors[idx]?.vector || [],
      metadata: {
        ...row,
        skills: row.top_skills,
      },
    }))
    saveVectors(records)
    logger.info(`Stored ${records.length} vectors.`)
  })

program
  .command("load-db")
  .description("Load normalized tables into SQLite")
  .action(async () => {
    ensureDirs()
    const db = await getDb()
    const loadTable = (file: string, table: string, columns: string[]) => {
      const filePath = path.join(config.cleanDir, file)
      if (!fs.existsSync(filePath)) return
      const csv = Papa.parse(fs.readFileSync(filePath, "utf8"), { header: true })
      const rows = csv.data as any[]
      rows.forEach((row) => {
        const values = columns.map((col) => (row[col] !== undefined ? row[col] : null))
        const placeholders = columns.map(() => "?").join(",")
        db.run(
          `INSERT OR REPLACE INTO ${table} (${columns.join(",")}) VALUES (${placeholders})`,
          values
        )
      })
    }
    loadTable("listings.csv", "listings", [
      "listing_id",
      "title",
      "company_id",
      "company_name",
      "location_city",
      "location_state",
      "location_country",
      "skills",
      "stipend_min_inr",
      "stipend_max_inr",
      "duration_weeks",
      "mode",
      "category",
      "description",
      "application_url",
      "posted_date",
      "source",
    ])
    loadTable("companies.csv", "companies", [
      "company_id",
      "company_name",
      "industry",
      "headquarters_city",
      "headquarters_country",
      "company_url",
      "size_bucket",
      "source",
    ])
    loadTable("skills.csv", "skills", [
      "skill_id",
      "skill_name",
      "skill_normalized",
      "skill_category",
      "aliases",
      "source",
    ])
    loadTable("resumes.csv", "resumes", [
      "user_id",
      "name",
      "education",
      "experience_years",
      "skills",
      "projects",
      "raw_resume_text",
      "source",
    ])
    loadTable("chunks.csv", "chunks", [
      "chunk_id",
      "source_type",
      "source_id",
      "chunk_index",
      "text",
      "tokens_estimate",
      "top_skills",
      "location_city",
      "location_state",
      "location_country",
      "posted_date",
      "source",
    ])
    saveDb(db)
    logger.info("SQLite load complete.")
  })

program
  .command("report")
  .description("Generate report.json")
  .action(() => {
    ensureDirs()
    loadState()
    writeReport({
      datasets: state.datasets,
      parseFailures: state.parseFailures,
      skillMappings: state.skillMappings.slice(0, 20),
      locationSamples: state.locationSamples.slice(0, 20),
      sampleListings: state.sampleListings,
    })
    logger.info("Report generated.")
  })

program
  .command("all")
  .description("Run full pipeline")
  .action(async () => {
    await program.parseAsync(["node", "cli", "download"])
    await program.parseAsync(["node", "cli", "clean"])
    await program.parseAsync(["node", "cli", "embed"])
    await program.parseAsync(["node", "cli", "load-db"])
    await program.parseAsync(["node", "cli", "report"])
  })

program.parseAsync(process.argv)

const deduplicateListings = (rows: any[]) => {
  const map = new Map<string, any>()
  rows.forEach((row) => {
    const key =
      row.application_url ||
      `${row.title}-${row.company_name}-${row.location_city || ""}-${row.location_state || ""}`
    if (!map.has(key)) map.set(key, row)
  })
  return Array.from(map.values())
}

const buildChunks = (listings: any[], resumes: any[], mapper: SkillMapper) => {
  const chunks: any[] = []
  listings.forEach((listing) => {
    const listingChunks = chunkText(listing.description || "", {
      sourceType: "listing",
      sourceId: listing.listing_id,
      mapper,
      location: {
        city: listing.location_city,
        state: listing.location_state,
        country: listing.location_country,
      },
      postedDate: listing.posted_date,
      source: listing.source,
    })
    listingChunks.forEach((chunk) =>
      chunks.push({
        ...chunk,
        top_skills: JSON.stringify(chunk.top_skills),
      })
    )
  })
  resumes.forEach((resume) => {
    const resumeChunks = chunkText(resume.raw_resume_text || "", {
      sourceType: "resume",
      sourceId: resume.user_id,
      mapper,
    })
    resumeChunks.forEach((chunk) =>
      chunks.push({
        ...chunk,
        top_skills: JSON.stringify(chunk.top_skills),
      })
    )
  })
  return chunks
}

