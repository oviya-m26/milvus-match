const JobTag = ({ status }) => {
  return (
    <span
      className={` flex  items-center justify-center rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-widest md:right-10   ${
        status === "declined" && "bg-gray-200 text-gray-800"
      } ${status === "interview" && "bg-black text-white"} ${
        status === "pending" && "bg-gray-100 text-gray-700"
      } `}
    >
      {" "}
      {status}{" "}
    </span>
  )
}

export default JobTag
