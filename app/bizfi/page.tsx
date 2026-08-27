'use client';

import React, { useEffect, useState } from 'react';
import { 
    Activity01Icon, 
    Cancel01Icon, 
    Notification01Icon, 
    TelegramIcon, 
    TwitterIcon, 
    Menu01Icon,
    RocketIcon,
    Shield01Icon,
    Dollar01Icon,
    SparklesIcon,
    PlayIcon,
    ArrowRight01Icon,
    CheckmarkCircle02Icon,
    Building04Icon,
    Globe02Icon,
    Layers01Icon,
    File01Icon
} from "hugeicons-react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Instrument_Serif } from 'next/font/google';
import NewsletterEmbed from '@/app/components/NewsletterEmbed';
import { useAccount, useDisconnect } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import LanguageSelector from "@/components/LanguageSelector";
import "./bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

const ROTATING_TYPES = ["Businesses", "SMEs", "Start-Ups", "Cash Flows", "Debt Notes", "Enterprises"];

const HOW_IT_WORKS = [
    { 
        step: "01", 
        title: "Submit & Attest", 
        desc: "Complete streamlined registration with crypto or fiat payment. Your metadata is cryptographically attested onchain." 
    },
    { 
        step: "02", 
        title: "Compliance & Audit", 
        desc: "Automated verification checks company registrations, audits financial statements, and assigns algorithmic risk scores." 
    },
    { 
        step: "03", 
        title: "Tokenize BizShares", 
        desc: "Issue fractional equity, debt, or revenue-sharing tokens backed by institutional smart contracts on Base & Celo." 
    },
    { 
        step: "04", 
        title: "Trade & Scale", 
        desc: "Access global investor liquidity, distribute automated multi-currency dividends, and trade on BizSwap liquidity pools." 
    }
];

const PRODUCTS = [
    {
        title: "BizSwap",
        tagline: "Secondary Liquidity Pools",
        desc: "Provide liquidity for top-tier vetted businesses on BizFi and earn sustainable trading fee yields.",
        status: "Live",
        link: "/bizswap",
        icon: Layers01Icon,
        badge: "DEX"
    },
    {
        title: "BizFun",
        tagline: "Community & Promo Tokens",
        desc: "Create promotional business tokens in minutes, bootstrap initial community liquidity, and reward loyal customers.",
        status: "Live",
        link: "/bizfun",
        icon: RocketIcon,
        badge: "Launchpad"
    },
    {
        title: "Bitloans",
        tagline: "RWA-Backed Credit",
        desc: "Use tokenized BizShares or collateralized assets to borrow local stablecoins with flexible, automated repayment terms.",
        status: "Coming Soon",
        icon: Dollar01Icon,
        badge: "Credit"
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
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F1825]/85 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md bg-[#0F1825] border border-[#7B8B9A]/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative text-[#F9F9FB]"
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors p-1.5 rounded-xl hover:bg-[#1A2538]"
                    >
                        <Cancel01Icon className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mb-5 text-[#81D7B4] shadow-[0_0_20px_rgba(129,215,180,0.2)]">
                            <Notification01Icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] mb-2 tracking-tight">Stay in the Loop</h3>
                        <p className="text-xs sm:text-sm text-[#7B8B9A] mb-6 leading-relaxed">
                            Subscribe for major launch dates, tokenization grants, and high-yield real-world investment rounds.
                        </p>

                        <form className="w-full space-y-3.5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                            <input
                                type="email"
                                required
                                placeholder="founder@company.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#1A2538] border border-[#7B8B9A]/20 text-[#F9F9FB] text-sm focus:outline-none focus:border-[#81D7B4] placeholder-[#7B8B9A]/50 transition-colors font-medium"
                            />
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl font-black text-xs sm:text-sm bg-[#81D7B4] text-[#0F1825] hover:bg-[#9FE0C5] shadow-[0_4px_14px_rgba(129,215,180,0.35)] transition-all cursor-pointer tracking-wider uppercase"
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

export default function BizFiLandingPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTypeIndex((prev) => (prev + 1) % ROTATING_TYPES.length);
        }, 2600);
        return () => clearInterval(interval);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    return (
        <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] font-sans overflow-x-hidden selection:bg-[#81D7B4] selection:text-[#0F1825] relative">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-12%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#81D7B4]/5 blur-[160px]" />
                <div className="absolute top-[30%] right-[-12%] w-[600px] h-[600px] rounded-full bg-[#2C3E5D]/30 blur-[180px]" />
                <div className="absolute bottom-[-10%] left-[25%] w-[650px] h-[650px] rounded-full bg-[#1A2538]/50 blur-[160px]" />
            </div>

            {/* TOP NAVIGATION BAR */}
            <div className="fixed top-3 sm:top-5 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
                <nav className="pointer-events-auto w-full max-w-[1100px] rounded-2xl border border-[#7B8B9A]/15 bg-[#0F1825]/90 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all">
                    <div className="px-4 sm:px-6 h-14 sm:h-15 flex items-center justify-between">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-6 sm:gap-8">
                            <Link href="/bizfi" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] font-black text-sm shadow-[0_0_15px_rgba(129,215,180,0.3)] group-hover:scale-105 transition-transform">
                                    B
                                </div>
                                <span className="font-black text-base sm:text-lg tracking-tight text-[#F9F9FB]">BizFi</span>
                            </Link>

                            {/* Nav Anchor Links */}
                            <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#9BA8B5]">
                                <a href="#how-it-works" className="hover:text-[#81D7B4] transition-colors">How It Works</a>
                                <a href="#masterclass" className="hover:text-[#81D7B4] transition-colors">Masterclass</a>
                                <a href="#pathways" className="hover:text-[#81D7B4] transition-colors">Ecosystem</a>
                                <a href="#products" className="hover:text-[#81D7B4] transition-colors">Products</a>
                            </div>
                        </div>

                        {/* Actions Cluster */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="hidden sm:block">
                                <LanguageSelector />
                            </div>

                            <BizFiAuthButton />

                            {/* Mobile Menu Button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-xl border border-[#7B8B9A]/30 text-[#F9F9FB] hover:bg-[#1A2538] transition-colors"
                                aria-label="Toggle menu"
                            >
                                <Menu01Icon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden px-5 py-4 border-t border-[#7B8B9A]/20 bg-[#0F1825]/98 rounded-b-2xl flex flex-col gap-3.5 text-xs font-bold"
                            >
                                <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-[#9BA8B5] hover:text-[#F9F9FB] py-1">How It Works</a>
                                <a href="#masterclass" onClick={() => setIsMobileMenuOpen(false)} className="text-[#9BA8B5] hover:text-[#F9F9FB] py-1">Masterclass Video</a>
                                <a href="#pathways" onClick={() => setIsMobileMenuOpen(false)} className="text-[#9BA8B5] hover:text-[#F9F9FB] py-1">Ecosystem</a>
                                <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="text-[#9BA8B5] hover:text-[#F9F9FB] py-1">Products</a>
                                <div className="h-px bg-[#7B8B9A]/20 my-1" />
                                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-[#81D7B4] py-1 flex items-center justify-between">
                                    <span>SaveFi Dashboard</span>
                                    <span>&rarr;</span>
                                </Link>
                                <div className="pt-2">
                                    <LanguageSelector />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </div>

            <main className="relative z-10">
                {/* HERO SECTION WITH DEDICATED BACKGROUND ELEMENTS & SEPARATOR */}
                <section className="relative overflow-hidden bg-gradient-to-b from-[#0F1825] via-[#0D1520] to-[#0A1019] pt-32 sm:pt-40 pb-20 sm:pb-24 border-b border-[#7B8B9A]/15">
                    
                    {/* Hero Background Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Radial Masked Fine Grid */}
                        <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(129, 215, 180, 0.25) 1px, transparent 0)`,
                                backgroundSize: '32px 32px',
                                maskImage: 'radial-gradient(ellipse 60% 50% at 50% 45%, #000 70%, transparent 100%)',
                                WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 45%, #000 70%, transparent 100%)'
                            }}
                        />

                        {/* Central Concentric Aura Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[340px] bg-gradient-to-tr from-[#81D7B4]/10 via-[#2C3E5D]/20 to-transparent rounded-full blur-[80px]" />
                    </div>

                    <div className="max-w-4xl mx-auto text-center px-6 lg:px-8 relative z-10">
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
                            
                            {/* Headline */}
                            <motion.h1 variants={fadeUp} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F9F9FB] leading-[1.12] mb-6">
                                <span className="block whitespace-normal sm:whitespace-nowrap">Tokenize Real-World</span>
                                <span className={`${instrumentSerif.className} italic font-normal tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] via-[#9FE0C5] to-[#6BC4A0] inline-block min-w-[220px]`}>
                                    {ROTATING_TYPES[currentTypeIndex]}
                                </span>
                            </motion.h1>

                            {/* Subtitle */}
                            <motion.p variants={fadeUp} className="text-xs sm:text-sm md:text-base text-[#7B8B9A] max-w-xl mx-auto leading-relaxed mb-8 font-normal">
                                Convert businesses, cash flows, and debt into high-liquidity digital shares. Attest on Base & Celo, raise borderless capital, and trade 24/7 onchain.
                            </motion.p>

                            {/* Primary Action Buttons */}
                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12">
                                <Link 
                                    href="/bizfi/dashboard" 
                                    className="w-full sm:w-auto px-7 py-3.5 bg-[#81D7B4] text-[#0F1825] font-black rounded-xl text-xs sm:text-sm text-center transition-all hover:bg-[#9FE0C5] shadow-[0_4px_20px_rgba(129,215,180,0.3)] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                                >
                                    <RocketIcon className="w-4 h-4 text-[#0F1825]" />
                                    <span>Launch Your Business</span>
                                </Link>
                                <a 
                                    href="#masterclass" 
                                    className="w-full sm:w-auto px-7 py-3.5 text-[#F9F9FB] bg-[#1A2538]/80 font-bold text-xs sm:text-sm text-center border border-[#7B8B9A]/20 rounded-xl transition-all hover:bg-[#2C3E5D]/50 hover:border-[#81D7B4]/40 flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
                                >
                                    <PlayIcon className="w-4 h-4 text-[#81D7B4]" />
                                    <span>Watch Masterclass</span>
                                </a>
                            </motion.div>

                            {/* Live Metric Highlights (Clean 3-Pillar Ribbon) */}
                            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl pt-6 border-t border-[#7B8B9A]/15">
                                <div className="p-3.5 rounded-xl bg-[#1A2538]/50 border border-[#7B8B9A]/15 backdrop-blur-md text-center hover:border-[#81D7B4]/30 transition-colors">
                                    <p className="text-[10px] font-black uppercase text-[#7B8B9A] tracking-wider mb-0.5">Asset Standard</p>
                                    <p className="text-xs sm:text-sm font-black text-[#81D7B4]">ERC-3643 / RWA</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#1A2538]/50 border border-[#7B8B9A]/15 backdrop-blur-md text-center hover:border-[#81D7B4]/30 transition-colors">
                                    <p className="text-[10px] font-black uppercase text-[#7B8B9A] tracking-wider mb-0.5">Settlement Chains</p>
                                    <p className="text-xs sm:text-sm font-black text-[#F9F9FB]">Base & Celo</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#1A2538]/50 border border-[#7B8B9A]/15 backdrop-blur-md text-center hover:border-[#81D7B4]/30 transition-colors">
                                    <p className="text-[10px] font-black uppercase text-[#7B8B9A] tracking-wider mb-0.5">Compliance</p>
                                    <p className="text-xs sm:text-sm font-black text-[#81D7B4]">Automated KYB</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Bottom Horizon Accent Beam Separator */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-px bg-gradient-to-r from-transparent via-[#81D7B4]/40 to-transparent" />
                </section>

                {/* HOW BIZFI WORKS SECTION */}
                <section id="how-it-works" className="py-20 sm:py-28 relative bg-[#0F1825]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 mb-2.5">
                                <div className="h-px w-6 bg-[#81D7B4]" />
                                <span className="text-[#81D7B4] text-[11px] font-bold tracking-[0.2em] uppercase">Protocol Architecture</span>
                                <div className="h-px w-6 bg-[#81D7B4]" />
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight mb-2.5">
                                How Real-World Assets <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Get Funded</span>
                            </h2>
                            <p className="text-[#7B8B9A] text-xs sm:text-sm leading-relaxed">
                                A frictionless 4-step pipeline bridging physical business equity to onchain capital.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {HOW_IT_WORKS.map((item, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, y: 15 }} 
                                    whileInView={{ opacity: 1, y: 0 }} 
                                    viewport={{ once: true }} 
                                    transition={{ duration: 0.35, delay: index * 0.08 }} 
                                    className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-2xl p-6 relative flex flex-col justify-between hover:border-[#81D7B4]/40 hover:bg-[#1A2538]/70 transition-all shadow-lg group backdrop-blur-md"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <span className={`${instrumentSerif.className} italic text-3xl text-[#2C3E5D] group-hover:text-[#81D7B4] transition-colors select-none`}>
                                            {item.step}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7B8B9A]/30 group-hover:bg-[#81D7B4] transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-black text-[#F9F9FB] mb-1.5">{item.title}</h3>
                                        <p className="text-[#7B8B9A] text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* YOUTUBE VIDEO MASTERCLASS SECTION (COMPACT SPLIT SPOTLIGHT) */}
                <section id="masterclass" className="py-20 sm:py-28 relative overflow-hidden bg-[#0A1019]/80 border-y border-[#7B8B9A]/10">
                    <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                            <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                                
                                {/* Left Content Column */}
                                <div className="lg:col-span-5 flex flex-col">
                                    <div className="inline-flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse" />
                                        <span className="text-[#81D7B4] text-[11px] font-bold tracking-[0.2em] uppercase">Educational Masterclass</span>
                                    </div>

                                    <h2 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight leading-tight mb-3">
                                        Investing in <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>BizShares</span> & Real-World Assets
                                    </h2>

                                    <p className="text-[#7B8B9A] text-xs sm:text-sm leading-relaxed mb-6">
                                        Learn how BizFi coordinates institutional private equity, risk underwriting, and secondary liquidity onchain.
                                    </p>

                                    {/* Minimalist Key Points */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-2.5">
                                            <CheckmarkCircle02Icon className="w-4 h-4 text-[#81D7B4] shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-xs font-bold text-[#F9F9FB]">ERC-3643 Tokenization</h4>
                                                <p className="text-[11px] text-[#7B8B9A]">Compliant offchain equity, revenue, and debt on Base & Celo.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckmarkCircle02Icon className="w-4 h-4 text-[#81D7B4] shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-xs font-bold text-[#F9F9FB]">Algorithmic Underwriting</h4>
                                                <p className="text-[11px] text-[#7B8B9A]">Automated KYB verification and bank cash flow scoring.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <CheckmarkCircle02Icon className="w-4 h-4 text-[#81D7B4] shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-xs font-bold text-[#F9F9FB]">Secondary DEX Liquidity</h4>
                                                <p className="text-[11px] text-[#7B8B9A]">24/7 liquidity on BizSwap with automated distributions.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* External Watch Link */}
                                    <a 
                                        href="https://www.youtube.com/watch?v=gtoY7io1iYo"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81D7B4] hover:text-[#9FE0C5] transition-colors self-start uppercase tracking-wider"
                                    >
                                        <span>Open Full Screen on YouTube</span>
                                        <span>&nearr;</span>
                                    </a>
                                </div>

                                {/* Right Video Frame Column */}
                                <div className="lg:col-span-7">
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                        className="relative w-full rounded-2xl overflow-hidden border border-[#7B8B9A]/20 bg-[#000000] shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
                                    >
                                        <div className="relative w-full aspect-video">
                                            <iframe 
                                                className="absolute inset-0 w-full h-full rounded-2xl"
                                                src="https://www.youtube.com/embed/gtoY7io1iYo?si=J7Mj7KowTsBhEwGK&rel=0&modestbranding=1&enablejsapi=1" 
                                                title="Investing in BizShares Masterclass" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    </motion.div>
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* DUAL PATHWAYS / ECOSYSTEM (FOUNDERS VS INVESTORS) */}
                <section id="pathways" className="py-20 sm:py-28 relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 mb-2.5">
                                <div className="h-px w-6 bg-[#81D7B4]" />
                                <span className="text-[#81D7B4] text-[11px] font-bold tracking-[0.2em] uppercase">Tailored Experiences</span>
                                <div className="h-px w-6 bg-[#81D7B4]" />
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight mb-2.5">
                                Built for <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Founders.</span> Engineered for <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Investors.</span>
                            </h2>
                            <p className="text-[#7B8B9A] text-xs sm:text-sm leading-relaxed">
                                Complete infrastructure for scaling real-world businesses or deploying institutional capital into cash-flowing assets.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                            {/* Founders Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                viewport={{ once: true }} 
                                transition={{ duration: 0.35 }} 
                                className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-3xl p-7 sm:p-8 hover:border-[#81D7B4]/40 transition-all flex flex-col justify-between shadow-xl backdrop-blur-md group"
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-5">
                                        <span className="text-[11px] font-black tracking-widest text-[#81D7B4] uppercase">FOR BUSINESS OWNERS</span>
                                        <span className="px-2.5 py-0.5 bg-[#81D7B4]/15 text-[#81D7B4] text-[10px] font-black rounded-full border border-[#81D7B4]/30">
                                            Instant Launch
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] mb-2.5">Launch on BizFi</h3>
                                    <p className="text-[#7B8B9A] text-xs leading-relaxed mb-5">
                                        Tokenize your SME, Start-Up, Enterprise, or project with zero technical blockchain knowledge required. We handle smart contracts, attestation, and regulatory filings.
                                    </p>
                                    <ul className="space-y-2 mb-6 text-xs text-[#F9F9FB]/90">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Fiat & Crypto registration fee settlement
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Automated loan agreement & term generation
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Multi-currency automated revenue dividends
                                        </li>
                                    </ul>
                                </div>
                                <Link 
                                    href="/bizfi/dashboard" 
                                    className="text-[#0F1825] bg-[#81D7B4] hover:bg-[#9FE0C5] font-black text-xs py-3 px-5 rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(129,215,180,0.3)] self-start uppercase tracking-wider"
                                >
                                    <span>Launch Business</span>
                                    <ArrowRight01Icon className="w-3.5 h-3.5 text-[#0F1825]" />
                                </Link>
                            </motion.div>

                            {/* Investors Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                viewport={{ once: true }} 
                                transition={{ duration: 0.35, delay: 0.08 }} 
                                className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-3xl p-7 sm:p-8 hover:border-[#81D7B4]/40 transition-all flex flex-col justify-between shadow-xl backdrop-blur-md group"
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-5">
                                        <span className="text-[11px] font-black tracking-widest text-[#9BA8B5] uppercase">FOR INVESTORS</span>
                                        <span className="px-2.5 py-0.5 bg-[#2C3E5D]/60 text-[#F9F9FB] text-[10px] font-black rounded-full border border-[#7B8B9A]/30">
                                            Audited Assets
                                        </span>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB] mb-2.5">Curated RWA Portfolio</h3>
                                    <p className="text-[#7B8B9A] text-xs leading-relaxed mb-5">
                                        Own fractional shares of verified businesses with verifiable bank cash flows, legally binding onchain agreements, and transparent governance.
                                    </p>
                                    <ul className="space-y-2 mb-6 text-xs text-[#F9F9FB]/90">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Sustainable liquidity provider yields on BizSwap
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Automated revenue sharing & quarterly distributions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                            Transparent, cryptographic onchain audit trails
                                        </li>
                                    </ul>
                                </div>
                                <Link 
                                    href="/bizswap" 
                                    className="text-[#F9F9FB] bg-[#1A2538] border border-[#7B8B9A]/30 hover:border-[#81D7B4] hover:text-[#81D7B4] font-black text-xs py-3 px-5 rounded-xl inline-flex items-center justify-center gap-2 transition-all self-start uppercase tracking-wider"
                                >
                                    <span>Start Investing</span>
                                    <ArrowRight01Icon className="w-3.5 h-3.5" />
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* PRODUCTS MATRIX SECTION */}
                <section id="products" className="py-20 sm:py-28 relative bg-[#0F1825]">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-5">
                            <div>
                                <div className="inline-flex items-center gap-2 mb-2.5">
                                    <div className="h-px w-6 bg-[#81D7B4]" />
                                    <span className="text-[#81D7B4] text-[11px] font-bold tracking-[0.2em] uppercase">Ecosystem Suite</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight mb-2">
                                    BizFi <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Product Matrix</span>
                                </h2>
                                <p className="text-[#7B8B9A] text-xs sm:text-sm leading-relaxed">
                                    A decentralized modular suite powering the future of borderless business commerce.
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowNotifyModal(true)} 
                                className="px-5 py-2.5 border border-[#7B8B9A]/25 text-[#F9F9FB] rounded-xl text-xs font-bold hover:border-[#81D7B4] hover:text-[#81D7B4] transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer shadow-md uppercase tracking-wider"
                            >
                                Get Notified When Live
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {PRODUCTS.map((p, i) => {
                                const Icon = p.icon;
                                return (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, y: 15 }} 
                                        whileInView={{ opacity: 1, y: 0 }} 
                                        viewport={{ once: true }} 
                                        transition={{ duration: 0.35, delay: i * 0.08 }} 
                                        className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-[#81D7B4]/40 hover:bg-[#1A2538]/70 shadow-lg group backdrop-blur-md"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(129,215,180,0.15)]">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    p.status === 'Live' ? 'bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30' : 'bg-[#7B8B9A]/15 text-[#7B8B9A] border border-[#7B8B9A]/30'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-black text-[#F9F9FB] mb-0.5">{p.title}</h3>
                                            <p className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-wider mb-2.5">{p.tagline}</p>
                                            <p className="text-xs text-[#7B8B9A] leading-relaxed mb-5">{p.desc}</p>
                                        </div>

                                        <div className="pt-3.5 border-t border-[#7B8B9A]/15">
                                            {p.link ? (
                                                <Link 
                                                    href={p.link} 
                                                    className="text-xs font-black uppercase tracking-wider text-[#81D7B4] hover:text-[#9FE0C5] transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <span>Open {p.title}</span>
                                                    <span>&rarr;</span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#7B8B9A]/60">In Final Audits</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* NEWSLETTER & INTELLIGENCE */}
                <section className="relative overflow-hidden py-20 sm:py-28 border-t border-[#7B8B9A]/15">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 mb-2.5">
                                    <div className="h-px w-6 bg-[#81D7B4]" />
                                    <span className="text-[#81D7B4] text-[11px] font-bold tracking-[0.2em] uppercase">Intelligence</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-black leading-tight text-[#F9F9FB] mb-3.5 tracking-tight">
                                    The Art of <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Savviness.</span>
                                </h2>
                                <p className="text-[#7B8B9A] text-xs sm:text-sm leading-relaxed">
                                    Corporate and decentralized financial engineering strategies to scale enduring balance sheet growth, delivered straight to your inbox.
                                </p>
                            </div>
                            
                            <div>
                                <NewsletterEmbed />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-[#7B8B9A]/15 py-10 bg-[#0A1019] relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-[#81D7B4] flex items-center justify-center text-[#0F1825] font-black text-[10px] shadow-md">
                            B
                        </div>
                        <span className="text-base font-black tracking-tight text-[#81D7B4]">BizFi</span>
                        <span className="text-xs text-[#7B8B9A] border-l border-[#7B8B9A]/30 pl-2.5">Protocol</span>
                    </div>

                    <p className="text-[#7B8B9A] text-xs font-medium">
                        &copy; {new Date().getFullYear()} BitSave BizFi Protocol. All rights reserved.
                    </p>

                    <div className="flex items-center gap-5 text-xs font-bold text-[#7B8B9A]">
                        <a href="https://x.com/bitsaveprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-[#81D7B4] transition-colors flex items-center gap-1.5">
                            <TwitterIcon className="w-3.5 h-3.5" />
                            <span>X (Twitter)</span>
                        </a>
                        <a href="https://t.me/bitsaveprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-[#81D7B4] transition-colors flex items-center gap-1.5">
                            <TelegramIcon className="w-3.5 h-3.5" />
                            <span>Telegram</span>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Notification Modal */}
            <NotifyModal 
                isOpen={showNotifyModal} 
                onClose={() => setShowNotifyModal(false)} 
            />
        </div>
    );
}
