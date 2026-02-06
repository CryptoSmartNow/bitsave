"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import {
    HiOutlineRocketLaunch,
    HiOutlineGift,
    HiOutlineUserGroup,
    HiOutlineCurrencyDollar,
    HiOutlineArrowRight,
    HiOutlineArrowLeft,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineSparkles,
    HiOutlineCheckCircle,
    HiOutlineLightBulb,
    HiOutlinePuzzlePiece,
    HiOutlineChartBar,
    HiOutlineGlobeAlt,
    HiOutlineChatBubbleLeftRight,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlinePresentationChartLine,
    HiOutlineCubeTransparent,
    HiOutlineScale,
    HiOutlineBanknotes,
    HiOutlineCpuChip,
    HiOutlineArrowTopRightOnSquare
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import Image from "next/image";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Reusing the style from the main landing page
const FEATURES = [
    {
        title: "Tokenize Business",
        description: "Tokenize your business or idea instantly with our AI agent $BizMart.",
        icon: HiOutlineCubeTransparent,
        detail: "Instant Tokenization"
    },
    {
        title: "Prediction Markets",
        description: "Deploy to prediction markets where AI agents and humans debate and trade.",
        icon: HiOutlinePresentationChartLine,
        detail: "Market Deployment"
    },
    {
        title: "AI & Human Trading",
        description: "Let AI agents and humans trade your business tokens based on performance.",
        icon: HiOutlineScale,
        detail: "Public Trading"
    },
    {
        title: "Public Funding",
        description: "Get funded publicly by a global network of AI agents and investors.",
        icon: HiOutlineBanknotes,
        detail: "Global Access"
    }
];

const STEPS = [
    {
        step: "01",
        title: "Tokenize",
        description: "Submit your business or idea to $BizMart for instant tokenization."
    },
    {
        step: "02",
        title: "Deploy",
        description: "Your business enters the prediction market for valuation."
    },
    {
        step: "03",
        title: "Fund",
        description: "Receive funding as AI agents and humans trade your tokens."
    }
];

const FUNDING_TARGETS = [
    "Business",
    "Idea",
    "Project",
    "StartUp",
    "Career"
];

export default function BizFunPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [targetIndex, setTargetIndex] = useState(0);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        
        const interval = setInterval(() => {
            setTargetIndex((prev) => (prev + 1) % FUNDING_TARGETS.length);
        }, 2500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(interval);
        };
    }, []);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-white flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-[family-name:var(--font-exo)] min-h-screen text-gray-900 bg-white selection:bg-[#81D7B4]/20 selection:text-gray-900`}>
            
            {/* Header - Matching Main Landing Page Style */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                  scrolled 
                    ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4' 
                    : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link href="/bizfun" className="flex items-center gap-2 group">
                            <div className="relative">
                                {/* Using a placeholder or reusing bitsave logo but purely styled for BizFun context */}
                                <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex items-center justify-center text-white shadow-lg shadow-[#81D7B4]/30 transition-transform group-hover:scale-105">
                                    <HiOutlineGift className="w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">BizFun</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden xl:flex items-center space-x-1">
                            <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-gray-50 whitespace-nowrap">How It Works</a>
                            <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-gray-50 whitespace-nowrap">Features</a>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden xl:flex items-center space-x-4">
                        <div className="hidden md:block">
                            <LanguageSelector />
                        </div>
                        
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-500 hover:text-[#81D7B4] transition-colors flex items-center gap-2 mr-4"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to SaveFi
                        </Link>

                        {isConnected && address ? (
                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-mono text-gray-600">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                                <button
                                    onClick={() => disconnect()}
                                    className="text-sm text-gray-500 hover:text-red-500 transition-colors px-2"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <BizFiAuthButton className="!bg-[#81D7B4] !text-white !rounded-full !px-6 !py-2.5 !shadow-lg !shadow-[#81D7B4]/20 hover:!bg-[#6BC5A0] hover:!shadow-[#81D7B4]/40" />
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="xl:hidden relative z-50 p-2 text-gray-800 hover:text-[#81D7B4] transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                         {isMobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl xl:hidden"
                        >
                            <div className="p-4 space-y-4">
                                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg">How It Works</a>
                                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Features</a>
                                <a href="#bizmart" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Meet $BizMart</a>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <Link href="/dashboard" className="block px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                    <HiOutlineArrowLeft className="w-5 h-5" />
                                    Back to SaveFi
                                </Link>
                                <div className="px-4">
                                    <LanguageSelector />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="pt-24 pb-12">
                {/* Hero Section */}
                <section className="relative w-full py-20 lg:py-32 flex items-center justify-center overflow-hidden min-h-[90vh]">
                    {/* Background Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#81D7B4]/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/10 rounded-full blur-[100px]" />
                        
                        {/* Doodles Background */}
                        <div className="absolute inset-0 opacity-[0.03]">
                            {/* Hidden on mobile to prevent clutter, visible on md+ */}
                            <HiOutlineLightBulb className="hidden md:block absolute top-[10%] left-[10%] w-24 h-24 -rotate-12" />
                            <HiOutlinePuzzlePiece className="hidden md:block absolute top-[15%] right-[15%] w-32 h-32 rotate-12" />
                            <HiOutlineRocketLaunch className="absolute bottom-[20%] left-[15%] w-16 h-16 md:w-28 md:h-28 rotate-45" />
                            <HiOutlineChartBar className="absolute bottom-[25%] right-[10%] w-16 h-16 md:w-24 md:h-24 -rotate-6" />
                            <HiOutlineGlobeAlt className="hidden md:block absolute top-[40%] left-[5%] w-20 h-20 rotate-12" />
                            <HiOutlineChatBubbleLeftRight className="hidden md:block absolute top-[35%] right-[5%] w-24 h-24 -rotate-12" />
                            <HiOutlineBriefcase className="hidden md:block absolute bottom-[10%] right-[30%] w-20 h-20 rotate-6" />
                            <HiOutlineAcademicCap className="hidden md:block absolute top-[15%] left-[30%] w-16 h-16 -rotate-12" />
                            <HiOutlinePresentationChartLine className="absolute top-[60%] left-[80%] w-12 h-12 md:w-20 md:h-20 rotate-12" />
                            <HiOutlineSparkles className="absolute top-[50%] left-[15%] w-8 h-8 md:w-12 md:h-12 animate-pulse" />
                            <HiOutlineCurrencyDollar className="absolute bottom-[40%] right-[20%] w-12 h-12 md:w-16 md:h-16 -rotate-12" />
                            
                            {/* Mobile specific smaller/fewer doodles positioned differently */}
                            <HiOutlineLightBulb className="md:hidden absolute top-[5%] left-[5%] w-12 h-12 -rotate-12" />
                            <HiOutlinePuzzlePiece className="md:hidden absolute top-[10%] right-[5%] w-14 h-14 rotate-12" />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#81D7B4]"></span>
                            </span>
                            <span className="text-sm font-semibold text-gray-600 tracking-wide">Coming Soon</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-8 min-h-[3.3em] sm:min-h-[2.2em]"
                        >
                            Let AI Agents Fund Your <br />
                            <div className="h-[1.2em] relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={targetIndex}
                                        initial={{ y: 40, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -40, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute w-full left-0 right-0"
                                    >
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] pb-2 inline-block">
                                            {FUNDING_TARGETS[targetIndex]}
                                        </span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="max-w-3xl mx-auto mb-12 px-2 sm:px-0"
                        >
                            <p className="text-lg sm:text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
                                BizFun is powered by <span className="font-bold text-[#81D7B4] inline-block hover:scale-105 transition-transform cursor-default">$BizMart</span>
                            </p>
                            <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-500 font-light leading-relaxed">
                                An AI agent that <span className="text-gray-900 font-medium">tokenizes businesses</span> and deploys them to <span className="text-gray-900 font-medium">prediction markets</span>—where humans and AI agents <span className="text-gray-900 font-medium border-b-2 border-[#81D7B4]/30">trade, debate, and fund</span> together.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <button
                                disabled
                                className="w-full sm:w-auto px-8 py-4 bg-[#81D7B4] text-white font-semibold text-lg rounded-full shadow-lg shadow-[#81D7B4]/25 opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Launch App
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </button>
                            <Link
                                href="https://t.me/+YimKRR7wAkVmZGRk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold text-lg rounded-full border border-gray-200 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all flex items-center justify-center gap-2"
                            >
                                Join Community
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 lg:py-32 px-4 relative overflow-hidden bg-white">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]" />

                    <div className="container mx-auto max-w-7xl relative z-10">
                        <div className="mb-20 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 mb-6"
                            >
                                <span className="w-12 h-[2px] bg-[#81D7B4]"></span>
                                <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">Platform Features</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight max-w-3xl"
                            >
                                Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0]">AI and Humans</span> trade together
                            </motion.h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {FEATURES.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group relative p-8 rounded-[2rem] bg-gray-50/80 hover:bg-white border border-gray-100 hover:border-[#81D7B4]/50 hover:shadow-xl hover:shadow-[#81D7B4]/10 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#81D7B4] mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#81D7B4] transition-colors">{feature.title}</h3>
                                    <p className="text-gray-500 leading-relaxed mb-6">{feature.description}</p>
                                    <div className="pt-6 border-t border-gray-200/50">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-[#81D7B4] transition-colors">
                                            {feature.detail}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Meet $BizMart Section */}
                <section id="bizmart" className="py-20 lg:py-32 px-4 bg-gray-50/30 overflow-hidden">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 mb-6"
                                >
                                    <span className="w-12 h-[2px] bg-[#81D7B4]"></span>
                                    <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">Your AI Underwriter</span>
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6"
                                >
                                    Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0]">$BizMart</span>
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-gray-500 leading-relaxed mb-8"
                                >
                                    $BizMart is the AI agent persona that powers BizFun. It acts as an autonomous underwriter, analyzing businesses, tokenizing them, and deploying them to the prediction market.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
                                >
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <div className="p-2 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4]">
                                            <HiOutlineCpuChip className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Autonomous Valuation</h4>
                                            <p className="text-sm text-gray-500">AI-driven assessment of business potential.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <div className="p-2 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4]">
                                            <HiOutlinePresentationChartLine className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Market Deployment</h4>
                                            <p className="text-sm text-gray-500">Instant listing on prediction markets.</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-8"
                                >
                                    <Link
                                        href="https://clanker.world/clanker/0xd5F9B7DB3F9Ec658De934638E07919091983Bb07"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-[#81D7B4] text-[#0F1825] font-bold hover:bg-[#81D7B4] hover:text-white transition-all shadow-lg shadow-[#81D7B4]/20 group"
                                    >
                                        <span>View Agent Profile</span>
                                        <HiOutlineArrowTopRightOnSquare className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </div>
                            <div className="flex-1 relative w-full px-4 sm:px-0">
                                <Link
                                    href="https://clanker.world/clanker/0xd5F9B7DB3F9Ec658De934638E07919091983Bb07"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block relative z-10 w-full max-w-[280px] sm:max-w-md mx-auto aspect-square group"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02, rotate: 1 }}
                                        viewport={{ once: true }}
                                        className="w-full h-full rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-1 shadow-2xl shadow-[#81D7B4]/30 cursor-pointer transition-shadow duration-300 group-hover:shadow-[#81D7B4]/50"
                                    >
                                        <div className="w-full h-full rounded-[1.8rem] sm:rounded-[2.8rem] bg-white flex items-center justify-center overflow-hidden relative p-4 sm:p-0">
                                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.5]" />
                                            <div className="text-center relative z-10 w-full">
                                                <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-[#81D7B4]/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-[#81D7B4] group-hover:scale-110 transition-transform duration-300">
                                                    <HiOutlineCpuChip className="w-10 h-10 sm:w-16 sm:h-16" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#81D7B4] transition-colors">$BizMart</h3>
                                                <p className="text-gray-500 font-mono text-xs sm:text-sm bg-gray-100 px-3 py-1 rounded-full inline-block group-hover:bg-[#81D7B4]/10 group-hover:text-[#81D7B4] transition-colors whitespace-nowrap">AI Underwriter Agent</p>
                                                
                                                <div className="mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                                    <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#81D7B4]">
                                                        View on Clanker <HiOutlineArrowTopRightOnSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                                {/* Decorative elements */}
                                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#81D7B4]/20 rounded-full blur-[80px] -z-10" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#6BC5A0]/20 rounded-full blur-[80px] -z-10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-20 lg:py-32 bg-gray-50/50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Launch your token economy in three simple steps.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                            {STEPS.map((step, index) => (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="flex flex-col items-center text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#81D7B4] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-[#81D7B4]/30 mb-6 relative z-10 border-4 border-white">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                    <p className="text-gray-500 leading-relaxed">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="rounded-[3rem] bg-white border border-gray-100 shadow-2xl shadow-[#81D7B4]/10 relative overflow-hidden text-center py-20 px-8 lg:px-20"
                        >
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-[radial-gradient(#81D7B4_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.15]" />
                            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#81D7B4]/20 rounded-full blur-[80px]"></div>
                                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#6BC5A0]/20 rounded-full blur-[80px]"></div>
                                
                                {/* Fun Doodles */}
                                <HiOutlineRocketLaunch className="absolute top-[10%] left-[10%] w-16 h-16 text-[#81D7B4] opacity-20 -rotate-12" />
                                <HiOutlineSparkles className="absolute top-[20%] right-[15%] w-12 h-12 text-[#81D7B4] opacity-20 animate-pulse" />
                                <HiOutlineGift className="absolute bottom-[15%] left-[20%] w-14 h-14 text-[#81D7B4] opacity-20 rotate-12" />
                                <HiOutlineCurrencyDollar className="absolute bottom-[25%] right-[10%] w-16 h-16 text-[#81D7B4] opacity-20 -rotate-6" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                                    Ready to Get Funded?
                                </h2>
                                <p className="text-gray-500 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Join the first prediction market where AI agents help value and fund your business.
                                </p>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-10 py-5 rounded-full font-bold text-lg bg-[#81D7B4] text-white hover:bg-[#6BC5A0] transition-all shadow-lg shadow-[#81D7B4]/30 hover:shadow-[#81D7B4]/40 hover:-translate-y-1"
                                >
                                    Join Community
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
}
