import { useState, useRef, useEffect } from "react";
import {
    Plus,
    Sparkles,
    Trash2,
    ArrowLeft,
    BookOpen,
    Hash,
    Palette,
    ImageIcon,
    Upload,

} from "lucide-react";

import { Modal, InputField, SelectField, Button } from "../ui/index";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useAuth } from "../../context/useAuth";



const CreateBookModal = ({ isOpen, onClose, onBookCreated }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [bookTitle, setBookTitle] = useState("");
    const [numChapters, setNumChapters] = useState(5);
    const [aiTopic, setAiTopic] = useState("");
    const [aiStyle, setAiStyle] = useState("Informative");
    const [chapters, setChapters] = useState([]);

    // NEW COVER CONFIGURATION STATES
    const [coverMode, setCoverMode] = useState("ai"); // 'ai' or 'manual'
    const [coverPrompt, setCoverPrompt] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
    const [isFinalizingBook, setIsFinalizingBook] = useState(false);
    const chaptersContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const resetModal = () => {
        setStep(1);
        setBookTitle("");
        setNumChapters(5);
        setAiTopic("");
        setAiStyle("Informative");
        setChapters([]);
        setCoverMode("ai");
        setCoverPrompt("");
        setSelectedFile(null);
        if (filePreview) URL.revokeObjectURL(filePreview);
        setFilePreview(null);
        setIsGeneratingOutline(false);
        setIsFinalizingBook(false);
        localStorage.removeItem("book-draft"); 
    };


    useEffect(() => {
        if (!isOpen) return;

        const savedDraft = localStorage.getItem("book-draft");
        if (!savedDraft) return;

        let timer;
        try {
            const { title, topic, chaps, savedAt } = JSON.parse(savedDraft);
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (savedAt && Date.now() - savedAt > oneDayMs) {
                localStorage.removeItem("book-draft");
                return;
            }
            timer = setTimeout(() => {
                setBookTitle(title || "");
                setAiTopic(topic || "");
                setChapters(chaps || []);
            }, 0);
        } catch {
            localStorage.removeItem("book-draft");
        }
        return () => clearTimeout(timer);
    }, [isOpen]);

    // Auto-scroll handler when outline rows expand
    useEffect(() => {
        if (step === 2 && chaptersContainerRef.current) {
            const scrollableDiv = chaptersContainerRef.current;
            scrollableDiv.scrollTo({
                top: scrollableDiv.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [chapters.length, step]);



    // Handle Local File Selection & Create Object Preview URL
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.type)) {
            toast.error("Please upload a valid image file (PNG/JPG).");
            return;
        }
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
    };

    const handleChapterChange = (index, field, value) => {
        const updatedChapters = [...chapters];
        updatedChapters[index][field] = value;
        setChapters(updatedChapters);
    };

    const handleDeleteChapter = (index) => {
        if (chapters.length <= 1) {
            toast.error("An eBook must contain at least one chapter.");
            return;
        }
        setChapters(chapters.filter((_, i) => i !== index));
    };

    const handleAddChapter = () => {
        setChapters([
            ...chapters,
            { title: `Chapter ${chapters.length + 1}`, description: "" },
        ]);
    };



    // STEP 1: Generate AI Outline Flow
    const handleGenerateOutline = async (e) => {
        if (e) e.preventDefault();

        if (!bookTitle.trim() || !aiTopic.trim()) {
            toast.error("Please provide a book title and topic instructions.");
            return;
        }
        if (coverMode === "manual" && !selectedFile) {
            toast.error("Please select a local cover image file to upload.");
            return;
        }



        setIsGeneratingOutline(true);
        try {
            const endpoint =
                API_PATHS.AI?.GENERATE_OUTLINE || "/api/ai/generate-outline";

            const response = await axiosInstance.post(endpoint, {
                title: bookTitle.trim(), // Sent as title string
                topic: aiTopic.trim(), // Sent as core instruction prompt string
                numChapters: parseInt(numChapters, 10) || 5,
                style: aiStyle,
            });


            if (import.meta.env.DEV) console.log("AI outline response:", response.data);
            let extractedChapters = null;

            if (response.data) {
                if (Array.isArray(response.data.outline))
                    extractedChapters = response.data.outline;
                else if (Array.isArray(response.data.chapters))
                    extractedChapters = response.data.chapters;
                else if (Array.isArray(response.data))
                    extractedChapters = response.data;
            }



            // Safe client generation check if structural fields come back blank
            if (!extractedChapters || extractedChapters.length === 0) {
                extractedChapters = Array.from({
                    length: parseInt(numChapters, 10) || 5,
                }).map((_, i) => ({
                    title: `Chapter ${i + 1}: Introduction to ${bookTitle.trim()}`,
                    description: `Detailed exploration regarding your prompt targets.`,
                }));
            }


            setChapters(extractedChapters);
            setStep(2);
            toast.success("AI outline generated successfully!");
        } catch (error) {
            if (import.meta.env.DEV) console.error("Outline error:", error.message);

            toast.error(
                error.response?.data?.message ||
                    "AI engine busy. Initializing manual template workspace.",
            );

            const fallbackCount = parseInt(numChapters, 10) || 5;
            const fallbackTemplates = Array.from({ length: fallbackCount }).map(
                (_, i) => ({
                    title: `Chapter ${i + 1}`,
                    description: "",
                }),
            );
            setChapters(fallbackTemplates);
            setStep(2); //movement to Step 2 so your app layout never locks up!
        } finally {
            setIsGeneratingOutline(false);
        }
    };



    //  STEP 2: Finalize and Assemble eBook
    const handleFinalizeBook = async () => {
        if (!bookTitle.trim() || chapters.length === 0) {
            toast.error("Book title and chapters are required.");
            return;
        }



        setIsFinalizingBook(true);
        try {
            const endpoint = API_PATHS.BOOKS?.CREATE_BOOK || "/api/books";
            let response;

            //  MULTIPART FORM-DATA WRAPPER IF NATIVE UPLOAD IS ACTIVE
            if (coverMode === "manual" && selectedFile) {
                const formData = new FormData();
                formData.append("title", bookTitle.trim());
                formData.append("author", user?.name || "Unknown Author");
                formData.append("topic", aiTopic.trim());
                formData.append("style", aiStyle);
                formData.append("chapters", JSON.stringify(chapters)); // Backend run JSON.parse()
                formData.append("coverImage", selectedFile);

                response = await axiosInstance.post(endpoint, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                // If AI cover mode, generate cover first then create book
                let aiCoverUrl = null;

                if (coverPrompt.trim()) {
                    try {
                        const coverResponse = await axiosInstance.post(
                            "/api/ai/generate-cover",
                            {
                                prompt: coverPrompt.trim(),
                                title: bookTitle.trim(),
                            },
                        );
                        aiCoverUrl = coverResponse.data.imageUrl || null;
                    } catch (coverError) {
                        if (import.meta.env.DEV)
                            console.error(
                                "Cover gen error:",
                                coverError.message,
                            );
                        // Continue without AI cover if generation fails
                        toast("Cover generation failed, using default cover.", {
                            icon: "⚠️",
                        });
                    }
                }

                response = await axiosInstance.post(endpoint, {
                    title: bookTitle.trim(),
                    author: user?.name || "Unknown Author",
                    topic: aiTopic.trim(),
                    style: aiStyle,
                    chapters: chapters,
                    ...(aiCoverUrl && { coverImage: aiCoverUrl }),
                });
            }
            toast.success("eBook built perfectly!");
            onBookCreated(response.data);
            onClose();
            resetModal();
        } catch (error) {
            if (import.meta.env.DEV) console.error("Book creation error:", error.message);
            toast.error(
                error.response?.data?.message ||
                    "Failed to compile book document.",
            );
        } finally {
            setIsFinalizingBook(false);
        }
    };






    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!isGeneratingOutline && !isFinalizingBook) {
                    onClose();
                    resetModal();
                }
            }}
            title={
                step === 1 ? "Configure AI eBook" : "Review & Customize Outline"
            }
        >

            {/* PROGRESS STEP HEADERS */}
            <div className="flex items-center justify-center w-full max-w-xs mx-auto mb-6 mt-1 select-none">
                <div className="flex items-center w-full">
                    <div
                        onClick={() => {
                            if (step === 2 && !isFinalizingBook) setStep(1);
                        }}
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors duration-300 ${step === 2 ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "bg-violet-600 text-white shadow-sm shadow-violet-100"}`}
                    >
                        {step > 1 ? "✓" : "1"}
                    </div>
                    <div
                        className={`flex-grow h-0.5 mx-2 transition-colors duration-500 ${step > 1 ? "bg-emerald-200" : "bg-slate-100"}`}
                    />
                    <div
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors duration-300 ${step === 2 ? "bg-violet-600 text-white shadow-sm shadow-violet-100" : "bg-slate-100 text-slate-400"}`}
                    >
                        2
                    </div>
                </div>
            </div>

            {step === 1 ?
                <form onSubmit={handleGenerateOutline} className="space-y-4">
                    <InputField
                        label="Book Title"
                        placeholder="Enter your book title..."
                        icon={BookOpen}
                        required
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        disabled={isGeneratingOutline}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            label="Number of Chapters"
                            type="number"
                            min="1"
                            max="20"
                            icon={Hash}
                            required
                            value={numChapters}
                            onChange={(e) =>
                                setNumChapters(
                                    parseInt(e.target.value, 10) || 1,
                                )
                            }
                            disabled={isGeneratingOutline}
                        />
                        <SelectField
                            label="Writing Style"
                            icon={Palette}
                            value={aiStyle}
                            onChange={(e) => setAiStyle(e.target.value)}
                            disabled={isGeneratingOutline}
                            options={[
                                { value: "Informative", label: "Informative" },
                                {
                                    value: "Storytelling",
                                    label: "Storytelling",
                                },
                                { value: "Casual", label: "Casual" },
                                {
                                    value: "Professional",
                                    label: "Professional",
                                },
                            ]}
                        />
                    </div>

                    {/* TAB TOGGLE CONTROL: Switch between AI Generator or Manual File Upload */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            eBook Cover Configuration
                        </label>
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setCoverMode("ai")}
                                disabled={isGeneratingOutline}
                                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === "ai" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Cover Engine
                            </button>
                            <button
                                type="button"
                                onClick={() => setCoverMode("manual")}
                                disabled={isGeneratingOutline}
                                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === "manual" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Upload Local File
                            </button>
                        </div>
                    </div>

                    {/* Conditional Cover Art Inputs Selection Canvas */}
                    {coverMode === "ai" ?
                        <InputField
                            label="AI Cover Art Design Prompt"
                            placeholder="e.g., Clean abstract design, pastel lavender tones, gold lines..."
                            icon={ImageIcon}
                            value={coverPrompt}
                            onChange={(e) => setCoverPrompt(e.target.value)}
                            disabled={isGeneratingOutline}
                        />
                    :   <div className="flex flex-col text-left">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Select Image Asset *
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Interactive Upload Drag Scrim Panel Box */}
                            <div
                                onClick={() =>
                                    !isGeneratingOutline &&
                                    fileInputRef.current?.click()
                                }
                                className="border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50/50 hover:bg-violet-50/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                            >
                                {filePreview ?
                                    <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-slate-200">
                                        <img
                                            src={filePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                :   <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-slate-400">
                                        <Upload className="h-4 w-4" />
                                    </div>
                                }
                                <span className="text-xs font-medium text-slate-600">
                                    {selectedFile ?
                                        selectedFile.name
                                    :   "Click to select cover file image..."}
                                </span>
                            </div>
                        </div>
                    }
                    <div className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                            Topic Instructions *
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Describe what your eBook is about..."
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            disabled={isGeneratingOutline}
                            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 resize-none disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={() => {
                                onClose();
                                resetModal();
                            }}
                            disabled={isGeneratingOutline}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isGeneratingOutline}
                            isLoading={isGeneratingOutline}
                            icon={Sparkles}
                            className="bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md"
                        >
                            Generate Outline with AI
                        </Button>
                    </div>
                </form>
            :   /* Stage 2 Chapters Outline Editor View */
                <div className="flex flex-col h-full animate-fade-in pt-1">
                    <div className="flex items-center justify-between mb-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                        <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                                Review Chapters
                            </h4>
                            <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                                Fine-tune themes before compilation
                            </p>
                        </div>
                        <span className="bg-violet-50 text-violet-700 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-violet-100/50 uppercase tracking-wide">
                            {chapters.length}{" "}
                            {chapters.length === 1 ? "chapter" : "chapters"}
                        </span>
                    </div>
                    <div
                        ref={chaptersContainerRef}
                        className="space-y-4 max-h-[340px] overflow-y-auto pr-1.5 pb-1 scrollbar-thin"
                    >
                        {chapters.map((chapter, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col gap-3 shadow-sm relative group/row"
                            >
                                <div className="flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                        <div className="flex items-center justify-center w-5 h-5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border shrink-0">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={chapter.title}
                                            onChange={(e) =>
                                                handleChapterChange(
                                                    index,
                                                    "title",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={isFinalizingBook}
                                            className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none border-b border-transparent focus:border-violet-500 pb-0.5 transition-colors"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteChapter(index)
                                        }
                                        disabled={isFinalizingBook}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl cursor-pointer shrink-0 transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <textarea
                                    rows={2}
                                    value={chapter.description || ""}
                                    onChange={(e) =>
                                        handleChapterChange(
                                            index,
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    disabled={isFinalizingBook}
                                    className="w-full px-3.5 py-2 text-xs border border-slate-200 bg-slate-50/30 focus:bg-white rounded-xl focus:outline-none focus:border-violet-500 resize-none text-slate-600"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddChapter}
                        disabled={isFinalizingBook}
                        className="mt-3 py-2 border border-dashed border-slate-200 hover:border-violet-400 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-all flex items-center justify-center gap-1 rounded-xl cursor-pointer"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Custom Chapter Slot
                    </button>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 gap-3">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setStep(1)}
                            disabled={isFinalizingBook}
                            icon={ArrowLeft}
                            className="text-slate-500 text-xs rounded-xl"
                        >
                            Back
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                    onClose();
                                    resetModal();
                                }}
                                disabled={isFinalizingBook}
                                className="text-xs font-semibold h-9 rounded-xl"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="button"
                                onClick={handleFinalizeBook}
                                disabled={isFinalizingBook}
                                isLoading={isFinalizingBook}
                                icon={Sparkles}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs px-4 h-9 rounded-xl shadow-md"
                            >
                                Create eBook
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </Modal>
    );
};;



export default CreateBookModal;

