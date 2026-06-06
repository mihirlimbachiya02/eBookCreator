import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { validateEmail, validatePassword } from "../utils/helper";

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailError    = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);
        if (emailError)    return toast.error(emailError);
        if (passwordError) return toast.error(passwordError);

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, formData);
            const token        = response.data?.token || response.data?.data?.token;
            const refreshToken = response.data?.refreshToken;

            if (!token) throw new Error("Authentication failed: No token returned.");

            const profileResponse = await axiosInstance.get(
                API_PATHS.AUTH.GET_PROFILE,
                { headers: { Authorization: `Bearer ${token}` } },
            );

            login(profileResponse.data, token, refreshToken);
            toast.success("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message || "Login failed. Please try again.",
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
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sign in to continue to your eBook dashboard.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-4 sm:mx-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="UserName or Email"
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {/* Forgot Password Link */}
                        <div className="flex justify-end -mt-2">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full flex justify-center"
                            >
                                Sign In
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="font-medium text-violet-600 hover:text-violet-500 transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
