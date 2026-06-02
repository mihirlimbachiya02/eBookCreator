import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Menu, Maximize, Minimize, Download, FileText,
    ChevronLeft, ChevronRight, ZoomIn, ZoomOut
} from "lucide-react";
import ViewChapterSidebar from "../components/view/ViewChapterSidebar";
import { fetchUploadedBooks } from "../utils/uploadedBooksApi";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const NON_VIEWABLE = ["zip", "epub", "mobi"];

// ── PDF Viewer ───────────────────────────────────────────────────
const PdfViewer = ({ url }) => {
    const canvasRef     = useRef(null);
    const renderTaskRef = useRef(null);
    const containerRef  = useRef(null);
    const [pdf,        setPdf]        = useState(null);
    const [pageNum,    setPageNum]    = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale,      setScale]      = useState(null);
    const [autoScale,  setAutoScale]  = useState(1);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [progress,   setProgress]   = useState(0);

    // 1. Load PDF
    useEffect(() => {
        let cancelled = false;
        const loadPdf = async () => {
            const token = localStorage.getItem("token");
            try {
                const pdfDoc = await pdfjsLib.getDocument({
                    url,
                    httpHeaders: { Authorization: `Bearer ${token}` },
                }).promise;
                if (cancelled) return;
                setPdf(pdfDoc);
                setTotalPages(pdfDoc.numPages);
                setPageNum(1);
                setScale(null);
                setLoading(false);
            } catch (err) {
                if (cancelled) return;
                console.error("PDF load error:", err);
                setError("Failed to load PDF.");
                setLoading(false);
            }
        };
        setLoading(true);
        setError(null);
        loadPdf();
        return () => {
            cancelled = true;
        };
    }, [url]);

    // 2. Calculate fit scale once container + pdf are ready
    useEffect(() => {
        if (!pdf || !containerRef.current || scale !== null) return;
        pdf.getPage(1).then((page) => {
            const containerWidth = containerRef.current.clientWidth - 64;
            const baseViewport   = page.getViewport({ scale: 1 });
            const fitScale       = +(containerWidth / baseViewport.width).toFixed(2);
            setAutoScale(fitScale);
            setScale(fitScale);
        });
    }, [pdf, scale]);

    // 3. Render page whenever scale or page changes
    useEffect(() => {
        if (!pdf || !canvasRef.current || scale === null) return;

        let renderCancelled = false;
        if (renderTaskRef.current) renderTaskRef.current.cancel();

        pdf.getPage(pageNum).then((page) => {
            if (renderCancelled) return;
            const viewport = page.getViewport({ scale });
            const canvas   = canvasRef.current;
            if (!canvas) return;
            const ctx      = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.height  = viewport.height;
            canvas.width   = viewport.width;
            const task     = page.render({ canvasContext: ctx, viewport });
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

    if (loading) return (
        <div className="flex items-center justify-center flex-1 bg-[#CBD5E1]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-400" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center flex-1 bg-[#CBD5E1] text-center p-8">
            <FileText className="w-12 h-12 text-slate-400 mb-3" />
            <p className="text-slate-300 text-sm">{error}</p>
        </div>
    );

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Progress bar */}
            <div className="w-full h-[3px] bg-slate-300">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Controls */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-300 bg-white shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                        disabled={pageNum <= 1}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-500 font-mono">
                        {pageNum} / {totalPages}
                    </span>
                    <button
                        onClick={() =>
                            setPageNum((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={pageNum >= totalPages}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-md disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
                    <button
                        onClick={() =>
                            setScale((s) =>
                                Math.max(
                                    0.3,
                                    +((s ?? autoScale) - 0.15).toFixed(2),
                                ),
                            )
                        }
                        className="px-4 py-1.5 rounded-full font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-slate-400 w-14 text-center">
                        {Math.round((scale ?? autoScale) * 100)}%
                    </span>
                    <button
                        onClick={() =>
                            setScale((s) =>
                                Math.min(
                                    3,
                                    +((s ?? autoScale) + 0.15).toFixed(2),
                                ),
                            )
                        }
                        className="px-4 py-1.5 rounded-full font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setScale(autoScale)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                        title="Fit to width"
                    >
                        Fit
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto bg-[#CBD5E1] py-8 px-4"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        display: "block",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                        flexShrink: 0,
                    }}
                />
            </div>
        </div>
    );
};

// ── Non-viewable format screen ───────────────────────────────────
const NonViewable = ({ book }) => (
    <div className="flex-1 overflow-auto bg-[#cbd5e1] flex items-center justify-center p-8">
        <div className="max-w-4xl w-full mx-auto bg-[#f8fafc] p-16 shadow-lg border border-slate-300 rounded-lg text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">{book.title}</h2>
            <p className="text-slate-500 mb-2">
                <span className="uppercase font-semibold">{book.format}</span> files
                cannot be previewed in the browser.
            </p>
            <p className="text-sm text-slate-400 mb-8">
                Download the file and open it with a compatible reader
                (Calibre for EPUB/MOBI, WinRAR/7-Zip for ZIP).
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

// ── Main Page ────────────────────────────────────────────────────
const ViewUploadedBookPage = () => {
    const { bookId }                      = useParams();
    const navigate                        = useNavigate();
    const [book,        setBook]          = useState(null);
    const [loading,     setLoading]       = useState(true);
    const [sidebarOpen, setSidebarOpen]   = useState(false);
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

    if (loading) return (
        <div className="flex h-screen bg-[#0f172a] items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
        </div>
    );

    if (!book) return (
        <div className="flex h-screen bg-[#0f172a] items-center justify-center text-center p-6">
            <div>
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Book Not Found</h3>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    const proxyUrl           = `${import.meta.env.VITE_API_URL}/api/uploaded-books/proxy/${book._id}`;
    const isNonViewable      = NON_VIEWABLE.includes(book.format);
    const fakeBookForSidebar = { title: book.title, chapters: [] };

    return (
        <div className="flex h-screen bg-[#0f172a] font-sans overflow-hidden">
            <ViewChapterSidebar
                book={fakeBookForSidebar}
                selectedChapterIndex={0}
                onSelectChapter={() => {}}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#e2e8f0] m-4 rounded-xl border border-[#334155] shadow-2xl transition-all duration-300">
                <header className="h-16 flex items-center justify-between px-6 border-b border-slate-300 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-sm font-semibold text-slate-500 truncate max-w-[200px]">
                            {book.title?.toUpperCase()}
                        </h2>
                        <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                            {book.format}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={book.fileUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-violet-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" /> Download
                        </a>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-full transition-all"
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                </header>

                {isNonViewable ? (
                    <NonViewable book={book} />
                ) : book.format === "pdf" ? (
                    <PdfViewer url={proxyUrl} />
                ) : (
                    <div className="flex-1 overflow-auto bg-[#cbd5e1] py-8 px-4">
                        <div
                            className="max-w-4xl mx-auto bg-[#f8fafc] shadow-lg border border-slate-300 rounded-lg overflow-hidden"
                            style={{ height: "80vh" }}
                        >
                            <iframe
                                src={proxyUrl}
                                title={book.title}
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ViewUploadedBookPage;