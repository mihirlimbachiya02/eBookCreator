const ViewBookSkeleton = () => {
    return (
        <div className="animate-pulse p-6 bg-slate-100 h-screen flex flex-col gap-6">
            {/* Header Skeleton */}
            <div className="h-16 bg-white rounded-lg w-full flex items-center px-6">
                <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            </div>

            {/* Content Area Skeleton */}
            <div className="flex gap-8 flex-1">
                <div className="w-80 h-full bg-white rounded-lg shadow-sm"></div>
                <div className="flex-1 space-y-4">
                    <div className="h-10 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-64 bg-slate-200 rounded w-full"></div>
                </div>
            </div>
        </div>
    );
};

export default ViewBookSkeleton;
