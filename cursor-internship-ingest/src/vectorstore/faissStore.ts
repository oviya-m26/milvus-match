import fs from "node:fs"
import path from "node:path"
import { config } from "../config.js"

export interface VectorRecord {
  chunk_id: string
  vector: number[]
  metadata: Record<string, unknown>
}

const indexFile = path.join(config.vectorDir, "index.json")

export const saveVectors = (vectors: VectorRecord[]) => {
  const existing: VectorRecord[] = fs.existsSync(indexFile)
    ? JSON.parse(fs.readFileSync(indexFile, "utf8"))
    : []
  existing.push(...vectors)
  fs.writeFileSync(indexFile, JSON.stringify(existing, null, 2))
}

export const queryVectors = (
  query: number[],
  topK = 5,
  filter?: { country?: string; mode?: string }
) => {
  if (!fs.existsSync(indexFile)) return []
  const vectors: VectorRecord[] = JSON.parse(fs.readFileSync(indexFile, "utf8"))
  return vectors
    .filter((record) => {
      if (filter?.country && record.metadata.location_country !== filter.country) return false
      if (filter?.mode && record.metadata.mode !== filter.mode) return false
      return true
    })
    .map((record) => ({
      record,
      score: cosineSimilarity(query, record.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i]
    normA += a[i] ** 2
    normB += b[i] ** 2
  }
  if (!normA || !normB) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}



