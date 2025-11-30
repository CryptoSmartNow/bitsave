"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
    HiOutlineRocketLaunch,
    HiOutlineFire,
    HiOutlineSparkles,
    HiOutlineTrophy,
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlinePlus,
    HiOutlineArrowLeft,
    HiOutlineHome
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import Link from "next/link";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Mock token data
const MOCK_TOKENS = [
    {
        id: 1,
        name: "Moon Token",
        symbol: "MOON",
        creator: "0x1234...5678",
        marketCap: "$125.4K",
        holders: 234,
        price: "$0.0234",
        change24h: "+156%",
        isPositive: true,
        description: "To the moon! 🚀",
        volume24h: "$45.2K",
        createdAt: "2h ago"
    },
    {
        id: 2,
        name: "Pepe Coin",
        symbol: "PEPE",
        creator: "0xabcd...efgh",
        marketCap: "$89.2K",
        holders: 189,
        price: "$0.0089",
        change24h: "+89%",
        isPositive: true,
        description: "Rare pepe edition",
        volume24h: "$32.1K",
        createdAt: "4h ago"
    },
    {
        id: 3,
        name: "Diamond Hands",
        symbol: "DIAM",
        creator: "0x9876...5432",
        marketCap: "$234.8K",
        holders: 456,
        price: "$0.0512",
        change24h: "+234%",
        isPositive: true,
        description: "HODL forever 💎🙌",
        volume24h: "$78.9K",
        createdAt: "1h ago"
    },
    {
        id: 4,
        name: "Rocket Fuel",
        symbol: "FUEL",
        creator: "0x5555...6666",
        marketCap: "$67.3K",
        holders: 123,
        price: "$0.0167",
        change24h: "+67%",
        isPositive: true,
        description: "Fuel for your portfolio",
        volume24h: "$23.4K",
        createdAt: "6h ago"
    },
    {
        id: 5,
        name: "Doge Killer",
        symbol: "DGKL",
        creator: "0x7777...8888",
        marketCap: "$156.7K",
        holders: 289,
        price: "$0.0345",
        change24h: "+123%",
        isPositive: true,
        description: "The new king of memes",
        volume24h: "$56.7K",
        createdAt: "3h ago"
    },
    {
        id: 6,
        name: "Shiba Moon",
        symbol: "SHMN",
        creator: "0x9999...0000",
        marketCap: "$98.4K",
        holders: 167,
        price: "$0.0198",
        change24h: "+98%",
        isPositive: true,
        description: "Shiba to the moon",
        volume24h: "$34.5K",
        createdAt: "5h ago"
    }
];

export default function BizFiPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedToken, setSelectedToken] = useState<typeof MOCK_TOKENS[0] | null>(null);
    const [filterTab, setFilterTab] = useState<'trending' | 'new' | 'top'>('trending');

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] text-white relative overflow-x-hidden`}>
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #81D7B4 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo/Brand */}
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-gray-400 hover:text-[#81D7B4] transition-colors group"
                            >
                                <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Back to SaveFi</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-800"></div>
                            <h1 className="text-xl font-bold text-white">BizFi</h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#81D7B4] text-gray-900 font-semibold rounded-lg hover:bg-[#6BC4A0] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#81D7B4]/20"
                            >
                                <HiOutlinePlus className="w-5 h-5" />
                                <span className="hidden sm:inline">Create coin</span>
                            </button>
                            {address && (
                                <div className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-sm font-mono text-gray-300">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 text-center"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                        Launch Your Token
                        <span className="block mt-2 text-[#81D7B4]">In Seconds</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Create, trade, and discover the next big token. No coding required. Fair launch for everyone.
                    </p>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mb-8 flex-wrap"
                >
                    <button
                        onClick={() => setFilterTab('trending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterTab === 'trending'
                                ? 'bg-[#81D7B4] text-gray-900'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                            }`}
                    >
                        <HiOutlineFire className="w-5 h-5" />
                        <span>Trending</span>
                    </button>
                    <button
                        onClick={() => setFilterTab('new')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterTab === 'new'
                                ? 'bg-[#81D7B4] text-gray-900'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                            }`}
                    >
                        <HiOutlineClock className="w-5 h-5" />
                        <span>New</span>
                    </button>
                    <button
                        onClick={() => setFilterTab('top')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filterTab === 'top'
                                ? 'bg-[#81D7B4] text-gray-900'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700'
                            }`}
                    >
                        <HiOutlineTrophy className="w-5 h-5" />
                        <span>Top</span>
                    </button>
                </motion.div>

                {/* Token Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                >
                    {MOCK_TOKENS.map((token, index) => (
                        <motion.div
                            key={token.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (index * 0.1) }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedToken(token)}
                            className="group relative overflow-hidden cursor-pointer bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-[#81D7B4]/50 transition-all duration-300 p-4"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                {/* Token Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center text-xl font-bold text-gray-900 shadow-lg">
                                            {token.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white group-hover:text-[#81D7B4] transition-colors">
                                                {token.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">${token.symbol}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-bold ${token.isPositive
                                            ? 'bg-[#81D7B4]/20 text-[#81D7B4]'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {token.change24h}
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                    {token.description}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                                        <div className="flex items-center gap-1 mb-1">
                                            <HiOutlineCurrencyDollar className="w-3 h-3 text-[#81D7B4]" />
                                            <span className="text-xs text-gray-500">Market Cap</span>
                                        </div>
                                        <p className="text-sm font-bold text-white">{token.marketCap}</p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
                                        <div className="flex items-center gap-1 mb-1">
                                            <HiOutlineUsers className="w-3 h-3 text-[#81D7B4]" />
                                            <span className="text-xs text-gray-500">Holders</span>
                                        </div>
                                        <p className="text-sm font-bold text-white">{token.holders}</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                                    <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="text-sm font-bold text-white">{token.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Created</p>
                                        <p className="text-sm font-bold text-white">{token.createdAt}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Create Token Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Create Token</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Moon Token"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., MOON"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                    <textarea
                                        placeholder="Tell us about your token..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Initial Supply</label>
                                    <input
                                        type="number"
                                        placeholder="1000000"
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-6 py-4 bg-[#81D7B4] text-gray-900 font-bold rounded-lg shadow-lg shadow-[#81D7B4]/20 hover:bg-[#6BC4A0] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <HiOutlineRocketLaunch className="w-5 h-5" />
                                    Launch Token
                                </button>
                            </form>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Fair launch • No presale • Community owned
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Token Detail Modal */}
            <AnimatePresence>
                {selectedToken && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedToken(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-2xl p-8"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center text-3xl font-bold text-gray-900 shadow-lg">
                                        {selectedToken.symbol.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white">{selectedToken.name}</h2>
                                        <p className="text-lg text-gray-400">${selectedToken.symbol}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedToken(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Price</p>
                                    <p className="text-lg font-bold text-white">{selectedToken.price}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">24h Change</p>
                                    <p className="text-lg font-bold text-[#81D7B4]">{selectedToken.change24h}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                                    <p className="text-lg font-bold text-white">{selectedToken.marketCap}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                    <p className="text-xs text-gray-500 mb-1">Volume 24h</p>
                                    <p className="text-lg font-bold text-white">{selectedToken.volume24h}</p>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-6">
                                <h3 className="text-lg font-bold text-white mb-3">About</h3>
                                <p className="text-gray-300 mb-4">{selectedToken.description}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="text-gray-500">Creator</p>
                                        <p className="text-white font-mono">{selectedToken.creator}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500">Holders</p>
                                        <p className="text-white font-bold">{selectedToken.holders}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="px-6 py-4 bg-[#81D7B4] text-gray-900 font-bold rounded-lg shadow-lg hover:bg-[#6BC4A0] transition-all duration-300 hover:scale-105">
                                    Buy
                                </button>
                                <button className="px-6 py-4 bg-gray-800 text-white font-bold rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-300 hover:scale-105">
                                    Sell
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
