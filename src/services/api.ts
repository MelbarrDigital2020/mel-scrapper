import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4010/api",
  withCredentials: true, // 🔥 REQUIRED
});

export default api;
