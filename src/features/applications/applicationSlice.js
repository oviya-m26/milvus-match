import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import customFetch, { checkForUnauthorizedResponse } from "../../utils/axios"
import { toast } from "react-hot-toast"

const initialState = {
  isLoading: false,
  items: [],
  byJobId: {},
}

export const fetchMyApplications = createAsyncThunk(
  "applications/fetchAll",
  async (_, thunkAPI) => {
    try {
      const { data } = await customFetch.get("/applications/me")
      return data
    } catch (error) {
      return checkForUnauthorizedResponse(error, thunkAPI)
    }
  }
)

export const submitApplication = createAsyncThunk(
  "applications/submit",
  async ({ jobId, justification }, thunkAPI) => {
    try {
      const { data } = await customFetch.post("/applications", {
        jobId,
        justification,
      })
      return data.application
    } catch (error) {
      return checkForUnauthorizedResponse(error, thunkAPI)
    }
  }
)

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    resetApplications: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.applications || []
        state.byJobId = state.items.reduce((acc, application) => {
          acc[application.jobId] = application
          return acc
        }, {})
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          toast.error(action.payload)
        }
      })
      .addCase(submitApplication.pending, (state) => {
        state.isLoading = true
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = [action.payload, ...state.items]
        state.byJobId[action.payload.jobId] = action.payload
        toast.success("Application submitted")
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          toast.error(action.payload)
        }
      })
  },
})

export const { resetApplications } = applicationsSlice.actions
export default applicationsSlice.reducer

