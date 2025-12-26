import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { getJob } from "../../features/job/jobSlice"
import { submitApplication } from "../../features/applications/applicationSlice"
import { Loading, NoData } from "../../components"
import moment from "moment"
import { 
  HiOutlineBriefcase, 
  HiOutlineLocationMarker, 
  HiOutlineCalendar, 
  HiOutlineCurrencyDollar,
  HiArrowLeft
} from "react-icons/hi"
import { toast } from "react-hot-toast"

const JobDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { isLoading, currentJob } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.user)
  if (user?.role !== "applicant") {
    return (
      <section className="px-5 py-16 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-gray-900">Applicant-only feature</h2>
        <p className="mt-3 text-gray-600">Employers cannot view or apply to jobs.</p>
        <NoData />
      </section>
    )
  }
  const { isLoading: isApplying } = useSelector((store) => store.applications)

  const [justification, setJustification] = useState("")
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    dispatch(getJob(id))
  }, [id, dispatch])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!justification.trim()) {
      toast.error("Please provide a brief justification")
      return
    }
    
    await dispatch(submitApplication({ jobId: id, justification }))
    setShowApplyModal(false)
    // Refresh job details to update status
    dispatch(getJob(id))
  }

  if (isLoading || !currentJob) {
    return <Loading center />
  }

  const {
    company,
    position,
    jobLocation,
    jobType,
    jobDescription,
    createdAt,
    skillsRequired,
    salary,
    hasApplied,
    applicationStatus,
    image
  } = currentJob

  const isApplicant = user?.role === "applicant"
  const hash = (str) => {
    let h = 0
    for (let i = 0; i < String(str).length; i++) h = (h << 5) - h + String(str).charCodeAt(i)
    return Math.abs(h)
  }
  const seed = hash(id || company || position)
  const randomDaysAgo = (seed % 60) + 1
  const seededDate = moment().subtract(randomDaysAgo, "days").toDate()
  const displayCreatedAt = moment(createdAt || seededDate).format("MMM Do, YYYY")

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/all-jobs" className="flex items-center text-gray-600 hover:text-primary mb-6 transition-colors">
        <HiArrowLeft className="mr-2" /> Back to Jobs
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
               {image ? (
                 <img src={image} alt={company} className="w-full h-full object-contain" />
               ) : (
                 <div className="text-2xl font-bold text-primary">{company?.charAt(0)}</div>
               )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{position}</h1>
              <p className="text-lg text-gray-600">{company}</p>
            </div>
          </div>
          
          {isApplicant && (
            <div>
              {hasApplied ? (
                <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-semibold capitalize">
                  Status: {applicationStatus || "Applied"}
                </span>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Job Description</h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                {jobDescription || "No detailed description provided."}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {skillsRequired && skillsRequired.length > 0 ? (
                  skillsRequired.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No specific skills listed.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Job Overview</h3>
              
              <div className="flex items-center text-gray-600">
                <HiOutlineCalendar className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Posted Date</p>
                  <p className="font-medium">{displayCreatedAt}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <HiOutlineLocationMarker className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="font-medium">{jobLocation}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <HiOutlineBriefcase className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Job Type</p>
                  <p className="font-medium capitalize">{jobType}</p>
                </div>
              </div>

              {salary && (
                <div className="flex items-center text-gray-600">
                  <HiOutlineCurrencyDollar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Salary</p>
                    <p className="font-medium">{salary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">Apply to {company}</h2>
            <p className="text-gray-600 text-sm">
              Please explain briefly why you are a good fit for this {position} role.
            </p>
            
            <form onSubmit={handleApply}>
              <textarea
                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-primary focus:border-primary resize-none"
                placeholder="I am excited about this opportunity because..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                required
              />
              
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-70"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
