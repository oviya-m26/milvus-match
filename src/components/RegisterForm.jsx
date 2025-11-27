import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { FormRow, FormRowSelect } from "../components"
import { toast } from "react-toastify"
import { registerUser } from "../features/user/userSlice"
import { useNavigate, Link } from "react-router-dom"
import { CgSpinner } from "react-icons/cg"

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "applicant",
  location: "",
  state: "",
  region: "",
  socialCategory: "General",
  skills: "",
  resumeText: "",
}

const categoryOptions = ["General", "SC", "ST", "OBC", "EWS", "Women"]

const RegisterForm = () => {
  const [values, setValues] = useState(initialState)
  const { isLoading, user } = useSelector((store) => store.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!values.name || !values.email || !values.password) {
      toast.error("Name, email and password are required")
      return
    }

    const payload = {
      ...values,
      skills: values.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    }
    if (values.role !== "applicant") {
      payload.skills = []
      payload.resumeText = ""
    }
    dispatch(registerUser(payload))
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <form className="w-full space-y-6 px-4 md:w-2/3 md:px-0 lg:w-2/3 xl:w-1/2" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <FormRow
          type="text"
          name="name"
          placeholder="Your full name"
          value={values.name}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="location"
          placeholder="Home city"
          value={values.location}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="state"
          placeholder="State / UT"
          value={values.state}
          handleChange={handleChange}
        />
        <FormRow
          type="text"
          name="region"
          placeholder="Region (rural/urban/aspirational)"
          value={values.region}
          handleChange={handleChange}
        />
        <FormRow
          type="email"
          name="email"
          placeholder="you@example.com"
          value={values.email}
          handleChange={handleChange}
        />
        <FormRow
          type="password"
          name="password"
          placeholder="Minimum 6 characters"
          value={values.password}
          handleChange={handleChange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="label_style">I am signing up as</p>
          <div className="flex space-x-4">
            {["applicant", "employer"].map((role) => (
              <label
                key={role}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium capitalize ${
                  values.role === role ? "border-primary text-primary" : "border-gray-200 text-gray-600"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  value={role}
                  checked={values.role === role}
                  name="role"
                  onChange={handleChange}
                />
                {role}
              </label>
            ))}
          </div>
        </div>
        <FormRowSelect
          name="socialCategory"
          labelText="Reservation Category"
          options={categoryOptions}
          value={values.socialCategory}
          handleChange={handleChange}
        />
      </div>

      {values.role === "applicant" && (
        <div className="space-y-6">
          <FormRow
            type="text"
            name="skills"
            labelText="Skills & tools"
            placeholder="python, gis, qualitative research"
            value={values.skills}
            handleChange={handleChange}
          />
          <FormRow
            type="text"
            name="resumeText"
            labelText="Summary / resume highlights"
            textArea={true}
            placeholder="Tell us about your experience, projects or causes you care about."
            value={values.resumeText}
            handleChange={handleChange}
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-10 py-4 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
          disabled={isLoading}
        >
          {isLoading && <CgSpinner className="mr-3 h-5 w-5 animate-spin" />}
          Create account
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link className="font-semibold text-primary" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}

export default RegisterForm
