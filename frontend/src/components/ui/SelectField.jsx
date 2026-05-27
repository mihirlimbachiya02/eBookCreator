const SelectField = ({ icon: Icon, label, name, options = [], ...props }) => {
    return (
        // Main Form Field Container Stack
        <div className="flex flex-col w-full text-left">
            {/* 🏷️ Label Text Layout */}
            {label && (
                <label
                    htmlFor={name}
                    className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block"
                >
                    {label}
                </label>
            )}

            {/* 🚀 INPUT CHASIS LAYER WRAPPER: relative bounds keeps nested absolute vectors locked inside */}
            <div className="relative w-full flex items-center">
                {/* 🎨 Left Indicator Custom Icon Node Layer */}
                {Icon && (
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10 flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                    </div>
                )}

                {/* 🔽 Native Dropdown Component Input Matrix */}
                <select
                    id={name}
                    name={name}
                    {...props}
                    className={`w-full h-11 px-3.5 py-2 border border-slate-200 focus:border-violet-500 rounded-xl bg-white text-slate-800 text-sm focus:outline-none transition-colors cursor-pointer appearance-none ${
                        Icon ? "pl-10" : ""
                    }`}
                >
                    {options.map((option, index) => {
                        const isObject = option && typeof option === "object";
                        const val = isObject ? option.value : option;
                        const lbl = isObject ? option.label : option;

                        return (
                            <option key={val || index} value={val}>
                                {lbl}
                            </option>
                        );
                    })}
                </select>

                {/* 🛞 Right Side Custom Arrow Vector Overlap Scrim */}
                <div className="absolute right-3.5 pointer-events-none text-slate-400 z-10 flex items-center justify-center">
                    <svg
                        className="h-4 w-4 stroke-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default SelectField;
