import links from "../utils/links"
import { NavLink } from "react-router-dom"
import { useSelector } from "react-redux"
const SidebarNavLink = () => {
  const { user } = useSelector((store) => store.user)
  const role = user?.role
  const visibleLinks = links.filter((link) => {
    if (role === "employer") {
      return ["home", "add opportunity", "profile"].includes(link.text)
    }
    return ["home", "all jobs", "internships", "profile"].includes(link.text)
  })
  return (
    <>
      {visibleLinks.map((link) => {
        const { id, path, text, icon } = link
        return (
          <NavLink
            key={id}
            to={path}
            end
            className={({ isActive }) => {
              return isActive
                ? "flex w-full items-center space-x-6 rounded-md bg-gray-100 px-4 py-2 text-lg font-medium capitalize text-black transition-all duration-200 ease-out "
                : "flex w-full items-center space-x-6 rounded-md px-4 py-2 text-lg font-medium capitalize text-gray-600 transition-all duration-300 ease-out hover:bg-gray-50 hover:text-black "
            }}
          >
            <span> {icon}</span>
            <span>{text} </span>
          </NavLink>
        )
      })}
    </>
  )
}

export default SidebarNavLink
