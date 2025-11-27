import crypto from "node:crypto"
import { OpenAI } from "openai"
import { config } from "../config.js"
import { logger } from "../utils/logger.js"

export interface EmbeddingResult {
  vector: number[]
  model: string
}

const MAX_RETRY = 3

export class EmbeddingsClient {
  private provider = config.embeddings
  private openai = config.openAiKey ? new OpenAI({ apiKey: config.openAiKey }) : null

  async embed(texts: string[], model = "text-embedding-3-small"): Promise<EmbeddingResult[]> {
    if (this.provider === "openai" && this.openai) {
      return this.embedOpenAI(texts, model)
    }
    return texts.map((text) => ({
      vector: pseudoVector(text),
      model: "local-fallback",
    }))
  }

  private async embedOpenAI(texts: string[], model: string): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = []
    for (let i = 0; i < texts.length; i += 64) {
      const batch = texts.slice(i, i + 64)
      let attempts = 0
      while (attempts < MAX_RETRY) {
        try {
          const resp = await this.openai!.embeddings.create({
            input: batch,
            model,
          })
          resp.data.forEach((item) =>
            results.push({ vector: item.embedding as number[], model })
          )
          break
        } catch (error) {
          attempts++
          const wait = 2 ** attempts * 500
          logger.warn(`OpenAI embedding retry ${attempts}: ${(error as Error).message}`)
          await new Promise((resolve) => setTimeout(resolve, wait))
          if (attempts === MAX_RETRY) {
            logger.error("Falling back to pseudo vectors for remaining batch.")
            batch.forEach((text) =>
              results.push({ vector: pseudoVector(text), model: "local-fallback" })
            )
          }
        }
      }
    }
    return results
  }
}

const pseudoVector = (text: string): number[] => {
  const hash = crypto.createHash("sha256").update(text).digest()
  const vector = []
  for (let i = 0; i < 256; i++) {
    const value = hash[i % hash.length]
    vector.push((value / 255) * 2 - 1)
  }
  return vector
}



