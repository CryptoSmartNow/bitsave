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
    HiOutlineFunnel,
    HiOutlineXMark
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import "../../bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Real promotional video data
const CONTENT_ITEMS = [
    {
        id: "yxEQHPaM6MU",
        title: "How to Tokenise Your Business on BizMarket and Raise Capital from the Web3 Space.",
        duration: "2:45",
        views: 1200,
        category: "Tutorial",
        uploadDate: "3 weeks ago"
    },
    {
        id: "kTGV7mCBF_s",
        title: "How to innovate your business with tech in 2026",
        duration: "3:12",
        views: 850,
        category: "Tutorial",
        uploadDate: "1 month ago"
    },
    {
        id: "DMtgJmsRj8w",
        title: "Earn up to $1,000 Monthly as a BizFi Merchant",
        duration: "1:58",
        views: 2100,
        category: "Updates",
        uploadDate: "2 weeks ago"
    },
    {
        id: "DmcrSzhP0uA",
        title: "How to Raise Capital Without Banks in 2026",
        duration: "4:20",
        views: 1500,
        category: "Tutorial",
        uploadDate: "2 months ago"
    },
    {
        id: "DmwqIOPQ70A",
        title: "Your Government Is Tokenizing Assets — Why Isn’t Your Business?",
        duration: "3:35",
        views: 920,
        category: "Marketing",
        uploadDate: "1 month ago"
    },
    {
        id: "0tYXxQOHvFA",
        title: "Bitsave's BizMarket Is Live: The New Way Businesses Raise Capital Onchain",
        duration: "5:10",
        views: 3400,
        category: "Updates",
        uploadDate: "1 week ago"
    }
];

const CATEGORIES = ["All", "Tutorial", "Marketing", "Updates"];

function VideoPlayerModal({ videoId, isOpen, onClose }: { videoId: string | null, isOpen: boolean, onClose: () => void }) {
    if (!isOpen || !videoId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[110] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 group"
                >
                    <HiOutlineXMark className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
}

export default function BizContentPage() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [mounted, setMounted] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    useState(() => {
        setMounted(true);
    });

    const filteredContent = selectedCategory === "All"
        ? CONTENT_ITEMS
        : CONTENT_ITEMS.filter(item => item.category === selectedCategory);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen text-white overflow-x-hidden`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
                <VideoPlayerModal
                    videoId={selectedVideo}
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />

                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl tracking-tight" style={{ color: '#F9F9FB', fontWeight: 500 }}>BizContent</h1>
                            <p className="text-sm sm:text-base font-medium" style={{ color: '#7B8B9A' }}>Educational content and updates for business owners</p>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <HiOutlineFunnel className="w-5 h-5 text-gray-400 hidden sm:block" />
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${selectedCategory === category
                                        ? 'bg-[#81D7B4] text-gray-900 shadow-[0_0_20px_rgba(129,215,180,0.3)]'
                                        : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 w-full">
                    {filteredContent.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => setSelectedVideo(item.id)}
                            className="bg-gray-900/40 backdrop-blur-sm rounded-3xl border border-gray-800/50 overflow-hidden hover:border-[#81D7B4]/40 transition-all cursor-pointer group shadow-lg flex flex-col h-full"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                                    <div className="w-16 h-16 rounded-full bg-[#81D7B4] flex items-center justify-center shadow-[0_0_30px_rgba(129,215,180,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                        <HiOutlinePlay className="w-8 h-8 text-gray-900 ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-[10px] font-black border border-white/10 uppercase tracking-widest text-white">
                                    {item.duration}
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-block px-2 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-[10px] font-black rounded-lg uppercase tracking-widest border border-[#81D7B4]/20">
                                        {item.category}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">• Bitsave Protocol</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-[#81D7B4] transition-colors">
                                    {item.title}
                                </h3>
                                <div className="mt-auto flex items-center justify-between text-[11px] font-medium text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <HiOutlineEye className="w-4 h-4 text-[#81D7B4]" />
                                        <span>{item.views.toLocaleString()} views</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
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
                    <div className="text-center py-24 bg-gray-900/20 rounded-[3rem] border border-dashed border-gray-800 mt-8">
                        <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-6 text-gray-600">
                            <HiOutlineVideoCamera className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No content found</h3>
                        <p className="text-gray-500">Try selecting a different category from the filters above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
