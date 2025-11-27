import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { config, DatasetSpec } from "../config.js"
import { logger } from "../utils/logger.js"
import { setTimeout as delay } from "node:timers/promises"

const MAX_RETRIES = 3

const sampleMap: Record<string, string> = {
  listings: "data/samples/listings_sample.csv",
  skills: "data/samples/skills_sample.csv",
  resumes: "data/samples/resumes_sample.csv",
  companies: "data/samples/companies_sample.csv",
}

const copySample = (dataset: DatasetSpec) => {
  const sample = sampleMap[dataset.type]
  if (!sample) return
  const src = path.resolve(process.cwd(), sample)
  const destDir = path.join(config.rawDir, dataset.alias)
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, path.join(destDir, path.basename(sample)))
  logger.warn(`Fell back to bundled sample for ${dataset.alias}`)
}

export const downloadDataset = async (dataset: DatasetSpec) => {
  const destDir = path.join(config.rawDir, dataset.alias)
  fs.mkdirSync(destDir, { recursive: true })
  const envAvailable = config.kaggle.username && config.kaggle.key
  if (!envAvailable) {
    logger.warn("Kaggle credentials missing; using sample data.")
    copySample(dataset)
    return
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Downloading ${dataset.slug} (attempt ${attempt})`)
      execSync(
        `kaggle datasets download -d ${dataset.slug} -p "${destDir}" --force`,
        {
          stdio: "inherit",
          env: {
            ...process.env,
            KAGGLE_USERNAME: config.kaggle.username!,
            KAGGLE_KEY: config.kaggle.key!,
          },
        }
      )
      // unzip
      const files = fs.readdirSync(destDir).filter((f) => f.endsWith(".zip"))
      for (const file of files) {
        execSync(`powershell -Command "Expand-Archive -Path '${path.join(destDir, file)}' -DestinationPath '${destDir}' -Force"`)
        fs.unlinkSync(path.join(destDir, file))
      }
      return
    } catch (error) {
      logger.error(`Download failed: ${(error as Error).message}`)
      if (attempt === MAX_RETRIES) {
        logger.error(`Giving up on ${dataset.alias}; copying sample.`)
        copySample(dataset)
      } else {
        await delay(2 ** attempt * 500)
      }
    }
  }
}

