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
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
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
        <div className={`${archivo.variable} font-[family-name:var(--font-archivo)] min-h-screen text-white relative overflow-x-hidden`} style={{ background: '#0F1825' }}>
            {/* Ambient orbs - Static - Reduced opacity for cleaner look */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, rgba(44, 62, 93, 0.4) 0%, transparent 70%)' }}></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-5" style={{ background: 'radial-gradient(circle, rgba(129, 215, 180, 0.08) 0%, transparent 70%)' }}></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b border-[#7B8B9A]/10" style={{ backgroundColor: 'rgba(15, 24, 37, 0.9)' }}>
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
                <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#81D7B4] text-sm font-medium mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#81D7B4] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#81D7B4]"></span>
                            </span>
                            The Future of Business Finance
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-[#F9F9FB] tracking-tight leading-tight mb-8">
                            Tokenize your <br className="hidden md:block" />
                            <span className="relative inline-block text-[#81D7B4]">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentTypeIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                        className="inline-block"
                                    >
                                        {ROTATING_TYPES[currentTypeIndex]}
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                            <span className="block mt-2 text-3xl md:text-5xl text-[#9BA8B5] font-normal">
                                and raise capital onchain.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-[#9BA8B5] max-w-2xl mx-auto mb-12 leading-relaxed">
                            BizFi connects visionaries with global capital. Launch your business on the blockchain in minutes, not months.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/bizfi/dashboard"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-all hover:scale-105 shadow-[0_0_20px_rgba(129,215,180,0.2)] flex items-center justify-center gap-2 min-w-[180px]"
                            >
                                Launch Business
                                <HiOutlineArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="https://t.me/+YimKRR7wAkVmZGRk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg border border-[#7B8B9A]/30 text-[#F9F9FB] hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all min-w-[180px]"
                            >
                                Join Community
                            </Link>
                        </div>
                    </motion.div>
                </section>


                {/* Feature Highlights - Minimal Cards */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                title: "Launch Onchain",
                                desc: "Deploy your business entity on the blockchain securely.",
                                icon: HiOutlineRocketLaunch
                            },
                            {
                                title: "Global Access",
                                desc: "Connect with a borderless network of investors.",
                                icon: HiOutlineCurrencyDollar
                            },
                            {
                                title: "Transparent",
                                desc: "Built on immutable protocols for trust and security.",
                                icon: HiOutlineShieldCheck
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group p-8 rounded-2xl bg-[#1A2538]/20 border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 hover:bg-[#1A2538]/40 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-[#F9F9FB] mb-3 group-hover:text-[#81D7B4] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-[#9BA8B5] leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How It Works Section - Minimal & Linear */}
                <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 scroll-mt-20">
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true }}
                         className="text-center mb-16"
                    >
                         <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9FB] mb-4">How It Works</h2>
                         <p className="text-[#9BA8B5] max-w-2xl mx-auto">A simple, transparent process to get your business funded.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#81D7B4]/30 to-transparent"></div>
                        
                        {HOW_IT_WORKS.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative flex flex-col items-center text-center group"
                                >
                                    <div className="w-24 h-24 rounded-full bg-[#0F1825] border border-[#7B8B9A]/20 flex items-center justify-center text-[#81D7B4] mb-6 relative z-10 group-hover:border-[#81D7B4]/50 group-hover:bg-[#1A2538] transition-all duration-300">
                                        <Icon className="w-10 h-10" />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#1A2538] border border-[#7B8B9A]/20 flex items-center justify-center text-xs font-bold text-[#F9F9FB]">
                                            {step.step}
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-[#F9F9FB] mb-3 group-hover:text-[#81D7B4] transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-[#9BA8B5] text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Features Section - Clean Split Layout */}
                <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 scroll-mt-20 bg-[#1A2538]/10 rounded-[3rem] my-12">
                    <div className="text-center mb-16">
                        <span className="text-[#81D7B4] text-sm font-bold tracking-widest uppercase mb-2 block">Ecosystem</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9FB]">Built for Everyone</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {FEATURES.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-[#0F1825]/60 border border-[#7B8B9A]/10 rounded-2xl p-8 hover:border-[#81D7B4]/30 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        {feature.available ? (
                                            <span className="px-3 py-1 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold">
                                                Available Now
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-[#7B8B9A]/10 text-[#7B8B9A] text-xs font-bold">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-2xl font-bold text-[#F9F9FB] mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[#9BA8B5] mb-8 leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {feature.available ? (
                                        <Link
                                            href={feature.link}
                                            className="inline-flex items-center gap-2 text-[#81D7B4] font-bold hover:gap-3 transition-all"
                                        >
                                            {feature.buttonText}
                                            <HiOutlineArrowRight className="w-4 h-4" />
                                        </Link>
                                    ) : (
                                        <div className="text-[#7B8B9A] font-medium text-sm flex items-center gap-2">
                                            {feature.buttonText}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Products Section - Clean Grid */}
                <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-24 scroll-mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
                    >
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9FB] mb-4">
                                BizFi Products
                            </h2>
                            <p className="text-[#9BA8B5] max-w-xl">
                                A suite of financial tools designed to power the next generation of business finance.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNotifyModal(true)}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#7B8B9A]/20 text-[#F9F9FB] hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all"
                        >
                            <HiOutlineBell className="w-5 h-5" />
                            <span>Get Notified</span>
                        </button>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PRODUCTS.map((product, index) => {
                            const Icon = product.icon;
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="group p-8 rounded-2xl border border-[#7B8B9A]/10 bg-[#1A2538]/10 hover:bg-[#1A2538]/30 hover:border-[#81D7B4]/20 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="mb-6 flex justify-between items-start">
                                        <div className="w-12 h-12 rounded-xl bg-[#1A2538] flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded bg-[#0F1825] text-[#7B8B9A]">
                                            {product.status.replace('Coming ', '')}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-[#F9F9FB] mb-3 group-hover:text-[#81D7B4] transition-colors">
                                        {product.title}
                                    </h3>

                                    <p className="text-[#9BA8B5] text-sm leading-relaxed flex-grow">
                                        {product.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* CTA Section - Minimal */}
                <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="rounded-3xl bg-gradient-to-b from-[#1A2538] to-[#0F1825] border border-[#7B8B9A]/10 p-12 text-center overflow-hidden relative"
                    >
                         {/* Subtle glow */}
                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 bg-[#81D7B4]/5 blur-[80px] rounded-full pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-[#F9F9FB] mb-6">
                                Ready to Transform Your Business?
                            </h2>
                            <p className="text-[#9BA8B5] mb-10 max-w-xl mx-auto">
                                Join 250+ businesses that have already tokenized and raised capital on BizMarket.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/bizfi/dashboard"
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[#0F1825] bg-[#81D7B4] hover:bg-[#6BC4A0] transition-all hover:scale-105"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href="https://t.me/+YimKRR7wAkVmZGRk"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[#F9F9FB] border border-[#7B8B9A]/20 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Footer - Minimal */}
                <footer className="border-t border-[#7B8B9A]/10 py-8">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-sm text-[#7B8B9A]/60">
                            © {new Date().getFullYear()} Bitsave Bizfi. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a 
                                href="https://x.com/bitsaveprotocol" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors"
                            >
                                <FaXTwitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://t.me/+YimKRR7wAkVmZGRk" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors"
                            >
                                <FaTelegramPlane className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </footer>
            </div >
            <NotifyModal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)} />
        </div >
    );
}
