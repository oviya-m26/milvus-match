import { Outlet } from "react-router-dom"
import {
  Sidebar,
  ProfileBanner,
  MobileNavLink,
  Loading,
} from "../../components"
import { Suspense, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyApplications } from "../../features/applications/applicationSlice"

const SharedLayout = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((store) => store.user)

  useEffect(() => {
    if (user?.token) {
      dispatch(fetchMyApplications())
    }
  }, [dispatch, user?.token])

  return (
    <>
      <main className="flex bg-gray-50">
        <Sidebar />
        <div className="w-full">
          <ProfileBanner />
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
        <MobileNavLink />
      </main>
    </>
  )
}

export default SharedLayout
