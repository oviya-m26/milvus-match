import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { FormRow, FormRowSelect } from "../components"
import { CgSpinner } from "react-icons/cg"

import {
  handleChangeFunction,
  clearValues,
  createJob,
  editJob,
  uploadImage,
} from "../features/job/jobSlice"

const AddJobForm = () => {
  const {
    isLoading,
    position,
    company,
    jobLocation,
    jobType,
    jobTypeOptions,
    status,
    statusOptions,
    jobDescription,
    image,
    skillsRequired,
    quotaSC,
    quotaST,
    quotaOBC,
    quotaEWS,
    quotaWomen,
    capacity,
    statePriority,
    salary,
    applicationDeadline,
    isEditing,
    editJobId,
  } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.user)
  const dispatch = useDispatch()

  const handleChange = (e) => {
    const name = e.target.name
    const value = e.target.value
    dispatch(handleChangeFunction({ name, value }))
  }

  const handleUpload = (e) => {
    const imageFile = e.target.files[0]
    if (!imageFile) return
    const formData = new FormData()
    formData.append("image", imageFile)
    dispatch(uploadImage(formData))
  }

  const buildPayload = () => {
    const quota = {
      sc: quotaSC ? Number(quotaSC) : undefined,
      st: quotaST ? Number(quotaST) : undefined,
      obc: quotaOBC ? Number(quotaOBC) : undefined,
      ews: quotaEWS ? Number(quotaEWS) : undefined,
      women: quotaWomen ? Number(quotaWomen) : undefined,
    }
    const filteredQuota = Object.fromEntries(
      Object.entries(quota).filter(([, value]) => value)
    )

    return {
      position,
      company,
      jobLocation,
      jobType,
      status,
      jobDescription,
      image,
      skillsRequired: skillsRequired
        ? skillsRequired
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [],
      reservationQuota: filteredQuota,
      capacity: Number(capacity) || 1,
      statePriority,
      salary,
      applicationDeadline: applicationDeadline
        ? new Date(applicationDeadline).toISOString()
        : null,
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!position || !company || !jobLocation) {
      toast.error("Please fill out all required fields")
      return
    }

    const payload = buildPayload()

    if (isEditing) {
      dispatch(
        editJob({
          jobId: editJobId,
          job: payload,
        })
      )
      return
    }

    dispatch(createJob(payload))
  }

  useEffect(() => {
    if (!isEditing && user?.location) {
      dispatch(
        handleChangeFunction({
          name: "jobLocation",
          value: user.location,
        })
      )
    }
  }, [dispatch, isEditing, user?.location])

  return (
    <form className="space-y-10 xl:w-2/3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-12">
        <FormRow
          type="text"
          name="position"
          labelText="Position*"
          placeholder="Policy Intern"
          value={position}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="company"
          labelText="Organization*"
          placeholder="NITI Aayog"
          value={company}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="jobLocation"
          labelText="Location*"
          placeholder="New Delhi, India"
          value={jobLocation}
          handleChange={handleChange}
        />
        <FormRowSelect
          name="jobType"
          labelText="Opportunity Type"
          value={jobType}
          options={jobTypeOptions}
          handleChange={handleChange}
        />
        <FormRowSelect
          name="status"
          labelText="Application Status"
          value={status}
          options={statusOptions}
          handleChange={handleChange}
        />
        <FormRow
          type="number"
          name="capacity"
          labelText="Total Slots"
          placeholder="10"
          value={capacity}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="statePriority"
          labelText="Priority States / Regions"
          placeholder="North-East, Aspirational districts"
          value={statePriority}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="salary"
          labelText="Stipend / Honorarium"
          placeholder="₹15,000 per month"
          value={salary}
          handleChange={handleChange}
        />
        <FormRow
          type="date"
          name="applicationDeadline"
          labelText="Application Deadline"
          value={applicationDeadline}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="skillsRequired"
          labelText="Skills / Domains"
          placeholder="python, data analysis, rural development"
          value={skillsRequired}
          handleChange={handleChange}
        />
        <FormRow
          type="file"
          name="image"
          labelText="Organization Logo"
          handleChange={handleUpload}
          acceptProps="image/*"
          className="bg-white text-gray-500 file:mr-4 file:border-0 file:bg-white file:px-4 file:text-sm file:font-semibold file:text-black"
        />
        <div className="md:col-span-2">
          <FormRow
            type="text"
            name="jobDescription"
            labelText="About the Opportunity"
            placeholder="Brief description about your opportunity..."
            textArea={true}
            value={jobDescription}
            handleChange={handleChange}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-black">
          Reservation & Quota Allocation
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FormRow
            type="number"
            name="quotaSC"
            labelText="SC Seats"
            placeholder="2"
            value={quotaSC}
            handleChange={handleChange}
          />
          <FormRow
            type="number"
            name="quotaST"
            labelText="ST Seats"
            placeholder="1"
            value={quotaST}
            handleChange={handleChange}
          />
          <FormRow
            type="number"
            name="quotaOBC"
            labelText="OBC Seats"
            placeholder="3"
            value={quotaOBC}
            handleChange={handleChange}
          />
          <FormRow
            type="number"
            name="quotaEWS"
            labelText="EWS Seats"
            placeholder="1"
            value={quotaEWS}
            handleChange={handleChange}
          />
          <FormRow
            type="number"
            name="quotaWomen"
            labelText="Women Seats"
            placeholder="2"
            value={quotaWomen}
            handleChange={handleChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="submit"
          className="flex w-52 items-center justify-center rounded-md bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition disabled:cursor-not-allowed disabled:bg-gray-500"
          disabled={isLoading}
        >
          {isLoading && <CgSpinner className="mr-2 h-5 w-5 animate-spin" />}
          {isEditing ? "Save Changes" : "Publish Opportunity"}
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          onClick={() => dispatch(clearValues())}
        >
          Clear
        </button>
      </div>
    </form>
  )
}

export default AddJobForm