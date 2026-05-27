import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { validateEmail, validatePassword } from "../utils/helper";

const SignupPage = () => {
    // ✅ Added confirmPassword string parameter to initial state layout
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛡️ Guard Clause: Check passwords match before doing any network work
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        if (emailError) return toast.error(emailError);
        if (passwordError) return toast.error(passwordError);

        setIsLoading(true);

        try {
            // Adjust "name" to "username" if your backend model prefers username.
            const registrationPayload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            };

            // Send the clean payload instead of raw formData
            const response = await axiosInstance.post(
                API_PATHS.AUTH.REGISTER,
                registrationPayload,
            );
            const { token } = response.data;

            // Fetch profile to get user details
            const profileResponse = await axiosInstance.get(
                API_PATHS.AUTH.GET_PROFILE,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            login(profileResponse.data, token);
            toast.success("Account created successfully!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Signup failed. Please try again.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto w-full sm:max-w-md text-center">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                    Create an Account
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Start your journey of creating amazing eBooks today.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-4 sm:mx-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <InputField
                            label="UserName"
                            name="name"
                            type="text"
                            placeholder="username"
                            icon={User}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        {/* Email Address */}
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        {/* Password Input */}
                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            icon={Lock}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {/* ✅ Confirm Password Input Added */}
                        <InputField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter your password"
                            icon={Lock}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full flex justify-center"
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-violet-600 hover:text-violet-500 transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
