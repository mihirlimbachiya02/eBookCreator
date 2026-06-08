import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { Link } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { Menu, X, BookOpen, LogOut } from "lucide-react";

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "Testimonials", href: "#testimonials" },
    ];

    useEffect(() => {
        const handleClickOutside = () => {
            if (profileDropdownOpen) setProfileDropdownOpen(false);
        };
        if (profileDropdownOpen)
            document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [profileDropdownOpen]);

    
    return (
        <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link
                        to="/"
                        className="flex items-center space-x-2.5 group"
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-gray-900 tracking-tight">
                            eBook Creator
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-violet-600 rounded-lg hover:bg-violet-50/50 transition-all"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Auth Actions */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex items-center space-x-3">
                            {isAuthenticated ?
                                <ProfileDropdown
                                    isOpen={profileDropdownOpen}
                                    onToggle={(e) => {
                                        e.stopPropagation();
                                        setProfileDropdownOpen(
                                            !profileDropdownOpen,
                                        );
                                    }}
                                    avatar={
                                        user?.profilePic || user?.avatar || ""
                                    }
                                    companyName={user?.name || ""}
                                    email={user?.email || ""}
                                    onLogout={logout}
                                />
                            :   <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-md"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            }
                        </div>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                        >
                            {isOpen ?
                                <X className="w-6 h-6" />
                            :   <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
                    <nav className="px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2.5 text-base font-medium text-gray-600"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="pt-4 pb-6 border-t border-gray-100 px-6 space-y-3">
                        {isAuthenticated ?
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-rose-600 bg-rose-50 rounded-xl font-medium"
                            >
                                <LogOut className="w-4 h-4" /> Sign out
                            </button>
                        :   <>
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-2.5 text-base font-medium text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </>
                        }
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
