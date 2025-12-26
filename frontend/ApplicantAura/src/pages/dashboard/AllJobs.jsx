import { JobContainer, SearchBarFilter, NoData } from "../../components"
import { useSelector } from "react-redux"

const AllJobs = () => {
  const { user } = useSelector((store) => store.user)
  if (user?.role !== "applicant") {
    return (
      <section className="px-5 py-16 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-gray-900">Applicant-only feature</h2>
        <p className="mt-3 text-gray-600">Switch to a student account to browse and apply.</p>
        <NoData />
      </section>
    )
  }
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
