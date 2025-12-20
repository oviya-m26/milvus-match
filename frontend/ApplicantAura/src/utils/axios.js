import axios from "axios"
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

export default customFetch
