import { FEATURES } from "../../utils/data";

const Features = () => {
    return (
        <div
            id="features"
            className="relative w-full bg-white overflow-hidden pt-6 pb-24"
            style={{ scrollMarginTop: "20px" }}
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-violet-50/50 via-transparent to-purple-50/50 z-0 pointer-events-none" />

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative w-full">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
                        <span className="text-sm font-semibold text-violet-900">
                            Features
                        </span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                        Everything You Need to
                        <span className="block mt-2 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Create Your Ebook
                        </span>
                    </h2>

                    <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        Our platform is packed with powerful features to help
                        you write, design, and publish your ebook effortlessly.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-violet-300 transition-all duration-300 hover:shadow-xl hover:shadow-violet-600/10 hover:-translate-y-1 flex flex-col gap-4 mb-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/0 to-purple-50/0 group-hover:from-violet-50/50 group-hover:to-purple-50/30 rounded-2xl transition-all duration-300 pointer-events-none" />

                                <div className="relative">
                                    <div
                                        className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="relative flex flex-col flex-grow gap-2">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-900 transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed text-sm flex-grow">
                                        {feature.description}
                                    </p>
                                </div>

                                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-violet-600 text-sm font-medium inline-flex items-center gap-1">
                                        Learn more
                                        <svg
                                            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-4">
                    <p className="mt-4 text-gray-600 mb-6">Ready to get started?</p>
                    <a
                        href="/signup"
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200"
                    >
                        <span>Start Creating Today</span>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Features;
