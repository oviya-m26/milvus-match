import { describe, it, expect } from "vitest"
import { normalizeLocation } from "../../src/parsers/locationParser.js"

describe("locationParser", () => {
  const cases = [
    { input: "Mumbai, India", city: "Mumbai", state: "Maharashtra", country: "India" },
    { input: "Remote - Work from home", city: null, state: null, country: null, mode: "online" },
    { input: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India" },
    { input: "Hyderabad, Telangana", city: "Hyderabad", state: "Telangana", country: "India" },
    { input: "Chennai, IN", city: "Chennai", state: "Tamil Nadu", country: "India" },
    { input: "Kolkata, West Bengal, India", city: "Kolkata", state: "West Bengal", country: "India" },
    { input: "Delhi NCR", city: "Delhi", state: "Delhi", country: "India" },
    { input: "New York, USA", city: null, state: null, country: "United States" },
    { input: "London, UK", city: null, state: null, country: "United Kingdom" },
    { input: "Pune office", city: "Pune", state: "Maharashtra", country: "India" },
  ]

  cases.forEach(({ input, city, state, country, mode }) => {
    it(`parses ${input}`, () => {
      const result = normalizeLocation(input)
      expect(result.city).toBe(city ?? null)
      expect(result.state).toBe(state ?? null)
      expect(result.country).toBe(country ?? null)
      if (mode) expect(result.mode).toBe(mode)
    })
  })
})



