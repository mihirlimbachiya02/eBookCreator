import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Sparkles,
    Menu,
    ChevronDown,
    ArrowLeft,
    CheckCircle,
    HelpCircle,
    NotebookText,
    BookOpen,
    X,
} from "lucide-react";

import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import Dropdown, { DropdownItem } from "../components/ui/Dropdown";
import ChapterSidebar from "../components/editor/ChapterSidebar.jsx";
import ChapterEditorTab from "../components/editor/ChapterEditorTab.jsx";
import BookDetailsTab from "../components/editor/BookDetailsTab.jsx";

const EditorPage = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();

    // Core Data Framework States
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("chapter");

    // AI Modal / Control Panel States
    const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [aiStyle, setAiStyle] = useState("Informative");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isAiOpen, setIsAiOpen] = useState(true);

    const fileInputRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // Initial Data Cargo Fetch
    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axiosInstance.get(
                    API_PATHS.BOOKS.GET_BOOK_BY_ID(bookId),
                );
                setBook(response.data);
            } catch (error) {
                if (import.meta.env.DEV)
                    console.error("Failed to load book:", error.message);
                toast.error("Could not locate requested eBook details.");
                navigate("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        if (bookId) fetchBook();
    }, [bookId, navigate]);

    // Dynamic Chapter Upstream Synchronization Proxy
    const handleChapterUpdate = (updatePayload) => {
        if (updatePayload?.target) {
            const { name, value } = updatePayload.target;
            setBook((prev) => {
                if (!prev || !prev.chapters) return prev;
                const updatedChapters = [...prev.chapters];
                if (updatedChapters[selectedChapterIndex]) {
                    updatedChapters[selectedChapterIndex][
                        name === "title" ? "title" : "content"
                    ] = value;
                }
                const updatedBook = { ...prev, chapters: updatedChapters };
                triggerAutoSave(updatedBook);
                return updatedBook;
            });
        } else {
            setBook((prev) => {
                if (!prev || !prev.chapters) return prev;
                const updatedChapters = [...prev.chapters];
                updatedChapters[selectedChapterIndex] = {
                    ...updatedChapters[selectedChapterIndex],
                    ...updatePayload,
                };
                const updatedBook = { ...prev, chapters: updatedChapters };
                triggerAutoSave(updatedBook);
                return updatedBook;
            });
        }
    };

    // Generic Metadata Form Update Upstream Handler
    const handleBookDetailsUpdate = (e) => {
        const { name, value } = e.target;
        setBook((prev) => {
            const updated = { ...prev, [name]: value };
            triggerAutoSave(updated);
            return updated;
        });
    };

    const triggerAutoSave = (currentBookState = book) => {
        if (isSaving) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            handleSaveChanges(currentBookState, false);
        }, 2500);
    };

    const handleSaveChanges = async (bookToSave = book, showToast = true) => {
        if (!bookToSave || !bookId) return;

        // 1. Snapshot the data to avoid reference mutation issues
        const payload = {
            title: bookToSave.title,
            author: bookToSave.author,
            subtitle: bookToSave.subtitle || "",
            chapters: bookToSave.chapters,
        };

        setIsSaving(true);
        try {
            const response = await axiosInstance.put(
                `/api/books/${bookId}`,
                payload,
            );
            // Update local state with the confirmed server response
            setBook(response.data);
            if (showToast) toast.success("Changes saved!");
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("Save error:", error.message);
            if (showToast) toast.error("Failed to synchronize editor updates.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddChapter = () => {
        setBook((prev) => {
            if (!prev) return prev;
            const currentChapters = prev.chapters || [];
            const newChapter = {
                title: `Chapter ${currentChapters.length + 1}: New Chapter Section`,
                content: "",
                description: "",
            };
            const updated = {
                ...prev,
                chapters: [...currentChapters, newChapter],
            };
            handleSaveChanges(updated, false);
            return updated;
        });
        toast.success("New chapter template initialized!");
    };

    const handleDeleteChapter = (index) => {
        if (book?.chapters?.length <= 1) {
            toast.error(
                "An eBook must contain at least one operational chapter node.",
            );
            return;
        }
        setBook((prev) => {
            if (!prev) return prev;
            const filtered = prev.chapters.filter((_, i) => i !== index);
            const updated = { ...prev, chapters: filtered };
            handleSaveChanges(updated, false);
            return updated;
        });
        if (selectedChapterIndex >= index && selectedChapterIndex > 0) {
            setSelectedChapterIndex((prev) => prev - 1);
        }
        toast.success("Chapter block removed.");
    };

    const handleReorderChapters = (oldIndex, newIndex) => {
        setBook((prev) => {
            if (!prev) return prev;
            const working = [...prev.chapters];
            const [movedItem] = working.splice(oldIndex, 1);
            working.splice(newIndex, 0, movedItem);
            const updated = { ...prev, chapters: working };
            handleSaveChanges(updated, false);
            return updated;
        });
    };

    const handleCoverImageUpload = async (formData) => {
        // formData is already created in BookDetailsTab.jsx
        if (!formData) return;
        formData.append("bookTitle", book.title);
        setIsUploading(true);
        try {
            const response = await axiosInstance.put(
                `/api/books/cover/${bookId}`, // Matches your router.put("/cover/:id")
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            setBook(response.data);
            toast.success("Cover image uploaded and renamed!");
        } catch (err) {
            if (import.meta.env.DEV)
                console.error("Upload error:", err.message);
            toast.error("Failed to process cloud image upload.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAICoverSave = async (coverImageUrl) => {
        if (!bookId || !coverImageUrl) return;
        setIsUploading(true);
        try {
            const response = await axiosInstance.put(
                `/api/books/cover/${bookId}`,
                { coverImageUrl },
                { headers: { "Content-Type": "application/json" } },
            );
            setBook(response.data);
            toast.success("AI cover saved successfully!");
        } catch (err) {
            if (import.meta.env.DEV)
                console.error("AI cover save error:", err.message);
            toast.error("Failed to save AI cover image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerateOutline = async () => {
        setIsGenerating(true);
        try {
            const response = await axiosInstance.post(
                "/api/ai/generate-outline",
                {
                    title: book?.title,
                    topic: aiTopic,
                    style: aiStyle,
                },
            );
            setBook((prev) => {
                const updated = {
                    ...prev,
                    chapters:
                        response.data.outline || response.data.chapters || [],
                };
                handleSaveChanges(updated, true);
                return updated;
            });
            setIsOutlineModalOpen(false);
        } catch {
            toast.error(
                "AI failed to regenerate workspace structure outline map.",
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateChapterContent = async (index) => {
        if (!book || !book.chapters?.[index]) return;
        setIsGenerating(true);
        try {
            const endpoint = API_PATHS.AI?.GENERATE_TEXT || "/api/ai/generate";
            const response = await axiosInstance.post(endpoint, {
                bookId: bookId,
                chapterTitle: book.chapters[index].title,
                currentContent: book.chapters[index].content || "",
                instructions:
                    aiPrompt || "Generate an engaging structured book chapter.",
                style: book.style || "Informative",
            });
            setBook((prev) => {
                const updatedChapters = [...prev.chapters];
                updatedChapters[index].content =
                    response.data.content || response.data.generatedText || "";
                const updated = { ...prev, chapters: updatedChapters };
                handleSaveChanges(updated, false);
                return updated;
            });
            setAiPrompt("");
            toast.success("AI Content populated beautifully!");
        } catch (err) {
            console.error(err);
            toast.error("AI text generator engine timed out.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportPDF = async () => {
        toast.loading("Generating PDF...", { id: "export" });
        try {
            const response = await axiosInstance.get(
                API_PATHS.EXPORT.PDF(bookId),
                { responseType: "blob" },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${book.title || "eBook"}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("PDF downloaded successfully!", { id: "export" });
        } catch (err) {
            if (import.meta.env.DEV)
                console.error("PDF export error:", err.message);
            toast.error("Failed to generate PDF.", { id: "export" });
        }
    };

    const handleExportDoc = async () => {
        toast.loading("Generating document...", { id: "export" });
        try {
            const response = await axiosInstance.get(
                API_PATHS.EXPORT.DOC(bookId),
                { responseType: "blob" },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${book.title || "eBook"}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Document downloaded successfully!", {
                id: "export",
            });
        } catch (err) {
            if (import.meta.env.DEV)
                console.error("Doc export error:", err.message);
            toast.error("Failed to generate document.", { id: "export" });
        }
    };

    if (isLoading || !book) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                        Loading Workspace...
                    </p>
                </div>
            </div>
        );
    }

    const currentActiveChapter = book.chapters?.[selectedChapterIndex] || null;

    return (
        <div className="h-screen bg-white flex flex-col font-sans overflow-hidden">
            {/* WORKSPACE TOP HEADER BAR */}
            <header className="h-auto md:h-14 border-b border-slate-150 bg-slate-900 px-4 py-2 flex flex-col md:flex-row items-center justify-between shrink-0 z-20">
                {/* ROW 1: Navigation + Metadata (Always visible) */}
                <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => {
                                handleSaveChanges(book, false);
                                navigate("/dashboard");
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`p-1.5 rounded-lg ${isSidebarOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800"}`}
                        >
                            <Menu className="h-4 w-4" />
                        </button>

                        {/* Metadata shown on desktop, Title only on mobile */}
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white truncate">
                                {book.title}
                            </h2>
                            <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400">
                                <span>by {book.author || "Mihir"}</span>
                                <span className="text-slate-700">•</span>
                                {isSaving ?
                                    <span className="text-violet-400">
                                        Syncing...
                                    </span>
                                :   <span className="text-emerald-400 flex items-center gap-1">
                                        <CheckCircle className="h-2.5 w-2.5" />{" "}
                                        Saved
                                    </span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* DESKTOP ROW 1: Editor/Detail Tabs & Buttons (visible on md+) */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
                            <button
                                onClick={() => setActiveTab("chapter")}
                                className={`flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg ${activeTab === "chapter" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                <BookOpen className="w-3.5 h-3.5" /> Editor
                            </button>
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg ${activeTab === "details" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}
                            >
                                <NotebookText className="w-3.5 h-3.5" /> Details
                            </button>
                        </div>
                        <button
                            onClick={() => handleSaveChanges(book, true)}
                            className="px-3 h-8 bg-violet-600 text-white font-bold text-xs rounded-xl"
                        >
                            Save Changes
                        </button>
                        <Dropdown
                            trigger={
                                <button className="bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs h-8 px-3 rounded-xl flex items-center gap-1">
                                    Export <ChevronDown className="h-3 w-3" />
                                </button>
                            }
                        >
                            <DropdownItem onClick={handleExportPDF}>
                                Export PDF
                            </DropdownItem>
                            <DropdownItem onClick={handleExportDoc}>
                                Export Doc
                            </DropdownItem>
                        </Dropdown>
                    </div>
                </div>

                {/* ROW 2: Mobile Only Tabs + Actions */}
                <div className="flex md:hidden w-full items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setActiveTab("chapter")}
                            className={`flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg ${activeTab === "chapter" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" /> Editor
                        </button>
                        <button
                            onClick={() => setActiveTab("details")}
                            className={`flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg ${activeTab === "details" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                        >
                            <NotebookText className="w-3.5 h-3.5" /> Details
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleSaveChanges(book, true)}
                            className="p-2 text-violet-400 hover:bg-slate-800 rounded-lg"
                        >
                            <CheckCircle className="h-5 w-5" />
                        </button>
                        <Dropdown
                            trigger={
                                <button className="p-2 text-slate-200 hover:bg-slate-800 rounded-lg">
                                    <ChevronDown className="h-5 w-5" />
                                </button>
                            }
                        >
                            <DropdownItem
                                onClick={() => handleSaveChanges(book, true)}
                            >
                                Save Changes
                            </DropdownItem>
                            <DropdownItem onClick={handleExportPDF}>
                                Export PDF
                            </DropdownItem>
                            <DropdownItem onClick={handleExportDoc}>
                                Export Doc
                            </DropdownItem>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {/* MAIN PANELS WRAPPER */}
            <div className="flex-grow flex w-full overflow-hidden bg-slate-50 relative">
                {/* Sidebar only appears in Editor mode */}
                <aside
                    className={`bg-slate-900 border-r border-slate-800 h-full transition-all duration-300 z-10 shrink-0 ${
                        isSidebarOpen && activeTab === "chapter" ?
                            "w-64 opacity-100"
                        :   "w-0 opacity-0 overflow-hidden"
                    }`}
                >
                    <ChapterSidebar
                        book={book}
                        selectedChapterIndex={selectedChapterIndex}
                        onSelectChapter={(idx) => setSelectedChapterIndex(idx)}
                        onAddChapter={handleAddChapter}
                        onDeleteChapter={handleDeleteChapter}
                        onGenerateChapterContent={handleGenerateChapterContent}
                        isGenerating={isGenerating}
                        onReorderChapters={handleReorderChapters}
                    />
                </aside>

                {/* CENTRAL WORKING VIEWPORT CANVAS */}
                <main className="flex-grow flex flex-col h-full bg-white relative overflow-hidden p-6">
                    {activeTab === "details" ?
                        <BookDetailsTab
                            book={book}
                            onBookChange={handleBookDetailsUpdate}
                            onCoverUpload={handleCoverImageUpload}
                            onAICoverSave={handleAICoverSave}
                            isUploading={isUploading}
                            fileInputRef={fileInputRef}
                        />
                    : currentActiveChapter ?
                        <ChapterEditorTab
                            book={book}
                            selectedChapterIndex={selectedChapterIndex}
                            onChapterChange={handleChapterUpdate}
                        />
                    :   <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-50 select-none h-full">
                            <HelpCircle className="h-8 w-8 text-slate-300 animate-bounce" />
                            <h4 className="text-sm font-bold text-slate-700 mt-2">
                                No Chapter Selected
                            </h4>
                        </div>
                    }
                </main>

                {/* RIGHT SIDE AI ASSIST PANEL */}
                <aside
                    onClick={() => !isAiOpen && setIsAiOpen(true)}
                    className={`border-l border-slate-200 bg-slate-50 flex flex-col gap-4 overflow-y-auto shrink-0 select-none z-50 transition-all duration-300 
    ${
        isAiOpen ?
            "w-80 p-4 fixed inset-y-0 right-0 shadow-2xl md:shadow-none md:static md:w-80 md:p-4"
        :   "w-10 p-2 cursor-pointer items-center"
    }`}
                >
                    {/* CLOSED STATE: Sparkle Icon (Visible on desktop) */}
                    {!isAiOpen && (
                        <div className="hidden md:flex justify-center pt-2">
                            <Sparkles className="h-5 w-5 text-violet-600 animate-pulse" />
                        </div>
                    )}

                    {/* OPEN STATE: Full Panel Content */}
                    {isAiOpen && (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200 shrink-0">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-violet-600 animate-pulse" />
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                        AI Assistant
                                    </h4>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAiOpen(false);
                                    }}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="space-y-3 shrink-0 mt-4">
                                <button
                                    onClick={() => setIsOutlineModalOpen(true)}
                                    className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 text-slate-700 hover:text-violet-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Generate Outline Structure
                                </button>
                                <button
                                    onClick={() =>
                                        handleGenerateChapterContent(
                                            selectedChapterIndex,
                                        )
                                    }
                                    disabled={
                                        isGenerating ||
                                        (activeTab === "chapter" &&
                                            !currentActiveChapter)
                                    }
                                    className="w-full py-2.5 px-3 bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 text-slate-700 hover:text-violet-700 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer group disabled:opacity-40"
                                >
                                    <span>
                                        {activeTab === "details" ?
                                            "🪄 Polish Book Metadata"
                                        :   "🪄 Auto-Write Chapter"}
                                    </span>
                                    <Sparkles className="h-3.5 w-3.5 text-slate-400 group-hover:text-violet-500" />
                                </button>
                            </div>

                            <div className="flex-grow flex flex-col min-h-0 pt-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                    Custom Directives
                                </label>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) =>
                                        setAiPrompt(e.target.value)
                                    }
                                    placeholder={
                                        activeTab === "details" ?
                                            "e.g., Suggest a captivating tagline..."
                                        :   "e.g., Include case scenarios..."
                                    }
                                    rows={6}
                                    className="w-full px-3 py-2.5 text-xs border border-slate-200 focus:border-violet-500 rounded-xl bg-white focus:outline-none resize-none text-slate-700 leading-relaxed"
                                />
                                <button
                                    onClick={() =>
                                        handleGenerateChapterContent(
                                            selectedChapterIndex,
                                        )
                                    }
                                    disabled={
                                        isGenerating ||
                                        (activeTab === "chapter" &&
                                            !currentActiveChapter)
                                    }
                                    className="mt-3 w-full h-10 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs shadow-md rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all hover:scale-[1.02]"
                                >
                                    <Sparkles
                                        className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : "animate-pulse"}`}
                                    />
                                    {isGenerating ?
                                        "Processing..."
                                    :   "Generate with AI"}
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {isOutlineModalOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Generate Outline Structure
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Provide the topic and style for AI outline
                                    generation.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOutlineModalOpen(false)}
                                className="text-slate-500 hover:text-slate-700 text-sm font-bold"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                    Topic
                                </label>
                                <input
                                    type="text"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    placeholder="Enter the book topic or focus area"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-violet-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                                    Style
                                </label>
                                <select
                                    value={aiStyle}
                                    onChange={(e) => setAiStyle(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="Informative">
                                        Informative
                                    </option>
                                    <option value="Creative">Creative</option>
                                    <option value="Technical">Technical</option>
                                    <option value="Narrative">Narrative</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => setIsOutlineModalOpen(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateOutline}
                                disabled={isGenerating}
                                className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
                            >
                                {isGenerating ?
                                    "Generating..."
                                :   "Generate Outline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;
