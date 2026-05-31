import { MdEditor } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import "./SimpleMDEEditor.css";

const SimpleMDEEditor = ({ value = "", onChange }) => {
    
    const handleEditorChange = (newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (

        <div 
            className="w-full flex-grow flex flex-col h-[calc(100vh-190px)] min-h-[500px] rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-300 focus-within:border-violet-400 focus-within:shadow-[0_0_0_4px_rgba(124,58,237,0.05)] custom-minimalist-editor"
        >
            <MdEditor
                modelValue={value || ""}
                onChange={handleEditorChange}
                language="en-US"
                theme="light"
                preview={true}
                htmlPreview={true}
                placeholder="Write your thoughts completely unobstructed..."
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