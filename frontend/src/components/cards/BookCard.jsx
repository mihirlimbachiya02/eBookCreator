import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/apiPaths";
import { Edit, Trash2 } from "lucide-react";

const BookCard = ({ book, onDelete }) => {
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const cleanImagePath =
        book?.coverImage?.trim() ?
            book.coverImage.startsWith("http") ?
                book.coverImage
            :   book.coverImage.replace(/\\/g, "/").replace(/\/{2,}/g, "/")
        :   null;

    const coverImageUrl =
        cleanImagePath ?
            cleanImagePath.startsWith("http") ? cleanImagePath
            : cleanImagePath.startsWith("res.cloudinary.com") ?
                `https://${cleanImagePath}`
            :   `${BASE_URL.replace(/\/$/, "")}/${cleanImagePath.replace(/^\//, "")}`
        :   null;

    const showImage = coverImageUrl && !imageError;

    const handleError = () => {
        if (retryCount < 2) {
            // Retry up to 2 times with a 1.5s delay before giving up
            setTimeout(() => {
                setRetryCount((c) => c + 1);
            }, 1500);
        } else {
            setImageError(true);
        }
    };

    return (
        <div
            className="group relative w-full max-w-[200px] aspect-[2/3] mx-auto rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer bg-slate-900 select-none"
            onClick={() => navigate(`/view-book/${book._id}`)}
        >
            {/* 1. Full Art Background Layout */}
            <div className="absolute inset-0 w-full h-full">
                {showImage ?
                    <img
                        key={retryCount}
                        src={`${coverImageUrl}?r=${retryCount}`}
                        alt={book.title}
                        className="w-full h-full object-fill block"
                        onLoad={() => setImageError(false)}
                        onError={handleError}
                    />
                :   <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1 bg-slate-800">
                        <span className="text-3xl">📖</span>
                        <span className="text-[11px] font-medium text-slate-400">
                            No Cover Image
                        </span>
                    </div>
                }
            </div>

            {/* 2. Enhanced High-Contrast Gradient Backdrop Scrim */}
            <div className="absolute bottom-0 inset-x-0 h-[50%] bg-gradient-to-t from-black via-black/75 to-transparent pointer-events-none z-0" />

            {/* 3. Floating Action Circles (Visible on Hover States) */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor/${book._id}`);
                    }}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                    title="Edit eBook"
                >
                    <Edit className="h-3.5 w-3.5" />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(book._id);
                    }}
                    className="p-1.5 bg-white/95 hover:bg-rose-50 text-rose-600 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 cursor-pointer"
                    title="Delete eBook"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* 4. Overlay Text Metadata Panel Container */}
            <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col pointer-events-none z-10">
                <h3 className="font-bold text-white line-clamp-1 text-[13px] leading-snug tracking-wide group-hover:text-violet-300 transition-colors duration-200">
                    {book.title}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5 opacity-90">
                    by {book.author || "Unknown Author"}
                </p>
            </div>
        </div>
    );
};

export default BookCard;
