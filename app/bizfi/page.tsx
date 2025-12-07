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
    HiOutlineBanknotes
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
            <div className="relative z-10 border-b backdrop-blur-sm sticky top-0" style={{ borderColor: 'rgba(123, 139, 154, 0.2)', backgroundColor: 'rgba(26, 37, 56, 0.8)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 text-[#7B8B9A] hover:text-[#81D7B4] transition-colors group"
                            >
                                <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-medium">Back to SaveFi</span>
                            </Link>
                            <div className="h-6 w-px" style={{ backgroundColor: 'rgba(123, 139, 154, 0.3)' }}></div>
                            <h1 className="text-xl font-bold text-[#F9F9FB]">Bitsave BizMarket</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {address && (
                                <div className="px-3 py-2 rounded-lg border text-sm font-mono" style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(123, 139, 154, 0.3)', color: '#9BA8B5' }}>
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <motion.section
                    className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 relative"
                    style={{ y: heroY, opacity: heroOpacity }}
                >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'linear-gradient(135deg, rgba(129, 215, 180, 0.08) 0%, rgba(44, 62, 93, 0.12) 50%, rgba(129, 215, 180, 0.06) 100%)',
                        borderRadius: '24px'
                    }}></div>

                    {/* Decorative elements */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-px h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(129, 215, 180, 0.3), transparent)' }}></div>
                        <div className="absolute top-0 right-1/4 w-px h-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(129, 215, 180, 0.3), transparent)' }}></div>
                    </div>

                    <div className="relative">
                        {/* Top badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex justify-center mb-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border backdrop-blur-sm" style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(129, 215, 180, 0.4)' }}>
                                <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
                                <span className="text-[#81D7B4] text-sm font-semibold">Revolutionizing Business Funding</span>
                            </div>
                        </motion.div>

                        {/* Main heading with better hierarchy */}
                        <div className="text-center max-w-5xl mx-auto mb-12">
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]"
                                style={{ color: '#F9F9FB' }}
                            >
                                <span className="block mb-3">Tokenize your</span>
                                <span className="relative inline-block h-[1.2em] align-bottom" style={{ minWidth: '320px' }}>
                                    <AnimatePresence mode="wait">
                                        <motion.span
                                            key={currentTypeIndex}
                                            initial={{
                                                opacity: 0,
                                                y: 20,
                                                filter: "blur(8px)"
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                filter: "blur(0px)"
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -20,
                                                filter: "blur(8px)"
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.43, 0.13, 0.23, 0.96]
                                            }}
                                            className="absolute inset-0 bg-clip-text text-transparent text-center"
                                            style={{ backgroundImage: 'linear-gradient(135deg, #81D7B4 0%, #9FE0C5 100%)' }}
                                        >
                                            {ROTATING_TYPES[currentTypeIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                                <span className="block mt-3">
                                    and raise capital <span className="text-[#81D7B4]">onchain</span>
                                </span>
                            </motion.h1>



                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                            >
                                <Link
                                    href="/bizfi/dashboard"
                                    className="group px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 hover:scale-105 shadow-lg"
                                    style={{ backgroundColor: '#81D7B4', color: '#0F1825', boxShadow: '0 10px 40px rgba(129, 215, 180, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#6BC4A0';
                                        e.currentTarget.style.boxShadow = '0 15px 50px rgba(129, 215, 180, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#81D7B4';
                                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(129, 215, 180, 0.3)';
                                    }}
                                >
                                    Launch Your Business
                                    <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 rounded-xl font-bold text-lg border transition-all hover:scale-105"
                                    style={{ borderColor: 'rgba(129, 215, 180, 0.3)', color: '#F9F9FB', backgroundColor: 'rgba(44, 62, 93, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#81D7B4';
                                        e.currentTarget.style.backgroundColor = 'rgba(129, 215, 180, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.3)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.3)';
                                    }}
                                >
                                    Join Community
                                </Link>
                            </motion.div>

                            {/* Trust indicators */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                                className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
                            >
                                <div className="flex items-center gap-2">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                                    <span className="text-sm" style={{ color: '#7B8B9A' }}>Fast Verification</span>
                                </div>
                                <div className="hidden sm:block w-px h-4" style={{ backgroundColor: 'rgba(123, 139, 154, 0.3)' }}></div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                                    <span className="text-sm" style={{ color: '#7B8B9A' }}>Global Investors</span>
                                </div>
                                <div className="hidden sm:block w-px h-4" style={{ backgroundColor: 'rgba(123, 139, 154, 0.3)' }}></div>
                                <div className="flex items-center gap-2">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                                    <span className="text-sm" style={{ color: '#7B8B9A' }}>Blockchain Secured</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>


                {/* Feature Highlights Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.4)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(123, 139, 154, 0.2)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.4)';
                            }}
                        >
                            <HiOutlineRocketLaunch className="w-12 h-12 text-[#81D7B4] mb-4" />
                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#F9F9FB' }}>
                                Launch Onchain
                            </h3>
                            <p className="leading-relaxed" style={{ color: '#7B8B9A' }}>
                                Launch your business onchain and raise capital from the web3 space.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.4)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(123, 139, 154, 0.2)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.4)';
                            }}
                        >
                            <HiOutlineCurrencyDollar className="w-12 h-12 text-[#81D7B4] mb-4" />
                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#F9F9FB' }}>
                                Global Access
                            </h3>
                            <p className="leading-relaxed" style={{ color: '#7B8B9A' }}>
                                Reach investors worldwide and raise capital from a global investor base
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.4)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(123, 139, 154, 0.2)';
                                e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.4)';
                            }}
                        >
                            <HiOutlineShieldCheck className="w-12 h-12 text-[#81D7B4] mb-4" />
                            <h3 className="text-2xl font-bold mb-3" style={{ color: '#F9F9FB' }}>
                                Secure & Transparent
                            </h3>
                            <p className="leading-relaxed" style={{ color: '#7B8B9A' }}>
                                Built on blockchain technology for maximum security and transparency
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* How It Works Section */}
                < section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20" >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F9F9FB' }}>
                            How It Works
                        </h2>
                        <p className="text-xl" style={{ color: '#7B8B9A' }}>
                            Four simple steps to launch your business onchain
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {HOW_IT_WORKS.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                    className="relative"
                                >
                                    {/* Connector Line */}
                                    {index < HOW_IT_WORKS.length - 1 && (
                                        <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 -translate-x-1/2" style={{ backgroundColor: 'rgba(129, 215, 180, 0.2)' }}></div>
                                    )}

                                    <div className="relative p-6 rounded-2xl border transition-all duration-300 h-full" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                                        <div className="absolute -top-4 left-6 px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#81D7B4', color: '#0F1825' }}>
                                            {step.step}
                                        </div>
                                        <Icon className="w-12 h-12 text-[#81D7B4] mb-4 mt-2" />
                                        <h3 className="text-xl font-bold mb-3" style={{ color: '#F9F9FB' }}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm leading-relaxed" style={{ color: '#7B8B9A' }}>
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section >

                {/* Features Section */}
                < section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20" >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F9F9FB' }}>
                            Built for Everyone
                        </h2>
                        <p className="text-xl" style={{ color: '#7B8B9A' }}>
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
                                    className="group relative p-8 rounded-3xl border transition-all duration-500 hover:scale-[1.02]"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)', boxShadow: '0 4px 16px rgba(15, 24, 37, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.5)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(123, 139, 154, 0.2)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.4)';
                                    }}
                                >
                                    <div className="p-4 rounded-2xl w-fit mb-6 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: 'rgba(129, 215, 180, 0.15)', border: '1px solid rgba(129, 215, 180, 0.3)' }}>
                                        <Icon className="w-8 h-8 text-[#81D7B4]" />
                                    </div>

                                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F9F9FB' }}>
                                        {feature.title}
                                    </h3>

                                    <p className="text-lg mb-6 leading-relaxed" style={{ color: '#7B8B9A' }}>
                                        {feature.description}
                                    </p>

                                    <ul className="space-y-3 mb-8">
                                        {feature.benefits.map((benefit) => (
                                            <li key={benefit} className="flex items-center gap-2">
                                                <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4] flex-shrink-0" />
                                                <span className="text-sm" style={{ color: '#9BA8B5' }}>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {feature.available ? (
                                        <Link
                                            href={feature.link}
                                            className="block w-full py-4 text-center font-bold rounded-xl transition-all duration-300 hover:scale-105"
                                            style={{ backgroundColor: '#81D7B4', color: '#0F1825', boxShadow: '0 4px 16px rgba(129, 215, 180, 0.2)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#6BC4A0';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(129, 215, 180, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '#81D7B4';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(129, 215, 180, 0.2)';
                                            }}
                                        >
                                            {feature.buttonText}
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-4 rounded-md border font-bold cursor-not-allowed"
                                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(123, 139, 154, 0.3)', color: '#7B8B9A' }}
                                        >
                                            {feature.buttonText}
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </section >

                {/* Products Section */}
                < section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20" >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F9F9FB' }}>
                            BizMarket Products
                        </h2>
                        <p className="text-xl" style={{ color: '#7B8B9A' }}>
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
                                    className="p-8 rounded-3xl border transition-all duration-500"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)', boxShadow: '0 4px 16px rgba(15, 24, 37, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.4)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(123, 139, 154, 0.2)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.4)';
                                    }}
                                >
                                    <div className="p-4 rounded-2xl w-fit mb-6" style={{ backgroundColor: 'rgba(129, 215, 180, 0.15)', border: '1px solid rgba(129, 215, 180, 0.3)' }}>
                                        <Icon className="w-8 h-8 text-[#81D7B4]" />
                                    </div>

                                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#F9F9FB' }}>
                                        {product.title}
                                    </h3>

                                    <p className="text-lg mb-6 leading-relaxed" style={{ color: '#7B8B9A' }}>
                                        {product.description}
                                    </p>

                                    <div className="inline-block px-4 py-2 rounded-md border" style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(129, 215, 180, 0.3)' }}>
                                        <span className="text-[#81D7B4] text-sm font-semibold">{product.status}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section >

                {/* CTA Section */}
                < section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20" >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 md:p-16 rounded-3xl border overflow-hidden"
                        style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(129, 215, 180, 0.3)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 to-transparent"></div>

                        <div className="relative z-10 text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#F9F9FB' }}>
                                Ready to Transform Your Business?
                            </h2>
                            <p className="text-xl mb-10" style={{ color: '#7B8B9A' }}>
                                Join 250+ businesses that have already tokenized and raised capital on BizMarket
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/bizfi/dashboard"
                                    className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 flex items-center gap-2"
                                    style={{ backgroundColor: '#81D7B4', color: '#0F1825', boxShadow: '0 10px 40px rgba(129, 215, 180, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#6BC4A0';
                                        e.currentTarget.style.boxShadow = '0 15px 50px rgba(129, 215, 180, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#81D7B4';
                                        e.currentTarget.style.boxShadow = '0 10px 40px rgba(129, 215, 180, 0.3)';
                                    }}
                                >
                                    Get Started Now
                                    <HiOutlineArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 rounded-xl font-bold text-lg border transition-all hover:scale-105 flex items-center gap-2"
                                    style={{ borderColor: 'rgba(129, 215, 180, 0.3)', color: '#F9F9FB', backgroundColor: 'rgba(44, 62, 93, 0.3)' }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#81D7B4';
                                        e.currentTarget.style.backgroundColor = 'rgba(129, 215, 180, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(129, 215, 180, 0.3)';
                                        e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.3)';
                                    }}
                                >
                                    <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                    Talk to an Expert
                                </Link>
                            </div>
                        </div>
                    </motion.div>
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
