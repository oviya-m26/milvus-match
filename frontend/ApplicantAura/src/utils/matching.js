// Mock internships and a simple matching engine for the prototype

export const internships = [
  {
    id: "it-001",
    title: "Data Analyst Intern",
    sector: "IT",
    skillsRequired: ["python", "sql", "excel"],
    location: "Delhi",
    capacity: 5,
    affirmativeTags: ["rural-friendly"],
  },
  {
    id: "it-002",
    title: "Frontend Developer Intern",
    sector: "IT",
    skillsRequired: ["javascript", "react", "html", "css"],
    location: "Bengaluru",
    capacity: 8,
    affirmativeTags: ["women"],
  },
  {
    id: "gov-011",
    title: "Public Policy Research Intern",
    sector: "Public Sector",
    skillsRequired: ["research", "writing", "statistics"],
    location: "Chandigarh",
    capacity: 3,
    affirmativeTags: ["aspirational-district"],
  },
  {
    id: "manu-021",
    title: "Manufacturing Ops Intern",
    sector: "Manufacturing",
    skillsRequired: ["operations", "excel", "lean"],
    location: "Ahmedabad",
    capacity: 6,
    affirmativeTags: ["rural-friendly"],
  },
]

// Weights configurable for the prototype UI if needed
const defaultWeights = {
  skillMatch: 0.5,
  sectorPreference: 0.15,
  locationPreference: 0.15,
  affirmativeAction: 0.1,
  pastParticipationPenalty: 0.1,
}

// candidate example structure used by the matcher
// {
//   skills: ["python", "sql"],
//   preferredSectors: ["IT"],
//   preferredLocations: ["Delhi", "Remote"],
//   categoryTags: ["rural", "women"],
//   hasPastParticipation: false,
// }

export function scoreInternship(candidate, internship, weights = defaultWeights) {
  const { skills = [], preferredSectors = [], preferredLocations = [], categoryTags = [], hasPastParticipation = false } = candidate || {}

  // skill overlap ratio
  const overlap = internship.skillsRequired.filter((s) => skills.includes(s)).length
  const skillRatio = internship.skillsRequired.length ? overlap / internship.skillsRequired.length : 0

  // sector preference
  const sectorScore = preferredSectors.includes(internship.sector) ? 1 : 0

  // location preference (exact match heuristic; could expand to distance/city clusters)
  const locationScore = preferredLocations.includes(internship.location) ? 1 : 0

  // affirmative action: if candidate tags align with internship affirmative tags
  const aff = internship.affirmativeTags || []
  const affMatch = aff.some((t) =>
    (t === "rural-friendly" && categoryTags.includes("rural")) ||
    (t === "aspirational-district" && categoryTags.includes("aspirational-district")) ||
    (t === "women" && categoryTags.includes("women"))
  )
  const affirmativeScore = affMatch ? 1 : 0

  // past participation penalty
  const pastPenalty = hasPastParticipation ? 1 : 0

  // capacity bonus (light): normalize to small bonus 0..0.2 based on capacity bucket
  const capacityBonus = Math.min(0.2, (internship.capacity || 0) / 50)

  const total =
    weights.skillMatch * skillRatio +
    weights.sectorPreference * sectorScore +
    weights.locationPreference * locationScore +
    weights.affirmativeAction * affirmativeScore -
    weights.pastParticipationPenalty * pastPenalty +
    capacityBonus

  return Number(total.toFixed(4))
}

export function getRecommendations(candidate, limit = 5, weights = defaultWeights) {
  const scored = internships.map((i) => ({
    internship: i,
    score: scoreInternship(candidate, i, weights),
    explanation: buildExplanation(candidate, i),
  }))
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}

function buildExplanation(candidate, internship) {
  const skillsHit = internship.skillsRequired.filter((s) => (candidate.skills || []).includes(s))
  const sectorHit = (candidate.preferredSectors || []).includes(internship.sector)
  const locationHit = (candidate.preferredLocations || []).includes(internship.location)
  const tags = internship.affirmativeTags || []

  const reasons = []
  if (skillsHit.length) reasons.push(`skills match: ${skillsHit.join(", ")}`)
  if (sectorHit) reasons.push(`preferred sector: ${internship.sector}`)
  if (locationHit) reasons.push(`preferred location: ${internship.location}`)
  if (tags.length) reasons.push(`affirmative tags: ${tags.join(", ")}`)
  if (!reasons.length) reasons.push("baseline suitability")
  return reasons.join("; ")
}



