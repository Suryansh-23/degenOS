export function CardSkeleton() {
    return (
        <div className="card bg-base-100 shadow-xl w-full h-full animate-pulse">
        <div className="card-body flex flex-col justify-between h-full">
            <div>
            <div className="w-20 h-6 bg-gray-300 rounded mb-2"></div>
            <div className="flex flex-row">
                <div className="mr-4 w-24 h-24 bg-gray-300 rounded-full"></div>
                <div className="flex flex-col flex-grow">
                <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gray-300 rounded mb-2"></div>
                <div className="w-full h-4 bg-gray-300 rounded"></div>
                </div>
            </div>
            </div>
            <div className="mt-4 w-full">
            <div className="w-full h-10 bg-gray-300 rounded"></div>
            </div>
        </div>
        </div>
    );
}