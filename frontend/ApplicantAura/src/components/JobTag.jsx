const JobTag = ({ status }) => {
  const s = String(status || "").toLowerCase()
  const base = "flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-widest"
  const map = {
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    interview: "bg-indigo-100 text-indigo-800 border border-indigo-200",
    declined: "bg-red-100 text-red-800 border border-red-200",
    applied: "bg-blue-100 text-blue-800 border border-blue-200",
    shortlisted: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    hired: "bg-emerald-200 text-emerald-900 border border-emerald-300",
  }
  const cls = `${base} ${map[s] || "bg-gray-100 text-gray-700 border border-gray-200"}`
  return <span className={cls}>{status}</span>
}

export default JobTag
