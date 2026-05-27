import { ArrowRight, Sparkles, BookOpen, Zap } from "lucide-react";
import { useAuth } from "../../context/useAuth.js";
import { Link } from "react-router-dom";
import HERO_IMG from "../../assets/hero-img.png";

const Hero = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative w-md-editor min-h-[calc(100vh-60px)] bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden flex items-center">
            {/* Floating Background Accent Lights */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* LEFT COLUMN - Text Content Wrapper */}
                    <div className="max-w-xl space-y-8 flex flex-col items-start text-left">
                        {/* Pill Badge */}
                        <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-100 shadow-sm">
                            <Sparkles className="w-4 h-4 text-violet-600" />
                            <span className="text-sm font-medium text-violet-900">
                                AI-Powered Publishing
                            </span>
                        </div>

                        {/* Title Heading */}
                        <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                            Create Stunning
                            <span className="block mt-2 bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                                Ebooks in Minutes
                            </span>
                        </h1>

                        {/* Body Paragraph Description */}
                        <p className="text-lg text-gray-600 leading-relaxed">
                            From idea to published ebook, our AI-powered
                            platform helps you write, design, and export
                            professional-quality books effortlessly.
                        </p>

                        {/* Action Buttons Row */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                            <Link
                                to={isAuthenticated ? "/dashboard" : "/login"}
                                className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200"
                            >
                                <span>Start Creating for Free</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <a
                                href="#demo"
                                className="inline-flex items-center justify-center space-x-2 text-gray-700 font-semibold hover:text-violet-600 transition-colors duration-200 px-4 py-4"
                            >
                                <span>Watch Demo</span>
                                <span className="text-violet-600 font-bold">
                                    →
                                </span>
                            </a>
                        </div>

                        {/* Analytics Row - Responsive flex-wrap added */}
                        <div className="flex items-center gap-4 sm:gap-8 pt-4 w-full flex-wrap">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    50K+
                                </div>
                                <div className="text-sm text-gray-600">
                                    Books Created
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200 shrink-0" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    4.9/5
                                </div>
                                <div className="text-sm text-gray-600">
                                    User Rating
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200 shrink-0" />
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    10min
                                </div>
                                <div className="text-sm text-gray-600">
                                    Avg. Creation
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Dashboard Graphic Container */}
                    <div className="relative lg:pl-8 w-full">
                        <div className="relative max-w-[580px] mx-auto lg:ml-auto">
                            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl opacity-20 blur-2xl pointer-events-none" />
                            <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-tr from-violet-400/20 to-purple-400/20 rounded-3xl rotate-12 blur-sm pointer-events-none z-0"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-300/30 rounded-full blur-2xl pointer-events-none z-0"></div>

                            {/* Main Image Container */}
                            <div className="relative bg-white rounded-xl overflow-hidden border border-gray-100 shadow-2xl z-10">
                                <img
                                    src={HERO_IMG}
                                    alt="AI Ebook Creator Dashboard"
                                    className="w-full h-auto object-cover"
                                    loading="eager"
                                />
                            </div>

                            {/* Floating Widget: Processing */}
                            <div className="absolute top-6 right-6 bg-white rounded-2xl shadow-xl p-4 backdrop-blur-sm border border-gray-100 animate-in fade-in slide-in-from-right duration-700 z-20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-gray-500">
                                            Processing
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            AI Generation
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Widget: Completed */}
                            <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-xl p-4 backdrop-blur-sm border border-gray-100 animate-in fade-in slide-in-from-right duration-700 delay-300 z-20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-gray-500">
                                            Completed
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            247 Pages
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
