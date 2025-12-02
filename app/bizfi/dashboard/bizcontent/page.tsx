"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
    HiOutlineVideoCamera,
    HiOutlinePlay,
    HiOutlineEye,
    HiOutlineClock,
    HiOutlinePlus,
    HiOutlineFunnel
} from "react-icons/hi2";
import { Exo } from "next/font/google";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Mock content data
const CONTENT_ITEMS = [
    {
        id: 1,
        title: "How to Launch Your Business on BizMarket",
        thumbnail: "/api/placeholder/400/225",
        duration: "12:34",
        views: 1240,
        category: "Tutorial",
        uploadDate: "2 days ago"
    },
    {
        id: 2,
        title: "Understanding Business Tokenization",
        thumbnail: "/api/placeholder/400/225",
        duration: "8:15",
        views: 856,
        category: "Tutorial",
        uploadDate: "1 week ago"
    },
    {
        id: 3,
        title: "Marketing Your BizToken Effectively",
        thumbnail: "/api/placeholder/400/225",
        duration: "15:42",
        views: 2103,
        category: "Marketing",
        uploadDate: "3 days ago"
    },
    {
        id: 4,
        title: "Q4 2024 Platform Updates",
        thumbnail: "/api/placeholder/400/225",
        duration: "6:28",
        views: 3421,
        category: "Updates",
        uploadDate: "1 day ago"
    },
    {
        id: 5,
        title: "Investor Relations Best Practices",
        thumbnail: "/api/placeholder/400/225",
        duration: "18:56",
        views: 1567,
        category: "Tutorial",
        uploadDate: "5 days ago"
    },
    {
        id: 6,
        title: "Creating Compelling Business Pitches",
        thumbnail: "/api/placeholder/400/225",
        duration: "11:23",
        views: 987,
        category: "Marketing",
        uploadDate: "1 week ago"
    }
];

const CATEGORIES = ["All", "Tutorial", "Marketing", "Updates"];

export default function BizContentPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [mounted, setMounted] = useState(false);

    useState(() => {
        setMounted(true);
    });

    const filteredContent = selectedCategory === "All"
        ? CONTENT_ITEMS
        : CONTENT_ITEMS.filter(item => item.category === selectedCategory);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] text-white p-4 sm:p-6 lg:p-8`}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">BizContent</h1>
                        <p className="text-sm sm:text-base text-gray-400">Educational content and updates for business owners</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-xl hover:bg-[#6BC4A0] transition-all w-full sm:w-auto">
                        <HiOutlinePlus className="w-5 h-5" />
                        <span className="sm:inline">Upload Content</span>
                    </button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <HiOutlineFunnel className="w-5 h-5 text-gray-400 hidden sm:block" />
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${selectedCategory === category
                                        ? 'bg-[#81D7B4] text-gray-900'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredContent.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden hover:border-[#81D7B4]/30 transition-all cursor-pointer group"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-800">
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#81D7B4]/20 to-gray-900">
                                <HiOutlineVideoCamera className="w-16 h-16 text-gray-600" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                <div className="w-16 h-16 rounded-full bg-[#81D7B4] flex items-center justify-center">
                                    <HiOutlinePlay className="w-8 h-8 text-gray-900 ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs font-bold">
                                {item.duration}
                            </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4">
                            <span className="inline-block px-2 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold rounded mb-2">
                                {item.category}
                            </span>
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <HiOutlineEye className="w-4 h-4" />
                                    <span>{item.views.toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <HiOutlineClock className="w-4 h-4" />
                                    <span>{item.uploadDate}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredContent.length === 0 && (
                <div className="text-center py-16">
                    <HiOutlineVideoCamera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No content found</h3>
                    <p className="text-gray-500">Try selecting a different category</p>
                </div>
            )}
        </div>
    );
}
