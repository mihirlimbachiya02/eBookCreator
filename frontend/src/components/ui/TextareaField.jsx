const TextareaField = ({ label, name, className = "", ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={name}
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 text-left"
                >
                    {label}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                {...props}
                className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 resize-none ${className}`}
            />
        </div>
    );
};

export default TextareaField;
