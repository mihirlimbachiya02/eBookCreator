import { useState } from "react";
import {Button, InputField} from "../ui/index.js";
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { BASE_URL } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";


const BookDetailsTab = ({
    book,
    onBookChange,
    onCoverUpload,
    onAICoverSave,
    isUploading,
    fileInputRef,
}) => {
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState("");
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    
    const handleLocalFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("coverImage", file); 
        onCoverUpload(formData);
    };


    const coverImageUrl =
        book?.coverImage ?
            book.coverImage.startsWith("http") ?
                book.coverImage
            :   `${BASE_URL}${book.coverImage.startsWith("/") ? "" : "/"}${book.coverImage.replace(/\\/g, "/")}`
        :   null;


    const handleGenerateAICover = async () => {
        if (!imagePrompt.trim()) {
            toast.error("Please enter a prompt description first.");
            return;
        }

        setIsGeneratingImage(true);
        const generationToast = toast.loading(
            "Generating AI cover image... this may take 15-30 seconds.",
        );

        try {
            const response = await axiosInstance.post(
                "/api/ai/generate-cover",
                {
                    bookId: book?._id,
                    prompt: imagePrompt.trim(),
                    title: book?.title || "Untitled Book",
                },
            );

            const finalizedUrl = response.data.imageUrl;

            if (finalizedUrl) {
                // Save the URL to the book in DB
                await axiosInstance.put(
                    `/api/books/cover/${book._id}`,
                    { coverImageUrl: finalizedUrl },
                    { headers: { "Content-Type": "application/json" } },
                );

                onAICoverSave(finalizedUrl);
                toast.success("AI cover generated successfully!", {
                    id: generationToast,
                });
                setImagePrompt("");
                setIsAiPanelOpen(false);
            } else {
                throw new Error("No image URL returned.");
            }
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("AI cover error:", error.message);
            toast.error(
                error.response?.data?.message ||
                    "Failed to generate cover. Please try a different prompt.",
                { id: generationToast },
            );
        } finally {
            setIsGeneratingImage(false);
        }
    };




    return (
        /* The container now takes full width, pinning the scrollbar to the right edge */
        <div className="w-full h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-4">
            {/* The inner container keeps the content centered and constrained */}
            <div className="max-w-5xl mx-auto space-y-8 p-2 animate-fade-in pb-12 select-none">
                {/* 📝 SECTION 1: CORE METADATA PANELS */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] p-4 sm:p-4 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2.5 pb-5 mb-6 border-b border-slate-100">
                        <div className="p-2 bg-violet-50 rounded-xl text-violet-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                                Book Metadata
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Configure the global identity details for your
                                publication asset.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-7">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            <InputField
                                label="Book Title"
                                name="title"
                                value={book?.title || ""}
                                onChange={onBookChange}
                                placeholder="e.g., Plant-Based on a Budget"
                            />
                            <InputField
                                label="Primary Author"
                                name="author"
                                value={book?.author || ""}
                                onChange={onBookChange}
                                placeholder="e.g., Alex Parker"
                            />
                        </div>
                        <InputField
                            label="Subtitle"
                            name="subtitle"
                            value={book?.subtitle || ""}
                            onChange={onBookChange}
                            placeholder="An optional engaging description hook..."
                        />
                    </div>
                </div>

                {/* 🖼️ SECTION 2: PREMIUM COVER IMAGE UPLOAD STUDIO */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.015)] p-6 sm:p-8 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-2.5 pb-1 mb-6 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                                Cover Illustration Studio
                            </h3>
                            <p className="text-[11px] text-slate-400">
                                Manage your high-resolution visualization asset
                                or render a dynamic masterpiece.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-50/40 p-6 rounded-2xl border border-slate-150/80">
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-slate-900/5 rounded-2xl blur-md opacity-60" />
                            <div className="w-36 h-48 bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center relative z-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-slate-900/5">
                                {coverImageUrl ?
                                    <img
                                        src={coverImageUrl}
                                        alt="Book Front Cover"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                                    />
                                :   <div className="text-center p-4 flex flex-col items-center gap-2">
                                        <ImageIcon className="w-6 h-6 text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                            Empty Cover
                                        </span>
                                    </div>
                                }
                            </div>
                        </div>

                        <div className="flex-grow space-y-5 text-center md:text-left self-center">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-700 tracking-tight">
                                    Select your design strategy
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                                    Upload a local illustration file or trigger
                                    our advanced text-to-image synthesis
                                    interface generator below.
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleLocalFileUpload}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                            />
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    isLoading={isUploading}
                                    icon={UploadCloud}
                                    className="h-10 px-4 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow"
                                >
                                    {isUploading ?
                                        "Uploading Asset..."
                                    :   "Upload Local File"}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAiPanelOpen(!isAiPanelOpen)
                                    }
                                    className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${isAiPanelOpen ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/10" : "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100 text-violet-700 hover:from-violet-100/80 hover:to-indigo-100/80"}`}
                                >
                                    <Sparkles
                                        className={`w-3.5 h-3.5 ${isAiPanelOpen ? "text-white" : "text-violet-600"}`}
                                    />
                                    {isAiPanelOpen ?
                                        "Close AI Designer"
                                    :   "Generate Cover with AI"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {isAiPanelOpen && (
                        <div className="mt-6 border border-violet-100 bg-gradient-to-b from-violet-50/20 to-indigo-50/10 p-5 rounded-2xl animate-fade-in space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                                <h4 className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                                    AI Generation Directives Menu
                                </h4>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={imagePrompt}
                                    onChange={(e) =>
                                        setImagePrompt(e.target.value)
                                    }
                                    disabled={isGeneratingImage}
                                    placeholder="e.g., A minimalist watercolor painting..."
                                    className="flex-grow h-11 px-4 text-xs border border-slate-200 bg-white focus:border-violet-500 rounded-xl focus:outline-none text-slate-700 placeholder:text-slate-400 transition-colors disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateAICover}
                                    disabled={isGeneratingImage}
                                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 disabled:pointer-events-none transform active:scale-95"
                                >
                                    {isGeneratingImage ?
                                        <>
                                            {" "}
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                                            Rendering Asset...{" "}
                                        </>
                                    :   <>
                                            {" "}
                                            <RefreshCw className="w-3.5 h-3.5" />{" "}
                                            Synthesize Illustration{" "}
                                        </>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-4" />
            </div>
        </div>
    );
};

export default BookDetailsTab;
