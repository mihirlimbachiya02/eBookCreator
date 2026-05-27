import axios from "axios";
import { BASE_URL } from "./apiPaths.js";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                const isOnAuthPage =
                    window.location.pathname === "/login" ||
                    window.location.pathname === "/signup";
                if (!isOnAuthPage) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                }
            }
            if (error.response.status === 500 && import.meta.env.DEV) {
                console.error("Internal Server Error.");
            }
        } else if (error.code === "ECONNABORTED") {
            console.error("Request timed out. Check your internet connection.");
        }

        return Promise.reject(error);
    },
);

export default axiosInstance;
