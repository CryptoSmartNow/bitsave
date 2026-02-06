"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import {
    HiOutlineRocketLaunch,
    HiOutlineGift,
    HiOutlineCurrencyDollar,
    HiOutlineArrowRight,
    HiOutlineArrowLeft,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineSparkles,
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
    HiOutlineArrowTopRightOnSquare,
    HiOutlineCog6Tooth,
    HiOutlineServer
} from "react-icons/hi2";
import { GiCrabClaw } from "react-icons/gi";
import { Exo } from "next/font/google";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

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

// Reusable BizMart Link Component
const BizMartLink = () => (
    <Link 
        href="https://clanker.world/clanker/0xd5F9B7DB3F9Ec658De934638E07919091983Bb07" 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-bold text-[#81D7B4] hover:text-[#6BC5A0] hover:underline transition-colors inline-flex items-center gap-0.5 cursor-pointer"
    >
        $BizMart
        <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
    </Link>
);

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
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0b0c15] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-[family-name:var(--font-exo)] min-h-screen text-white bg-[#0b0c15] selection:bg-[#81D7B4]/30 selection:text-white overflow-x-hidden`}>
            
            {/* Header */}
            <header 
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                  scrolled 
                    ? 'bg-[#0b0c15]/80 backdrop-blur-xl border-b border-white/5 py-4' 
                    : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link href="/bizfun" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/50 flex items-center justify-center text-[#81D7B4] shadow-[0_0_15px_rgba(129,215,180,0.3)] transition-transform group-hover:scale-105">
                                    <HiOutlineGift className="w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white font-mono">BizFun</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden xl:flex items-center space-x-1">
                            <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-white/5 whitespace-nowrap">How It Works</a>
                            <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#81D7B4] transition-colors rounded-full hover:bg-white/5 whitespace-nowrap">Features</a>
                        </nav>
                    </div>

                    {/* Right Actions */}
                    <div className="hidden xl:flex items-center space-x-4">
                        <div className="hidden md:block">
                            <LanguageSelector />
                        </div>
                        
                        <Link
                            href="/dashboard"
                            className="text-sm font-medium text-gray-400 hover:text-[#81D7B4] transition-colors flex items-center gap-2 mr-4"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Back to SaveFi
                        </Link>

                        {isConnected && address ? (
                            <div className="flex items-center gap-2">
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-mono text-gray-300">
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                                <button
                                    onClick={() => disconnect()}
                                    className="text-sm text-gray-400 hover:text-red-400 transition-colors px-2"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <BizFiAuthButton className="!bg-[#81D7B4] !text-[#0b0c15] !rounded-full !px-6 !py-2.5 !font-bold !shadow-[0_0_20px_rgba(129,215,180,0.3)] hover:!bg-[#6BC5A0] hover:!shadow-[0_0_30px_rgba(129,215,180,0.5)] transition-all" />
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="xl:hidden relative z-50 p-2 text-gray-300 hover:text-[#81D7B4] transition-colors"
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
                            className="absolute top-full left-0 right-0 bg-[#0b0c15] border-b border-white/10 shadow-2xl xl:hidden"
                        >
                            <div className="p-4 space-y-4">
                                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg">How It Works</a>
                                <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg">Features</a>
                                <a href="#bizmart" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg">Meet $BizMart</a>
                                <div className="h-px bg-white/10 my-2"></div>
                                <Link href="/dashboard" className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg flex items-center gap-2">
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
                        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#81D7B4]/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
                        
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

                        {/* Claw Decoration - Large Background */}
                        <div className="hidden md:block absolute -right-20 top-1/4 opacity-[0.03] rotate-[-15deg]">
                             <GiCrabClaw className="w-[600px] h-[600px] text-[#81D7B4]" />
                        </div>
                        <div className="hidden md:block absolute -left-20 bottom-0 opacity-[0.03] rotate-[195deg]">
                             <GiCrabClaw className="w-[500px] h-[500px] text-[#81D7B4]" />
                        </div>
                        
                        {/* Tech/Bot Doodles Background */}
                        <div className="absolute inset-0 opacity-[0.05]">
                            {/* Desktop only doodles */}
                            <HiOutlineCpuChip className="hidden md:block absolute top-[15%] left-[10%] w-24 h-24 text-[#81D7B4] animate-pulse" />
                            <HiOutlineServer className="hidden md:block absolute top-[20%] right-[15%] w-32 h-32 rotate-12" />
                            <HiOutlineCog6Tooth className="hidden md:block absolute bottom-[20%] left-[15%] w-28 h-28 animate-[spin_10s_linear_infinite]" />
                            <HiOutlineChartBar className="hidden md:block absolute bottom-[25%] right-[10%] w-24 h-24 -rotate-6" />
                            <HiOutlineGlobeAlt className="hidden md:block absolute top-[40%] left-[5%] w-20 h-20 rotate-12" />
                            <GiCrabClaw className="hidden md:block absolute top-[35%] right-[5%] w-24 h-24 -rotate-12" />
                            <HiOutlineBriefcase className="hidden md:block absolute bottom-[10%] right-[30%] w-20 h-20 rotate-6" />
                            <HiOutlinePresentationChartLine className="hidden md:block absolute top-[60%] left-[80%] w-20 h-20 rotate-12" />
                            <HiOutlineSparkles className="hidden md:block absolute top-[50%] left-[15%] w-12 h-12 animate-pulse text-[#81D7B4]" />
                            
                            {/* Mobile specific well-spaced doodles (Corners only) */}
                            <HiOutlineCpuChip className="md:hidden absolute top-[5%] left-[5%] w-10 h-10 -rotate-12 text-[#81D7B4]" />
                            <HiOutlineCog6Tooth className="md:hidden absolute top-[10%] right-[5%] w-12 h-12 rotate-12 animate-[spin_10s_linear_infinite]" />
                            <HiOutlineChartBar className="md:hidden absolute bottom-[15%] right-[5%] w-10 h-10 -rotate-6" />
                            <HiOutlineSparkles className="md:hidden absolute bottom-[20%] left-[8%] w-8 h-8 animate-pulse text-[#81D7B4]" />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#81D7B4]/30 shadow-[0_0_15px_rgba(129,215,180,0.1)] mb-8 backdrop-blur-sm"
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#81D7B4]"></span>
                            </span>
                            <span className="text-sm font-semibold text-[#81D7B4] tracking-wide font-mono">COMING SOON</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-8 min-h-[3.3em] sm:min-h-[2.2em]"
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
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] pb-2 inline-block drop-shadow-[0_0_10px_rgba(129,215,180,0.3)]">
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
                            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                                BizFun is powered by <BizMartLink />
                            </p>
                            <p className="mt-2 text-base sm:text-lg md:text-xl text-gray-400 font-light leading-relaxed">
                                An AI agent that <span className="text-white font-medium">tokenizes businesses</span> and deploys them to <span className="text-white font-medium">prediction markets</span>—where humans and AI agents <span className="text-white font-medium border-b-2 border-[#81D7B4]">trade, debate, and fund</span> together.
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
                                className="w-full sm:w-auto px-8 py-4 bg-[#81D7B4] text-[#0b0c15] font-bold text-lg rounded-full shadow-[0_0_20px_rgba(129,215,180,0.3)] opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Launch App
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </button>
                            <Link
                                href="https://t.me/+YimKRR7wAkVmZGRk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-semibold text-lg rounded-full border border-white/20 hover:border-[#81D7B4] hover:text-[#81D7B4] hover:bg-[#81D7B4]/5 transition-all flex items-center justify-center gap-2"
                            >
                                Join Community
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 lg:py-32 px-4 relative overflow-hidden bg-[#0b0c15]">
                    {/* Subtle Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.05]" />

                    <div className="container mx-auto max-w-7xl relative z-10">
                        <div className="mb-20 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 mb-6"
                            >
                                <span className="w-12 h-[2px] bg-[#81D7B4] shadow-[0_0_10px_#81D7B4]"></span>
                                <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase font-mono">Platform Features</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight max-w-3xl"
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
                                    whileHover={{ y: -5 }}
                                    className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#81D7B4]/50 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="w-8 h-8 text-[#81D7B4]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>
                                    <span className="text-xs font-mono text-[#81D7B4] uppercase tracking-wider">{feature.detail}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Meet BizMart Section */}
                <section id="bizmart" className="py-20 lg:py-32 px-4 relative bg-[#0b0c15]">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#81D7B4]/20 to-transparent"></div>
                    
                    <div className="container mx-auto max-w-7xl relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="flex-1 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="inline-flex items-center gap-2 mb-6 justify-center lg:justify-start"
                                >
                                    <GiCrabClaw className="w-6 h-6 text-[#81D7B4] rotate-90" />
                                    <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase font-mono">Your AI Underwriter</span>
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-6"
                                >
                                    Meet <BizMartLink />
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                    className="text-lg text-gray-400 leading-relaxed mb-8"
                                >
                                    <BizMartLink /> is the AI agent persona that powers BizFun. It acts as an autonomous underwriter, analyzing businesses, tokenizing them, and deploying them to the prediction market.
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
                                >
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm hover:border-[#81D7B4]/30 transition-colors">
                                        <div className="p-2 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4]">
                                            <HiOutlineCpuChip className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Autonomous Valuation</h4>
                                            <p className="text-sm text-gray-400">AI-driven assessment of business potential.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 shadow-sm hover:border-[#81D7B4]/30 transition-colors">
                                        <div className="p-2 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4]">
                                            <HiOutlinePresentationChartLine className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Market Deployment</h4>
                                            <p className="text-sm text-gray-400">Instant listing on prediction markets.</p>
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
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#81D7B4] border border-[#81D7B4] text-[#0b0c15] font-bold hover:bg-[#6BC5A0] hover:text-[#0b0c15] transition-all shadow-[0_0_20px_rgba(129,215,180,0.3)] hover:shadow-[0_0_30px_rgba(129,215,180,0.5)] group"
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
                                        className="w-full h-full rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-[2px] shadow-[0_0_50px_rgba(129,215,180,0.2)] cursor-pointer transition-shadow duration-300 group-hover:shadow-[0_0_70px_rgba(129,215,180,0.4)]"
                                    >
                                        <div className="w-full h-full rounded-[1.8rem] sm:rounded-[2.8rem] bg-[#0b0c15] flex items-center justify-center overflow-hidden relative p-4 sm:p-0 border border-white/10">
                                            {/* Card Grid Background */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(129,215,180,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(129,215,180,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.3]" />
                                            
                                            <div className="text-center relative z-10 w-full">
                                                <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto bg-[#81D7B4]/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-[#81D7B4] group-hover:scale-110 transition-transform duration-300 border border-[#81D7B4]/30 shadow-[0_0_20px_rgba(129,215,180,0.2)]">
                                                <GiCrabClaw className="w-10 h-10 sm:w-16 sm:h-16 rotate-45" />
                                            </div>
                                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#81D7B4] transition-colors">$BizMart</h3>
                                                <p className="text-[#81D7B4] font-mono text-xs sm:text-sm bg-[#81D7B4]/10 px-3 py-1 rounded-full inline-block border border-[#81D7B4]/20 whitespace-nowrap">AI Underwriter Agent</p>
                                                
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
                                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#81D7B4]/10 rounded-full blur-[80px] -z-10" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#6BC5A0]/10 rounded-full blur-[80px] -z-10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how-it-works" className="py-20 lg:py-32 bg-[#0b0c15]">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Launch your token economy in three simple steps.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-white/10 -z-10"></div>

                            {STEPS.map((step, index) => (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="flex flex-col items-center text-center bg-white/5 p-8 rounded-3xl border border-white/10 shadow-sm relative backdrop-blur-sm"
                                >
                                    <div className="w-16 h-16 rounded-full bg-[#0b0c15] text-[#81D7B4] border-2 border-[#81D7B4] flex items-center justify-center text-xl font-bold shadow-[0_0_20px_rgba(129,215,180,0.3)] mb-6 relative z-10">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-[#0b0c15]">
                    <div className="container mx-auto max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="rounded-[3rem] bg-[#81D7B4]/10 border border-[#81D7B4]/30 shadow-[0_0_40px_rgba(129,215,180,0.1)] relative overflow-hidden text-center py-20 px-8 lg:px-20"
                        >
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-[radial-gradient(#81D7B4_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.2]" />
                            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
                                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#81D7B4]/20 rounded-full blur-[80px]"></div>
                                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#6BC5A0]/20 rounded-full blur-[80px]"></div>
                                
                                {/* Fun Doodles */}
                                <GiCrabClaw className="absolute top-[10%] left-[10%] w-24 h-24 text-[#81D7B4] opacity-20 -rotate-12" />
                                <GiCrabClaw className="absolute bottom-[15%] right-[10%] w-32 h-32 text-[#81D7B4] opacity-20 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                    Ready to Get Funded?
                                </h2>
                                <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Join the first prediction market where AI agents help value and fund your business.
                                </p>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-10 py-5 rounded-full font-bold text-lg bg-[#81D7B4] text-[#0b0c15] hover:bg-[#6BC5A0] transition-all shadow-[0_0_20px_rgba(129,215,180,0.3)] hover:shadow-[0_0_30px_rgba(129,215,180,0.5)] hover:-translate-y-1"
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
