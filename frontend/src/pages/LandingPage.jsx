import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";

const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/dashboard", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // Show nothing while auth resolves — no flash, no "Checking session"
    if (loading) return null;

    // Already authenticated — redirect happening, show nothing
    if (isAuthenticated) return null;

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
