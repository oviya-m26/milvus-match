import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import moment from "moment"
import { HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineDotsVertical, HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi"
import { useRef, useState } from "react"
import JobTag from "./JobTag"
import { deleteJob, setEditJob } from "../features/job/jobSlice"
import defaultImage from "../assets/defaultLogo.png"

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
  hasApplied,
  applicationStatus,
}) => {
  const [menuDropdown, setMenuDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.user)
  const jobCreationDate = moment(createdAt).format("MMM Do YY")

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMenuDropdown(false)
    }
  }

  const handleButtonClick = () => {
    setMenuDropdown(!menuDropdown)
  }
  
  // Attach click event listener to the document
  document.addEventListener("mousedown", handleClickOutside)

  const isApplicant = user?.role === "applicant"

  return (
    <article className="relative min-h-full w-full rounded-md border border-gray-200 bg-white p-5 pb-10 shadow-sm hover:shadow-md transition-shadow duration-200 lg:max-w-sm">
      {/* Company Logo */}
      <div className="flex items-start justify-start space-x-5">
        <img
          width={200}
          height={100}
          src={image || defaultImage}
          alt={`${company} Logo`}
          className="h-10 w-10 rounded-full border border-gray-200 object-contain object-center shadow-sm md:bg-white xl:h-12 xl:w-12"
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
            <p className=" font-semibold capitalize text-black hover:text-primary transition-colors">{position}</p>
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
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className=" absolute right-5 bottom-3  ">
        {isApplicant ? (
          <div className="flex justify-end">
             <span className="text-xs text-gray-500 mr-2 self-center"> {jobCreationDate} </span>
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
