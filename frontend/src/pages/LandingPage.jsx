import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // Import your auth hook

import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth(); // Use auth state

    useEffect(() => {
        // Only redirect if we are NOT loading AND the user is authenticated
        if (!loading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // Optional: Add a simple loading state if you want to avoid a flash
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Checking session...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col overflow-x-hidden relative">
            <Navbar />

            <main className="flex-grow w-full relative">
                <Hero />
                <Features />
                <Testimonials />
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
