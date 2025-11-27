import Fuse from "fuse.js"
import stringSimilarity from "string-similarity"

export interface SkillRecord {
  skill_id: string
  skill_name: string
  skill_category?: string
  aliases?: string[]
}

export interface SkillMapping {
  input: string
  matched: SkillRecord | null
  score: number
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bml\b/g, "machine learning")
    .replace(/\bjs\b/g, "javascript")
    .replace(/\baws\b/g, "amazon web services")

export class SkillMapper {
  private fuse: Fuse<SkillRecord>
  private map = new Map<string, SkillRecord>()

  constructor(records: SkillRecord[]) {
    this.fuse = new Fuse(records, {
      keys: ["skill_name", "aliases"],
      includeScore: true,
      threshold: 0.35,
    })
    for (const rec of records) {
      this.map.set(normalize(rec.skill_name), rec)
      for (const alias of rec.aliases || []) {
        this.map.set(normalize(alias), rec)
      }
    }
  }

  match(raw: string): SkillMapping {
    const key = normalize(raw)
    if (this.map.has(key)) {
      const matched = this.map.get(key)!
      return { input: raw, matched, score: 1 }
    }
    const fuseResult = this.fuse.search(key)[0]
    if (fuseResult && fuseResult.score !== undefined) {
      const score = 1 - fuseResult.score
      if (score >= 0.85) {
        return { input: raw, matched: fuseResult.item, score }
      }
    }
    const best = stringSimilarity.findBestMatch(
      key,
      Array.from(this.map.keys())
    )
    if (best.bestMatch.rating >= 0.85) {
      return { input: raw, matched: this.map.get(best.bestMatch.target)!, score: best.bestMatch.rating }
    }
    return { input: raw, matched: null, score: 0 }
  }
}



