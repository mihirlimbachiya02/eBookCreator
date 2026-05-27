import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/useAuth.js"; // Import your auth hook

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import ViewBookPage from "./pages/ViewBookPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

const App = () => {
    const { loading } = useAuth(); // Consume loading state

    // If AuthContext is still checking the token, show a loader
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

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
        </Routes>
    );
};

export default App;
