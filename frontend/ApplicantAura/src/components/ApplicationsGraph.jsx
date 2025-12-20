import { useSelector } from "react-redux"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { selectApplicationsTimeline } from "../features/applications/applicationSlice"

const ApplicationsGraph = () => {
  const timeline = useSelector((state) => selectApplicationsTimeline(state))

  if (!timeline || !Array.isArray(timeline) || timeline.length === 0) {
    return null
  }

  return (
    <section className="mb-12 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Application Timeline
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Track your application submissions over time
        </p>
      </div>

      <div className="mt-8">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px",
              }}
              formatter={(value) => [value, ""]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Daily Applications"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Applications"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-sm text-gray-600">Total Applications</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {timeline[timeline.length - 1]?.cumulative || 0}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm text-gray-600">This Period</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {timeline.reduce((sum, day) => sum + day.applications, 0)}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ApplicationsGraph
