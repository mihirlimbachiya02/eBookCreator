import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, BookOpen, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import axiosInstance from "../utils/axiosInstance";

const ForgotPasswordPage = () => {
    const [email,     setEmail]     = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");

        setIsLoading(true);
        try {
            await axiosInstance.post("/api/auth/forgot-password", { email });
            setSubmitted(true);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Something went wrong. Please try again.",
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
                    Forgot Password
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 mx-4 sm:mx-0">
                    {submitted ?
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                Check your inbox
                            </h3>
                            <p className="text-sm text-gray-600 mb-6">
                                If <strong>{email}</strong> is registered,
                                you'll receive a password reset link within a
                                few minutes. The link expires in 15 minutes.
                            </p>
                            <p className="text-xs text-gray-400">
                                Didn't receive it? Check your spam folder.
                            </p>
                        </div>
                    :   <form onSubmit={handleSubmit} className="space-y-5">
                            <InputField
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="Enter your email address"
                                icon={Mail}
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    className="w-full flex justify-center"
                                >
                                    Send Reset Link
                                </Button>
                            </div>
                        </form>
                    }

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-500 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
