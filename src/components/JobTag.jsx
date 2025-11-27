const variants = {
  declined: "bg-red-100 text-red-700",
  interview: "bg-black text-white",
  pending: "bg-gray-100 text-gray-700",
  matched: "bg-blue-100 text-blue-700",
  selected: "bg-green-100 text-green-700",
  applied: "bg-primary/10 text-primary",
}

const JobTag = ({ status = "pending" }) => {
  const normalized = status?.toLowerCase()
  const label = normalized
    ? normalized.replace("-", " ")
    : "pending"
  return (
    <span
      className={`flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${
        variants[normalized] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  )
}

export default JobTag
