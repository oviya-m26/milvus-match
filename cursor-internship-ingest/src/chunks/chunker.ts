import { SkillMapper } from "../skillMatching/skillMapper.js"

export interface Chunk {
  chunk_id: string
  source_type: string
  source_id: string
  chunk_index: number
  text: string
  tokens_estimate: number
  top_skills: string[]
  location_city?: string | null
  location_state?: string | null
  location_country?: string | null
  posted_date?: string | null
  source?: string | null
}

const sanitize = (text: string) =>
  text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim()

export const chunkText = (
  text: string,
  opts: {
    sourceType: string
    sourceId: string
    mapper?: SkillMapper
    skillsUniverse?: string[]
    location?: { city?: string | null; state?: string | null; country?: string | null }
    postedDate?: string | null
    source?: string | null
  }
): Chunk[] => {
  const cleaned = sanitize(text)
  const size = 1500
  const overlap = 300
  const chunks: Chunk[] = []
  let index = 0
  let cursor = 0
  while (cursor < cleaned.length) {
    const slice = cleaned.slice(cursor, cursor + size)
    const chunkTextValue = slice.trim()
    if (chunkTextValue) {
      const tokens = Math.ceil(chunkTextValue.length / 4)
      const topSkills = extractSkills(chunkTextValue, opts.mapper)
      chunks.push({
        chunk_id: `${opts.sourceId}-${index}`,
        source_type: opts.sourceType,
        source_id: opts.sourceId,
        chunk_index: index,
        text: chunkTextValue,
        tokens_estimate: tokens,
        top_skills: topSkills,
        location_city: opts.location?.city || null,
        location_state: opts.location?.state || null,
        location_country: opts.location?.country || null,
        posted_date: opts.postedDate || null,
        source: opts.source || null,
      })
      index++
    }
    cursor += size - overlap
  }
  return chunks
}

const extractSkills = (text: string, mapper?: SkillMapper): string[] => {
  if (!mapper) return []
  const tokens = text.split(/[,.;\s]+/).filter(Boolean)
  const counts = new Map<string, number>()
  for (const token of tokens) {
    const { matched } = mapper.match(token)
    if (matched) {
      const name = matched.skill_name
      counts.set(name, (counts.get(name) || 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill)
}



