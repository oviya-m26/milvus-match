import customFetch, { checkForUnauthorizedResponse } from "../../utils/axios"

//** ==================== Get all jobs ==================== */
export const getAllJobsThunk = async (_, thunkAPI) => {
  // Get the initialState of allJobs slice
  const { page, search, searchJobStatus, searchJobType, searchLocation, sort } =
    thunkAPI.getState().allJobs

  // Example url: jobs?status=all&jobType=all&location=all&sort=latest&page=1
  let url = `/jobs?status=${searchJobStatus}&jobType=${searchJobType}&sort=${sort}&page=${page}`
  if (searchLocation && searchLocation !== "all") {
    url = url + `&location=${encodeURIComponent(searchLocation)}`
  }
  if (search) {
    url = url + `&search=${search}`
  }
  try {
    const response = await customFetch.get(url)
    return response.data
  } catch (error) {
    return checkForUnauthorizedResponse(error, thunkAPI)
  }
}

//** ==================== Show stats ==================== */
export const showStatsThunk = async (_, thunkAPI) => {
  try {
    const response = await customFetch.get("/jobs/stats")
    return response.data
  } catch (error) {
    return checkForUnauthorizedResponse(error, thunkAPI)
  }
}
