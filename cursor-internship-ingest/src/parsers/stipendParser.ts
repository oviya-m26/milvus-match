export interface ParsedStipend {
  min: number | null
  max: number | null
  ambiguous?: boolean
}

const currencyRegex = /₹|inr|rs\.?/gi

const clean = (value: string) =>
  value
    .replace(currencyRegex, "")
    .replace(/per\s*annum|per\s*year|lpa/gi, "")
    .replace(/per\s*(month|mo)/gi, "")
    .replace(/\/\s*month/gi, "")
    .replace(/,/g, "")
    .trim()

const toNumber = (token: string): number | null => {
  if (!token) return null
  const lower = token.toLowerCase()
  if (lower.endsWith("k")) {
    const num = Number(token.slice(0, -1))
    return Number.isFinite(num) ? num * 1000 : null
  }
  if (lower.includes("lakh") || lower.includes("l")) {
    const numeric = Number(lower.replace(/[^\d.]/g, ""))
    return Number.isFinite(numeric) ? numeric * 100000 : null
  }
  const num = Number(lower.replace(/[^\d.]/g, ""))
  return Number.isFinite(num) ? num : null
}

export const parseStipend = (raw?: string | null): ParsedStipend => {
  if (!raw) return { min: null, max: null }
  const rawLower = raw.toLowerCase()
  if (rawLower.includes("usd") || rawLower.includes("$")) {
    return { min: null, max: null, ambiguous: true }
  }
  const normalized = clean(rawLower)
  if (!normalized) return { min: null, max: null }
  const annual =
    rawLower.includes("per annum") ||
    rawLower.includes("per year") ||
    rawLower.includes("pa") ||
    rawLower.includes("lpa") ||
    rawLower.includes("lakh")
  const scale = rawLower.includes("lpa") || rawLower.includes("lakh") ? 100000 : 1
  const parts = normalized.split(/-|to|–/).map((part) => part.trim())
  let min = toNumber(parts[0])
  let max = parts[1] ? toNumber(parts[1]) : min
  if (min) min *= scale
  if (max) max *= scale
  if (annual && min) min = Math.round(min / 12)
  if (annual && max) max = Math.round(max / 12)
  if (min && !max) max = min
  if (!min && !max) {
    return { min: null, max: null, ambiguous: true }
  }
  return { min: min ?? null, max: max ?? null }
}

