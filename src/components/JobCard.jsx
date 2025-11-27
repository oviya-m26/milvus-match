import {
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineDotsVertical,
} from "react-icons/hi"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { deleteJob, setEditJob } from "../features/job/jobSlice"
import { JobTag } from "../components"
import moment from "moment/moment"
import defaultImage from "../assets/defaultLogo.png"
import { useEffect, useRef, useState } from "react"
import { submitApplication } from "../features/applications/applicationSlice"

const JobCard = ({
  _id,
  company,
  image,
  jobLocation,
  jobType,
  position,
  status,
  jobDescription,
  createdAt,
  reservationQuota,
  capacity,
  skillsRequired,
  matchScore,
  matchReasons,
  statePriority,
  salary,
  applicationDeadline,
}) => {
  const [menuDropdown, setMenuDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.user)
  const { byJobId, isLoading: applicationsLoading } = useSelector(
    (store) => store.applications
  )
  const application = byJobId[_id]
  const isEmployer = user?.role === "employer"
  const isApplicant = user?.role === "applicant"
  const jobCreationDate = moment(createdAt).format("MMM Do YY")
  const skillChips = Array.isArray(skillsRequired)
    ? skillsRequired
    : (skillsRequired || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMenuDropdown(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleApply = () => {
    dispatch(submitApplication({ jobId: _id }))
  }

  const quotaText = Object.entries(reservationQuota || {})
    .map(([key, value]) => `${key.toUpperCase()}:${value}`)
    .join(" • ")

  return (
    <article className="relative min-h-full w-full rounded-2xl border border-gray-200 bg-white p-5 pb-10 shadow-sm transition hover:shadow-lg lg:max-w-sm">
      <div className="flex items-start space-x-5">
        <img
          width={200}
          height={100}
          src={image || defaultImage}
          alt={`${company} Logo`}
          className="h-12 w-12 rounded-full border border-gray-200 object-cover shadow-sm"
        />
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-light uppercase tracking-wide text-gray-500">
              {company}
            </p>
            <div className="flex items-center space-x-2">
              {typeof matchScore === "number" && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                  AI match {Math.round(matchScore * 100)}%
                </span>
              )}
              <JobTag status={status} />
            </div>
          </div>
          <p className="text-lg font-semibold text-black">{position}</p>
          <div className="flex justify-between text-sm font-light text-gray-600">
            <span className="flex items-center">
              <HiOutlineLocationMarker className="mr-1" /> {jobLocation}
            </span>
            <span className="flex items-center">
              <HiOutlineBriefcase className="mr-1" /> {jobType}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-700 line-clamp-4">
        {jobDescription || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-gray-500">
        <span className="rounded-full bg-gray-100 px-3 py-1">
          {capacity} seats
        </span>
        {quotaText && (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
            {quotaText}
          </span>
        )}
        {salary && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
            {salary}
          </span>
        )}
      </div>

      {!!skillChips.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {skillChips.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize text-gray-600"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {statePriority && (
        <p className="mt-3 text-xs text-gray-500">
          Priority regions: {statePriority}
        </p>
      )}
      {applicationDeadline && (
        <p className="text-xs text-gray-500">
          Apply by {new Date(applicationDeadline).toLocaleDateString()}
        </p>
      )}

      {matchReasons?.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-gray-500">
          {matchReasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      ) : null}

      {isApplicant && (
        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {application ? "Your status" : "Ready to apply?"}
            </p>
            {application ? (
              <JobTag status={application.status} />
            ) : (
              <p className="text-sm text-gray-600">
                AI will rank you instantly after applying.
              </p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={Boolean(application) || applicationsLoading}
            onClick={handleApply}
          >
            {application ? "Applied" : "Apply"}
          </button>
        </div>
      )}

      {isEmployer && (
        <div className="absolute bottom-3 right-5">
          <div ref={dropdownRef} className="relative flex justify-end">
            <span className="mr-2 text-xs text-gray-500">{jobCreationDate}</span>
            <button
              aria-label="Job Options"
              type="button"
              onClick={() => setMenuDropdown((prev) => !prev)}
              className="text-gray-600 transition hover:text-black"
            >
              <HiOutlineDotsVertical />
            </button>
            {menuDropdown && (
              <div className="absolute bottom-0 top-6 z-10 text-gray-700">
                <div className="flex flex-col space-y-1 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-lg">
                  <Link
                    aria-label="Edit Job"
                    to="/add-job"
                    className="flex items-center space-x-2 transition hover:text-black"
                    onClick={() =>
                      dispatch(
                        setEditJob({
                          editJobId: _id,
                          position,
                          company,
                          jobLocation,
                          jobType,
                          status,
                          jobDescription,
                          image,
                          reservationQuota,
                          capacity,
                          skillsRequired,
                          statePriority,
                          salary,
                          applicationDeadline,
                        })
                      )
                    }
                  >
                    <HiOutlinePencilAlt />
                    <span>Edit</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete Job"
                    className="flex items-center space-x-2 transition hover:text-red-600"
                    onClick={() => dispatch(deleteJob(_id))}
                  >
                    <HiOutlineTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default JobCard
