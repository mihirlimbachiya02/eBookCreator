import { useState, useRef } from "react";
import { X, Upload, Sparkles, Image, Camera } from "lucide-react";
import toast from "react-hot-toast";
import { updateUploadedBook } from "../../utils/uploadedBooksApi";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const FORMATS = ["pdf", "html", "epub", "mobi", "zip"];
const SOURCES = ["device", "url", "google_drive"];
const SOURCE_LABELS = {
    device: "Device",
    url: "URL",
    google_drive: "Google Drive",
};

const COVER_TABS = [
    { id: "device", label: "Upload", icon: Upload },
    { id: "cloudinary", label: "Library", icon: Image },
    { id: "ai", label: "Generate", icon: Sparkles },
];

const EditUploadedBookModal = ({ book, onClose, onUpdated }) => {
    const coverInputRef = useRef(null);

    const [title, setTitle] = useState(book.title);
    const [format, setFormat] = useState(book.format);
    const [source, setSource] = useState(book.source);
    const [coverTab, setCoverTab] = useState("device");
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(book.coverImage || "");
    const [aiPrompt, setAiPrompt] = useState("");
    const [cloudCovers, setCloudCovers] = useState([]);
    const [loadingCloud, setLoadingCloud] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load Cloudinary covers
    const loadCloudinaryCovers = async () => {
        if (cloudCovers.length > 0) return;
        setLoadingCloud(true);
        try {
            const { data } = await axiosInstance.get(
                API_PATHS.BOOKS.GET_CLOUDINARY_COVERS,
            );
            setCloudCovers(data.covers || []);
        } catch {
            toast.error("Failed to load library");
        } finally {
            setLoadingCloud(false);
        }
    };

    const handleCoverTabChange = (tab) => {
        setCoverTab(tab);
        if (tab === "cloudinary") loadCloudinaryCovers();
    };

    const handleCoverFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSelectCloudinary = (url) => {
        setCoverPreview(url);
        setCoverFile(null);
    };

    const handleGenerateAi = async () => {
        if (!aiPrompt.trim() && !title.trim()) {
            return toast.error("Enter a prompt or title first");
        }
        setGeneratingAi(true);
        try {
            const { data } = await axiosInstance.post(
                `${import.meta.env.VITE_API_URL}/api/ai/generate-cover`,
                { prompt: aiPrompt, title },
            );
            setCoverPreview(data.imageUrl);
            setCoverFile(null);
            toast.success("Cover generated!");
        } catch {
            toast.error("AI generation failed");
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return toast.error("Title is required");
        setSaving(true);
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("format", format);
            form.append("source", source);

            if (coverFile) {
                form.append("coverImage", coverFile);
            } else if (coverPreview && coverPreview !== book.coverImage) {
                form.append("coverImage", coverPreview);
            }

            const { data } = await updateUploadedBook(book._id, form);
            toast.success("Book updated!");
            onUpdated(data);
            onClose();
        } catch {
            toast.error("Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Edit Book Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    {/* Format + Source row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Format
                            </label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            >
                                {FORMATS.map((f) => (
                                    <option key={f} value={f}>
                                        {f.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">
                                Source
                            </label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            >
                                {SOURCES.map((s) => (
                                    <option key={s} value={s}>
                                        {SOURCE_LABELS[s]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-2">
                            Cover Image
                        </label>

                        {/* Cover preview */}
                        <div className="flex gap-4 mb-3">
                            <div className="w-20 h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                                {coverPreview ?
                                    <img
                                        src={coverPreview}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                :   <Camera className="w-6 h-6 text-slate-400" />
                                }
                            </div>
                            <div className="flex-1 text-xs text-slate-400 flex items-center">
                                {coverPreview ?
                                    "Cover selected — save to apply"
                                :   "No cover image set"}
                            </div>
                        </div>

                        {/* Cover tabs */}
                        <div className="flex border-b border-slate-100 mb-3">
                            {COVER_TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => handleCoverTabChange(id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors
                                        ${
                                            coverTab === id ?
                                                "text-violet-600 border-b-2 border-violet-500"
                                            :   "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Upload from device */}
                        {coverTab === "device" && (
                            <div
                                onClick={() => coverInputRef.current.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-violet-300 transition-colors"
                            >
                                <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                                <p className="text-xs text-slate-500">
                                    Click to upload cover image
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    JPG, PNG, WebP
                                </p>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleCoverFile}
                                />
                            </div>
                        )}

                        {/* Cloudinary library */}
                        {coverTab === "cloudinary" && (
                            <div>
                                {loadingCloud ?
                                    <div className="flex justify-center py-6">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
                                    </div>
                                : cloudCovers.length === 0 ?
                                    <p className="text-xs text-slate-400 text-center py-6">
                                        No covers in library
                                    </p>
                                :   <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                        {cloudCovers.map((img, i) => (
                                            <div
                                                key={i}
                                                onClick={() =>
                                                    handleSelectCloudinary(
                                                        img.url,
                                                    )
                                                }
                                                className={`aspect-[2/3] rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                                    ${coverPreview === img.url ? "border-violet-500" : "border-transparent hover:border-violet-300"}`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                        )}

                        {/* AI Generate */}
                        {coverTab === "ai" && (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) =>
                                        setAiPrompt(e.target.value)
                                    }
                                    placeholder="Describe the cover (or leave blank to use title)"
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400"
                                />
                                <button
                                    onClick={handleGenerateAi}
                                    disabled={generatingAi}
                                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2 text-xs font-medium transition-colors"
                                >
                                    <Sparkles
                                        className={`w-3.5 h-3.5 ${generatingAi ? "animate-spin" : "animate-pulse"}`}
                                    />
                                    {generatingAi ?
                                        "Generating..."
                                    :   "Generate Cover"}
                                </button>
                                <p className="text-xs text-slate-400 text-center">
                                    Takes 20-60 seconds
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUploadedBookModal;
