import axios from "axios";
import { BASE_URL } from "./apiPaths.js";

const TOKEN_KEY   = "token:v1";
const USER_KEY    = "user:v1";
const REFRESH_KEY = "refreshToken:v1";

const axiosInstance = axios.create({
    baseURL:         import.meta.env.VITE_API_URL || BASE_URL,
    timeout:         120000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept:         "application/json",
    },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem(TOKEN_KEY);
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ── Response Interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing  = false; // prevent multiple simultaneous refresh calls
let refreshQueue  = [];    // queue of requests waiting for new token

const processQueue = (error, token = null) => {
    refreshQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    refreshQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401) {
            const isOnAuthPage =
                window.location.pathname === "/login" ||
                window.location.pathname === "/signup" ||   
                window.location.pathname === "/forgot-password" ||
                window.location.pathname.startsWith("/reset-password");


            // Don't try to refresh if we're on auth pages
            // or if this IS the refresh request itself (prevents infinite loop)
            if (isOnAuthPage || originalRequest._isRetry) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            const refreshToken = localStorage.getItem(REFRESH_KEY);
            if (!refreshToken) {
                if (!isOnAuthPage) {
                    clearAuthAndRedirect();
                }
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                }).then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }).catch((err) => Promise.reject(err));
            }

            // Mark as refreshing and retry flag
            isRefreshing = true;
            originalRequest._isRetry = true;

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                    { refreshToken },
                    { headers: { "Content-Type": "application/json" } },
                );

                const newAccessToken  = data.token;
                const newRefreshToken = data.refreshToken;

                // Store new tokens
                localStorage.setItem(TOKEN_KEY,   newAccessToken);
                localStorage.setItem(REFRESH_KEY, newRefreshToken);

                // Update auth header for queued requests
                axiosInstance.defaults.headers.common.Authorization =
                    `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status === 500 && import.meta.env.DEV) {
            console.error("Internal Server Error.");
        }

        return Promise.reject(error);
    },
);

const clearAuthAndRedirect = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_KEY);
    window.location.href = "/login";
};

export default axiosInstance;
