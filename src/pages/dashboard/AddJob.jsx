import { useSelector } from "react-redux"
import { AddJobForm } from "../../components"

const AddJob = () => {
  const { isEditing } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.user)

  if (user?.role !== "employer") {
    return (
      <section className="px-5 py-16 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-gray-900">
          Employer access required
        </h2>
        <p className="mt-3 text-gray-600">
          Only verified employers can create or edit opportunities. Please log
          in with an employer account or contact your administrator for access.
        </p>
      </section>
    )
  }

  return (
    <section className="my-10 mb-28 space-y-10 px-5 md:px-8">
      <h4 className="text-3xl text-black">
        {isEditing ? "Edit Opportunity" : "Add Opportunity"}
      </h4>
      <p className="text-gray-600">
        Publish internships and jobs to feed the AI allocation engine. Reservation inputs are enforced automatically.
      </p>
      <AddJobForm />
    </section>
  )
}

export default AddJob
