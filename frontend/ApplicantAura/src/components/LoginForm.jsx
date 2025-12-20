import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loginUser } from "../features/user/userSlice"
import { CgSpinner } from "react-icons/cg"
import { useNavigate, Link } from "react-router-dom"

const initialState = {
  email: "",
  password: "",
}

const LoginForm = () => {
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
    dispatch(loginUser(values))
  }

  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  return (
    <form className="w-full space-y-6 px-4 md:w-2/3 md:px-0 lg:w-2/3 xl:w-1/2" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="input_container">
          <label htmlFor="email" className="label_style">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="input_style"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input_container">
          <label htmlFor="password" className="label_style">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            className="input_style"
            placeholder="Enter your password"
            value={values.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-md bg-primary px-10 py-4 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60"
        disabled={isLoading}
      >
        {isLoading && <CgSpinner className="mr-3 h-5 w-5 animate-spin" />}
        Sign in
      </button>
      <p className="text-center text-sm text-gray-600">
        New here?{" "}
        <Link className="font-semibold text-primary" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  )
}

export default LoginForm







