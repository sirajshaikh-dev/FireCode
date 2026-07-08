import axios from "axios";

<<<<<<< HEAD
const baseURL = import.meta.env.VITE_BASE_URL;

console.log("Base URL:", baseURL); 

export const axiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
=======
const VITE_BASE_URL = import.meta.env.VITE_BASE_URL

export const axiosInstance = axios.create({
  baseURL: `${VITE_BASE_URL}/api/v1`,
>>>>>>> a6a53c4335255a174d787f083c64ff0b7c9f50d8
  withCredentials: true,
});
