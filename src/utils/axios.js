import axios from "axios"
import { clearStore } from "../features/user/userSlice"
import { getUserFromLocalStorage } from "./localStorage"

export const API_BASE_URL = import.meta.env.VITE_REACT_APP_BASE_URL || "/api/v1"

const customFetch = axios.create({
  baseURL: API_BASE_URL,
})

customFetch.interceptors.request.use((config) => {
  const user = getUserFromLocalStorage()
  if (user) {
    config.headers["Authorization"] = `Bearer ${user.token}`
  }
  return config
})


export const checkForUnauthorizedResponse = (error, thunkAPI) => {
  if (error?.response?.status === 401) {
    thunkAPI.dispatch(clearStore())
    return thunkAPI.rejectWithValue(
      error.response.data?.msg || "Unauthorized! Logging Out..."
    )
  }
  return thunkAPI.rejectWithValue(error?.response?.data?.msg || "Network error occurred")
}

export default customFetch
