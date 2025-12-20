import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import customFetch from "../../utils/axios"
import { JobCard, Loading, NoData } from "../../components"
import { toast } from "react-hot-toast"

const Internships = () => {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSelector((store) => store.user)

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true)
      const { data } = await customFetch.get("/matching/recommendations?limit=6")
      setRecommendations(data.recommendations || [])
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Unable to fetch matches")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.token && user?.role === "applicant") {
      fetchRecommendations()
    }
  }, [user?.token, user?.role])

  if (user?.role !== "applicant") {
    return (
      <section className="px-5 py-16 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Applicant-only feature
        </h2>
        <p className="mt-3 text-gray-600">
          Switch to an applicant account to view AI-powered internship
          recommendations.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-8 px-5 py-6 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">AI Matchmaking</h1>
          <p className="text-gray-600">
            Personalized recommendations powered by SBERT embeddings, Milvus similarity search and reservation filters.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRecommendations}
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          disabled={isLoading}
        >
          Refresh matches
        </button>
      </div>

      {isLoading && <Loading className="h-40" />}

      {!isLoading && !recommendations.length && (
        <NoData
          title="No recommendations yet"
          description="Complete your profile to receive AI-ranked matches aligned to regional and social quotas."
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {recommendations.map((item) => (
          <JobCard
            key={item.job._id}
            {...item.job}
            matchScore={item.score}
            matchReasons={item.reasons}
          />
        ))}
      </div>
    </section>
  )
}

export default Internships







