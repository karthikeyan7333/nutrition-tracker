import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// The backend mounts every route beneath /api. Accept either a Render origin
// (https://service.onrender.com) or the complete API URL
// (https://service.onrender.com/api) so a missing suffix in Vercel cannot make
// requests target /auth/* instead of /api/auth/*.
const apiBaseUrl = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/$/, "").replace(/\/api$/, "")}/api`
  : "/api";

// Create Axios client pointing to the Express API prefix.
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically add JWT token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nutrition_tracker_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if unauthorized
      localStorage.removeItem("nutrition_tracker_token");
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
