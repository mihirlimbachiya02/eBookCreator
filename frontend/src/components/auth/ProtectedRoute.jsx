import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show nothing while checking — no spinner, no text
    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
