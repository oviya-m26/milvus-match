import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import moment from "moment"
import { HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineDotsVertical, HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi"
import { useRef, useState, useEffect } from "react"
import JobTag from "./JobTag"
import { deleteJob, setEditJob } from "../features/job/jobSlice"
import defaultImage from "../assets/defaultLogo.png"
import logoA from "../assets/Logo.png"
import logoB from "../assets/milvusmatch_logo.svg"
import logoC from "../assets/pm_internship_logo.svg"

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
  salary,
  hasApplied,
  applicationStatus,
}) => {
  const [menuDropdown, setMenuDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.user)
  const jobCreationDate = moment(createdAt).format("MMM Do YY")
  const hash = (str) => {
    let h = 0
    for (let i = 0; i < String(str).length; i++) h = (h << 5) - h + String(str).charCodeAt(i)
    return Math.abs(h)
  }
  const seed = hash(_id || company || position)
  const randomDaysAgo = (seed % 60) + 1
  const seededDate = moment().subtract(randomDaysAgo, "days").toDate()
  const postedDate = moment(createdAt || seededDate).format("MMM Do YY")
  const logos = [defaultImage, logoA, logoB, logoC]
  const chosenLogo = logos[seed % logos.length]
  const accents = ["border-rose-500", "border-indigo-500", "border-emerald-500", "border-sky-500", "border-orange-500"]
  const accentClass = accents[seed % accents.length]

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMenuDropdown(false)
    }
  }

  const handleButtonClick = () => {
    setMenuDropdown(!menuDropdown)
  }
  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const isApplicant = user?.role === "applicant"

  return (
    <article className="relative min-h-full w-full rounded-md border border-gray-200 bg-white p-5 pb-10 shadow-sm hover:shadow-md transition-shadow duration-200 lg:max-w-sm">
      {/* Company Logo */}
      <div className="flex items-start justify-start space-x-5">
        <img
          width={200}
          height={100}
          src={image || chosenLogo}
          alt={`${company} Logo`}
          className={`h-10 w-10 rounded-full border object-contain object-center shadow-sm md:bg-white xl:h-12 xl:w-12 ${image ? "border-gray-200" : "border-transparent"}`}
        />
        {/* Job info */}
        <div className=" w-full space-y-1 ">
          <div className=" flex items-center justify-between ">
            {/* company */}
            <p className=" font-light capitalize text-gray-500 ">{company}</p>
            {/* Show JobTag only if NOT applicant, OR if applicant has applied (showing app status) */}
            {!isApplicant && <JobTag status={status} />}
            {isApplicant && hasApplied && <JobTag status={applicationStatus || "applied"} />}
          </div>
          {/* Job position - Clickable Link */}
          <Link to={`/job/${_id}`} className="hover:underline">
            <p className={`font-semibold capitalize text-black hover:text-primary transition-colors border-l-4 pl-2 ${accentClass}`}>{position}</p>
          </Link>
          <div className=" flex justify-between text-sm font-light capitalize text-gray-600 ">
            {/* Job location */}
            <p className=" flex items-center justify-center ">
              {" "}
              <HiOutlineLocationMarker className=" mr-1 " /> {jobLocation}
            </p>
            {/* Job type */}
            <p className=" flex items-center justify-center ">
              {" "}
              <HiOutlineBriefcase className=" mr-1 " /> {jobType}{" "}
            </p>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Posted {postedDate}</span>
            {salary && <span className="font-medium text-gray-700">Salary: {salary}</span>}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className=" absolute right-5 bottom-3  ">
        {isApplicant ? (
          <div className="flex justify-end">
             <span className="text-xs text-gray-500 mr-2 self-center"> {postedDate} </span>
             {!hasApplied && (
               <Link
                 to={`/job/${_id}`}
                 className="rounded bg-primary px-3 py-1 text-xs text-white hover:bg-primary/80 transition-colors"
               >
                 View & Apply
               </Link>
             )}
          </div>
        ) : (
          <div ref={dropdownRef} className=" relative flex justify-end ">
            <span className="text-xs text-gray-500 "> {jobCreationDate} </span>
            <button
              aria-label="Job Options"
              type="button"
              onClick={handleButtonClick}
              className="text-gray-600 hover:text-black transition-colors duration-200"
            >
              <HiOutlineDotsVertical />
            </button>
            {menuDropdown && (
              <div className=" absolute bottom-0 top-6 z-10  text-gray-700">
                <div className=" flex flex-col space-y-1 rounded-md border border-gray-200 bg-white p-2 text-sm shadow-lg ">
                  {/* Edit link */}
                  <Link
                    aria-label="Edit Job"
                    to="/add-job"
                    className=" flex items-center space-x-2 hover:text-black transition-colors duration-200"
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
                        })
                      )
                    }
                  >
                    <span>
                      <HiOutlinePencilAlt />
                    </span>
                    <span>Edit </span>
                  </Link>
                  {/* Delete button */}
                  <button
                    type="button"
                    aria-label="Delete Job"
                    className="  flex items-center space-x-2 hover:text-red-600 transition-colors duration-200"
                    onClick={() => dispatch(deleteJob(_id))}
                  >
                    <span>
                      <HiOutlineTrash />
                    </span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default JobCard
