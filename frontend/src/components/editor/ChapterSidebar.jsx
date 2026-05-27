import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Trash2, Plus, GripVertical } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {Button} from "../ui/index.js";


const SortableItem = ({
    chapter,
    index,
    selectedChapterIndex,
    onSelectChapter,
    onDeleteChapter,
    onGenerateChapterContent,
    isGenerating,
}) => {
    const id = chapter._id || `new-${index}`;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between gap-2 border text-left transition-colors group/item relative ${
                isDragging ?
                    "bg-slate-800/80 border-violet-500/40 shadow-xl opacity-70"
                :   ""
            } ${
                !isDragging && selectedChapterIndex === index ?
                    "bg-gradient-to-r from-violet-600/10 to-indigo-600/5 border-violet-500/20 text-violet-400 shadow-sm"
                :   "hover:bg-slate-800/40 border-transparent text-slate-400 hover:text-slate-200"
            }`}
        >
            {/* Left Column: Drag Handle & Title Link */}
            <div className="flex items-center gap-2 min-w-0 flex-grow py-0.5">
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="p-1 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors"
                    title="Drag to Reorder"
                >
                    <GripVertical className="h-3.5 w-3.5" />
                </button>

                <div
                    onClick={() => onSelectChapter(index)}
                    className="flex items-center gap-2 min-w-0 flex-grow cursor-pointer h-full"
                >
                    <span
                        className={`text-[10px] font-black h-5 w-5 rounded-md flex items-center justify-center shrink-0 border select-none ${
                            selectedChapterIndex === index ?
                                "bg-violet-950 border-violet-800/40 text-violet-400"
                            :   "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                    >
                        {index + 1}
                    </span>
                    <h4 className="text-xs font-bold truncate mt-0.5">
                        {chapter.title || `Chapter ${index + 1}`}
                    </h4>
                </div>
            </div>

            {/* Right Column: Context Management Action Set */}
            <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onGenerateChapterContent(index);
                    }}
                    disabled={isGenerating}
                    className="p-1 text-slate-500 hover:text-violet-400 disabled:opacity-30 cursor-pointer transition-colors"
                    title="AI Auto-Write Chapter"
                >
                    <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(index);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                    title="Delete Chapter"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};


/* DND CHAPTERSIDEBAR EXPORT*/

const ChapterSidebar = ({
    book,
    selectedChapterIndex,
    onSelectChapter,
    onAddChapter,
    onDeleteChapter,
    onGenerateChapterContent,
    isGenerating,
    onReorderChapters,
}) => {
    const navigate = useNavigate();

    const chapterIds =
        book?.chapters?.map(
            (chapter, index) => chapter._id || `new-${index}`,
        ) || [];

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = chapterIds.indexOf(active.id);
            const newIndex = chapterIds.indexOf(over.id);
            onReorderChapters(oldIndex, newIndex);
        }
    };

    return (
        <aside className="w-full h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all z-10 shrink-0">
            
            <div className="p-3 border-b border-slate-800/50 bg-slate-950/20 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="text-slate-400 hover:text-white hover:bg-slate-800/60 font-semibold text-xs w-full justify-start gap-1.5 h-8 px-2 rounded-xl"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Dashboard
                </Button>
            </div>

            {/* Middle Section: Drag and Drop sorting list wrapper */}
            <div className="flex-grow overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={chapterIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                            {book?.chapters?.map((chapter, index) => (
                                <SortableItem
                                    key={chapter._id || `new-${index}`}
                                    chapter={chapter}
                                    index={index}
                                    selectedChapterIndex={selectedChapterIndex}
                                    onSelectChapter={onSelectChapter}
                                    onDeleteChapter={onDeleteChapter}
                                    onGenerateChapterContent={
                                        onGenerateChapterContent
                                    }
                                    isGenerating={isGenerating}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Bottom Section: Action trigger add button */}
            <div className="p-3 border-t border-slate-850 bg-slate-950/20 shrink-0">
                <Button
                    variant="secondary"
                    onClick={onAddChapter}
                    className="w-full h-9 bg-slate-800 hover:bg-slate-750 text-violet-400 hover:text-violet-300 font-bold text-xs rounded-xl border border-slate-700/60 shadow-sm transition-all"
                    icon={Plus}
                >
                    New Chapter
                </Button>
            </div>
        </aside>
    );
};

export default ChapterSidebar;
