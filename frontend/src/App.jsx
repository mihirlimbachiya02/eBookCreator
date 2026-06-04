import { Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import ViewBookPage from "./pages/ViewBookPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ViewUploadedBookPage from "./pages/ViewUploadedBookPage.jsx";

const App = () => {
    return (
        <>
            <Routes>
                {/* Public routes — render immediately, no auth wait */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected routes — ProtectedRoute handles auth check */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/editor/:bookId"
                    element={
                        <ProtectedRoute>
                            <EditorPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/view-book/:bookId"
                    element={
                        <ProtectedRoute>
                            <ViewBookPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/view-uploaded-book/:bookId"
                    element={
                        <ProtectedRoute>
                            <ViewUploadedBookPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <SpeedInsights />
            <Analytics />
        </>
    );
};

export default App;
