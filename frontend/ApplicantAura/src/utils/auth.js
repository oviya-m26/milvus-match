import { clearStore } from "../features/user/userSlice"

export const checkForUnauthorizedResponse = (error, thunkAPI) => {
  if (!error.response) {
    // Network error or CORS issue
    return error.message || "Cannot connect to server. Please check if the backend is running."
  }

  if (error.response.status === 401) {
    thunkAPI.dispatch(clearStore())
    return error.response.data?.msg || "Unauthorized! Logging Out..."
  }

  // Handle validation errors (422) - backend returns array of errors
  if (error.response.status === 422 && Array.isArray(error.response.data)) {
    const errorMessages = error.response.data.map(err => {
      if (typeof err === 'string') return err
      if (err.msg) return err.msg
      if (err.message) return err.message
      if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`
      return JSON.stringify(err)
    }).join(", ")
    return errorMessages || "Validation error"
  }

  // Handle other errors
  const errorMsg = error.response.data?.msg ||
                   error.response.data?.message ||
                   error.response.data?.detail ||
                   (typeof error.response.data === 'string' ? error.response.data : null) ||
                   `Server error: ${error.response.status}`
  return errorMsg || "Something went wrong"
}
