import { useState, useEffect } from "react";
import { Album, BookOpen, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import ProfileDropdown from "./ProfileDropdown";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) setProfileDropdownOpen(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [profileDropdownOpen]);

    const scrollTo = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-16 w-full sticky top-0 z-30 relative">
                    <div className="w-full h-full px-12 flex items-center justify-between">

                        {/* Left: Brand */}
                        <div className="flex items-center">
                            <Link className="flex items-center space-x-3" to="/dashboard">
                                <div className="h-8 w-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-lg flex items-center justify-center text-white">
                                    <Album className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-xl text-slate-900 tracking-tight">
                                    eBook Creator
                                </span>
                            </Link>
                        </div>

                        {/* Center: Nav */}
                        <nav className="hidden sm:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                            <a
                                href="#ai-books"
                                onClick={(e) => scrollTo(e, "ai-books")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-all"
                            >
                                <BookOpen className="w-4 h-4" />
                                AI eBooks
                            </a>
                            <a
                                href="#uploaded-books"
                                onClick={(e) => scrollTo(e, "uploaded-books")}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Uploaded Books
                            </a>
                        </nav>

                        {/* Right: Profile */}
                        <div className="flex items-center pr-2">
                            <ProfileDropdown
                                isOpen={profileDropdownOpen}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setProfileDropdownOpen(!profileDropdownOpen);
                                }}
                                avatar={user?.avatar || ""}
                                companyName={user?.name || ""}
                                email={user?.email || ""}
                                onLogout={logout}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;