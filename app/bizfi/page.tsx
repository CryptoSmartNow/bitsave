"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import {
    HiOutlineRocketLaunch,
    HiOutlineFire,
    HiOutlineTrophy,
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlineArrowLeft,
    HiOutlineBuildingStorefront,
    HiOutlineChatBubbleLeftRight,
    HiOutlineArrowsRightLeft,
    HiOutlineGift,
    HiOutlineCheckCircle,
    HiOutlineChartBarSquare,
    HiOutlineSparkles,
    HiOutlineArrowRight,
    HiOutlineShieldCheck,
    HiOutlineBanknotes,
    HiOutlineBars3,
    HiOutlineXMark,
    HiOutlineCubeTransparent
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import Link from "next/link";
import "./bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
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
const FEATURES = [
    {
        title: "For Business Owners",
        description: "Tokenize your SME, Start-Up, Company, Project, or Idea on BizMarket and raise capital from a global investor base.",
        icon: HiOutlineRocketLaunch,
        link: "/bizfi/dashboard",
        buttonText: "Launch Business",
        available: true,
        benefits: [
            "Global investor access",
            "Quick approval process",
            "Transparent pricing",
            "Ongoing support"
        ]
    },
    {
        title: "For Investors",
        description: "Own equity or revenue of Real World Businesses curated from our portfolio. Trade anytime in our secondary markets.",
        icon: HiOutlineCurrencyDollar,
        link: "#",
        buttonText: "Coming Feb 2026",
        available: false,
        benefits: [
            "Curated opportunities",
            "Sector filtering",
            "Liquidity options",
            "Risk assessment"
        ]
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

export default function BizFiPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const containerRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    const orbY = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const blob1Y = useTransform(scrollYProgress, [0, 1], [0, -150]);
    const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 150]);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTypeIndex((prevIndex) => (prevIndex + 1) % ROTATING_TYPES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0F1825] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`${exo.variable} font-sans min-h-screen text-white relative overflow-x-hidden`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(123, 139, 154, 0.3) 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Ambient orbs with parallax */}
            <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ y: orbY }}
            >
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(44, 62, 93, 0.4) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }}></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(129, 215, 180, 0.08) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite', animationDelay: '2s' }}></div>
            </motion.div>

            {/* Floating blobs with parallax */}
            <motion.div
                className="absolute top-1/4 right-1/6 w-[300px] h-[300px] rounded-full blur-2xl opacity-30 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(129, 215, 180, 0.15) 0%, transparent 70%)',
                    y: blob1Y
                }}
            ></motion.div>
            <motion.div
                className="absolute bottom-1/3 left-1/6 w-[400px] h-[400px] rounded-full blur-2xl opacity-20 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(44, 62, 93, 0.5) 0%, transparent 70%)',
                    y: blob2Y
                }}
            ></motion.div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 24, 37, 0.85)', borderBottom: '1px solid rgba(123, 139, 154, 0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/bizfi/dashboard" className="flex items-center gap-2 text-[#F9F9FB] font-bold text-xl hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-lg bg-[#81D7B4] flex items-center justify-center text-[#0F1825]">
                                    <HiOutlineCubeTransparent className="w-5 h-5" />
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
                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 text-[#7B8B9A] hover:text-[#81D7B4] transition-colors group text-sm font-medium"
                            >
                                <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Back to SaveFi
                            </Link>

                            {address && (
                                <div className="hidden sm:block px-3 py-1.5 rounded-full border text-xs font-mono bg-[#1A2538]/50 border-[#7B8B9A]/20 text-[#9BA8B5]">
                                    {address.slice(0, 6)}...{address.slice(-4)}
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
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden border-t border-[#7B8B9A]/10 bg-[#0F1825]/95 backdrop-blur-xl overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
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
                    )}
                </AnimatePresence>
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <motion.section
                    className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-12 md:pt-32 md:pb-16 relative"
                    style={{ y: heroY, opacity: heroOpacity }}
                >
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left Column: Content */}
                        <div className="text-left mb-12 lg:mb-0 relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="text-[#81D7B4] text-sm md:text-base font-bold tracking-wider uppercase mb-4 block flex items-center gap-2">
                                    <span className="w-8 h-px bg-[#81D7B4]"></span>
                                    Borderless Capital
                                </span>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 leading-tight text-[#F9F9FB]">
                                    <span className="block mb-2">Tokenize your</span>
                                    <span className="relative inline-block h-[1.2em] align-bottom" style={{ minWidth: '280px' }}>
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={currentTypeIndex}
                                                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 bg-gradient-to-r from-[#81D7B4] to-[#9FE0C5] bg-clip-text text-transparent"
                                            >
                                                {ROTATING_TYPES[currentTypeIndex]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>
                                    <span className="block mt-2">
                                        and raise capital <span className="text-[#81D7B4]">onchain</span>
                                    </span>
                                </h1>

                                <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-16">
                                    <Link
                                        href="/bizfi/dashboard"
                                        className="w-full sm:w-auto px-4 md:px-8 py-4 rounded-xl font-bold text-base md:text-lg bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-all hover:scale-105 shadow-[0_10px_40px_rgba(129,215,180,0.3)] flex items-center justify-center gap-2 text-center"
                                    >
                                        Launch Business
                                        <HiOutlineArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="https://t.me/+YimKRR7wAkVmZGRk"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto px-4 md:px-8 py-4 rounded-xl font-bold text-base md:text-lg border border-[#81D7B4]/30 text-[#F9F9FB] hover:border-[#81D7B4] hover:bg-[#81D7B4]/10 transition-all text-center"
                                    >
                                        Join Community
                                    </Link>
                                </div>

                                {/* Pillars Row */}
                                {/* Pillars Row */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-6 pt-8 border-t border-[#7B8B9A]/20">
                                    <div className="text-center sm:text-left">
                                        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-3 text-[#81D7B4] mx-auto sm:mx-0">
                                            <HiOutlineRocketLaunch className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-[#F9F9FB] mb-1 text-xs sm:text-sm md:text-base">Fast Launch</h4>
                                        <p className="text-[10px] md:text-xs text-[#7B8B9A]">Deploy in minutes</p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-3 text-[#81D7B4] mx-auto sm:mx-0">
                                            <HiOutlineCurrencyDollar className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-[#F9F9FB] mb-1 text-xs sm:text-sm md:text-base">Global Liquidity</h4>
                                        <p className="text-[10px] md:text-xs text-[#7B8B9A]">Worldwide capital</p>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-3 text-[#81D7B4] mx-auto sm:mx-0">
                                            <HiOutlineShieldCheck className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-bold text-[#F9F9FB] mb-1 text-xs sm:text-sm md:text-base">Verified</h4>
                                        <p className="text-[10px] md:text-xs text-[#7B8B9A]">Secure & Compliant</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Visual */}
                        <div className="relative h-[600px] flex items-center justify-center">
                            {/* Blueprint background effect */}
                            <div className="absolute inset-0 border border-[#7B8B9A]/10 rounded-3xl overflow-hidden"
                                style={{
                                    backgroundImage: 'linear-gradient(rgba(129, 215, 180, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(129, 215, 180, 0.05) 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }}>
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#7B8B9A]/30"></div>
                                        <div className="h-2 w-2 rounded-full bg-[#7B8B9A]/30"></div>
                                    </div>
                                </div>
                                {/* Compass lines */}
                                <div className="absolute top-10 right-10 w-20 h-20 border-r border-t border-[#81D7B4]/20 rounded-tr-3xl"></div>
                                <div className="absolute bottom-10 left-10 w-20 h-20 border-l border-b border-[#81D7B4]/20 rounded-bl-3xl"></div>
                            </div>

                            {/* Floating Hero Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="relative w-full max-w-md bg-[#1A2538]/90 backdrop-blur-xl border border-[#7B8B9A]/20 rounded-2xl p-6 shadow-2xl z-20 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#81D7B4]/20 flex items-center justify-center">
                                            <HiOutlineBuildingStorefront className="text-[#81D7B4] w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Global opportunities</h3>
                                            <p className="text-xs text-[#7B8B9A]">for builders worldwide</p>
                                        </div>
                                    </div>
                                    <div className="h-6 w-1 bg-[#81D7B4] rounded-full"></div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-[#0F1825] rounded-xl p-4 border border-[#7B8B9A]/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-[#7B8B9A]">Total Raised</span>
                                            <span className="text-xs text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-1 rounded">+12.5%</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">$2,450,000</div>
                                        <div className="w-full bg-[#7B8B9A]/10 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-[#81D7B4] h-full w-[70%] rounded-full"></div>
                                        </div>
                                    </div>

                                    <div className="bg-[#0F1825] rounded-xl p-4 border border-[#7B8B9A]/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-[#7B8B9A]">Investors</span>
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full bg-[#7B8B9A]/20 border border-[#0F1825]"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-lg font-bold text-white">1,208 <span className="text-sm font-normal text-[#7B8B9A]">Active</span></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Background Elements behind card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#81D7B4]/5 blur-[100px] pointer-events-none z-0"></div>
                        </div>
                    </div>
                </motion.section>


                {/* Feature Highlights Section - New "Reference 3" Style */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-0 relative z-10 -mt-12">
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
                                className="bg-[#1A2538]/60 backdrop-blur-md border border-[#7B8B9A]/20 rounded-[2rem] p-8 shadow-xl min-h-[300px] flex flex-col justify-between hover:shadow-2xl hover:bg-[#1A2538]/80 hover:border-[#81D7B4]/30 transition-all duration-300 group"
                            >
                                {/* Header: Title + Dots */}
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-bold text-[#F9F9FB] max-w-[70%]">
                                        {item.title}
                                    </h3>
                                    <div className="flex gap-1.5 mt-2">
                                        {[1, 2, 3].map(d => (
                                            <div key={d} className="w-2.5 h-2.5 rounded-full bg-[#81D7B4]/40 group-hover:bg-[#81D7B4] transition-colors"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Body */}
                                <p className="text-[#9BA8B5] text-lg font-medium leading-relaxed mb-8">
                                    {item.desc}
                                </p>

                                {/* Footer: Icon in circle */}
                                <div>
                                    <div className="w-14 h-14 rounded-full border border-[#7B8B9A]/30 flex items-center justify-center text-[#81D7B4] group-hover:border-[#81D7B4] group-hover:bg-[#81D7B4]/10 transition-colors bg-[#0F1825]/50">
                                        <item.icon className="w-7 h-7" />
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

                {/* Features Section */}
                <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F9F9FB]">
                            Built for Everyone
                        </h2>
                        <p className="text-lg text-[#7B8B9A]">
                            Whether you're raising capital or investing, we've got you covered
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {FEATURES.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className="bg-[#1A2538]/60 backdrop-blur-md border border-[#7B8B9A]/20 rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl hover:bg-[#1A2538]/80 hover:border-[#81D7B4]/30 transition-all duration-300 group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center mb-8 border border-[#81D7B4]/20 group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-8 h-8 text-[#81D7B4]" />
                                    </div>

                                    <h3 className="text-3xl font-bold mb-6 text-[#F9F9FB]">
                                        {feature.title}
                                    </h3>

                                    <p className="text-lg text-[#9BA8B5] mb-8 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    <ul className="space-y-4 mb-10">
                                        {feature.benefits.map((benefit) => (
                                            <li key={benefit} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-[#81D7B4]/20 flex items-center justify-center flex-shrink-0">
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5 text-[#81D7B4]" />
                                                </div>
                                                <span className="text-[#9BA8B5] font-medium">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {feature.available ? (
                                        <Link
                                            href={feature.link}
                                            className="block w-full py-5 text-center font-bold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
                                            style={{ backgroundColor: '#81D7B4', color: '#0F1825', boxShadow: '0 8px 20px rgba(129, 215, 180, 0.25)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#6BC4A0';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#81D7B4';
                                            }}
                                        >
                                            {feature.buttonText}
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-5 rounded-xl border-2 font-bold text-lg cursor-not-allowed border-dashed"
                                            style={{ borderColor: 'rgba(123, 139, 154, 0.3)', color: '#7B8B9A' }}
                                        >
                                            {feature.buttonText}
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Products Section */}
                <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F9F9FB]">
                            BizMarket Products
                        </h2>
                        <p className="text-lg text-[#7B8B9A]">
                            Comprehensive tools for business tokenization and trading
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {PRODUCTS.map((product, index) => {
                            const Icon = product.icon;
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className="bg-[#1A2538]/60 backdrop-blur-md border border-[#7B8B9A]/20 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl hover:bg-[#1A2538]/80 hover:border-[#81D7B4]/30 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center mb-6 border border-[#81D7B4]/20 group-hover:bg-[#81D7B4]/20 transition-colors">
                                            <Icon className="w-7 h-7 text-[#81D7B4]" />
                                        </div>

                                        <h3 className="text-2xl font-bold mb-4 text-[#F9F9FB]">
                                            {product.title}
                                        </h3>

                                        <p className="text-[#9BA8B5] mb-6 leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="inline-block px-3 py-1.5 rounded-lg border border-[#81D7B4]/20 bg-[#81D7B4]/5">
                                            <span className="text-[#81D7B4] text-xs font-bold tracking-wide uppercase">{product.status}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section */}
                < section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20" >
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
                </section >

                {/* Footer */}
                < footer className="border-t py-12" style={{ borderColor: 'rgba(123, 139, 154, 0.2)' }
                }>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <div className="text-center">
                            <p className="text-sm" style={{ color: '#7B8B9A' }}>
                                © {new Date().getFullYear()} Bitsave BizMarket. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer >
            </div >
        </div >
    );
}
