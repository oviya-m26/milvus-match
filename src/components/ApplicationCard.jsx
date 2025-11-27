import { HiOutlineOfficeBuilding, HiOutlineLocationMarker } from "react-icons/hi"
import JobTag from "./JobTag"

const ApplicationCard = ({ application }) => {
  const { job, status, matchScore, metadata } = application
  if (!job) return null
  const normalizedScore =
    typeof matchScore === "number"
      ? Math.round(Math.max(0, Math.min(1, matchScore)) * 100)
      : null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            {job.company}
          </p>
          <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
        </div>
        <JobTag status={status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 text-sm text-gray-600">
        <span className="flex items-center space-x-1">
          <HiOutlineOfficeBuilding />
          <span>{job.jobType}</span>
        </span>
        <span className="flex items-center space-x-1">
          <HiOutlineLocationMarker />
          <span>{job.jobLocation}</span>
        </span>
        {normalizedScore !== null && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Match score: {normalizedScore}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-600 line-clamp-3">
        {job.jobDescription}
      </p>
      {!!metadata?.reasons?.length && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-gray-500">
          {metadata.reasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      )}
      <div className="mt-5 grid gap-3 text-xs text-gray-500 md:grid-cols-3">
        <div>
          <p className="font-semibold text-gray-800">Seats</p>
          <p>{job.capacity}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Quota</p>
          <p>
            {Object.entries(job.reservationQuota || {})
              .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
              .join(" • ") || "Open"}
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Updated</p>
          <p>{new Date(application.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default ApplicationCard

