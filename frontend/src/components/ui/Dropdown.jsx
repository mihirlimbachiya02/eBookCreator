import { useEffect, useRef, useState } from "react";

const Dropdown = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); 

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-1 origin-top-right focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="menu-button"
                    tabIndex="-1"
                >
                    <div className="py-0.5" role="none">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export const DropdownItem = ({ children, onClick, className = "" }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors ${className}`}
            role="menuitem"
        >
            {children}
        </button>
    );
};

export default Dropdown;
