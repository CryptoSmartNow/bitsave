'use client';

import { 
    PlayIcon, 
    ViewIcon, 
    Cancel01Icon, 
    Search01Icon, 
    Clock01Icon
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Instrument_Serif } from "next/font/google";
import "../../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

interface ContentItem {
    id: string;
    title: string;
    description: string;
    duration: string;
    views: number;
    category: "Masterclass" | "Tutorial" | "Marketing" | "Updates";
    level: "Beginner" | "Intermediate" | "Advanced";
    uploadDate: string;
    featured?: boolean;
}

const CONTENT_ITEMS: ContentItem[] = [
    {
        id: "gtoY7io1iYo",
        title: "BizFi Masterclass: Structuring & Tokenizing Real-World Businesses Onchain",
        description: "Comprehensive blueprint on building sustainable Web3 businesses, collateralized credit, and fractional revenue sharing for modern enterprises.",
        duration: "18:40",
        views: 4820,
        category: "Masterclass",
        level: "Advanced",
        uploadDate: "Featured",
        featured: true
    },
    {
        id: "0tYXxQOHvFA",
        title: "BizMarket Is Live: The New Way Businesses Raise Capital Onchain",
        description: "Explore the end-to-end flow of listing your company, minting BizShares, and accessing global liquidity without traditional bank debt.",
        duration: "5:10",
        views: 3400,
        category: "Updates",
        level: "Beginner",
        uploadDate: "1 week ago"
    },
    {
        id: "yxEQHPaM6MU",
        title: "How to Tokenize Your Business on BizMarket and Raise Web3 Capital",
        description: "Step-by-step walkthrough covering company assessment tiers, metadata filing, attestation, and launching your investor pool.",
        duration: "2:45",
        views: 1200,
        category: "Tutorial",
        level: "Intermediate",
        uploadDate: "3 weeks ago"
    },
    {
        id: "DMtgJmsRj8w",
        title: "Earn up to $1,000 Monthly as a BizFi Merchant & Node Partner",
        description: "Discover the revenue model behind protocol verification, merchant processing, and referral incentives.",
        duration: "1:58",
        views: 2100,
        category: "Updates",
        level: "Beginner",
        uploadDate: "2 weeks ago"
    },
    {
        id: "DmcrSzhP0uA",
        title: "How to Raise Capital Without Banks in 2026",
        description: "Practical guide to alternative liquidity, onchain credit scores, and community-backed fundraising mechanisms.",
        duration: "4:20",
        views: 1500,
        category: "Tutorial",
        level: "Intermediate",
        uploadDate: "2 months ago"
    },
    {
        id: "ji1sO_AcSxk",
        title: "Stablecoins Changed Money. Capital Is Still Broken.",
        description: "Why payment rails alone aren't enough and how programmable business equity bridges the capital distribution gap.",
        duration: "4:15",
        views: 890,
        category: "Updates",
        level: "Intermediate",
        uploadDate: "Recently"
    },
    {
        id: "iGbrRMXMMno",
        title: "Every Serious Business Has Gone Digital. Next Is Tokenization.",
        description: "The transition from traditional digital storefronts to immutable onchain balance sheets and asset-backed tokens.",
        duration: "3:30",
        views: 740,
        category: "Tutorial",
        level: "Beginner",
        uploadDate: "Recently"
    },
    {
        id: "DmwqIOPQ70A",
        title: "Your Government Is Tokenizing Assets — Why Isn’t Your Business?",
        description: "Real-world regulatory trends in institutional RWA tokenization and how micro-to-enterprise founders can capitalize.",
        duration: "3:35",
        views: 920,
        category: "Marketing",
        level: "Intermediate",
        uploadDate: "1 month ago"
    },
    {
        id: "kTGV7mCBF_s",
        title: "How to Innovate Your Business with Tech in 2026",
        description: "Modern stack recommendations, automation workflows, and Web3 integrations for lean founders.",
        duration: "3:12",
        views: 850,
        category: "Tutorial",
        level: "Beginner",
        uploadDate: "1 month ago"
    },
    {
        id: "frhBXU62vmc",
        title: "Seeing is Not Believing in Business. Believing is Seeing.",
        description: "Mindset principles for high-conviction execution, team alignment, and capital attraction.",
        duration: "2:55",
        views: 610,
        category: "Marketing",
        level: "Beginner",
        uploadDate: "Recently"
    },
    {
        id: "PuYXtLbsa4Q",
        title: "Making Money is Easy. Keeping It is Hard.",
        description: "Treasury management strategies, cashflow hedging with stablecoins, and risk management protocols.",
        duration: "3:10",
        views: 790,
        category: "Tutorial",
        level: "Intermediate",
        uploadDate: "Recently"
    },
    {
        id: "ZstO23QRnuE",
        title: "Your Money is Not in Banks. Your Money is in People.",
        description: "Building loyal customer flywheels, community stakeholder alignment, and decentralized distribution networks.",
        duration: "3:50",
        views: 680,
        category: "Marketing",
        level: "Beginner",
        uploadDate: "Recently"
    }
];

const CATEGORIES = ["All", "Masterclass", "Tutorial", "Marketing", "Updates"] as const;

function VideoPlayerModal({ 
    video, 
    isOpen, 
    onClose 
}: { 
    video: ContentItem | null; 
    isOpen: boolean; 
    onClose: () => void;
}) {
    if (!isOpen || !video) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#070A0F]/85 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 10 }}
                    className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-[#0F1825] border border-[#7B8B9A]/20 shadow-2xl z-10 flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#7B8B9A]/15 bg-[#1A2538]/40">
                        <h3 className="text-sm font-bold text-[#F9F9FB] truncate pr-4">
                            {video.title}
                        </h3>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-[#0F1825] hover:bg-[#1A2538] border border-[#7B8B9A]/20 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors cursor-pointer shrink-0"
                            title="Close"
                        >
                            <Cancel01Icon className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Video Frame */}
                    <div className="relative w-full aspect-video bg-black">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Footer */}
                    <div className="p-4 sm:p-5 bg-[#0F1825] border-t border-[#7B8B9A]/15 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-[#7B8B9A]">
                            <div className="flex items-center gap-3">
                                <span>{video.duration}</span>
                                <span>•</span>
                                <span>{video.views.toLocaleString()} views</span>
                                <span>•</span>
                                <span className="text-[#81D7B4] font-medium">{video.category}</span>
                            </div>
                            <span className="text-[11px] font-mono text-[#7B8B9A]">
                                {video.level}
                            </span>
                        </div>
                        <p className="text-xs text-[#7B8B9A] leading-relaxed">
                            {video.description}
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default function BizContentPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVideo, setSelectedVideo] = useState<ContentItem | null>(null);

    const featuredVideo = CONTENT_ITEMS.find(item => item.featured) || CONTENT_ITEMS[0];

    const filteredContent = useMemo(() => {
        return CONTENT_ITEMS.filter(item => {
            const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
            const matchesSearch = 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
            
            <VideoPlayerModal
                video={selectedVideo}
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
            />

            {/* Header Section */}
            <div className="pb-5 border-b border-[#7B8B9A]/15">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F9F9FB]">
                    BizContent <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Academy</span>
                </h1>
                <p className="text-xs sm:text-sm text-[#7B8B9A] mt-1 font-medium">
                    Educational masterclasses, tokenization tutorials, and strategic briefings for founders.
                </p>
            </div>

            {/* Featured Hero Banner */}
            {featuredVideo && (
                <div className="rounded-2xl border border-[#7B8B9A]/15 bg-[#1A2538]/30 overflow-hidden shadow-lg">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-5 sm:p-6 lg:p-7">
                        <div className="lg:col-span-7 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25">
                                    Featured Masterclass
                                </span>
                                <span className="text-xs text-[#7B8B9A] font-mono">
                                    {featuredVideo.duration}
                                </span>
                            </div>

                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#F9F9FB] tracking-tight leading-snug">
                                {featuredVideo.title}
                            </h2>

                            <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed">
                                {featuredVideo.description}
                            </p>

                            <div className="pt-1">
                                <button
                                    onClick={() => setSelectedVideo(featuredVideo)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold text-xs rounded-xl transition-all cursor-pointer"
                                >
                                    <PlayIcon className="w-4 h-4 fill-[#0F1825]" />
                                    <span>Watch Video</span>
                                </button>
                            </div>
                        </div>

                        <div 
                            onClick={() => setSelectedVideo(featuredVideo)}
                            className="lg:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-[#7B8B9A]/15 cursor-pointer group bg-[#0F1825]"
                        >
                            <img
                                src={`https://img.youtube.com/vi/${featuredVideo.id}/hqdefault.jpg`}
                                alt={featuredVideo.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-[#0F1825]/30 group-hover:bg-[#0F1825]/10 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] shadow-lg">
                                    <PlayIcon className="w-5 h-5 fill-[#0F1825] ml-0.5" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-[#0F1825]/90 rounded text-[10px] font-mono font-semibold text-[#81D7B4]">
                                {featuredVideo.duration}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Clean Category Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {CATEGORIES.map((category) => {
                        const isActive = selectedCategory === category;
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                    isActive
                                        ? 'bg-[#81D7B4] text-[#0F1825]'
                                        : 'bg-[#1A2538]/40 border border-[#7B8B9A]/15 text-[#7B8B9A] hover:text-[#F9F9FB] hover:border-[#7B8B9A]/30'
                                }`}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>

                {/* Search Input */}
                <div className="relative min-w-[220px]">
                    <Search01Icon className="w-3.5 h-3.5 text-[#7B8B9A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full pl-8.5 pr-8 py-1.5 bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-xl text-xs text-[#F9F9FB] placeholder-[#7B8B9A]/40 focus:border-[#81D7B4] focus:outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7B8B9A] hover:text-[#F9F9FB]"
                        >
                            <Cancel01Icon className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContent.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedVideo(item)}
                        className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer group flex flex-col h-full"
                    >
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden bg-[#0F1825]">
                            <img
                                src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                            
                            <div className="absolute inset-0 bg-[#0F1825]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] shadow-md">
                                    <PlayIcon className="w-4 h-4 fill-[#0F1825] ml-0.5" />
                                </div>
                            </div>

                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#0F1825]/90 rounded text-[10px] font-mono font-medium text-[#81D7B4]">
                                {item.duration}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1 justify-between space-y-2.5">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-[#7B8B9A]">
                                    <span className="text-[#81D7B4] font-semibold">{item.category}</span>
                                    <span>{item.uploadDate}</span>
                                </div>

                                <h3 className="text-sm font-bold text-[#F9F9FB] line-clamp-2 leading-snug group-hover:text-[#81D7B4] transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-xs text-[#7B8B9A] line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>

                            <div className="pt-2 border-t border-[#7B8B9A]/10 flex items-center justify-between text-[11px] text-[#7B8B9A]">
                                <div className="flex items-center gap-1.5">
                                    <ViewIcon className="w-3 h-3 text-[#7B8B9A]" />
                                    <span>{item.views.toLocaleString()} views</span>
                                </div>
                                <span className="font-mono text-[10px]">{item.level}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredContent.length === 0 && (
                <div className="text-center py-12 px-4 bg-[#1A2538]/20 rounded-2xl border border-dashed border-[#7B8B9A]/20 space-y-3">
                    <p className="text-xs font-semibold text-[#F9F9FB]">No matching content found for "{searchQuery}"</p>
                    <button
                        onClick={() => {
                            setSelectedCategory("All");
                            setSearchQuery("");
                        }}
                        className="px-3.5 py-1.5 bg-[#1A2538] hover:bg-[#2C3E5D]/60 border border-[#7B8B9A]/20 text-[#81D7B4] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                        Reset filters
                    </button>
                </div>
            )}
        </div>
    );
}
