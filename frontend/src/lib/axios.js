import axios from "axios";
import dotenv from 'dotenv'

dotenv.config()
const baseURL = import.meta.env.VITE_BASE_URL;
console.log(baseURL);
export const axiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
});
