import { create } from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useExecutionStore = create((set) => ({
    isRunning: false,
    isSubmitting: false,
    isExecuting: false,
    submission: null,

    executeCode: async (
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId
    ) => {
        try {
            set({ isRunning: true, isExecuting: true });

            // console.log("submission:", ({ source_code, language_id, stdin, expected_outputs, problemId }))
            const res = await axiosInstance.post("/execute-code", {
                source_code,
                language_id,
                stdin,
                expected_outputs,
                problemId,
            });
            set({ submission: res.data.submission });
            toast.success(res.data.message);
        } catch (error) {
            console.log("Error executing code", error);
            toast.error("Error executing code");
        } finally {
            set({ isRunning: false, isExecuting: false });
        }
    },

    submitCode: async (
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId
    ) => {
        try {
            set({ isSubmitting: true, isExecuting: true });

            const res = await axiosInstance.post("/submission/submit", {
                source_code,
                language_id,
                stdin,
                expected_outputs,
                problemId,
            });
            set({ submission: res.data.submission });
            toast.success(res.data.message);
        } catch (error) {
            // console.log("Error submitting code", error);
            toast.error(error.response?.data?.message || "Error submitting code");
            throw error;
        } finally {
            set({ isSubmitting: false, isExecuting: false });
        }
    },

    clearSubmission: () => set({ submission: null }),
}));
