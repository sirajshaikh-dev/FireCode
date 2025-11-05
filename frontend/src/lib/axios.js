import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

console.log("Base URL:", baseURL); 

export const axiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
});
