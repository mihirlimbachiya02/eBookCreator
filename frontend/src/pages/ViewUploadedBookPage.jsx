import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Menu, Maximize, Minimize, Download, FileText,
    ChevronLeft, ChevronRight, BookOpen, ArrowLeft
} from "lucide-react";
import { fetchUploadedBooks } from "../utils/uploadedBooksApi";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const NON_VIEWABLE = ["zip", "epub", "mobi", "html"];

// Outside component — stable reference, no ESLint dep warning
const getLastPageKey = (bookId) => `pdf-last-page:${bookId}`;

// ── PDF Sidebar ───────────────────────────────────────────────────────────────
const PdfSidebar = ({ isOpen, outline, totalPages, currentPage, onJumpTo }) => (
    <aside
        className={`bg-slate-900 border-r border-slate-700 h-full flex flex-col transition-all duration-300 shrink-0 ${
            isOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
    >
        <div className="p-4 border-b border-slate-700 shrink-0">
            <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {outline.length > 0 ? "Chapters" : "Pages"}
                </span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
            {outline.length > 0 ?
                outline.map((item) => (
                    <button
                        type="button"
                        key={`outline-${item.page}-${item.title}`}
                        onClick={() => onJumpTo(item.page)}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-all ${
                            currentPage === item.page ?
                                "bg-violet-600/20 text-violet-300 border-l-2 border-violet-500"
                            :   "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                    >
                        <span className="font-medium line-clamp-2">{item.title}</span>
                        <span className="text-slate-500 text-[10px] mt-0.5 block">
                            Page {item.page}
                        </span>
                    </button>
                ))
            :   Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p % 10 === 0 || p === totalPages)
                    .map((page) => (
                        <button
                            type="button"
                            key={`page-${page}`}
                            onClick={() => onJumpTo(page)}
                            className={`w-full text-left px-4 py-2 text-xs transition-all ${
                                currentPage === page ?
                                    "bg-violet-600/20 text-violet-300 border-l-2 border-violet-500"
                                :   "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }`}
                        >
                            Page {page}
                        </button>
                    ))
            }
        </div>
    </aside>
);

// ── PDF Viewer ────────────────────────────────────────────────────────────────
const PdfViewer = ({ url, bookId }) => {
    const canvasRef      = useRef(null);
    const renderTaskRef  = useRef(null);
    const containerRef   = useRef(null);
    const pdfRef         = useRef(null);
    // Use a ref for autoScale — it's only needed inside callbacks, never rendered
    const autoScaleRef   = useRef(1);

    const [pdf,         setPdf]         = useState(null);
    const [pageNum,     setPageNum]     = useState(1);
    const [totalPages,  setTotalPages]  = useState(0);
    const [scale,       setScale]       = useState(null);
    // autoScale is displayed in the zoom indicator so still needs state
    const [autoScale,   setAutoScale]   = useState(1);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [progress,    setProgress]    = useState(0);
    const [outline,     setOutline]     = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Fit scale calculator ──────────────────────────────────────────────────
    const calcFitScale = useCallback((pdfDoc) => {
        if (!pdfDoc) return;
        requestAnimationFrame(() => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            if (width === 0) return;
            pdfDoc.getPage(1).then((page) => {
                const base = page.getViewport({ scale: 1 });
                const fit  = +((width - 64) / base.width).toFixed(2);
                autoScaleRef.current = fit;
                setAutoScale(fit);
                setScale(fit);
            });
        });
    }, []);

    // 1. Load PDF — reset state synchronously at effect entry, not inside async
    useEffect(() => {
        let cancelled = false;

        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError(null);
        setScale(null);
        setPdf(null);
        setOutline([]);
        pdfRef.current = null;

        const loadPdf = async () => {
            const token =
                localStorage.getItem("token:v1") ||
                localStorage.getItem("token");
            try {
                const pdfDoc = await pdfjsLib.getDocument({
                    url,
                    httpHeaders: { Authorization: `Bearer ${token}` },
                }).promise;
                if (cancelled) return;

                pdfRef.current = pdfDoc;
                setPdf(pdfDoc);
                setTotalPages(pdfDoc.numPages);

                // Restore last page
                const savedPage =
                    parseInt(localStorage.getItem(getLastPageKey(bookId))) || 1;
                setPageNum(Math.min(savedPage, pdfDoc.numPages));

                // Extract PDF outline/bookmarks
                const pdfOutline = await pdfDoc.getOutline();
                if (pdfOutline && pdfOutline.length > 0) {
                    const resolved = await Promise.all(
                        pdfOutline.map(async (item) => {
                            try {
                                const dest =
                                    Array.isArray(item.dest) ?
                                        item.dest
                                    :   await pdfDoc.getDestination(item.dest);
                                const ref       = dest?.[0];
                                const pageIndex = await pdfDoc.getPageIndex(ref);
                                return { title: item.title, page: pageIndex + 1 };
                            } catch {
                                return null;
                            }
                        }),
                    );
                    setOutline(resolved.filter(Boolean));
                }

                setScale(null); // triggers fit scale calculation via effect 4
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                console.error("PDF load error:", err);
                setError("Failed to load PDF.");
                setLoading(false);
            }
        };

        loadPdf();
        return () => { cancelled = true; };
    }, [url, bookId]);

    // 2. Save last page to localStorage
    useEffect(() => {
        if (pageNum > 0) {
            localStorage.setItem(getLastPageKey(bookId), pageNum);
        }
    }, [pageNum, bookId]);

    // 3. ResizeObserver — recalculates fit scale on container resize / sidebar toggle
    // Uses autoScaleRef instead of autoScale state to avoid re-creating the observer
    // every time autoScale changes (fixes the "event logic in effect" warning)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            if (!pdfRef.current || !containerRef.current) return;
            const width = containerRef.current.clientWidth;
            if (width === 0) return;

            pdfRef.current.getPage(1).then((page) => {
                const base = page.getViewport({ scale: 1 });
                const fit  = +((width - 64) / base.width).toFixed(2);

                autoScaleRef.current = fit;
                setAutoScale(fit);

                // Only snap scale back to fit if the user was already in fit mode
                setScale((prev) => {
                    if (prev === null || prev === autoScaleRef.current) return fit;
                    return prev;
                });
            });
        });

        observer.observe(container);
        return () => observer.disconnect();
        // No dependency on autoScale state — we read autoScaleRef.current inside callback
    }, []);

    // 4. Fallback: if pdf loaded but scale still null, calc fit directly
    useEffect(() => {
        if (pdf && scale === null) {
            calcFitScale(pdf);
        }
    }, [pdf, scale, calcFitScale]);

    // 5. Render page
    useEffect(() => {
        if (!pdf || !canvasRef.current || scale === null) return;

        let renderCancelled = false;
        if (renderTaskRef.current) renderTaskRef.current.cancel();

        pdf.getPage(pageNum).then((page) => {
            if (renderCancelled) return;
            const viewport = page.getViewport({ scale });
            const canvas   = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.height = viewport.height;
            canvas.width  = viewport.width;
            const task = page.render({ canvasContext: ctx, viewport });
            renderTaskRef.current = task;
            task.promise
                .then(() => setProgress(Math.round((pageNum / totalPages) * 100)))
                .catch((e) => {
                    if (e?.name !== "RenderingCancelledException") console.error(e);
                });
        });

        return () => {
            renderCancelled = true;
            if (renderTaskRef.current) renderTaskRef.current.cancel();
        };
    }, [pdf, pageNum, scale, totalPages]);

    if (loading)
        return (
            <div className="flex items-center justify-center flex-1 bg-[#CBD5E1]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400" />
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center flex-1 bg-[#CBD5E1] text-center p-8">
                <FileText className="w-12 h-12 text-slate-400 mb-3" />
                <p className="text-slate-300 text-sm">{error}</p>
            </div>
        );

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <PdfSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                outline={outline}
                totalPages={totalPages}
                currentPage={pageNum}
                onJumpTo={(page) => {
                    setPageNum(page);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Progress bar */}
                <div className="w-full h-[3px] bg-slate-300">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-col border-b border-slate-300 bg-white shrink-0">
                    <div className="flex items-center justify-between px-3 py-2 gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-mono font-medium text-slate-500">
                                {pageNum} / {totalPages}
                            </span>
                        </div>

                        <div className="flex items-center bg-[#f1f5f9] rounded-full border border-slate-200 px-3 py-1 shadow-inner gap-2">
                            <button
                                type="button"
                                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                                className="text-slate-500"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2 border-l border-slate-300 pl-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setScale((s) =>
                                            Math.max(0.3, +((s ?? autoScale) - 0.15).toFixed(2)),
                                        )
                                    }
                                    className="text-slate-600 font-bold text-lg"
                                >
                                    A-
                                </button>
                                <span className="text-[10px] font-bold text-slate-400 w-8 text-center">
                                    {Math.round((scale ?? autoScale) * 100)}%
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setScale((s) =>
                                            Math.min(3, +((s ?? autoScale) + 0.15).toFixed(2)),
                                        )
                                    }
                                    className="text-slate-600 font-bold text-lg"
                                >
                                    A+
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setScale(autoScale)}
                                    className="text-[10px] font-bold text-violet-600 pl-2 border-l border-slate-300"
                                >
                                    Fit
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                                className="text-slate-500"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div
                    ref={containerRef}
                    className="flex-1 overflow-auto bg-[#CBD5E1] py-4 px-2 md:py-8 md:px-4 flex justify-center items-start"
                >
                    <canvas
                        ref={canvasRef}
                        className="max-w-full"
                        style={{ display: "block", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
                    />
                </div>
            </div>
        </div>
    );
};

// ── Non-viewable format screen ────────────────────────────────────────────────
const NonViewable = ({ book }) => (
    <div className="flex-1 overflow-auto bg-[#cbd5e1] flex items-center justify-center p-8">
        <div className="max-w-4xl w-full mx-auto bg-[#f8fafc] p-16 shadow-lg border border-slate-300 rounded-lg text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{book.title}</h2>
            <p className="text-slate-500 mb-2">
                <span className="uppercase font-semibold">{book.format}</span> files cannot be previewed in the browser.
            </p>
            <p className="text-sm text-slate-400 mb-8">
                Download the file and open it with a compatible reader.
            </p>
            <a
                href={book.fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                Download {book.format.toUpperCase()}
            </a>
        </div>
    </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const ViewUploadedBookPage = () => {
    const { bookId } = useParams();
    const navigate   = useNavigate();
    const [book,         setBook]        = useState(null);
    const [loading,      setLoading]     = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetchUploadedBooks()
            .then(({ data }) => setBook(data.find((b) => b._id === bookId) || null))
            .finally(() => setLoading(false));
    }, [bookId]);

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
            console.error("Fullscreen error:", err);
        }
    };

    if (loading)
        return (
            <div className="flex h-screen bg-[#0f172a] items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
            </div>
        );

    if (!book)
        return (
            <div className="flex h-screen bg-[#0f172a] items-center justify-center text-center p-6">
                <div>
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-4">Book Not Found</h3>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );

    const proxyUrl      = `${import.meta.env.VITE_API_URL}/api/uploaded-books/proxy/${book._id}`;
    const isNonViewable = NON_VIEWABLE.includes(book.format);

    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#e2e8f0] md:m-4 md:rounded-xl border border-[#334155] shadow-2xl">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-300 bg-white shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xs md:text-sm font-semibold text-slate-500 truncate max-w-[120px] md:max-w-[200px]">
                            {book?.title?.toUpperCase()}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 md:gap-3">
                        <a
                            href={book?.fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 hover:bg-slate-100 px-2 md:px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            <span className="hidden md:inline">Download</span>
                        </a>
                        <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {isNonViewable ?
                        <NonViewable book={book} />
                    :   <PdfViewer url={proxyUrl} bookId={book._id} />}
                </div>
            </main>
        </div>
    );
};

export default ViewUploadedBookPage;
