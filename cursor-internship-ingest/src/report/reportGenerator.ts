import fs from "node:fs"
import path from "node:path"
import { config } from "../config.js"

export interface ReportData {
  datasets: Record<string, { rowsRead: number; rowsIngested: number; duplicates: number }>
  parseFailures: {
    locations: number
    stipend: number
    postedDate: number
  }
  skillMappings: string[]
  locationSamples: string[]
  sampleListings: any[]
}

const reportFile = path.join(config.dataDir, "reports", "report.json")

export const writeReport = (data: ReportData) => {
  const dir = path.dirname(reportFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(reportFile, JSON.stringify(data, null, 2))
}

export const readReport = (): ReportData | null => {
  if (!fs.existsSync(reportFile)) return null
  return JSON.parse(fs.readFileSync(reportFile, "utf8"))
}



