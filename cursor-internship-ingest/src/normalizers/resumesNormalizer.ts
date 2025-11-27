export interface ResumeRow {
  user_id: string
  name: string
  education: string[]
  experience_years: number | null
  skills: string[]
  projects: string | null
  raw_resume_text: string
  source: string | null
}

export const normalizeResumes = (rows: Record<string, any>[]): ResumeRow[] => {
  return rows.map((row, index) => ({
    user_id: row.user_id || row.id || `resume-${index}`,
    name: row.name || row.candidate || "Unknown",
    education: parseList(row.education || row.educational_details),
    experience_years: parseFloat(row.experience_years) || null,
    skills: parseList(row.skills).map((s) => s.toLowerCase()),
    projects: row.projects || row.project || null,
    raw_resume_text: row.raw_resume_text || row.summary || "",
    source: row.source || row.dataset || "unknown",
  }))
}

const parseList = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((entry) => entry.toString())
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map((entry) => entry.toString())
    } catch {
      return value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    }
  }
  return [value.toString()]
}



