import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Book, Upload } from "lucide-react";
import UploadBookModal from "../components/modals/UploadBookModal";
import UploadedBookCard from "../components/cards/UploadedBookCard";
import {
    fetchUploadedBooks,
    deleteUploadedBook,
} from "../utils/uploadedBooksApi";

// Layout and UI component references
import DashboardLayout from "../components/layout/DasboardLayout";
import Button from "../components/ui/Button";
import BookCard from "../components/cards/BookCard";
import CreateBookModal from "../components/modals/CreateBookModal";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// 📦 COMPONENT: Confirmation Modal Pop-up Layout
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-2xl border border-slate-100 z-10 transform scale-100 transition-all duration-200">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {message}
                    </p>
                </div>
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

// ⏳ Skeleton loader
const BookCardSkeleton = () => (
    <div className="animate-pulse bg-slate-100 border border-slate-200 rounded-xl overflow-hidden w-full max-w-[200px] mx-auto aspect-[2/3]" />
);

const DashboardPage = () => {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [uploadedBooks, setUploadedBooks] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadedBookToDelete, setUploadedBookToDelete] = useState(null);

    // fetch AI books
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axiosInstance.get(
                    API_PATHS.BOOKS.GET_BOOKS,
                );
                setBooks(response.data);
            } catch (error) {
                if (import.meta.env.DEV)
                    console.error("Fetch error:", error.message);
                toast.error("Failed to fetch your eBooks.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBooks();
    }, []);

    // fetch uploaded books
    useEffect(() => {
        fetchUploadedBooks()
            .then(({ data }) => setUploadedBooks(data))
            .catch(() => toast.error("Failed to load uploaded books"));
    }, []);

    const handleDeleteBook = async () => {
        if (!bookToDelete) return;
        try {
            await axiosInstance.delete(
                API_PATHS.BOOKS.DELETE_BOOK(bookToDelete),
            );
            setBooks(books.filter((book) => book._id !== bookToDelete));
            toast.success("eBook deleted successfully!");
        } catch (error) {
            if (import.meta.env.DEV)
                console.error("Delete error:", error.message);
            toast.error(
                error.response?.data?.message || "Failed to delete the book.",
            );
        } finally {
            setBookToDelete(null);
        }
    };



    const handleDeleteUploaded = async () => {
    if (!uploadedBookToDelete) return;
    try {
        await deleteUploadedBook(uploadedBookToDelete);
        setUploadedBooks((prev) => prev.filter((b) => b._id !== uploadedBookToDelete));
        toast.success("Book deleted successfully!");
    } catch (error) {
        if (import.meta.env.DEV) console.error("Delete error:", error.message);
        toast.error(error.response?.data?.message || "Failed to delete the book.");
    } finally {
        setUploadedBookToDelete(null);
    }
};

    const handleBookCreated = (newBook) => {
        setBooks((prevBooks) => [newBook, ...prevBooks]);
    };

    const handleUpdateUploaded = (updatedBook) => {
        setUploadedBooks((prev) =>
            prev.map((b) => (b._id === updatedBook._id ? updatedBook : b)),
        );
    };

    return (
        <DashboardLayout>
            <div className="w-full px-4 md:px-12 py-8">
                {/* ── AI Created Books ── */}
                <div
                    id="ai-books"
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100"
                >
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                            AI eBooks
                        </h1>
                        <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">
                            Create, edit, and manage all your AI-generated
                            eBooks.
                        </p>
                    </div>
                    <Button
                        className="w-full md:w-auto justify-center bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md transition-all"
                        onClick={() => setIsCreateModalOpen(true)}
                        icon={Plus}
                    >
                        Create New eBook
                    </Button>
                </div>

                {/* Grid display */}
                {isLoading ?
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 justify-items-center">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BookCardSkeleton key={i} />
                        ))}
                    </div>
                : books.length === 0 ?
                    <div className="text-center py-12 md:py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-xl mx-auto px-4">
                        <Book className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-900">
                            No eBooks Found
                        </h3>
                        <Button
                            className="mt-5 bg-violet-600 text-white"
                            onClick={() => setIsCreateModalOpen(true)}
                            icon={Plus}
                        >
                            Create First eBook
                        </Button>
                    </div>
                :   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 justify-items-center">
                        {books.map((book) => (
                            <BookCard
                                key={book._id}
                                book={book}
                                onDelete={(id) => setBookToDelete(id)}
                            />
                        ))}
                    </div>
                }

                {/* ── Uploaded Books ── */}
                <div id="uploaded-books" className="mt-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                                Uploaded Books
                            </h2>
                            <p className="text-[12px] md:text-[13px] text-slate-500 mt-1">
                                Books uploaded from your device, URL, or Google
                                Drive.
                            </p>
                        </div>
                        <Button
                            className="w-full md:w-auto justify-center bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md transition-all"
                            onClick={() => setShowUploadModal(true)}
                            icon={Upload}
                        >
                            Upload Book
                        </Button>
                    </div>

                    {uploadedBooks.length === 0 ?
                        <div className="text-center py-12 md:py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 max-w-xl mx-auto px-4">
                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-slate-900">
                                No Uploaded Books
                            </h3>
                            <Button
                                className="mt-5 bg-violet-600 text-white"
                                onClick={() => setShowUploadModal(true)}
                                icon={Upload}
                            >
                                Upload First Book
                            </Button>
                        </div>
                    :   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6 justify-items-center">
                            {uploadedBooks.map((book) => (
                                <UploadedBookCard
                                    key={book._id}
                                    book={book}
                                    onDelete={(id) =>
                                        setUploadedBookToDelete(id)
                                    }
                                    onUpdate={handleUpdateUploaded}
                                />
                            ))}
                        </div>
                    }
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!bookToDelete}
                onClose={() => setBookToDelete(null)}
                onConfirm={handleDeleteBook}
                title="Delete eBook"
                message="Are you sure you want to delete this eBook? This action cannot be undone and will permanently remove all associated chapters."
            />

            <ConfirmationModal
                isOpen={!!uploadedBookToDelete}
                onClose={() => setUploadedBookToDelete(null)}
                onConfirm={handleDeleteUploaded}
                title="Delete Uploaded Book"
                message="Are you sure you want to delete this book? This action cannot be undone and will permanently remove it from your library."
            />

            {/* Create AI Book Modal */}
            <CreateBookModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onBookCreated={handleBookCreated}
            />

            {/* Upload Book Modal */}
            {showUploadModal && (
                <UploadBookModal
                    onClose={() => setShowUploadModal(false)}
                    onUploaded={(book) =>
                        setUploadedBooks((prev) => [book, ...prev])
                    }
                />
            )}
        </DashboardLayout>
    );
};

export default DashboardPage;
