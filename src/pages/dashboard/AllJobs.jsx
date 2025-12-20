import { JobContainer, SearchBarFilter } from "../../components"
import { useSelector } from "react-redux"

const AllJobs = () => {
  const { user } = useSelector((store) => store.user)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">APPLICANT WORKSPACE</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back, {user?.name || 'User'}!</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">All Jobs</h2>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6">
            <SearchBarFilter />
          </div>
          
          {/* Jobs List */}
          <div className="space-y-6">
            <JobContainer />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AllJobs
