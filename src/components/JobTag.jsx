const variants = {
  declined: "bg-red-100 text-red-800",
  interview: "bg-gray-900 text-white",
  pending: "bg-yellow-100 text-yellow-800",
  matched: "bg-blue-100 text-blue-800",
  selected: "bg-green-100 text-green-800",
  applied: "bg-purple-100 text-purple-800",
}

const JobTag = ({ status = "pending" }) => {
  const normalized = status?.toLowerCase()
  const label = normalized
    ? normalized.replace("-", " ")
    : "pending"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variants[normalized] || "bg-gray-100 text-gray-800"
      }`}
    >
      {label}
    </span>
  )
}

export default JobTag
