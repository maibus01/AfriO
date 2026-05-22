import axios from "axios";

const API = axios.create({
  baseURL: "https://afrio-api.onrender.com/api",
});
// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  // 🔑 FIX: Do not attach authorization headers if calling the public recovery route
  if (req.url && req.url.includes("/auth/forgot-password")) {
    return req; 
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;