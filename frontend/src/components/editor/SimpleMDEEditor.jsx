import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import "./SimpleMDEEditor.css";
import axiosInstance from "../../utils/axiosInstance";

// Strip HTML tags from AI-generated content — preserve markdown syntax
const stripHtmlTags = (text) => {
    if (!text) return "";
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const SimpleMDEEditor = ({ value = "", onChange }) => {

    const handleEditorChange = (newValue) => {
        if (onChange) onChange(newValue);
    };

    // Upload image to Cloudinary content-images folder (separate from book covers)
    const handleImageUpload = async (files, callback) => {
        try {
            const results = await Promise.all(
                Array.from(files).map(async (file) => {
                    const formData = new FormData();
                    formData.append("coverImage", file);
                    const response = await axiosInstance.post(
                        "/api/books/upload-content-image",
                        formData,
                        { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    return { url: response.data.url, alt: file.name };
                })
            );
            callback(results);
        } catch (err) {
            console.error("Image upload failed:", err.message);
            callback([]);
        }
    };

    return (
        <div className="w-full flex-grow flex flex-col h-[calc(100vh-190px)] min-h-[500px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-300 focus-within:border-violet-400 focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.05)] custom-minimalist-editor">
            <MdEditor
                modelValue={stripHtmlTags(value)}
                onChange={handleEditorChange}
                language="en-US"
                theme="light"
                preview={false}
                htmlPreview={true}
                placeholder="Write your thoughts completely unobstructed..."
                onUploadImg={handleImageUpload}
                toolbars={[
                    "bold",
                    "italic",
                    "strikeThrough",
                    "-",
                    "title",
                    "quote",
                    "unorderedList",
                    "orderedList",
                    "-",
                    "link",
                    "image",
                    "code",
                    "table",
                    "-",
                    "revoke",
                    "next",
                    "=",
                    "pageFullscreen",
                    "preview",
                ]}
            />
        </div>
    );
};

export default SimpleMDEEditor;
