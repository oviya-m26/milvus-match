import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import customFetch from "../../utils/axios"
import { checkForUnauthorizedResponse } from "../../utils/auth"
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
		updateApplication: (state, action) => {
			const { jobId, application } = action.payload
			state.byJobId[jobId] = application
			// Update or add to items list
			const existingIndex = state.items.findIndex(app => app.jobId === jobId)
			if (existingIndex >= 0) {
				state.items[existingIndex] = application
			} else {
				state.items.unshift(application)
			}
		},
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

export const { resetApplications, updateApplication } = applicationsSlice.actions
// Selector: build a timeline of applications grouped by date
export const selectApplicationsTimeline = (state) => {
	const items = state.applications?.items || []
	const counts = {}
	items.forEach((app) => {
		const date =
			app.createdAt?.split("T")[0] || app.submittedAt?.split("T")[0] ||
			new Date(app.createdAt || app.submittedAt || Date.now()).toISOString().split("T")[0]
		counts[date] = (counts[date] || 0) + 1
	})
	const dates = Object.keys(counts).sort()
	let cumulative = 0
	return dates.map((date) => {
		const applications = counts[date]
		cumulative += applications
		return { date, applications, cumulative }
	})
}

export default applicationsSlice.reducer







