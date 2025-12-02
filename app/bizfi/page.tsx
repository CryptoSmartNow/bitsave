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

// Feature Data
const FEATURES = [
    {
        title: "For Business Owners",
        description: "A marketplace where small businesses can list, tokenize, and raise capital. It’s like Pump.fun but for businesses.",
        icon: HiOutlineRocketLaunch,
        link: "/bizfi/dashboard",
        buttonText: "Launch Business",
        available: true
    },
    {
        title: "For Investors",
        description: "Filter by sector, tier, country, revenue. Buy shares of businesses in tokens. Secondary market trading.",
        icon: HiOutlineCurrencyDollar,
        link: "#",
        buttonText: "Coming Feb 2026",
        available: false
    }
];

export default function BizFiPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);


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
                            <h1 className="text-xl font-bold text-white">Bitsave BizMarket</h1>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {/* Removed Create Button from Header */}
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
                        Bitsave BizMarket
                        <span className="block mt-2 text-[#81D7B4]">The Onchain Marketplace for Real-World Business</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                        A marketplace where small businesses can list, tokenize, and raise capital. Users can invest and trade tokenized SMEs, businesses, companies, and assets.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
                            Login with Wallet
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
                            Login with Twitter
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
                            Login with Email
                        </span>
                    </div>
                </motion.div>

                {/* User Segmentation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid md:grid-cols-2 gap-8 mb-16"
                >
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1) }}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 hover:border-[#81D7B4]/30 transition-all duration-300 flex flex-col"
                        >
                            <div className="p-3 bg-[#81D7B4]/10 rounded-xl w-fit mb-6">
                                <feature.icon className="w-8 h-8 text-[#81D7B4]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-400 mb-8 flex-grow leading-relaxed">
                                {feature.description}
                            </p>
                            {feature.available ? (
                                <Link
                                    href={feature.link}
                                    className="w-full py-4 bg-[#81D7B4] text-gray-900 font-bold rounded-xl shadow-lg hover:bg-[#6BC4A0] transition-all duration-300 hover:scale-[1.02] text-center"
                                >
                                    {feature.buttonText}
                                </Link>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-4 bg-gray-800 text-gray-500 font-bold rounded-xl border border-gray-700 cursor-not-allowed"
                                >
                                    {feature.buttonText}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Info Sections */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">What are BizTokens?</h3>
                        <p className="text-gray-400 leading-relaxed">
                            BizTokens are the onchain representation of a Real World Business' Value. They allow businesses to tokenize their equity, revenue streams, or assets, making them tradable and investable on the blockchain.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gray-900/30 rounded-2xl p-8 border border-gray-800"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">How it fits into Bitsave</h3>
                        <p className="text-gray-400 leading-relaxed mb-4">
                            We already have SaveFi for Savings. BizFi is our investment arm - the BizMarket for SMEs.
                        </p>
                        <ul className="space-y-2 text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-[#81D7B4] mt-1">•</span>
                                <span>Users multiply savings power by investing through BizFi</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#81D7B4] mt-1">•</span>
                                <span>Businesses get access to capital</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#81D7B4] mt-1">•</span>
                                <span>Investors get access to new yield opportunities</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Create Token Modal Removed */}

            {/* Token Detail Modal Removed */}
        </div>
    );
}
