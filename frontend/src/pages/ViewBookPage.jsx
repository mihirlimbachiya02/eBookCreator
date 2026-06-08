import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import DashboardLayout from "../components/layout/DasboardLayout";
import ViewBook from "../components/view/ViewBook";
import ViewBookSkeleton from "../components/view/ViewBookSkeleton";

const ViewBookPage = () => {
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { bookId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) return;
            setIsLoading(true);
            try {
                // CALL the function with bookId
                const url = API_PATHS.BOOKS.GET_BOOK_BY_ID(bookId);

                const response = await axiosInstance.get(url);
                setBook(response.data);
            } catch (error) {
                if (import.meta.env.DEV) console.error("Fetch error:", error.message);
                toast.error("Failed to load eBook details.");
                navigate("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [bookId, navigate]);

    return (
        <DashboardLayout>
            {isLoading ?
                <ViewBookSkeleton />
            : book ?
                <ViewBook book={book} />
                // "Empty State" for missing content
            :   <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                    <div className="text-6xl mb-4">📖</div>
                    <h3 className="text-xl font-bold text-slate-800">
                        eBook Not Found
                    </h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        The eBook you are looking for does not exist or you do
                        not have permission to view it.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                    >
                        Return to Dashboard
                    </button>
                </div>
            }
        </DashboardLayout>
    );
};

export default ViewBookPage;
