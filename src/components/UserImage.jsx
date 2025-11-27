import React from 'react'
import { useSelector } from "react-redux"
import defaultUserImage from "../assets/default_user_avatar.jpg"
const UserImage = ({ className }) => {
  const { user } = useSelector((store) => store.user)
  const src = user?.image || user?.avatar || defaultUserImage
  return (
    <img
      src={src}
      className={`${className} rounded-full object-cover object-top `}
      alt="profile"
    />
  )
}

export default UserImage