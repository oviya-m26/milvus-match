#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { config } from "../src/config.js"
import { EmbeddingsClient } from "../src/embeddings/embeddingsClient.js"
import { queryVectors } from "../src/vectorstore/faissStore.js"

const args = process.argv.slice(2)
const textIndex = args.indexOf("--text")
const text = textIndex !== -1 ? args[textIndex + 1] : ""
const topKIndex = args.indexOf("--topk")
const topk = topKIndex !== -1 ? Number(args[topKIndex + 1]) : 5
const filterIndex = args.indexOf("--filter")
const filter = filterIndex !== -1 ? args[filterIndex + 1] : ""

if (!text) {
  console.error("Usage: node scripts/query_vector.js --text \"query\" --topk 5 --filter country=India")
  process.exit(1)
}

const parsedFilter: Record<string, string> = {}
if (filter) {
  filter.split(",").forEach((pair) => {
    const [key, value] = pair.split("=")
    if (key && value) parsedFilter[key.trim()] = value.trim()
  })
}

const run = async () => {
  const client = new EmbeddingsClient()
  const [result] = await client.embed([text])
  const matches = queryVectors(result.vector, topk, {
    country: parsedFilter.country,
    mode: parsedFilter.mode,
  })
  console.log(JSON.stringify(matches, null, 2))
}

run()



