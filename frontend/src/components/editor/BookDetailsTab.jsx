import { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";
import {
    UploadCloud,
    FileText,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    RefreshCw,
    Library,
    Check,
    X,
} from "lucide-react";
import { BASE_URL } from "../../utils/apiPaths";
import { API_PATHS } from "../../utils/apiPaths";
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

    // Cloudinary picker states
    const [isCloudinaryPickerOpen, setIsCloudinaryPickerOpen] = useState(false);
    const [cloudinaryCovers, setCloudinaryCovers] = useState([]);
    const [isFetchingCovers, setIsFetchingCovers] = useState(false);
    const [selectedCloudinaryUrl, setSelectedCloudinaryUrl] = useState(null);

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
                `${book.coverImage}?v=${book._id?.slice(-6) || "1"}`
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
                // onAICoverSave already saves to DB — no duplicate PUT needed
                await onAICoverSave(finalizedUrl);
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

    // Fetch covers from Cloudinary
    const handleOpenCloudinaryPicker = async () => {
        setIsCloudinaryPickerOpen(true);
        setIsFetchingCovers(true);
        try {
            const response = await axiosInstance.get(
                API_PATHS.BOOKS.GET_CLOUDINARY_COVERS,
            );
            setCloudinaryCovers(response.data.covers || []);
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("Cloudinary fetch error:", error.message);
            toast.error("Failed to load covers from Cloudinary.");
        } finally {
            setIsFetchingCovers(false);
        }
    };

    // Apply selected Cloudinary cover
    const handleApplyCloudinaryCover = async () => {
        if (!selectedCloudinaryUrl) {
            toast.error("Please select a cover first.");
            return;
        }

        try {
            await axiosInstance.put(
                `/api/books/cover/${book._id}`,
                { coverImageUrl: selectedCloudinaryUrl },
                { headers: { "Content-Type": "application/json" } },
            );
            onAICoverSave(selectedCloudinaryUrl);
            toast.success("Cover updated successfully!");
            setIsCloudinaryPickerOpen(false);
            setSelectedCloudinaryUrl(null);
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("Cover update error:", error.message);
            toast.error("Failed to update cover.");
        }
    };

    return (
        <div className="w-full h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-4">
            <div className="max-w-5xl mx-auto space-y-8 p-2 animate-fade-in pb-12 select-none">
                {/* SECTION 1: CORE METADATA */}
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
                                publication.
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

                {/* SECTION 2: COVER IMAGE STUDIO */}
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
                                Upload, generate, or select from your existing
                                Cloudinary library.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-50/40 p-6 rounded-2xl border border-slate-150/80">
                        {/* Cover Preview */}
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-slate-900/5 rounded-2xl blur-md opacity-60" />
                            <div className="w-36 h-48 bg-white border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center relative z-10 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
                                {coverImageUrl ?
                                    <img
                                        src={coverImageUrl}
                                        alt="Book Cover"
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                    />
                                :   <div className="text-center p-4 flex flex-col items-center gap-2">
                                        <ImageIcon className="w-6 h-6 text-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                            No Cover
                                        </span>
                                    </div>
                                }
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-grow space-y-5 text-center md:text-left self-center">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-700 tracking-tight">
                                    Select your cover source
                                </p>
                                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                                    Upload a new image, generate with AI, or
                                    pick from your existing Cloudinary library.
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
                                {/* Upload Local File */}
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    isLoading={isUploading}
                                    icon={UploadCloud}
                                    className="h-10 px-4 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                                >
                                    {isUploading ?
                                        "Uploading..."
                                    :   "Upload File"}
                                </Button>

                                {/* Pick from Cloudinary */}
                                <button
                                    type="button"
                                    onClick={handleOpenCloudinaryPicker}
                                    className="h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-700 hover:from-blue-100 hover:to-indigo-100"
                                >
                                    <Library className="w-3.5 h-3.5 text-blue-600" />
                                    Pick from Library
                                </button>

                                {/* Generate with AI */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAiPanelOpen(!isAiPanelOpen)
                                    }
                                    className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                                        isAiPanelOpen ?
                                            "bg-violet-600 border-violet-600 text-white shadow-md"
                                        :   "bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100 text-violet-700 hover:from-violet-100 hover:to-indigo-100"
                                    }`}
                                >
                                    <Sparkles
                                        className={`w-3.5 h-3.5 ${isAiPanelOpen ? "text-white" : "text-violet-600"}`}
                                    />
                                    {isAiPanelOpen ?
                                        "Close AI Designer"
                                    :   "Generate with AI"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Generation Panel */}
                    {isAiPanelOpen && (
                        <div className="mt-6 border border-violet-100 bg-gradient-to-b from-violet-50/20 to-indigo-50/10 p-5 rounded-2xl space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-violet-600 animate-pulse" />
                                <h4 className="text-xs font-bold text-violet-900 uppercase tracking-wider">
                                    AI Cover Generator
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
                                    placeholder="e.g., A minimalist watercolor painting with golden tones..."
                                    className="flex-grow h-11 px-4 text-xs border border-slate-200 bg-white focus:border-violet-500 rounded-xl focus:outline-none text-slate-700 placeholder:text-slate-400 transition-colors disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={handleGenerateAICover}
                                    disabled={isGeneratingImage}
                                    className="h-11 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {isGeneratingImage ?
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                                            Generating...
                                        </>
                                    :   <>
                                            <RefreshCw className="w-3.5 h-3.5" />{" "}
                                            Generate
                                        </>
                                    }
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="h-4" />
            </div>

            {/* CLOUDINARY PICKER MODAL */}
            {isCloudinaryPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <Library className="w-5 h-5 text-blue-600" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Cloudinary Cover Library
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Select any previously uploaded or
                                        AI-generated cover
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCloudinaryPickerOpen(false);
                                    setSelectedCloudinaryUrl(null);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-grow overflow-y-auto p-6">
                            {isFetchingCovers ?
                                <div className="flex items-center justify-center h-48">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
                                        <p className="text-sm text-slate-500">
                                            Loading your covers...
                                        </p>
                                    </div>
                                </div>
                            : cloudinaryCovers.length === 0 ?
                                <div className="flex flex-col items-center justify-center h-48 text-center">
                                    <ImageIcon className="w-12 h-12 text-slate-200 mb-3" />
                                    <p className="text-sm font-bold text-slate-700">
                                        No covers found
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Upload a cover image or generate one
                                        with AI first
                                    </p>
                                </div>
                            :   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                    {cloudinaryCovers.map((cover) => (
                                        <div
                                            key={cover.publicId}
                                            onClick={() =>
                                                setSelectedCloudinaryUrl(
                                                    (
                                                        selectedCloudinaryUrl ===
                                                            cover.url
                                                    ) ?
                                                        null
                                                    :   cover.url,
                                                )
                                            }
                                            className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[2/3] ${
                                                (
                                                    selectedCloudinaryUrl ===
                                                    cover.url
                                                ) ?
                                                    "border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]"
                                                :   "border-transparent hover:border-slate-300"
                                            }`}
                                        >
                                            <img
                                                src={cover.url}
                                                alt={cover.name}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Selected overlay */}
                                            {selectedCloudinaryUrl ===
                                                cover.url && (
                                                <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                                                    <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hover overlay */}
                                            {selectedCloudinaryUrl !==
                                                cover.url && (
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
                            <p className="text-xs text-slate-500">
                                {selectedCloudinaryUrl ?
                                    "1 cover selected"
                                :   `${cloudinaryCovers.length} covers available`
                                }
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCloudinaryPickerOpen(false);
                                        setSelectedCloudinaryUrl(null);
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyCloudinaryCover}
                                    disabled={!selectedCloudinaryUrl}
                                    className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:pointer-events-none shadow-md"
                                >
                                    Apply Cover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetailsTab;
