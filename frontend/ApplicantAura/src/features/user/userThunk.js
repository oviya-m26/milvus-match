import customFetch from "../../utils/axios"
import { checkForUnauthorizedResponse } from "../../utils/auth"
import { clearAllJobsState } from "../allJobs/allJobsSlice"
import { logoutUser } from "./userSlice"
import { clearValues } from "../job/jobSlice"
import { resetApplications } from "../applications/applicationSlice"

const apiBaseUrl = import.meta.env.VITE_REACT_APP_BASE_URL
const isDemoMode = !apiBaseUrl || apiBaseUrl.trim() === ""

const parseErrorMessage = (error) => {
  const data = error?.response?.data
  if (!data) return "Something went wrong, Please try again later."
  if (typeof data === "string") return data
  if (Array.isArray(data)) {
    return data
      .map(
        (item) =>
          item?.msg ||
          item?.message ||
          item?.detail ||
          (typeof item === "string" ? item : JSON.stringify(item))
      )
      .join(", ")
  }
  if (typeof data === "object") {
    return data.msg || data.detail || JSON.stringify(data)
  }
  return "Something went wrong, Please try again later."
}

const handleThunkError = (error, thunkAPI) => {
  if (error?.response?.status === 401) {
    return checkForUnauthorizedResponse(error, thunkAPI)
  }
  return thunkAPI.rejectWithValue(parseErrorMessage(error))
}

//** ==================== Register User ==================== */
export const registerUserThunk = async (url, user, thunkAPI) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      user: {
        name: user.name || "Demo Applicant",
        email: user.email || "demo@applicantaura.in",
        role: user.role || "applicant",
        location: user.location || "India",
        token: "demo-token",
      },
    }
  }
  try {
    const response = await customFetch.post(url, user)
    return response.data
  } catch (error) {
    return handleThunkError(error, thunkAPI)
  }
}

//** ==================== Login User ==================== */
export const loginUserThunk = async (user, thunkAPI) => {
  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    return {
      user: {
        name: "Demo Applicant",
        email: user.email || "demo@applicantaura.in",
        role: "applicant",
        location: "India",
        token: "demo-token",
      },
    }
  }
  try {
    const response = await customFetch.post("/auth/login", user)
    return response.data
  } catch (error) {
    return handleThunkError(error, thunkAPI)
  }
}

//** ==================== Update User ==================== */
export const updateUserThunk = async (user, thunkAPI) => {
  try {
    const response = await customFetch.patch("/auth/updateUser", user)
    return response.data
  } catch (error) {
    return handleThunkError(error, thunkAPI)
  }
}

//** ==================== Upload User Image ==================== */
export const uploadUserImageThunk = async (formData, thunkAPI) => {
  try {
    const response = await customFetch.post("/auth/uploadProfile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    thunkAPI.fulfillWithValue(response.data.image.src)
    return response.data
  } catch (error) {
    return handleThunkError(error, thunkAPI)
  }
}

//** ==================== Clear Store ==================== */
export const clearStoreThunk = async (message, thunkAPI) => {
  try {
    // clear the browser cache storage
    const keys = await window.caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
    // Logout user
    thunkAPI.dispatch(logoutUser(message))
    // Clear jobs values
    thunkAPI.dispatch(clearAllJobsState())
    // Clear job input value
    thunkAPI.dispatch(clearValues())
    thunkAPI.dispatch(resetApplications())
    return Promise.resolve()
  } catch (error) {
    return Promise.reject()
  }
}
