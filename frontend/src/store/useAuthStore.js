import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { persist } from "zustand/middleware"

export const useAuthStore = create(
  persist(
    (set) => ({
      authUser: null,
      isSigninUp: false,
      isLoggingIn: false,
      isCheckingAuth: false,

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const res = await axiosInstance.get("/auth/checkme");
          // convert res to json later
          console.log("Check auth response", res.data.user);

          set({ authUser: res.data.user });
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
          const res = await axiosInstance.post("/auth/login", data, {
            withCredentials: true,
          });
          // ✅ Set authUser first so it persists
          set({ authUser: res.data.user });
          toast.success("Login success");

          // Optionally verify cookie/session asynchronously
          // await useAuthStore.getState().checkAuth()
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
    }),
  {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);
