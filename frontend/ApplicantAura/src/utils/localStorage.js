export const addUserToLocalStorage = (user) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const removeUserFromLocalStorage = () => {
  localStorage.removeItem("user")
}

export const getUserFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("user")
    if (!raw) return null
    if (raw === "undefined" || raw === "null") {
      localStorage.removeItem("user")
      return null
    }
    const user = JSON.parse(raw)
    return user || null
  } catch {
    localStorage.removeItem("user")
    return null
  }
}
