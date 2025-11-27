import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { FormRow, FormRowSelect } from "../components"
import { updateUser } from "../features/user/userSlice"
import { CgSpinner } from "react-icons/cg"

const categoryOptions = ["General", "SC", "ST", "OBC", "EWS", "Women"]

const ProfileForm = () => {
  const { user, isLoading } = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const [userData, setUserData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    state: user?.state || "",
    region: user?.region || "",
    socialCategory: user?.socialCategory || "General",
    skills: (user?.skills || []).join(", "),
    resumeText: user?.resumeText || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userData.name) {
      toast.error("Name cannot be empty")
      return
    }
    const payload = {
      ...userData,
      skills: userData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    }
    dispatch(updateUser(payload))
  }

  return (
    <form className="space-y-6 xl:w-2/3" onSubmit={handleSubmit}>
      <div className="grid gap-y-8 md:grid-cols-2 md:gap-x-12">
        <FormRow
          type="text"
          labelText="Full name"
          name="name"
          placeholder="Aditi Sharma"
          value={userData.name}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          labelText="Home city"
          name="location"
          placeholder="Patna, Bihar"
          value={userData.location}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          labelText="State / UT"
          name="state"
          placeholder="Bihar"
          value={userData.state}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          labelText="Region"
          name="region"
          placeholder="Rural / Aspirational district"
          value={userData.region}
          handleChange={handleChange}
        />
        <FormRowSelect
          name="socialCategory"
          labelText="Reservation category"
          options={categoryOptions}
          value={userData.socialCategory}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          labelText="Skills"
          name="skills"
          placeholder="climate policy, stata, hindi"
          value={userData.skills}
          handleChange={handleChange}
        />
        <div className="md:col-span-2">
          <FormRow
            type="text"
            name="resumeText"
            labelText="Profile summary"
            textArea={true}
            placeholder="Share highlights, projects or causes."
            value={userData.resumeText}
            handleChange={handleChange}
          />
        </div>
      </div>
      <button
        className="ml-auto flex w-44 items-center justify-center rounded-md border border-gray-300 bg-primary py-2 text-sm font-medium uppercase text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-secondary-500 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading && <CgSpinner className="mr-2 h-5 w-5 animate-spin" />}
        Save profile
      </button>
    </form>
  )
}

export default ProfileForm
