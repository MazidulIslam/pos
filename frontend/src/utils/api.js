import axios from "axios";
import config from "../config";

/**
 * Custom Axios instance with pre-configured settings
 */
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor: Attach Auth Token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle Errors Globally
 */
api.interceptors.response.use(
  (response) => {
    if (response.config.fullResponse) {
      return response;
    }
    return response.data;
  },
  (error) => {
    // Handle global errors here
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Clear storage and redirect to login
        console.warn("Session expired. Redirecting to login...");
        localStorage.clear();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // Return a standard error message
      const errorMessage = data?.message || "An unexpected error occurred.";
      return Promise.reject({ ...error, message: errorMessage });
    }

    // Handle network errors or other issues
    if (error.request) {
      return Promise.reject({ message: "Network error. Please check your connection." });
    }

    return Promise.reject(error);
  }
);

export default api;
