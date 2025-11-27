import { JobContainer, SearchBarFilter } from "../../components"

const AllJobs = () => {
  return (
    <>
      <div className="px-5 md:px-8 py-6">
        <h1 className="text-3xl font-bold text-black mb-6">All Jobs</h1>
        <p className="text-gray-600 mb-6">Track and manage all your job applications in one place.</p>
      </div>
      <SearchBarFilter />
      <JobContainer />
    </>
  )
}

export default AllJobs
