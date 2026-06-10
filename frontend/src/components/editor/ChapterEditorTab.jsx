import { useMemo, useState, useEffect } from "react";
import { Type, Maximize2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button, InputField } from "../ui/index.js";
import DOMPurify from "dompurify";
import SimpleMDEEditor from "./SimpleMDEEditor.jsx";


const ChapterEditorTab = ({
    book,
    selectedChapterIndex = 0,
    onChapterChange = () => {},
    setIsAiOpen,
}) => {
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const currentChapter = book?.chapters?.[selectedChapterIndex];

    useEffect(() => {
        const toolbar = document.querySelector(".w-md-editor-toolbar");
        if (!toolbar) return;
        const handleToolbarUpdate = () => {};
        toolbar.addEventListener("click", handleToolbarUpdate);
        return () => toolbar.removeEventListener("click", handleToolbarUpdate);
    }, []);

    // Markdown parser — handles images, headings, bold, italic, blockquote, lists
    const formatMarkdown = (content) => {
        if (!content) return "";

        // Process images FIRST before paragraph splitting
        // so they don't get wrapped in <p> tags
        const blocks = content.split("\n\n");

        const processed = blocks.map((block) => {
            const trimmed = block.trim();
            if (!trimmed) return "";

            // Standalone image line
            if (/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/.test(trimmed)) {
                return trimmed.replace(
                    /^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/,
                    '<img src="$2" alt="$1" class="max-w-full rounded-lg my-6 shadow-md mx-auto block" loading="lazy" />'
                );
            }

            // Page break
            if (trimmed === "[break]") {
                return '<div class="my-12"></div>';
            }

            // Headings
            if (/^###\s/.test(trimmed)) {
                return trimmed.replace(/^###\s(.*)$/, '<h3 class="text-xl font-bold mb-4 mt-6 text-slate-800">$1</h3>');
            }
            if (/^##\s/.test(trimmed)) {
                return trimmed.replace(/^##\s(.*)$/, '<h2 class="text-2xl font-bold mb-4 mt-8 text-slate-800">$1</h2>');
            }
            if (/^#\s/.test(trimmed)) {
                return trimmed.replace(/^#\s(.*)$/, '<h1 class="text-3xl font-bold mb-6 mt-8 text-slate-900">$1</h1>');
            }

            // Blockquote
            if (/^>\s/.test(trimmed)) {
                return trimmed.replace(/^>\s(.*)$/, '<blockquote class="border-l-4 border-violet-500 pl-4 italic text-slate-600 my-4">$1</blockquote>');
            }

            // List items
            if (/^- /.test(trimmed)) {
                const items = trimmed
                    .split("\n")
                    .filter((l) => l.startsWith("- "))
                    .map((l) => `<li class="ml-4 mb-1 text-slate-700">${l.replace(/^- /, "")}</li>`)
                    .join("");
                return `<ul class="list-disc my-4 pl-4">${items}</ul>`;
            }

            // Inline formatting within paragraph
            // Handle inline images inside paragraphs too
            let inlined = trimmed
                .replace(
                    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g,
                    '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4 shadow-md mx-auto block" loading="lazy" />'
                )
                .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

            // If the block contains an img tag after inline processing, don't wrap in <p>
            if (inlined.includes("<img")) {
                return inlined;
            }

            return `<p class="mb-4 leading-relaxed text-slate-700">${inlined}</p>`;
        });

        return processed.join("");
    };

    const mdeOptions = useMemo(
        () => ({
            autofocus: true,
            spellChecker: false,
            toolbar: [
                "bold",
                "italic",
                "heading",
                "|",
                "quote",
                "unordered-list",
                "ordered-list",
                "|",
                "link",
                "image",
                "|",
                "preview",
                "side-by-side",
                "fullscreen",
            ],
        }),
        [],
    );

    if (!currentChapter) {
        return (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-50 min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Type className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium">
                        Select a chapter to start editing
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${isFullscreen ? "fixed inset-0 z-50 bg-white p-6" : "flex-1"} flex flex-col h-full`}
        >
            {/* Header Control Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h1 className="text-md font-bold text-slate-800">
                    Chapter Editor
                </h1>

                <div className="flex items-center gap-2">
                    {/* MOBILE ONLY AI TRIGGER */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAiOpen(true);
                        }}
                        className="md:hidden p-2 bg-violet-100 text-violet-700 rounded-lg border border-violet-100"
                    >
                        <Sparkles className="h-4 w-4" />
                    </button>

                    {/* Edit / Preview Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`p-2 rounded-xl transition-all border cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold h-9 px-3 ${
                            !isPreviewMode ?
                                "bg-violet-50 border-violet-200 text-violet-700"
                            :   "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                        {isPreviewMode ?
                            <EyeOff className="w-4 h-4" />
                        :   <Eye className="w-4 h-4" />}
                        <span className="hidden sm:inline">
                            {isPreviewMode ? "Preview" : "Edit Mode"}
                        </span>
                    </button>

                    {/* Fullscreen Button */}
                    <Button
                        variant="secondary"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 h-9 flex items-center justify-center"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content Display Workspace */}
            <div className="flex-grow flex flex-col min-h-0 relative">
                <div className="mb-4">
                    <InputField
                        label="Chapter Title"
                        name="title"
                        disabled={isPreviewMode}
                        value={currentChapter.title || ""}
                        onChange={(e) => onChapterChange(e)}
                        placeholder="Enter chapter title..."
                    />
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 relative">
                    {isPreviewMode ? (
                        <div
                            className="prose max-w-none p-6 border border-slate-150 rounded-2xl bg-slate-50/40 min-h-[350px] text-slate-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                    formatMarkdown(currentChapter.content),
                                    {
                                        ALLOWED_TAGS: [
                                            "p", "h1", "h2", "h3",
                                            "strong", "em", "blockquote",
                                            "ul", "li", "div", "img", "br",
                                        ],
                                        ALLOWED_ATTR: ["src", "alt", "class", "loading"],
                                    }
                                ),
                            }}
                        />
                    ) : (
                        <div className="h-full">
                            <SimpleMDEEditor
                                key={`mde-chapter-${selectedChapterIndex}`}
                                value={currentChapter.content || ""}
                                onChange={(value) =>
                                    onChapterChange({
                                        target: { value, name: "content" },
                                    })
                                }
                                options={mdeOptions}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChapterEditorTab;
