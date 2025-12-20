import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { toast } from "react-hot-toast"
import { getUserFromLocalStorage } from "../../utils/localStorage"
import {
	createJobThunk,
	deleteJobThunk,
	editJobThunk,
	uploadImageThunk,
	getJobThunk,
} from "./jobThunk"

const initialState = {
	isLoading: false,
	position: "",
	company: "",
	jobLocation: "",
	jobType: "full-time",
	jobTypeOptions: ["full-time", "part-time", "internship"],
	status: "pending",
	statusOptions: ["pending", "declined", "interview"],
	jobDescription: "",
	image: "",
	skillsRequired: "",
	quotaSC: "",
	quotaST: "",
	quotaOBC: "",
	quotaEWS: "",
	quotaWomen: "",
	capacity: 1,
	statePriority: "",
	salary: "",
	applicationDeadline: "",
	isEditing: false,
	editJobId: "",
	currentJob: null,
}

export const createJob = createAsyncThunk("job/createJob", createJobThunk)

export const deleteJob = createAsyncThunk("job/deleteJob", deleteJobThunk)

export const editJob = createAsyncThunk("job/editJob", editJobThunk)

export const uploadImage = createAsyncThunk("job/uploadImage", uploadImageThunk)
export const getJob = createAsyncThunk("job/getJob", getJobThunk)

export const jobSlice = createSlice({
	name: "Job",
	initialState,
	reducers: {
		handleChangeFunction: (state, { payload: { name, value } }) => {
			state[name] = value
		},
		clearValues: () => {
			return {
				...initialState,
				jobLocation: getUserFromLocalStorage()?.location || "",
			}
		},
		setEditJob: (state, { payload }) => {
		return {
			...state,
			isEditing: true,
			editJobId: payload.editJobId,
			position: payload.position || "",
			company: payload.company || "",
			jobLocation: payload.jobLocation || "",
			jobType: payload.jobType || "full-time",
			status: payload.status || "pending",
			jobDescription: payload.jobDescription || "",
			image: payload.image || "",
			skillsRequired: (payload.skillsRequired || []).join(", "),
			quotaSC: payload.reservationQuota?.sc || "",
			quotaST: payload.reservationQuota?.st || "",
			quotaOBC: payload.reservationQuota?.obc || "",
			quotaEWS: payload.reservationQuota?.ews || "",
			quotaWomen: payload.reservationQuota?.women || "",
			capacity: payload.capacity || 1,
			statePriority: payload.statePriority || "",
			salary: payload.salary || "",
			applicationDeadline: payload.applicationDeadline
				? payload.applicationDeadline.split("T")[0]
				: "",
		}
		},
	},
	extraReducers: (builder) => {
		//** ==================== CREATE JOB ==================== */
		builder
			.addCase(createJob.pending, (state) => {
				state.isLoading = true
			})
			.addCase(createJob.fulfilled, (state) => {
				state.isLoading = false
				toast.success("Job added successfully! ")
			})
			.addCase(createJob.rejected, (state, action) => {
				state.isLoading = false
				toast.error(
					action.payload || "Something went wrong, Please try again later."
				)
			})
			//** ==================== EDIT JOB ==================== */
			.addCase(editJob.pending, (state) => {
				state.isLoading = true
			})
			.addCase(editJob.fulfilled, (state) => {
				state.isLoading = false
				toast.success("Job modified successfully!")
			})
			.addCase(editJob.rejected, (state, action) => {
				state.isLoading = false
				toast.error(
					action.payload || "Something went wrong, Please try again later."
				)
			})
			//** ==================== GET SINGLE JOB ==================== */
			.addCase(getJob.pending, (state) => {
				state.isLoading = true
				state.currentJob = null
			})
			.addCase(getJob.fulfilled, (state, action) => {
				state.isLoading = false
				state.currentJob = action.payload.job
			})
			.addCase(getJob.rejected, (state, action) => {
				state.isLoading = false
				toast.error(
					action.payload || "Could not fetch job details"
				)
			})

			//** ==================== DELETE JOB ==================== */
			.addCase(deleteJob.fulfilled, () => {
				toast.success("Job deleted successfully!")
			})
			.addCase(deleteJob.rejected, (state, action) => {
				toast.error(
					action.payload || "Something went wrong, Please try again later."
				)
			})
			//** ==================== UPLOAD IMAGE ==================== */
			.addCase(uploadImage.fulfilled, (state, action) => {
				state.isLoading = false
				state.image = action.payload.image.src
				toast.success("Upload image successful!")
			})
			.addCase(uploadImage.rejected, (state, action) => {
				state.isLoading = false
				toast.error(
					action.payload || "Something went wrong, Please try again later."
				)
			})
	},
})

export const { handleChangeFunction, clearValues, setEditJob } =
	jobSlice.actions
export default jobSlice.reducer
