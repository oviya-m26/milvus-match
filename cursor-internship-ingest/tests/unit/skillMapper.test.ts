import { describe, it, expect } from "vitest"
import { SkillMapper } from "../../src/skillMatching/skillMapper.js"

const mapper = new SkillMapper([
  { skill_id: "1", skill_name: "Machine Learning", aliases: ["ml"] },
  { skill_id: "2", skill_name: "Python", aliases: ["py"] },
  { skill_id: "3", skill_name: "Amazon Web Services", aliases: ["aws"] },
])

describe("skillMapper", () => {
  it("matches exact", () => {
    const match = mapper.match("python")
    expect(match.matched?.skill_name).toBe("Python")
  })
  it("matches alias", () => {
    const match = mapper.match("ml")
    expect(match.matched?.skill_name).toBe("Machine Learning")
  })
  it("normalizes abbreviations", () => {
    const match = mapper.match("AWS")
    expect(match.matched?.skill_name).toBe("Amazon Web Services")
  })
  it("handles unknown", () => {
    const match = mapper.match("kubernetes")
    expect(match.matched).toBeNull()
  })
  it("is case insensitive", () => {
    const match = mapper.match("PyThOn")
    expect(match.matched?.skill_name).toBe("Python")
  })
})



