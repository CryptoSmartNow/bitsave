"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";

// import { usePrivy } from "@privy-io/react-auth";
import {
    HiOutlineRocketLaunch,
    HiOutlineTrophy,
    HiOutlineCurrencyDollar,
    HiOutlineArrowLeft,
    HiOutlineBuildingStorefront,
    HiOutlineChatBubbleLeftRight,
    HiOutlineArrowsRightLeft,
    HiOutlineGift,
    HiOutlineChartBarSquare,
    HiOutlineArrowRight,
    HiOutlineShieldCheck,
    HiOutlineBanknotes,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineCubeTransparent,
    HiOutlineBell
} from "react-icons/hi2";
import { Archivo } from "next/font/google";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";
import "./bizfi-colors.css";

const archivo = Archivo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-archivo',
});

// Rotating business types for hero
const ROTATING_TYPES = [
    "Business",
    "SMEs",
    "Start-Up",
    "Company",
    "Project",
    "Idea"
];

// How It Works Steps
const HOW_IT_WORKS = [
    {
        step: "01",
        title: "Submit Your Business",
        description: "Complete our simple assessment form and select your business tier",
        icon: HiOutlineBuildingStorefront
    },
    {
        step: "02",
        title: "Get Reviewed",
        description: "Our team reviews your application within 24-48 hours",
        icon: HiOutlineShieldCheck
    },
    {
        step: "03",
        title: "Launch & Raise",
        description: "Your business goes live and starts raising capital from global investors",
        icon: HiOutlineChartBarSquare
    },
    {
        step: "04",
        title: "Grow Together",
        description: "Scale your business with capital and community support",
        icon: HiOutlineTrophy
    }
];

// Feature Data
// Feature Data
const FEATURES = [
    {
        title: "For Business Owners",
        description: "Tokenize your SME, Start-Up, Company, Project, or Idea on BizMarket.",
        icon: HiOutlineRocketLaunch,
        link: "/bizfi/dashboard",
        buttonText: "Launch Business",
        available: true
    },
    {
        title: "For Investors",
        description: "Own equity or revenue of Real World Businesses curated from our portfolio.",
        icon: HiOutlineCurrencyDollar,
        link: "#",
        buttonText: "Coming Feb 2026",
        available: false
    }
];

// Product Data
const PRODUCTS = [
    {
        id: "bizfun",
        title: "BizFun",
        description: "Create Your Promo Tokens in minutes, raise Liquidity, build Your Movement, reward your community.",
        icon: HiOutlineGift,
        status: "Coming January 2026"
    },
    {
        id: "bizswap",
        title: "BizSwap",
        description: "Provide liquidity for the top 1% projects on BizMarket; earn a Savvy 10% markup every time Primary Market buyers sell at a 10% discount.",
        icon: HiOutlineArrowsRightLeft,
        status: "Coming April 2026"
    },
    {
        id: "bitloans",
        title: "Bitloans",
        description: "Use your BizShares or ETH, as collateral and borrow Local StableCoins.",
        icon: HiOutlineBanknotes,
        status: "Coming March 2026"
    }
];

// Animated Counter Component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isInView]);

    return <span ref={ref}>{count}</span>;
}

function NotifyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1825]/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[#1A2538] border border-[#7B8B9A]/20 rounded-2xl p-8 shadow-2xl relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors"
                    >
                        <HiOutlineXMark className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6 text-[#81D7B4]">
                            <HiOutlineBell className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-2">Stay Updated</h3>
                        <p className="text-[#9BA8B5] mb-8">
                            Enter your email to get notified when our roadmap triggers are hit.
                        </p>

                        <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-colors"
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl font-bold bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-colors"
                            >
                                Notify Me
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function BizFiPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTypeIndex((prevIndex) => (prevIndex + 1) % ROTATING_TYPES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) {
        return (
            <div className={`${archivo.variable} font-sans min-h-screen bg-[#0F1825] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${archivo.variable} font-sans min-h-screen text-white relative overflow-x-hidden`} style={{ background: '#0F1825' }}>
            {/* Ambient orbs - Static */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, rgba(44, 62, 93, 0.4) 0%, transparent 70%)' }}></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, rgba(129, 215, 180, 0.08) 0%, transparent 70%)' }}></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 24, 37, 0.85)', borderBottom: '1px solid rgba(123, 139, 154, 0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/bizfi/dashboard" className="flex items-center gap-2 text-[#F9F9FB] font-bold text-xl hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-lg bg-[#81D7B4] flex items-center justify-center text-[#0F1825]">
                                    <HiOutlineRocketLaunch className="w-5 h-5" />
                                </div>
                                BizFi
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-6">
                                <a href="#how-it-works" className="text-sm font-medium text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">How It Works</a>
                                <a href="#features" className="text-sm font-medium text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Features</a>
                                <a href="#products" className="text-sm font-medium text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Products</a>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <LanguageSelector />
                            </div>
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 text-[#7B8B9A] hover:text-[#81D7B4] transition-colors group text-sm font-medium"
                            >
                                <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to SaveFi
                            </Link>

                            {isConnected && address ? (
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1.5 rounded-full border text-xs font-mono bg-[#1A2538]/50 border-[#7B8B9A]/20 text-[#9BA8B5]">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </div>
                                    <button
                                        onClick={() => disconnect()}
                                        className="text-xs text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <BizFiAuthButton />
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg text-[#F9F9FB] hover:bg-[#1A2538] transition-colors"
                            >
                                {isMobileMenuOpen ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineBars3 className="w-6 h-6" />}
                            </button>
                        </div>
                    </div >
                </div >

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {
                        isMobileMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden border-t border-[#7B8B9A]/10 bg-[#0F1825]/95 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="px-4 py-6 space-y-4">
                                    <LanguageSelector className="w-full" />
                                    <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-[#F9F9FB]">How It Works</a>
                                    <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-[#F9F9FB]">Features</a>
                                    <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-medium text-[#F9F9FB]">Products</a>
                                    <div className="h-px bg-[#7B8B9A]/20 my-4"></div>
                                    <Link href="/dashboard" className="flex items-center gap-2 text-[#7B8B9A]">
                                        <HiOutlineArrowLeft className="w-5 h-5" />
                                        Back to SaveFi
                                    </Link>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </div >

            <div className="relative z-10 px-4 pt-24 pb-12 md:pt-32 md:pb-16 max-w-[1400px] mx-auto">
                {/* Hero Section */}
                <motion.section
                    className="p-8 md:p-24 bizfi-neo relative overflow-hidden text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col items-center max-w-4xl mx-auto relative z-10">


                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 leading-tight text-[#F9F9FB]">
                            <span className="block mb-2">Tokenize your</span>
                            <span className="relative inline-block h-[1.2em] align-bottom" style={{ minWidth: '320px' }}>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentTypeIndex}
                                        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 left-0 right-0 bg-gradient-to-r from-[#81D7B4] to-[#9FE0C5] bg-clip-text text-transparent"
                                    >
                                        {ROTATING_TYPES[currentTypeIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                            <span className="block mt-2">
                                and <span className="text-[#81D7B4]">raise capital</span> onchain
                            </span>
                        </h1>



                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full justify-center">
                            <Link
                                href="/bizfi/dashboard"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-all hover:scale-105 shadow-[0_10px_40px_rgba(129,215,180,0.3)] flex items-center justify-center gap-2 text-center min-w-[200px]"
                            >
                                Launch Business
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://t.me/+YimKRR7wAkVmZGRk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border border-[#81D7B4]/30 text-[#F9F9FB] hover:border-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all text-center min-w-[200px]"
                            >
                                Join Community
                            </Link>
                        </div>
                    </div>
                </motion.section>


                {/* Feature Highlights Section - New "Reference 3" Style */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-0 relative z-10 mt-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Launch Onchain",
                                desc: "Launch your business onchain and raise capital from the web3 space.",
                                icon: HiOutlineRocketLaunch
                            },
                            {
                                title: "Global Access",
                                desc: "Reach investors worldwide and raise capital from a global investor base.",
                                icon: HiOutlineCurrencyDollar
                            },
                            {
                                title: "Secure",
                                desc: "Built on blockchain technology for maximum security and transparency.",
                                icon: HiOutlineShieldCheck
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bizfi-neo-sm p-8 flex flex-col justify-between hover:transform hover:scale-[1.02] transition-all duration-300 group"
                            >
                                {/* Header: Title + Dots */}
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-[#F9F9FB]">
                                        {item.title}
                                    </h3>
                                    <div className="flex gap-1.5 mt-2">
                                        {[1, 2, 3].map(d => (
                                            <div key={d} className="w-2.5 h-2.5 rounded-full bizfi-neo-inset transition-colors"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Body */}
                                <p className="text-[#9BA8B5] text-base font-medium leading-relaxed mb-8">
                                    {item.desc}
                                </p>

                                {/* Footer: Icon in circle */}
                                <div>
                                    <div className="w-12 h-12 rounded-full bizfi-neo-inset flex items-center justify-center text-[#81D7B4]">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How It Works Section - Redesigned */}
                <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 relative scroll-mt-20">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        {/* Header Column */}
                        <div className="lg:w-1/3 pt-8 lg:sticky lg:top-32 h-fit">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="text-sm font-bold text-[#81D7B4] mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-8 h-px bg-[#81D7B4]"></span>
                                    The Process
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#F9F9FB] leading-tight">
                                    How It Works
                                </h2>
                                <p className="text-lg text-[#9BA8B5] mb-8 max-w-sm leading-relaxed">
                                    A simple, transparent process to get your business funded onchain.
                                </p>

                                {/* Decorative Arrow SVG - Visible on large screens */}
                                <div className="hidden lg:block opacity-60 ml-4">
                                    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10 10 C 60 10, 60 80, 140 80" stroke="#81D7B4" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" />
                                        <path d="M135 75 L 145 80 L 135 85" stroke="#81D7B4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </motion.div>
                        </div>

                        {/* Cards Column */}
                        <div className="lg:w-2/3">
                            <div className="grid md:grid-cols-2 gap-6">
                                {HOW_IT_WORKS.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <motion.div
                                            key={step.step}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            className="bg-[#1A2538]/60 backdrop-blur-md border border-[#7B8B9A]/20 rounded-[2rem] p-8 shadow-xl min-h-[320px] flex flex-col justify-between hover:shadow-2xl hover:bg-[#1A2538]/80 hover:border-[#81D7B4]/30 transition-all duration-300 group"
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <h3 className="text-2xl font-bold text-[#F9F9FB] max-w-[80%]">
                                                    {step.title}
                                                </h3>
                                                <div className="flex gap-1.5 mt-2">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4]/40 group-hover:bg-[#81D7B4] transition-colors"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4]/40 group-hover:bg-[#81D7B4] transition-colors delay-75"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4]/40 group-hover:bg-[#81D7B4] transition-colors delay-150"></div>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <p className="text-[#9BA8B5] text-lg font-medium leading-relaxed mb-8">
                                                {step.description}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between">
                                                <div className="w-14 h-14 rounded-full border border-[#7B8B9A]/30 flex items-center justify-center text-[#81D7B4] group-hover:border-[#81D7B4] group-hover:bg-[#81D7B4]/10 transition-colors bg-[#0F1825]/50">
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <div className="text-[#7B8B9A] font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">
                                                    {step.step}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>



                {/* Features Section - Built for Everyone - Refined Retrospective Layout */}
                <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20 md:py-32 scroll-mt-20 relative">
                    {/* Subtle Neomorphic Background for Section - Reduced height */}
                    <div className="absolute inset-0 rounded-[2.5rem] bg-[#0F1825] shadow-[inset_10px_10px_20px_#0a1019,inset_-10px_-10px_20px_#141f31] mx-4 sm:mx-8 my-4 md:my-0 -z-10"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16 md:mb-24 pt-12 md:pt-16"
                    >
                        <span className="text-[#81D7B4] font-bold tracking-wider uppercase text-xs md:text-sm mb-3 block">
                            Ecosystem Participants
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#F9F9FB] tracking-tight">
                            Built for Everyone
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent mx-auto mb-6 opacity-50"></div>
                        <p className="text-base md:text-lg text-[#9BA8B5] max-w-2xl mx-auto leading-relaxed px-4">
                            Connecting visionaries with capital through a unified ecosystem.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 px-2 sm:px-8 pb-12 md:pb-20 max-w-6xl mx-auto">
                        {FEATURES.map((feature, index) => {
                            const Icon = feature.icon;
                            // Alternate slight delays
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="relative flex flex-col h-full bg-[#1A2538]/20 backdrop-blur-sm border border-[#7B8B9A]/10 rounded-2xl p-6 md:p-10 hover:border-[#81D7B4]/30 transition-all duration-300 group"
                                >
                                    {/* Icon Top Right */}
                                    <div className="absolute top-8 right-8 w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-6 text-[#F9F9FB] pr-16 group-hover:text-[#81D7B4] transition-colors">
                                        {feature.title}
                                    </h3>

                                    <div className="w-full h-px bg-[#7B8B9A]/10 mb-8 group-hover:bg-[#81D7B4]/30 transition-colors"></div>

                                    <p className="text-[#9BA8B5] text-base md:text-lg leading-relaxed font-light mb-8 md:mb-12 flex-grow">
                                        {feature.description}
                                    </p>

                                    <div>
                                        {feature.available ? (
                                            <Link
                                                href={feature.link}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-colors shadow-lg hover:shadow-[#81D7B4]/20"
                                            >
                                                {feature.buttonText}
                                                <HiOutlineArrowRight className="w-4 h-4" />
                                            </Link>
                                        ) : (
                                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border border-[#7B8B9A]/20 bg-[#1A2538]/50">
                                                <span className="w-2 h-2 rounded-full bg-[#7B8B9A]/50"></span>
                                                <span className="text-[#7B8B9A] font-medium text-sm">
                                                    {feature.buttonText}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Products Section - Exciting Company Style */}
                <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-32 scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
                    >
                        <div className="max-w-2xl">
                            <span className="text-[#81D7B4] font-bold tracking-wider uppercase text-sm mb-4 block">Ecosystem</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-[#F9F9FB] mb-6 leading-tight">
                                BizFi Products
                            </h2>
                            <p className="text-lg text-[#9BA8B5] leading-relaxed">
                                A suite of financial tools designed to power the next generation of business finance.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <button
                                onClick={() => setShowNotifyModal(true)}
                                className="flex items-center gap-2 text-[#81D7B4] font-bold hover:gap-3 transition-all"
                            >
                                Notify Me <HiOutlineBell className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {PRODUCTS.map((product, index) => {
                            const Icon = product.icon;
                            // Make middle card stand out slightly
                            const isFeatured = index === 1;

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className={`relative rounded-3xl p-8 flex flex-col justify-between overflow-hidden group ${isFeatured ? 'bg-[#1A2538] border-[#81D7B4]/30 shadow-2xl scale-100 md:scale-105 z-10' : 'bg-[#0F1825] border-[#2C3E5D]/50 hover:border-[#81D7B4]/20'
                                        } border transition-all duration-500`}
                                >
                                    {/* Abstract Gradient Blob background */}
                                    <div className={`absolute top-0 right-0 w-64 h-64 bg-[#81D7B4] rounded-full blur-[100px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none rounded-bl-full translate-x-1/2 -translate-y-1/2`} />

                                    <div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isFeatured ? 'bg-[#81D7B4] text-[#0F1825]' : 'bg-[#1A2538] text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825]'} transition-all duration-300`}>
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border border-[#7B8B9A]/20 text-[#7B8B9A] bg-[#0F1825]/50 backdrop-blur-sm">
                                                {product.status.replace('Coming ', '')}
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-bold mb-4 text-[#F9F9FB] group-hover:translate-x-2 transition-transform duration-300">
                                            {product.title}
                                        </h3>

                                        <p className="text-[#9BA8B5] leading-relaxed mb-8">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-8 border-t border-[#7B8B9A]/10">
                                        {/* Removed Learn more link as requested */}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                {/* CTA Section - Redesigned */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-[2.5rem] overflow-hidden p-8 md:p-16 text-center group"
                    >
                        {/* Dark Glass Background */}
                        <div className="absolute inset-0 bg-[#1A2538]/60 backdrop-blur-md border border-[#81D7B4]/20 rounded-[2.5rem] transition-all duration-500 group-hover:border-[#81D7B4]/40" style={{ boxShadow: '0 4px 30px rgba(15, 24, 37, 0.4)' }}></div>

                        {/* Blueprint Overlay */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                            backgroundImage: 'linear-gradient(rgba(129, 215, 180, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(129, 215, 180, 0.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}></div>

                        {/* Content */}
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#F9F9FB] leading-tight">
                                Ready to Transform Your Business?
                            </h2>
                            <p className="text-lg md:text-xl text-[#9BA8B5] mb-10 leading-relaxed">
                                Join 250+ businesses that have already tokenized and raised capital on BizMarket
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/bizfi/dashboard"
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-all hover:scale-105 shadow-[0_10px_30px_rgba(129,215,180,0.2)] flex items-center justify-center gap-2"
                                >
                                    Get Started Now
                                    <HiOutlineArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border border-[#81D7B4]/30 text-[#F9F9FB] hover:border-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all flex items-center justify-center gap-2 bg-[#0F1825]/40"
                                >
                                    <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                    Talk to an Expert
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </section>
                {/* Footer */}
                <footer className="border-t py-12" style={{ borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <div className="text-center">
                            <p className="text-sm" style={{ color: '#7B8B9A' }}>
                                © {new Date().getFullYear()} Bitsave Bizfi. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div >
            <NotifyModal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)} />
        </div >
    );
}