import { useSelector } from "react-redux"
import { AddJobForm, NoData } from "../../components"

const AddJob = () => {
  const { isEditing } = useSelector((store) => store.job)
  const { user } = useSelector((store) => store.user)

  if (user?.role !== "employer") {
    return (
      <section className="px-5 py-16 text-center md:px-8">
        <h2 className="text-3xl font-semibold text-gray-900">Employer-only feature</h2>
        <p className="mt-3 text-gray-600">Only employers can create opportunities.</p>
        <NoData />
      </section>
    )
  }

  return (
    <>
      <section className=" my-10 mb-28 space-y-10 px-5  md:px-8   ">
        <h4 className="text-3xl text-black"> {isEditing ? "Edit Opportunity " : "Add Opportunity"} </h4>
        <p className="text-gray-600">Add a new job or internship opportunity to track your applications.</p>
        <AddJobForm />
      </section>
    </>
  )
}

export default AddJob
