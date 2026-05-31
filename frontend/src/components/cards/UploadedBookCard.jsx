import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, FileText, Edit } from "lucide-react";
import EditUploadedBookModal from "../modals/EditUploadedBookModal";

const FORMAT_COLORS = {
    pdf: "bg-red-500",
    epub: "bg-green-500",
    mobi: "bg-blue-500",
    html: "bg-yellow-500",
    zip: "bg-slate-500",
};

const UploadedBookCard = ({ book, onDelete, onUpdate }) => {
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);

    return (
        <>
            <div
                className="group relative w-full max-w-[200px] aspect-[2/3] mx-auto rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer bg-slate-900 select-none"
                onClick={() => navigate(`/view-uploaded-book/${book._id}`)}
            >
                {/* 1. Cover image or placeholder */}
                <div className="absolute inset-0 w-full h-full">
                    {book.coverImage ?
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-fill block"
                        />
                    :   <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                            <FileText className="w-12 h-12 text-slate-600 mb-2" />
                            <span className="text-[11px] font-medium text-slate-500 px-3 text-center line-clamp-2">
                                {book.title}
                            </span>
                        </div>
                    }
                </div>

                {/* 2. Format badge top-left */}
                <div className="absolute top-2 left-2 z-10">
                    <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${FORMAT_COLORS[book.format] || "bg-slate-500"}`}
                    >
                        {book.format}
                    </span>
                </div>

                {/* 3. Action buttons top-right */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEdit(true);
                        }}
                        className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                        title="Edit Book"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(book._id);
                        }}
                        className="p-1.5 bg-white/95 hover:bg-rose-50 text-rose-600 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                        title="Delete Book"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* 4. Gradient scrim */}
                <div className="absolute bottom-0 inset-x-0 h-[50%] bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none z-0" />

                {/* 5. Text overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col pointer-events-none z-10">
                    <h3 className="font-bold text-white line-clamp-1 text-[13px] leading-snug tracking-wide group-hover:text-violet-300 transition-colors duration-200">
                        {book.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5 opacity-90">
                        {book.fileSize ?
                            `${(book.fileSize / 1024 / 1024).toFixed(1)} MB`
                        :   ""}
                        {book.fileSize && book.source ? " · " : ""}
                        {book.source === "google_drive" ?
                            "Drive"
                        : book.source === "url" ?
                            "URL"
                        :   "Device"}
                    </p>
                </div>
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <EditUploadedBookModal
                    book={book}
                    onClose={() => setShowEdit(false)}
                    onUpdated={(updated) => {
                        onUpdate(updated);
                        setShowEdit(false);
                    }}
                />
            )}
        </>
    );
};

export default UploadedBookCard;
