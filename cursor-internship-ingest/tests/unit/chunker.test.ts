import { describe, it, expect } from "vitest"
import { chunkText } from "../../src/chunks/chunker.js"
import { SkillMapper } from "../../src/skillMatching/skillMapper.js"

const mapper = new SkillMapper([{ skill_id: "1", skill_name: "Python", aliases: [] }])

describe("chunker", () => {
  it("creates overlapping chunks", () => {
    const text = "Python ".repeat(400)
    const chunks = chunkText(text, { sourceType: "listing", sourceId: "L1", mapper })
    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0].chunk_index).toBe(0)
    expect(chunks[0].top_skills).toContain("Python")
  })
})



