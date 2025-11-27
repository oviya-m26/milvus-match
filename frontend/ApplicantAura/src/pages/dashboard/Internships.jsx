import React, { useMemo, useState } from "react"
import { JobContainer, SearchBarFilter } from "../../components"
import { getRecommendations } from "../../utils/matching"

const Internships = () => {
  const [skills, setSkills] = useState("")
  const [preferredSectors, setPreferredSectors] = useState("")
  const [preferredLocations, setPreferredLocations] = useState("")
  const [categoryTags, setCategoryTags] = useState("")
  const [hasPastParticipation, setHasPastParticipation] = useState(false)

  const candidate = useMemo(
    () => ({
      skills: skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      preferredSectors: preferredSectors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferredLocations: preferredLocations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      categoryTags: categoryTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      hasPastParticipation,
    }),
    [skills, preferredSectors, preferredLocations, categoryTags, hasPastParticipation]
  )

  const recommendations = getRecommendations(candidate, 5)

  return (
    <>
      <div className="px-5 md:px-8 py-6">
        <h1 className="text-3xl font-bold text-black mb-6">AI Matchmaking Prototype</h1>
        <p className="text-gray-600 mb-6">Enter your details to see recommended internships based on skills, preferences, and affirmative action.</p>
      </div>
      <div className="px-5 md:px-8 grid gap-6 md:grid-cols-2">
        <div className=" rounded-xl bg-white p-4 shadow ">
          <h3 className=" mb-2 text-lg font-semibold ">Candidate Profile</h3>
          <div className=" space-y-4 ">
            <div>
              <label className=" block text-sm font-medium text-gray-700 ">Skills (comma-separated)</label>
              <input value={skills} onChange={(e) => setSkills(e.target.value)} className=" mt-1 w-full rounded-md border border-gray-300 p-2 " placeholder="python, sql, excel" />
            </div>
            <div>
              <label className=" block text-sm font-medium text-gray-700 ">Preferred Sectors</label>
              <input value={preferredSectors} onChange={(e) => setPreferredSectors(e.target.value)} className=" mt-1 w-full rounded-md border border-gray-300 p-2 " placeholder="IT, Manufacturing" />
            </div>
            <div>
              <label className=" block text-sm font-medium text-gray-700 ">Preferred Locations</label>
              <input value={preferredLocations} onChange={(e) => setPreferredLocations(e.target.value)} className=" mt-1 w-full rounded-md border border-gray-300 p-2 " placeholder="Delhi, Bengaluru" />
            </div>
            <div>
              <label className=" block text-sm font-medium text-gray-700 ">Affirmative Tags</label>
              <input value={categoryTags} onChange={(e) => setCategoryTags(e.target.value)} className=" mt-1 w-full rounded-md border border-gray-300 p-2 " placeholder="rural, women, aspirational-district" />
            </div>
            <div className=" flex items-center space-x-2 ">
              <input id="pp" type="checkbox" checked={hasPastParticipation} onChange={(e) => setHasPastParticipation(e.target.checked)} />
              <label htmlFor="pp" className=" text-sm text-gray-700 ">Past participation</label>
            </div>
          </div>
        </div>
        <div className=" rounded-xl bg-white p-4 shadow ">
          <h3 className=" mb-2 text-lg font-semibold ">Recommended Internships</h3>
          <ul className=" divide-y ">
            {recommendations.map(({ internship, score, explanation }) => (
              <li key={internship.id} className=" py-3 ">
                <div className=" flex items-start justify-between ">
                  <div>
                    <p className=" font-medium text-gray-900 ">{internship.title}</p>
                    <p className=" text-sm text-gray-600 ">{internship.sector} • {internship.location} • capacity {internship.capacity}</p>
                    <p className=" text-xs text-gray-500 ">Requires: {internship.skillsRequired.join(", ")}</p>
                    <p className=" mt-1 text-xs text-gray-700 ">Why: {explanation}</p>
                  </div>
                  <div className=" ml-4 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ">{score}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Internships
