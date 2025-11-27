import fs from "node:fs"
import path from "node:path"
import initSqlJs from "sql.js"
import { config } from "../config.js"

export const getDb = async () => {
  const dir = path.dirname(config.dbPath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const SQL = await initSqlJs()
  let db
  if (fs.existsSync(config.dbPath)) {
    const fileBuffer = fs.readFileSync(config.dbPath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }
  createTables(db)
  return db
}

const createTables = (db: any) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS listings (
      listing_id TEXT PRIMARY KEY,
      title TEXT,
      company_id TEXT,
      company_name TEXT,
      location_city TEXT,
      location_state TEXT,
      location_country TEXT,
      skills TEXT,
      stipend_min_inr REAL,
      stipend_max_inr REAL,
      duration_weeks REAL,
      mode TEXT,
      category TEXT,
      description TEXT,
      application_url TEXT,
      posted_date TEXT,
      source TEXT
    );
    CREATE TABLE IF NOT EXISTS companies (
      company_id TEXT PRIMARY KEY,
      company_name TEXT,
      industry TEXT,
      headquarters_city TEXT,
      headquarters_country TEXT,
      company_url TEXT,
      size_bucket TEXT,
      source TEXT
    );
    CREATE TABLE IF NOT EXISTS skills (
      skill_id TEXT PRIMARY KEY,
      skill_name TEXT,
      skill_normalized TEXT,
      skill_category TEXT,
      aliases TEXT,
      source TEXT
    );
    CREATE TABLE IF NOT EXISTS resumes (
      user_id TEXT PRIMARY KEY,
      name TEXT,
      education TEXT,
      experience_years REAL,
      skills TEXT,
      projects TEXT,
      raw_resume_text TEXT,
      source TEXT
    );
    CREATE TABLE IF NOT EXISTS chunks (
      chunk_id TEXT PRIMARY KEY,
      source_type TEXT,
      source_id TEXT,
      chunk_index INTEGER,
      text TEXT,
      tokens_estimate INTEGER,
      top_skills TEXT,
      location_city TEXT,
      location_state TEXT,
      location_country TEXT,
      posted_date TEXT,
      source TEXT
    );
  `)
}

export const saveDb = (db: any) => {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(config.dbPath, buffer)
}

