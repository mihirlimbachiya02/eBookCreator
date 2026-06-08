import { useState } from "react";
import { Upload, Link, X, FolderOpen, HardDrive } from "lucide-react";
import {
    uploadBook,
    importFromUrl,
    importFromDrive,
} from "../../utils/uploadedBooksApi";
import toast from "react-hot-toast";

const ALLOWED = ["pdf", "html", "epub", "mobi", "zip"];
const TABS = [
    { id: "device", label: "Device", icon: HardDrive },
    { id: "url", label: "Paste URL", icon: Link },
    { id: "drive", label: "Google Drive", icon: FolderOpen },
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function loadScript(src) {
    return new Promise((res) => {
        if (document.querySelector(`script[src="${src}"]`)) return res();
        const s = document.createElement("script");
        s.src = src;
        s.onload = res;
        document.body.appendChild(s);
    });
}

async function openGooglePicker(onPicked) {
    await loadScript("https://apis.google.com/js/api.js");
    await loadScript("https://accounts.google.com/gsi/client");

    window.gapi.load("picker", () => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly",
            callback: (tokenResponse) => {
                const view = new window.google.picker.DocsView()
                    .setMimeTypes(
                        "application/pdf,application/epub+zip,application/zip,text/html",
                    )
                    .setIncludeFolders(false);

                new window.google.picker.PickerBuilder()
                    .addView(view)
                    .setOAuthToken(tokenResponse.access_token)
                    .setDeveloperKey(GOOGLE_API_KEY)
                    .setCallback((data) => {
                        if (
                            data.action === window.google.picker.Action.PICKED
                        ) {
                            const f = data.docs[0];
                            onPicked({
                                name: f.name,
                                mimeType: f.mimeType,
                                driveUrl: `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`,
                                accessToken: tokenResponse.access_token,
                            });
                        }
                    })
                    .build()
                    .setVisible(true);
            },
        });
        tokenClient.requestAccessToken({ prompt: "consent" });
    });
}

const UploadBookModal = ({ onClose, onUploaded }) => {
    const [tab, setTab] = useState("device");
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [drive, setDrive] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = (f) => {
        const ext = f.name.split(".").pop().toLowerCase();
        if (!ALLOWED.includes(ext)) {
            toast.error("Only PDF, HTML, EPUB, MOBI, ZIP allowed");
            return;
        }
        setFile(f);
        if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    };

    const handleDrivePick = async () => {
        try {
            await openGooglePicker((picked) => {
                setDrive(picked);
                if (!title) setTitle(picked.name.replace(/\.[^/.]+$/, ""));
            });
        } catch {
            toast.error("Could not open Google Picker");
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let data;

            if (tab === "device") {
                if (!file) {
                    toast.error("Select a file first");
                    return;
                }
                const form = new FormData();
                form.append("book", file);
                form.append("title", title);
                data = (await uploadBook(form)).data;
            } else if (tab === "url") {
                if (!url.trim()) {
                    toast.error("Paste a URL first");
                    return;
                }
                data = (await importFromUrl({ url: url.trim(), title })).data;
            } else if (tab === "drive") {
                if (!drive) {
                    toast.error("Pick a file from Drive first");
                    return;
                }
                data = (
                    await importFromDrive({
                        driveUrl: drive.driveUrl,
                        accessToken: drive.accessToken,
                        title: title || drive.name,
                        mimeType: drive.mimeType,
                    })
                ).data;
            }

            toast.success("Book uploaded!");
            onUploaded(data);
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Upload a Book
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors
                                ${
                                    tab === id ?
                                        "text-violet-600 border-b-2 border-violet-500"
                                    :   "text-slate-400 hover:text-slate-600"
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-4">
                    {/* Device */}
                    {tab === "device" && (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                handleFile(e.dataTransfer.files[0]);
                            }}
                            onClick={() =>
                                document
                                    .getElementById("book-file-input")
                                    .click()
                            }
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                                ${dragOver ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-violet-300"}`}
                        >
                            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                            {file ?
                                <p className="text-sm font-medium text-violet-600">
                                    {file.name}
                                </p>
                            :   <p className="text-sm text-slate-500">
                                    Drag & drop or click to select
                                    <br />
                                    <span className="text-xs text-slate-400">
                                        PDF, HTML, EPUB, MOBI, ZIP · max 50MB
                                    </span>
                                </p>
                            }
                            <input
                                id="book-file-input"
                                type="file"
                                accept=".pdf,.html,.epub,.mobi,.zip"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files[0])}
                            />
                        </div>
                    )}

                    {/* URL */}
                    {tab === "url" && (
                        <div className="space-y-2">
                            <label className="text-sm text-slate-600 block">
                                Direct link to book file
                            </label>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com/book.pdf"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                            />
                            <p className="text-xs text-slate-400">
                                Must end in .pdf, .epub, .mobi, .html or .zip
                            </p>
                        </div>
                    )}

                    {/* Google Drive */}
                    {tab === "drive" && (
                        <div className="text-center py-4 space-y-3">
                            {drive ?
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-sm font-medium text-green-700">
                                        ✓ File selected
                                    </p>
                                    <p className="text-xs text-green-600 mt-1 truncate">
                                        {drive.name}
                                    </p>
                                </div>
                            :   <p className="text-sm text-slate-500">
                                    Sign in with Google and pick a file from
                                    your Drive
                                </p>
                            }
                            <button
                                onClick={handleDrivePick}
                                className="inline-flex items-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <FolderOpen className="w-4 h-4" />
                                {drive ? "Change File" : "Browse Google Drive"}
                            </button>
                        </div>
                    )}

                    {/* Title — always shown */}
                    <div>
                        <label className="text-sm text-slate-600 mb-1 block">
                            Book Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Enter title..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
                    >
                        {loading ? "Uploading..." : "Upload Book"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadBookModal;
