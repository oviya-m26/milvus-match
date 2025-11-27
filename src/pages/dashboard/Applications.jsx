import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ApplicationCard, Loading, NoData } from "../../components"
import { fetchMyApplications } from "../../features/applications/applicationSlice"

const Applications = () => {
  const dispatch = useDispatch()
  const { items, isLoading } = useSelector((store) => store.applications)

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchMyApplications())
    }
  }, [dispatch])

  if (isLoading) {
    return <Loading className="h-64" />
  }

  return (
    <section className="space-y-8 px-4 py-8 md:px-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Allocation Tracker</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Monitor every internship you&apos;ve applied to, along with AI match
          scores and reservation status compliance.
        </p>
      </div>

      {!items.length && (
        <NoData
          title="No applications yet"
          description="Apply to opportunities from the All Jobs tab to start tracking allocations."
        />
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {items.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </section>
  )
}

export default Applications

