import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
    // 🛡️ Safety check: If the modal state toggle is off, don't inject elements 
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Clickable background layer to exit safely when clicking outside the panel boundaries */}
            <div
                type="button"
                className="absolute inset-0 transition-opacity"
                onClick={onClose}
            />

            {/* 📦 MODAL WINDOW CONTENT CANVAS CHASSIS */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 transform transition-all duration-300 z-10 animate-scale-up">
                {/* 🏷️ HEADER SECTION */}
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {title}
                    </h3>

                    {/* Circular Exit Controller Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer"
                        title="Close Modal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 🔮 SLOTTED MATRIX CANVAS */}
                <div className="w-full text-left">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
