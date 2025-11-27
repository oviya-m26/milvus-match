import { useSelector } from "react-redux"
import { AddJobForm } from "../../components"

const AddJob = () => {
  const { isEditing } = useSelector((store) => store.job)

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
