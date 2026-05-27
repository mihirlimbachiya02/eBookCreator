import { useState, useEffect } from "react";
import { Album } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import ProfileDropdown from "./ProfileDropdown";



const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) {
                setProfileDropdownOpen(false);
            }
        };



        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [profileDropdownOpen]);



    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Modern Top Navigation Bar */}
                <header className="bg-white border-b border-gray-200 h-16 w-full sticky top-0 z-30">
                    <div className="w-full h-full px-12 flex items-center justify-between">

                        {/* Left Side: Brand Logo Group */}
                        <div className="flex items-center">
                            <Link
                                className="flex items-center space-x-3"
                                to="/dashboard"
                            >
                                <div className="h-8 w-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center text-white font-semibold uppercase">
                                    <Album className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-slate-900 tracking-tight">
                                    eBook Creator
                                </span>
                            </Link>
                        </div>

                        {/* Right Side: Identity Control Dropdown Menu */}
                        <div className="flex items-center pr-2">
                            <ProfileDropdown
                                isOpen={profileDropdownOpen}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setProfileDropdownOpen(
                                        !profileDropdownOpen,
                                    );
                                }}
                                avatar={user?.avatar || ""}
                                companyName={user?.name || ""}
                                email={user?.email || ""}
                                onLogout={logout}
                            />
                        </div>
                    </div>
                </header>

                {/* Core Responsive Layout Children Workspace Slot */}
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
};



export default DashboardLayout;