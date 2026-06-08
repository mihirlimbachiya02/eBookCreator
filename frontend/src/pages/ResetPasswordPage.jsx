import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";

const ResetPasswordPage = () => {
    const [searchParams]                  = useSearchParams();
    const navigate                        = useNavigate();
    const token                           = searchParams.get("token");
    const [password,        setPassword]  = useState("");
    const [confirmPassword, setConfirm]   = useState("");
    const [isLoading,       setIsLoading] = useState(false);

    // No token in URL — invalid link
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        This password reset link is invalid or has expired.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="text-violet-600 font-medium hover:text-violet-500"
                    >
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6)
            return toast.error("Password must be at least 6 characters");
        if (password !== confirmPassword)
            return toast.error("Passwords do not match");

        setIsLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`,
                { password },
                { headers: { "Content-Type": "application/json" } },
            );
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Reset link is invalid or expired.",
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
                    Set New Password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Choose a strong password for your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-4 sm:mx-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            label="New Password"
                            name="password"
                            type="password"
                            placeholder="Minimum 6 characters"
                            icon={Lock}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <InputField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter new password"
                            icon={Lock}
                            value={confirmPassword}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                        />
                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full flex justify-center"
                            >
                                Reset Password
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
