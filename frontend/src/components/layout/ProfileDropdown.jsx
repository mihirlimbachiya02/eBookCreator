import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({
    isOpen,
    onToggle,
    avatar,
    companyName,
    email,
    onLogout,
}) => {
    const navigate = useNavigate();

    
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {avatar ?
                    <img
                        src={avatar}
                        alt={`${companyName}'s avatar`}
                        className="h-9 w-9 object-cover rounded-xl border border-gray-100"
                    />
                :   <div className="h-9 w-9 bg-gradient-to-br from-violet-400 to-violet-600 rounded-xl flex items-center justify-center text-white font-semibold uppercase shrink-0">
                        {companyName?.charAt(0).toUpperCase() || "U"}
                    </div>
                }

                <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {companyName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                        {email}
                    </p>
                </div>

                <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown Menu Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {companyName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {email}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            onToggle({ stopPropagation: () => {} });
                            navigate("/profile");
                        }}
                        className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        View Profile
                    </button>

                    <div className="border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                onToggle({ stopPropagation: () => {} });
                                onLogout();
                            }}
                            className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
