import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigninUp: false,
  isLoggingIn: false,
  isCheckingAuth: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/checkme");
    } catch (error) {
      console.log("Error checking auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigninUp: true });
    console.log("signup data ", data);
    try {
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data.user });

      toast.success(res.data.message);
    } catch (error) {
      console.log("Failed to signup", error);
      toast.error("Error Signup user");
    } finally {
      set({ isSigninUp: false });
    }
  },

  login: async (data) => {
    console.log("login data ", data);
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, {withCredentials:true});

      console.log(res.data.user);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      await useAuthStore.getState().checkAuth()
      set({ authUser: res.data.user });
      toast.success("Login success");
    } catch (error) {
      console.log("Error login user", error);
      toast.error("Error login user");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout success");
    } catch (error) {
      console.log("Error logout", error);
      toast.error("Error logout user");
    }
  },
}));
