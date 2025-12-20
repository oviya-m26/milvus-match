import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Error, Landing, Register, ProtectedRoute, Login } from "./pages"
import { SharedLayout } from "./pages/dashboard"

import "react-toastify/dist/ReactToastify.css"
import { Toaster } from "react-hot-toast"
import { lazy, Suspense } from "react"
import { Loading } from "./components"

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const AllJobs = lazy(() => import("./pages/dashboard/AllJobs"))
const Internships = lazy(() => import("./pages/dashboard/Internships"))
const AddJob = lazy(() => import("./pages/dashboard/AddJob"))
const Profile = lazy(() => import("./pages/dashboard/Profile"))
const Applications = lazy(() => import("./pages/dashboard/Applications"))
const JobDetails = lazy(() => import("./pages/dashboard/JobDetails"))
const DemoMatch = lazy(() => import("./pages/DemoMatch.jsx"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SharedLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="all-jobs" element={<AllJobs />} />
            <Route path="internships" element={<Internships />} />
            <Route path="add-job" element={<AddJob />} />
            <Route path="applications" element={<Applications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="job/:id" element={<JobDetails />} />
          </Route>
          <Route path="landing" element={<Landing />} />
          <Route path="demo" element={<DemoMatch />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </BrowserRouter>
  )
}

export default App
