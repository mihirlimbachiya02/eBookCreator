import { useState, useEffect, useRef } from "react";
import { Menu, Maximize, Minimize, ArrowLeft } from "lucide-react";
import ViewChapterSidebar from "./ViewChapterSidebar";
import DOMPurify from "dompurify";

const formatContent = (content) => {
    if (!content) return "";
    return DOMPurify.sanitize(
        content
            .replace(
                /^###\s(.*)$/gm,
                '<h3 class="text-xl font-bold mt-6 mb-2 text-[#334155]">$1</h3>',
            )
            .replace(
                /^##\s(.*)$/gm,
                '<h2 class="text-2xl font-semibold mt-8 mb-4 text-[#1e293b]">$1</h2>',
            )
            .replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="font-bold text-[#1e293b]">$1</strong>',
            )
            .replace(
                /\*(.*?)\*/g,
                '<em class="italic text-[#475569]">$1</em>',
            )
            .split("\n\n")
            .filter((p) => p.trim())
            .map(
                (p) =>
                    `<p class="mb-6 leading-relaxed text-[#334155]">${p.trim()}</p>`,
            )
            .join(""),
    );
};

const ViewBook = ({ book }) => {
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [fontSize, setFontSize] = useState(
        () => Number(localStorage.getItem("book-font-size")) || 18,
    );
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("book-font-size", fontSize);
    }, [fontSize]);


    // Scroll to top on every chapter change
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        });
        return () => cancelAnimationFrame(frame);
    }, [selectedChapterIndex]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setProgress(
            Math.min(
                Math.max((scrollTop / (scrollHeight - clientHeight)) * 100, 0),
                100,
            ),
        );
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error("Fullscreen toggle error:", err);
        }
    };

    if (!book)
        return (
            <div className="p-10 text-center text-slate-500">
                Loading book content…
            </div>
        );


    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
            <ViewChapterSidebar
                book={book}
                selectedChapterIndex={selectedChapterIndex}
                onSelectChapter={setSelectedChapterIndex}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#e2e8f0] m-2 md:m-4 rounded-xl border border-[#334155] shadow-2xl transition-all duration-300">
                {/* Progress Bar */}
                <div className="w-full h-[3px] bg-slate-300">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Header */}
                <header className="h-auto md:h-16 flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-300 bg-white gap-y-2">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <Menu size={20} />
                        </button>
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-sm font-semibold text-slate-500 truncate">
                            {book.title?.toUpperCase() || "UNTITLED"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-all"
                        >
                            {isFullscreen ?
                                <Minimize size={20} />
                            :   <Maximize size={20} />}
                        </button>

                        <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
                            <button
                                onClick={() =>
                                    setFontSize(Math.max(14, fontSize - 2))
                                }
                                className="px-3 py-1 rounded-full font-bold text-slate-600 hover:bg-white text-sm"
                            >
                                A-
                            </button>
                            <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-center">
                                {fontSize}
                            </span>
                            <button
                                onClick={() =>
                                    setFontSize(Math.min(28, fontSize + 2))
                                }
                                className="px-3 py-1 rounded-full font-bold text-slate-600 hover:bg-white text-sm"
                            >
                                A+
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth bg-[#cbd5e1]"
                >
                    <article className="w-full max-w-4xl mx-auto bg-[#f8fafc] p-6 md:p-16 shadow-lg border border-slate-300 rounded-lg box-border">
                        <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-8 md:mb-16 leading-tight break-words">
                            {book.chapters?.[selectedChapterIndex]?.title ||
                                "Untitled Chapter"}
                        </h1>

                        <div
                            className="prose prose-slate prose-lg max-w-none leading-relaxed break-words"
                            style={{
                                fontSize: `${fontSize}px`,
                                fontFamily: "Georgia, serif",
                                lineHeight: "1.6",
                            }}
                            dangerouslySetInnerHTML={{
                                __html: formatContent(
                                    book.chapters?.[selectedChapterIndex]
                                        ?.content,
                                ),
                            }}
                        />

                        {/* Prev / Next Navigation */}
                        <div className="flex items-center justify-between mt-16 pt-8 border-t border-slate-200">
                            <button
                                onClick={() =>
                                    setSelectedChapterIndex((i) => i - 1)
                                }
                                disabled={selectedChapterIndex === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-violet-400 hover:text-violet-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                            >
                                ← Previous
                            </button>

                            <span className="text-xs font-mono text-slate-400">
                                {selectedChapterIndex + 1} /{" "}
                                {book.chapters?.length}
                            </span>

                            <button
                                onClick={() =>
                                    setSelectedChapterIndex((i) => i + 1)
                                }
                                disabled={
                                    selectedChapterIndex ===
                                    (book.chapters?.length ?? 1) - 1
                                }
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:border-violet-400 hover:text-violet-600 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                            >
                                Next →
                            </button>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    );
};

export default ViewBook;
