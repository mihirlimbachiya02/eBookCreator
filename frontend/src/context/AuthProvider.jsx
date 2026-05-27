import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            setLoading(false);
            return;
        }

        try {
            const localUserData = JSON.parse(userStr);
            setUser(localUserData);
            setIsAuthenticated(true);

            const response = await axiosInstance.get(
                API_PATHS.AUTH.GET_PROFILE,
            );
            if (response.data) {
                setUser(response.data);
                localStorage.setItem("user", JSON.stringify(response.data));
            }
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("Auth check failed:", error.message);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
        } catch (error) {
            // Continue with local logout even if server call fails
            if (import.meta.env.DEV)
                console.error("Logout error:", error.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = "/";
        }
    };

    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        localStorage.setItem("user", JSON.stringify(newUserData));
        setUser(newUserData);
    };

    useEffect(() => {
        const id = setTimeout(() => {
            checkAuthStatus();
        }, 0);
        return () => clearTimeout(id);
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuthStatus,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
