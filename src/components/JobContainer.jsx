import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { JobCard, Loading } from "../components"
import { getAllJobs, handleChange } from "../features/allJobs/allJobsSlice"
import { generateMockJobs } from "../utils/mockData"

const JobContainer = () => {
  // Initialize state for mock data and pagination
  const [mockJobs] = useState(() => generateMockJobs(100));
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20;
  
  // Read data from the allJobs store
  const {
    isLoading,
    jobs,
    page,
    search,
    searchJobStatus,
    searchJobType,
    sort,
    sortOptions,
  } = useSelector((store) => store.allJobs);

  // Dispatch actions
  const dispatch = useDispatch();

  // dispatch the getAllJobs action when component is rendering
  useEffect(() => {
    dispatch(getAllJobs());
  }, [dispatch, page, search, searchJobStatus, searchJobType, sort]);

  const handleSort = (e) => {
    dispatch(handleChange({ name: e.target.name, value: e.target.value }));
  };

  // Determine which jobs to display
  const displayJobs = jobs.length > 0 ? jobs : mockJobs;
  const totalDisplayJobs = displayJobs.length;
  const totalPages = Math.ceil(totalDisplayJobs / jobsPerPage);
  
  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = displayJobs.slice(indexOfFirstJob, indexOfLastJob);
  
  // Reset to first page when jobs change
  useEffect(() => {
    setCurrentPage(1);
  }, [displayJobs]);
  
  if (isLoading) {
    return <Loading className="h-full" />;
  }

  return (
    <>
      {/* Total jobs and sort function */}
      <section className=" my-10  flex items-center justify-between lg:mx-5 xl:mx-16 ">
        <h3 className="px-6 text-sm font-medium md:px-10 lg:px-0 ">
          {" "}
          {totalDisplayJobs} Job{totalDisplayJobs !== 1 ? 's' : ''} found
        </h3>
        <div>
          <span className="text-sm lowercase text-gray-500 ">Sort by </span>
          <select
            name="sort"
            id="sort"
            onChange={handleSort}
            value={sort}
            className=" border-none bg-gray-100 py-0 font-medium capitalize focus:ring-0  "
          >
            {sortOptions.map((item, index) => {
              return (
                <option key={index} value={item}>
                  {item}
                </option>
              )
            })}
          </select>
        </div>
      </section>

      {/* Job card */}
      {currentJobs.length > 0 ? (
        <section className="grid grid-cols-1 gap-5 px-5 mb-20 md:grid-cols-2 lg:mx-5 lg:grid-cols-2 lg:px-0 xl:mx-16 xl:grid-cols-3">
          {currentJobs.map((job) => (
            <JobCard key={job._id} {...job} />
          ))}
        </section>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No jobs found matching your criteria</p>
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show current page and 2 pages before/after
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <span className="ml-4 text-sm text-gray-700">
              Page {currentPage} of {totalPages} ({mockJobs.length} total jobs)
            </span>
          </nav>
        </div>
      )}
    </>
  ) 
}

export default JobContainer
