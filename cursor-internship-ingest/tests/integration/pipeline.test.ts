import { describe, it, expect } from "vitest"
import fs from "node:fs"
import path from "node:path"
import { chunkText } from "../../src/chunks/chunker.js"
import { SkillMapper } from "../../src/skillMatching/skillMapper.js"
import { EmbeddingsClient } from "../../src/embeddings/embeddingsClient.js"
import { queryVectors, saveVectors } from "../../src/vectorstore/faissStore.js"

describe("integration pipeline sample", () => {
  it("chunks and queries sample resume", async () => {
    const listingsPath = path.resolve(process.cwd(), "data", "samples", "listings_sample.csv")
    const listingsCsv = fs.readFileSync(listingsPath, "utf8")
    expect(listingsCsv.length).toBeGreaterThan(0)
    const mapper = new SkillMapper([{ skill_id: "1", skill_name: "Python", aliases: ["py"] }])
    const chunks = chunkText("Python intern role building dashboards", {
      sourceType: "listing",
      sourceId: "test",
      mapper,
    })
    const embed = new EmbeddingsClient()
    const vectors = await embed.embed(chunks.map((c) => c.text))
    saveVectors(chunks.map((chunk, idx) => ({
      chunk_id: chunk.chunk_id,
      vector: vectors[idx].vector,
      metadata: chunk,
    })))
    const resume = "I love python and dashboards"
    const [resumeVector] = await embed.embed([resume])
    const results = queryVectors(resumeVector.vector, 1)
    expect(results.length).toBeGreaterThan(0)
  })
})

