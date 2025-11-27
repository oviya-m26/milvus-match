import { normalizeLocation } from "../parsers/locationParser.js"
import { parseStipend } from "../parsers/stipendParser.js"
import { SkillMapper, SkillRecord } from "../skillMatching/skillMapper.js"

export interface ListingRow {
  listing_id: string
  title: string
  company_id: string | null
  company_name: string
  location_city: string | null
  location_state: string | null
  location_country: string | null
  skills: string[]
  stipend_min_inr: number | null
  stipend_max_inr: number | null
  duration_weeks: number | null
  mode: string | null
  category: string | null
  description: string
  application_url: string | null
  posted_date: string | null
  source: string | null
}

export const normalizeListings = (
  rows: Record<string, any>[],
  skillRecords: SkillRecord[]
): { listings: ListingRow[]; mappings: string[] } => {
  const mapper = new SkillMapper(skillRecords)
  const normalized: ListingRow[] = []
  const mappingSamples: string[] = []
  rows.forEach((row, index) => {
    const title = row.title || row.role || row.jobtitle
    const company = row.company_name || row.company || row.employer || "Unknown"
    const location = row.location || row.city || row.place
    if (!title || !company) return
    const loc = normalizeLocation(location)
    const stipend = parseStipend(row.stipend || row.salary)
    const listedSkillsRaw: string[] = parseSkills(row.skills || row.skill || "")
    const mappedSkills = listedSkillsRaw
      .map((skill) => {
        const match = mapper.match(skill)
        if (match.matched) {
          mappingSamples.push(`${skill} -> ${match.matched.skill_name}`)
          return match.matched.skill_name
        }
        return skill
      })
      .filter(Boolean)
    normalized.push({
      listing_id: row.listing_id || row.id || `listing-${index}`,
      title: title.toString(),
      company_id: row.company_id || null,
      company_name: company.toString(),
      location_city: loc.city,
      location_state: loc.state,
      location_country: loc.country || (loc.mode === "online" ? "Remote" : null),
      skills: mappedSkills,
      stipend_min_inr: stipend.min,
      stipend_max_inr: stipend.max,
      duration_weeks: inferDuration(row.duration),
      mode: loc.mode || row.mode || null,
      category: row.category || row.domain || null,
      description: (row.description || row.job_description || "").toString(),
      application_url: row.application_url || row.url || null,
      posted_date: row.posted_date || row.posted || null,
      source: row.source || row.dataset || "unknown",
    })
  })
  return { listings: normalized, mappings: mappingSamples.slice(0, 25) }
}

const parseSkills = (value: string | string[]) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch {
    // not json
  }
  return value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
}

const inferDuration = (value?: string | number) => {
  if (!value) return null
  if (typeof value === "number") return value
  const match = value.match(/\d+/)
  return match ? Number(match[0]) : null
}



