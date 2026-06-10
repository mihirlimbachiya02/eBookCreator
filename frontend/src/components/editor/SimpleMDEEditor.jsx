import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import "./SimpleMDEEditor.css";

// Only strip HTML tags — preserve markdown syntax like ![alt](url)
const stripHtmlTags = (text) => {
    if (!text) return "";
    return text
        .replace(/<(?!img\b|a\b|strong\b|em\b|br\b)[^>]*>/gi, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const SimpleMDEEditor = ({ value = "", onChange }) => {

    const handleEditorChange = (newValue) => {
        if (onChange) onChange(newValue);
    };

    // Convert image to base64 — no Cloudinary, embedded directly in content
    const handleImageUpload = async (files, callback) => {
        try {
            const results = await Promise.all(
                Array.from(files).map((file) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload  = (e) => resolve({
                            url: e.target.result, // base64 data URL
                            alt: file.name,
                        });
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    })
                )
            );
            callback(results);
        } catch (err) {
            console.error("Image read failed:", err.message);
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
