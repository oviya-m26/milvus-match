import fs from "node:fs"
import path from "node:path"
import Papa from "papaparse"
import { parse as parseCsv } from "fast-csv"
import { logger } from "../utils/logger.js"

export type GenericRow = Record<string, unknown>

const readFileSync = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject(err)
      else resolve(data.toString("utf8"))
    })
  })

export const loadStructuredFiles = async (dir: string): Promise<GenericRow[]> => {
  const rows: GenericRow[] = []
  if (!fs.existsSync(dir)) {
    logger.warn(`Directory ${dir} missing.`)
    return rows
  }
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const absolute = path.join(dir, file)
    if (file.endsWith(".csv")) {
      try {
        const text = await readFileSync(absolute)
        const parsed = Papa.parse<GenericRow>(text, { header: true, skipEmptyLines: true })
        rows.push(...parsed.data)
      } catch (error) {
        logger.error(`Failed reading CSV ${file}: ${(error as Error).message}`)
      }
    } else if (file.endsWith(".json")) {
      const json = JSON.parse(fs.readFileSync(absolute, "utf8"))
      if (Array.isArray(json)) rows.push(...json)
    }
  }
  return rows
}



