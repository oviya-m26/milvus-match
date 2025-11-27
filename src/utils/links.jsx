import React from "react"
import {
  HiOutlineCollection,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlinePlus,
  HiOutlineAcademicCap,
  HiOutlineClipboardCheck,
} from "react-icons/hi"

const links = [
  {
    id: 1,
    text: "home",
    path: "/",
    icon: <HiOutlineHome className="h-6 w-6" />,
    roles: ["applicant", "employer"],
  },
  {
    id: 2,
    text: "all jobs",
    path: "/all-jobs",
    icon: <HiOutlineCollection className="h-6 w-6" />,
    roles: ["applicant", "employer"],
  },
  {
    id: 3,
    text: "applications",
    path: "/applications",
    icon: <HiOutlineClipboardCheck className="h-6 w-6" />,
    roles: ["applicant", "employer"],
  },
  {
    id: 4,
    text: "internships",
    path: "/internships",
    icon: <HiOutlineAcademicCap className="h-6 w-6" />,
    roles: ["applicant"],
  },
  {
    id: 5,
    text: "add opportunity",
    path: "/add-job",
    icon: <HiOutlinePlus className="h-6 w-6" />,
    roles: ["employer"],
  },
  {
    id: 6,
    text: "profile",
    path: "/profile",
    icon: <HiOutlineUser className="h-6 w-6" />,
    roles: ["applicant", "employer"],
  },
]

export default links
