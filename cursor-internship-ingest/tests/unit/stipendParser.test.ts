import { describe, it, expect } from "vitest"
import { parseStipend } from "../../src/parsers/stipendParser.js"

describe("stipendParser", () => {
  const cases = [
    { input: "₹10k-20k /month", min: 10000, max: 20000 },
    { input: "20000 INR per month", min: 20000, max: 20000 },
    { input: "15k", min: 15000, max: 15000 },
    { input: "3 LPA", min: 25000, max: 25000 },
    { input: "₹120000 per annum", min: 10000, max: 10000 },
    { input: "Rs. 5k per month", min: 5000, max: 5000 },
    { input: "USD 1000", min: null, max: null },
    { input: "", min: null, max: null },
    { input: null, min: null, max: null },
    { input: "₹10,000 to 12,000", min: 10000, max: 12000 },
  ]

  cases.forEach(({ input, min, max }) => {
    it(`parses ${input}`, () => {
      const result = parseStipend(input as any)
      expect(result.min).toBe(min)
      expect(result.max).toBe(max)
    })
  })
})



