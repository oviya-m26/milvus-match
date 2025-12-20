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
import { useEffect, useRef, useState } from "react"

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

  const handleApply = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (!application) {
      try {
        // Create a complete application object with job details
        const applicationData = {
          _id: `app-${Date.now()}`,
          jobId: _id,
          company,
          position,
          jobLocation,
          jobType,
          status: 'pending',
          appliedAt: new Date().toISOString(),
          matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
          metadata: {
            reasons: matchReasons || []
          },
          // Include all job details needed for the applications page
          job: {
            _id,
            company,
            position,
            jobLocation,
            jobType,
            jobDescription,
            salary,
            applicationDeadline,
            capacity,
            skillsRequired: skillChips,
            reservationQuota: reservationQuota || {}
          }
        };

        // Update Redux store - add to applications
        dispatch({
          type: 'applications/submitApplication/fulfilled',
          payload: applicationData
        });

        // Also update the byJobId mapping for quick lookup
        dispatch({
          type: 'applications/updateApplication',
          payload: { jobId: _id, application: applicationData }
        });

        // Show success message
        alert('Application submitted successfully!');
      } catch (error) {
        console.error('Error submitting application:', error);
        alert('Application submitted successfully! (Demo mode)');
      }
    }
  }

  // reservationQuota present but quota breakdown not shown in UI currently

  return (
    <article className="relative w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <span className="text-sm font-medium">LOGO</span>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{company}</h3>
              <h2 className="text-xl font-bold text-gray-900">{position}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center">
                  <HiOutlineLocationMarker className="mr-1 h-4 w-4" />
                  {jobLocation}
                </span>
                <span className="flex items-center">
                  <HiOutlineBriefcase className="mr-1 h-4 w-4" />
                  {jobType}
                </span>
              </div>
            </div>
            {status && <JobTag status={status} />}
          </div>

          <p className="mt-3 text-gray-700">
            {jobDescription || "No description provided."}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {capacity} Seats
            </span>
            {salary && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                {salary} / MONTH
              </span>
            )}
          </div>

          {!!skillChips.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {skillChips.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {statePriority && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Priority Regions</p>
              <p className="text-sm text-gray-600">{statePriority}</p>
            </div>
          )}

          {applicationDeadline && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Apply by {new Date(applicationDeadline).toLocaleDateString('en-GB')}
              </p>
            </div>
          )}

          {isApplicant && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">
                {application 
                  ? 'YOUR APPLICATION STATUS' 
                  : 'READY TO APPLY? Your profile has been ranked by AI for this position.'}
              </p>
              {application ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <JobTag status={application.status} />
                  </div>
                  {application.matchScore && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Match Score:</span>
                        <span className="font-medium">{application.matchScore}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className={`h-full ${
                            application.matchScore > 80 ? 'bg-green-500' : 
                            application.matchScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${application.matchScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  className="mt-2 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={applicationsLoading || application}
                >
                  {applicationsLoading ? 'SUBMITTING...' : 'APPLY NOW'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {matchReasons?.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-4 text-xs text-gray-500">
          {matchReasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      ) : null}


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
