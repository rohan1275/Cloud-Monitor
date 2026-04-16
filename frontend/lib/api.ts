import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Add token to every request from localStorage (for SSR safety)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      if (pathname !== "/login" && pathname !== "/signup") {
        localStorage.removeItem("cm_token");
        localStorage.removeItem("cm_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
