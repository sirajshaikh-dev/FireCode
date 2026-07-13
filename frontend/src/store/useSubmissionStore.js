import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";


export const usesubmissionStore = create((set) => ({
    isSubmissionLoading: null,
    submissions: [],
    submission: null,
    submissionCount: null,

    getAllSubmissions: async () => {

        try {
            set({ isSubmissionLoading: true })
            const res = await axiosInstance.get("/submission/get-all-submissions")
            // console.log(res.data);
            set({ submissions: res.data.submissions })
            toast.success(res.data.message)
        } catch (error) {
            // console.log("error getting all submissions", error);
            toast.error("Error getting all submission")
        } finally {
            set({ isSubmissionLoading: false })
        }
    },

    getSubmissionForProblem: async (problemId) => {
        try {
            set({ isSubmissionLoading: true })
            const res = await axiosInstance.get(`/submission/get-submission/${problemId}`)
            set({ submission: res.data.submission })
        } catch (error) {
            console.log("Error getting submission for problem", error);
            toast.error("Error getting submission")
        }finally{
            set({isSubmissionLoading:false})
        }
    },

    getSubmissionCountForProblem: async (problemId) => {
        try {
            set({ isSubmissionLoading: true })
            const res = await axiosInstance.get(`/submission/get-submission-count/${problemId}`)
            set({ submissionCount: res.data.count })
        } catch (error) {
            // console.log("Error getting submission count", error);
            toast.error("Error getting submission count")
        }finally{
            set({isSubmissionLoading: false})
        }
    }
}))
