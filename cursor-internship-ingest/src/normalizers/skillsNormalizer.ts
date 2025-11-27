import { SkillRecord } from "../skillMatching/skillMapper.js"

export const normalizeSkills = (rows: Record<string, any>[]): SkillRecord[] => {
  return rows.map((row, index) => ({
    skill_id: row.skill_id || row.id || `skill-${index}`,
    skill_name: row.skill_name || row.name || row.skill || "unknown",
    skill_category: row.skill_category || row.category || null,
    aliases: parseAliases(row.aliases),
  }))
}

const parseAliases = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return value.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}



