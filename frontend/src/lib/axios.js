import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: ["http://localhost:8080/api/v1", "https://leetlab-h95h.onrender.com/api/v1"],
  withCredentials: true,
});