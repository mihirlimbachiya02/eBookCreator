import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Book } from "lucide-react";

// Layout and UI component references
import DashboardLayout from "../components/layout/DasboardLayout";
import Button from "../components/ui/Button";
import BookCard from "../components/cards/BookCard";
import CreateBookModal from "../components/modals/CreateBookModal"; 
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// 📦 PRE-BAKED COMPONENT: Confirmation Modal Pop-up Layout
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200">
            
            {/* Clickable background overlay */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Card Chassis */}
            <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-2xl border border-slate-100 z-10 transform scale-100 transition-all duration-200">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-50">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors duration-200 cursor-pointer"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

// ⏳ Skeleton loader matched exactly to new immersive 2:3 card geometry bounds
const BookCardSkeleton = () => {
    return (
        <div className="animate-pulse bg-slate-100 border border-slate-200 rounded-xl overflow-hidden w-full max-w-[200px] mx-auto aspect-[2/3]" />
    );
};

const DashboardPage = () => {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); 
    const [bookToDelete, setBookToDelete] = useState(null); // 🚀 Re-activated active state deletion hook

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.BOOKS.GET_BOOKS);
                setBooks(response.data);
            } catch (error) {
                if (import.meta.env.DEV) console.error("Fetch error:", error.message);
                toast.error("Failed to fetch your eBooks.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooks();
    }, []);

    
    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await axiosInstance.delete(API_PATHS.BOOKS.DELETE_BOOK(bookToDelete));
            setBooks(books.filter((book) => book._id !== bookToDelete));
            toast.success("eBook deleted successfully!");
        } catch (error) {
            if (import.meta.env.DEV) console.error("Delete error:", error.message);
            toast.error(error.response?.data?.message || "Failed to delete the book.");
        } finally {
            setBookToDelete(null); // Clear tracking target state gracefully
        }
    };

    // 🚀 NEW: State propagation loop updates UI list instantly on new book responses
    const handleBookCreated = (newBook) => {
        setBooks((prevBooks) => [newBook, ...prevBooks]);
    };

    const handleCreateBookClick = () => {
        setIsCreateModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="w-full px-12 py-8">
                {/* Upper Dashboard Header Row Layout */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            All eBooks
                        </h1>
                        <p className="text-[13px] text-slate-500 mt-1">
                            Create, edit, and manage all your AI-generated eBooks.
                        </p>
                    </div>
                    <Button
                        className="whitespace-nowrap bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md transition-all"
                        onClick={handleCreateBookClick}
                        icon={Plus}
                    >
                        Create New eBook
                    </Button>
                </div>

                {/* Conditional Template Renderer Matrix */}
                {isLoading ? (
                    /* 1. Loading State: High density structural skeleton mesh columns */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 justify-items-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BookCardSkeleton key={i} />
                        ))}
                    </div>
                ) : books.length === 0 ? (
                    /* 2. Empty State: No Books Found Illustration Panel */
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-xl mx-auto px-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Book className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                            No eBooks Found
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                            You haven't created any eBooks yet. Get started by creating your first one.
                        </p>
                        <Button
                            className="mt-5 bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md"
                            onClick={handleCreateBookClick}
                            icon={Plus}
                        >
                            Create Your First eBook
                        </Button>
                    </div>
                ) : (
                    /* 3. Success State: High Density Unified Card Grid Loop */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
                        {books.map((book) => (
                            <BookCard
                                key={book._id}
                                book={book}
                                onDelete={(id) => setBookToDelete(id)} // Sets up safe deletion intercept confirmation modal hook loop
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 🛡️ 4. Confirmation Pop-up Instantiation View */}
            <ConfirmationModal
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={handleDeleteBook}
                title="Delete eBook"
                message="Are you sure you want to delete this eBook? This action cannot be undone and will permanently remove all associated chapters."
            />

            {/* 🪄 5. Create AI Book Overlay Sheet Canvas wrapper */}
            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onBookCreated={handleBookCreated}
            />
        </DashboardLayout>
    );
};

export default DashboardPage;