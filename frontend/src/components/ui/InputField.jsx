const InputField = ({ icon: Icon, label, name, className = "", ...props }) => {
    return (
        <div className="w-full">
            {/* Field Label element tied to the specific input ID */}
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 mb-1.5 text-left"
                >
                    {label}
                </label>
            )}

            {/* Input Wrapper Container */}
            <div className="relative rounded-xl shadow-sm">
                {/* Optional Decorative Inner Leading Icon Left Element */}
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </div>
                )}

                {/* Core Native Form Input Field control block */}
                <input
                    id={name}
                    name={name}
                    {...props}
                    className={`w-full h-11 py-2 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 ${
                        Icon ? "pl-10 pr-3" : "px-3"
                    } ${className}`}
                />
            </div>
        </div>
    );
};

export default InputField;
