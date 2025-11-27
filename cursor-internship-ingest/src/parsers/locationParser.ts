const indianStates = [
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa",
  "gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala",
  "madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
  "odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura",
  "uttar pradesh","uttarakhand","west bengal","delhi","jammu and kashmir","ladakh"
]

const metroCities = [
  "mumbai","delhi","bengaluru","bangalore","hyderabad","chennai","kolkata","pune"
]

export interface ParsedLocation {
  city: string | null
  state: string | null
  country: string | null
  mode?: "online" | "onsite" | "hybrid"
}

export const normalizeLocation = (input?: string | null): ParsedLocation => {
  if (!input) {
    return { city: null, state: null, country: null }
  }
  const text = input.toLowerCase()
  if (text.includes("remote") || text.includes("work from home")) {
    return { city: null, state: null, country: null, mode: "online" }
  }
  let city: string | null = null
  let state: string | null = null
  let country: string | null = null
  for (const s of indianStates) {
    if (text.includes(s)) {
      state = titleCase(s)
      country = "India"
      break
    }
  }
  for (const cityName of metroCities) {
    if (text.includes(cityName)) {
      city = titleCase(cityName)
      if (!state) state = guessStateFromCity(cityName)
      country = "India"
      break
    }
  }
  if (!country) {
    if (text.includes("india")) country = "India"
    else if (text.includes("usa") || text.includes("united states")) country = "United States"
    else if (text.includes("uk") || text.includes("united kingdom")) country = "United Kingdom"
    else if (text.includes("canada")) country = "Canada"
  }
  return { city, state, country }
}

const guessStateFromCity = (city: string): string | null => {
  switch (city) {
    case "mumbai":
      return "Maharashtra"
    case "delhi":
      return "Delhi"
    case "bengaluru":
    case "bangalore":
      return "Karnataka"
    case "hyderabad":
      return "Telangana"
    case "chennai":
      return "Tamil Nadu"
    case "kolkata":
      return "West Bengal"
    case "pune":
      return "Maharashtra"
    default:
      return null
  }
}

const titleCase = (value: string) =>
  value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")



