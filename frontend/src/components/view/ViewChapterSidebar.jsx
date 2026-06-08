import { BookOpen, ChevronLeft } from "lucide-react";

const ViewChapterSidebar = ({
    book,
    selectedChapterIndex,
    onSelectChapter,
    isOpen,
    onClose,
}) => {
    // Helper to handle selection with mobile-first behavior
    const handleChapterClick = (index) => {
        onSelectChapter(index);
        if (window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop: Added aria-hidden for accessibility */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-slate-100 z-[9999] transform transition-transform duration-300 ease-out shadow-2xl
                ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label="Chapter navigation"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2 text-indigo-600">
                            <BookOpen size={20} aria-hidden="true" />
                            <span className="font-bold text-slate-900 tracking-tight">
                                Chapters
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label="Close sidebar"
                        >
                            <ChevronLeft size={20} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Chapter List */}
                    <nav className="flex-1 overflow-y-auto py-2">
                        {book?.chapters?.map((chapter, index) => (
                            <button
                                key={index}
                                onClick={() => handleChapterClick(index)}
                                className={`w-full text-left px-6 py-4 transition-all duration-200 border-r-4 ${
                                    selectedChapterIndex === index ?
                                        "bg-indigo-50 border-indigo-600 text-indigo-900"
                                    :   "border-transparent hover:bg-slate-50 text-slate-600"
                                }`}
                                aria-current={
                                    selectedChapterIndex === index ? "page" : (
                                        undefined
                                    )
                                }
                            >
                                <div className="font-medium text-sm">
                                    {chapter.title || `Chapter ${index + 1}`}
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default ViewChapterSidebar;
