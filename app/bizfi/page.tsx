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
    HiOutlineHome,
    HiOutlineBuildingStorefront,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import Link from "next/link";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Rotating words for hero section
const ROTATING_WORDS = [
    "Business",
    "SME",
    "Start-Up",
    "Company",
    "Project",
    "Idea"
];

// Feature Data
const FEATURES = [
    {
        title: "For Business Owners",
        description: "Tokenize your SME, Start-Up, Company, Project, or Idea on BizMarket and raise capital.",
        icon: HiOutlineRocketLaunch,
        link: "/bizfi/dashboard",
        buttonText: "Launch Business",
        available: true
    },
    {
        title: "For Investors",
        description: "Own equity or revenue of Real World Businesses curated from our portfolio, sell at any time in our Secondary markets. Filter by sector, tier, country, revenue and more.",
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
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % ROTATING_WORDS.length);
        }, 2500); // Change word every 2.5 seconds
        return () => clearInterval(interval);
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
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #81D7B4 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Animated gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#81D7B4]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-[#81D7B4]/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#81D7B4]/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm bg-[#0A0E0D]/80">
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
                            {address && (
                                <div className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-sm font-mono text-gray-300">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-16 text-center"
                >
                    <div className="mb-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="inline-block px-4 py-2 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-full mb-6"
                        >
                            <span className="text-[#81D7B4] text-sm font-semibold">The Future of Business Funding</span>
                        </motion.div>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        <span className="block mb-3">Tokenize your</span>
                        <span className="relative inline-block h-[1.2em] min-w-[280px] sm:min-w-[350px]">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={currentWordIndex}
                                    initial={{
                                        opacity: 0,
                                        y: 40,
                                        filter: "blur(8px)",
                                        scale: 0.8
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        filter: "blur(0px)",
                                        scale: 1
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -40,
                                        filter: "blur(8px)",
                                        scale: 0.8
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: [0.43, 0.13, 0.23, 0.96]
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-[#81D7B4] via-[#6BC4A0] to-[#81D7B4] bg-clip-text text-transparent"
                                >
                                    {ROTATING_WORDS[currentWordIndex]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-xl md:text-2xl text-gray-400 font-light"
                    >
                        and raise capital <span className="text-[#81D7B4] font-semibold">onchain</span>
                    </motion.p>
                </motion.div>

                {/* User Segmentation Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                    className="grid md:grid-cols-2 gap-6 md:gap-8 mb-20"
                >
                    {FEATURES.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + (index * 0.15), duration: 0.6 }}
                            className="group relative bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800/50 p-8 md:p-10 hover:border-[#81D7B4]/50 transition-all duration-500 flex flex-col overflow-hidden"
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                            <div className="relative z-10">
                                <div className="p-4 bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-8 h-8 text-[#81D7B4]" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#81D7B4] transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 mb-8 flex-grow leading-relaxed text-base md:text-lg">
                                    {feature.description}
                                </p>
                                {feature.available ? (
                                    <Link
                                        href={feature.link}
                                        className="block w-full py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-[#81D7B4]/25 transition-all duration-300 hover:scale-[1.02] text-center group-hover:shadow-2xl"
                                    >
                                        {feature.buttonText}
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-gray-800/50 text-gray-500 font-bold rounded-xl border border-gray-700/50 cursor-not-allowed backdrop-blur-sm"
                                    >
                                        {feature.buttonText}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Merchant & Community Sections */}
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.6 }}
                        className="group relative bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-800/50 hover:border-[#81D7B4]/50 transition-all duration-500 flex flex-col items-start overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                        <div className="relative z-10 w-full">
                            <div className="p-4 bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                <HiOutlineBuildingStorefront className="w-8 h-8 text-[#81D7B4]" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#81D7B4] transition-colors duration-300">
                                Become a BizFi Merchant
                            </h3>
                            <p className="text-gray-400 leading-relaxed mb-8 flex-grow text-base md:text-lg">
                                BizMarket offers a new way to fund your business. Tokenize your assets, equity, or revenue streams and connect with a global network of investors.
                            </p>
                            <Link
                                href="/bizfi/dashboard"
                                className="inline-block py-3 px-8 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-[#81D7B4]/25 transition-all duration-300 hover:scale-105"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.15, duration: 0.6 }}
                        className="group relative bg-gradient-to-br from-gray-900/60 to-gray-900/30 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-gray-800/50 hover:border-[#81D7B4]/50 transition-all duration-500 flex flex-col items-start overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                        <div className="relative z-10 w-full">
                            <div className="p-4 bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-[#81D7B4]" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#81D7B4] transition-colors duration-300">
                                Join Our BizFi Community
                            </h3>
                            <p className="text-gray-400 leading-relaxed mb-8 flex-grow text-base md:text-lg">
                                Connect with other investors, entrepreneurs, and blockchain enthusiasts. Share insights, discuss opportunities, and grow together.
                            </p>
                            <a
                                href="#"
                                className="inline-block py-3 px-8 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-[#81D7B4]/25 transition-all duration-300 hover:scale-105"
                            >
                                Book a Consultation
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
