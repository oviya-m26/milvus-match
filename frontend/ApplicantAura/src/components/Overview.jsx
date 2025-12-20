import React from "react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { showStats } from "../features/allJobs/allJobsSlice"
import ChartsContainer from "./ChartsContainer"
import StatsContainer from "./StatsContainer"
import Loading from "./Loading"
import NoData from "./NoData"

const Overview = () => {
  const { isLoading, monthlyApplications } = useSelector(
    (store) => store.allJobs
  )
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(showStats())
  }, [])

  if (isLoading) {
    return <Loading className="h-screen" />
  }

  return (
    <>
      <StatsContainer />
      {monthlyApplications.length === 0 && <NoData />}
      {monthlyApplications.length > 0 && <ChartsContainer />}
    </>
  )
}

export default Overview
