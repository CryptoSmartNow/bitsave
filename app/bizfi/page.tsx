'use client';

import React, { useEffect, useState } from 'react';
import { Activity01Icon, Cancel01Icon, Notification01Icon, TelegramIcon, TwitterIcon } from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import NewsletterEmbed from '@/app/components/NewsletterEmbed';
import { useAccount, useDisconnect } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import LanguageSelector from "@/components/LanguageSelector";
import "./bizfi-colors.css";

// Features & Products
const HOW_IT_WORKS = [
    { step: "01", title: "Submit Your Business", desc: "Complete our simple assessment form and select your business tier. Includes ChainRails for fast fiat-to-crypto registration." },
    { step: "02", title: "Get Reviewed", desc: "Our team reviews your application within 24-48 hours to ensure compliance and quality." },
    { step: "03", title: "Launch & Raise", desc: "Your business goes live onchain and starts raising capital from global borderless investors." },
    { step: "04", title: "Grow Together", desc: "Scale your business with transparent capital and community support." }
];

const ROTATING_TYPES = ["Business", "SMEs", "Start-Up", "Company", "Project", "Idea"];

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
                    className="w-full max-w-md bg-[#0D1724] border border-[#1E2F45] rounded-3xl p-8 shadow-2xl relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors">
                        <Cancel01Icon className="w-6 h-6" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6 text-[#81D7B4]">
                            <Notification01Icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-2" style={{ fontFamily: "var(--font-display)" }}>Stay Updated</h3>
                        <p className="text-[#7B8B9A] mb-8">Enter your email to get notified when our roadmap triggers are hit.</p>

                        <form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-[#080E18] border border-[#1E2F45] text-[#F9F9FB] focus:outline-none focus:border-[#81D7B4] transition-colors"
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl font-black bg-[#81D7B4] text-[#0F1825] hover:bg-[#6BC4A0] transition-colors"
                                style={{ fontFamily: "var(--font-display)" }}
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
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] font-sans overflow-x-hidden selection:bg-[#81D7B4] selection:text-[#0F1825]">
            <style dangerouslySetInnerHTML={{ __html: `
                @media (min-width: 1024px) {
                    html { font-size: 90% !important; }
                }
            `}} />
            {/* Background gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#81D7B4] opacity-[0.03] blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#3A4F73] opacity-[0.05] blur-[100px]" />
            </div>

            {/* NAV */}
            <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
                <nav className="pointer-events-auto w-full max-w-[1400px] rounded-2xl border border-[#2C3E5D]/50 bg-[#0F1825]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/bizfi" className="flex items-center group">
                                <span className="text-xl font-black tracking-tight text-[#81D7B4]" style={{ fontFamily: "var(--font-display)" }}>BizFi</span>
                            </Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-bold">
                                <a href="#how-it-works" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">How it Works</a>
                                <a href="#features" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">Ecosystem</a>
                                <a href="#products" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">Products</a>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block">
                                <LanguageSelector />
                            </div>
                            <Link href="/dashboard" className="hidden sm:flex items-center text-[#7B8B9A] hover:text-[#81D7B4] transition-colors text-sm font-bold">
                                Back to SaveFi
                            </Link>
                            
                            {isConnected && address ? (
                                <div className="flex items-center gap-2">
                                    <div className="hidden sm:block px-3 py-1.5 rounded-full border text-xs font-mono bg-[#1A2538]/50 border-[#7B8B9A]/20 text-[#9BA8B5]">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </div>
                                    <button onClick={() => disconnect()} className="hidden sm:block text-xs text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors font-bold">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden sm:block">
                                    <BizFiAuthButton />
                                </div>
                            )}

                            {/* Mobile Hamburger Button */}
                            <button
                                className="md:hidden p-2 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors rounded-lg bg-[#1A2538]/50 border border-[#2C3E5D]/50"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <Cancel01Icon className="w-5 h-5" />
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="md:hidden border-t border-[#2C3E5D]/50 overflow-hidden bg-[#0D1724]/95 backdrop-blur-3xl rounded-b-2xl pointer-events-auto"
                            >
                                <div className="p-6 flex flex-col gap-6">
                                    <div className="flex flex-col gap-4 text-sm font-bold">
                                        <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-[#F9F9FB] hover:text-[#81D7B4] transition-colors">How it Works</a>
                                        <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-[#F9F9FB] hover:text-[#81D7B4] transition-colors">Ecosystem</a>
                                        <a href="#products" onClick={() => setIsMobileMenuOpen(false)} className="text-[#F9F9FB] hover:text-[#81D7B4] transition-colors">Products</a>
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-[#F9F9FB] hover:text-[#81D7B4] transition-colors">Back to SaveFi</Link>
                                    </div>
                                    <div className="pt-4 border-t border-[#2C3E5D]/50 flex justify-center">
                                        {isConnected && address ? (
                                            <div className="flex flex-col gap-4 w-full">
                                                <div className="px-3 py-2 rounded-lg border text-xs font-mono bg-[#1A2538]/50 border-[#7B8B9A]/20 text-[#9BA8B5] text-center">
                                                    {address.slice(0, 6)}...{address.slice(-4)}
                                                </div>
                                                <button onClick={() => { disconnect(); setIsMobileMenuOpen(false); }} className="w-full py-2 rounded-lg border border-[#2C3E5D] text-sm text-[#F9F9FB] font-bold">
                                                    Logout
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full">
                                                <BizFiAuthButton />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </div>

            <main className="relative z-10">
                {/* HERO */}
                <section className="relative min-h-screen flex items-center overflow-hidden px-6 pt-32">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.04) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
                        <div className="absolute top-[30%] left-[6%] w-3 h-3 rounded-full border border-[#81D7B4]/25" />
                        <div className="absolute top-[55%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#81D7B4]/20" />
                        <div className="absolute top-[42%] right-[7%] w-4 h-4 rounded-full border border-[#3A4F73]/40" />
                        <div className="absolute top-[65%] right-[12%] w-2 h-2 rounded-full bg-[#3A4F73]/30" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10 w-full">
                        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-start max-w-4xl">
                            
                            <motion.h1 variants={fadeUp} className="text-[60px] md:text-[88px] font-extrabold tracking-tight leading-[1.04] text-[#F9F9FB] mb-8" style={{ fontFamily: "var(--font-display)" }}>
                                Tokenize your
                                <br />
                                <span className="text-[#81D7B4] relative inline-block">
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
                                <br />
                                and access capital.
                            </motion.h1>

                            <motion.p variants={fadeUp} className="text-[#7B8B9A] text-xl leading-relaxed max-w-2xl mb-12">
                                BizFi connects visionaries with global capital. Launch your business on the blockchain in minutes, not months.
                            </motion.p>

                            <motion.div variants={fadeUp} className="flex flex-row items-center gap-3 w-full sm:w-auto">
                                <Link href="/bizfi/dashboard" className="flex-1 sm:flex-none px-3 sm:px-8 py-3.5 sm:py-4 bg-[#81D7B4] text-[#0F1825] font-black rounded-xl text-[14px] sm:text-lg text-center transition-all hover:opacity-90 hover:scale-105 hover:shadow-[0_8px_24px_rgba(129,215,180,0.25)] whitespace-nowrap" style={{ fontFamily: "var(--font-display)" }}>
                                    Launch Business
                                </Link>
                                <a href="#how-it-works" className="flex-1 sm:flex-none px-3 sm:px-8 py-3.5 sm:py-4 text-[#9BA8B5] font-bold text-[14px] sm:text-lg text-center border border-[#2C3E5D] rounded-xl transition-all hover:border-[#81D7B4]/40 hover:text-[#F9F9FB] whitespace-nowrap">
                                    Learn More
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* HOW IT WORKS (Sticky left, list right) */}
                <section id="how-it-works" className="py-36 relative overflow-hidden bg-[#080E18]">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.025) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
                        <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
                    </div>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-12 gap-16 items-start">
                            {/* Left sticky */}
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-4 lg:sticky lg:top-32">
                                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                                    <div className="h-px w-8 bg-[#81D7B4]" />
                                    <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Simple Process</span>
                                </motion.div>
                                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB] mb-6" style={{ fontFamily: "var(--font-display)" }}>
                                    How it<br /><span className="text-[#81D7B4]">Works</span>
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                                    A simple, transparent process to get your business funded and scale onchain.
                                </motion.p>
                            </motion.div>

                            {/* Right: numbered vertical steps */}
                            <div className="lg:col-span-8 flex flex-col">
                                {HOW_IT_WORKS.map((item, i) => (
                                    <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex gap-10 py-12 border-b border-[#1E2F45] last:border-b-0 group">
                                        <div className="flex-shrink-0 pt-1 w-16">
                                            <span className="text-5xl font-black leading-none text-[#1E2F45] group-hover:text-[#81D7B4]/30 transition-colors select-none" style={{ fontFamily: "var(--font-display)" }}>
                                                {item.step}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-3xl font-extrabold text-[#F9F9FB] mb-3" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                                            <p className="text-[#7B8B9A] text-lg leading-relaxed max-w-xl">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ECOSYSTEM / FEATURES */}
                <section id="features" className="py-36 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-20">
                            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                                <div className="h-px w-8 bg-[#81D7B4]" />
                                <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Ecosystem</span>
                            </motion.div>
                            <div className="grid lg:grid-cols-2 gap-10 items-end">
                                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>
                                    Built for<br /><span className="text-[#81D7B4]">Everyone.</span>
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                                    Whether you are building the next big thing or looking to invest in real-world value, BizMarket provides the immutable infrastructure.
                                </motion.p>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-px bg-[#1E2F45] border border-[#1E2F45] rounded-3xl overflow-hidden">
                            <motion.div variants={fadeUp} className="bg-[#0D1724] p-12 hover:bg-[#0F1A2A] transition-colors group flex flex-col justify-between min-h-[320px]">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-xs font-black tracking-[0.2em] text-[#81D7B4]/50" style={{ fontFamily: "var(--font-display)" }}>BUSINESS</p>
                                        <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold rounded-full">Available Now</span>
                                    </div>
                                    <h4 className="text-4xl font-extrabold text-[#F9F9FB] mb-4 group-hover:text-[#81D7B4] transition-colors" style={{ fontFamily: "var(--font-display)" }}>For Business Owners</h4>
                                    <p className="text-[#7B8B9A] text-lg leading-relaxed mb-8">Tokenize your SME, Start-Up, Company, Project, or Idea on BizMarket directly.</p>
                                </div>
                                <Link href="/bizfi/dashboard" className="text-[#81D7B4] font-bold text-lg inline-flex items-center gap-2 hover:gap-4 transition-all">
                                    Launch Business →
                                </Link>
                            </motion.div>

                            <motion.div variants={fadeUp} className="bg-[#0D1724] p-12 hover:bg-[#0F1A2A] transition-colors group flex flex-col justify-between min-h-[320px]">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-xs font-black tracking-[0.2em] text-[#81D7B4]/50" style={{ fontFamily: "var(--font-display)" }}>INVESTORS</p>
                                    </div>
                                    <h4 className="text-4xl font-extrabold text-[#F9F9FB] mb-4" style={{ fontFamily: "var(--font-display)" }}>For Investors</h4>
                                    <p className="text-[#7B8B9A] text-lg leading-relaxed mb-8">Own equity or revenue of Real World Businesses curated from our portfolio. Backed by solid metrics.</p>
                                </div>
                                <Link href="/bizswap" className="text-[#81D7B4] font-bold text-lg inline-flex items-center gap-2 hover:gap-4 transition-all">
                                    Start Investing →
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="mt-8 bg-[#1E2F45] border border-[#1E2F45] rounded-3xl overflow-hidden relative grid grid-cols-1 lg:grid-cols-12 gap-px">
                            {/* Texture background for the whole container */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>

                            <motion.div variants={fadeUp} className="bg-[#0D1724] p-8 md:p-12 lg:col-span-5 relative z-10 flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D7B4]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-px w-6 bg-[#81D7B4]" />
                                    <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Learn</span>
                                </div>
                                <h4 className="text-3xl md:text-4xl font-extrabold text-[#F9F9FB] mb-4" style={{ fontFamily: "var(--font-display)" }}>Investing in BizShares</h4>
                                <p className="text-[#7B8B9A] text-lg leading-relaxed">
                                    Master the mechanics of onchain business financing. Explore our curated series to understand how to build and manage a powerful portfolio of real-world assets.
                                </p>
                            </motion.div>
                            
                            <motion.div variants={fadeUp} className="bg-[#05090F] p-4 md:p-8 lg:col-span-7 relative z-10 flex items-center justify-center">
                                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-[#1E2F45]/50 shadow-[0_0_40px_rgba(129,215,180,0.05)] relative group">
                                    <div className="absolute inset-0 bg-[#81D7B4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                                    <iframe 
                                        className="w-full h-full relative z-10"
                                        src="https://www.youtube.com/embed/videoseries?list=PLGeDjvoeld0g" 
                                        title="Investing in BizShares" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* PRODUCTS (List format instead of generic cards) */}
                <section id="products" className="py-36 bg-[#080E18] relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1E2F45]" />
                        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.025) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
                    </div>
                    
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-2xl">
                                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                                    <div className="h-px w-8 bg-[#81D7B4]" />
                                    <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Suite</span>
                                </motion.div>
                                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB] mb-4" style={{ fontFamily: "var(--font-display)" }}>
                                    BizFi Products
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                                    A suite of financial tools designed to power the next generation of borderless business finance.
                                </motion.p>
                            </motion.div>
                            <motion.button initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} onClick={() => setShowNotifyModal(true)} className="px-6 py-3 border border-[#2C3E5D] text-[#F9F9FB] rounded-xl font-bold hover:border-[#81D7B4] hover:text-[#81D7B4] transition-colors whitespace-nowrap">
                                Get Notified When Live
                            </motion.button>
                        </div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="flex flex-col gap-4">
                            {[
                                { title: "BizFun", desc: "Create Your Promo Tokens in minutes, raise Liquidity, build Your Movement, reward your community.", status: "Live", link: "/bizfun" },
                                { title: "BizSwap", desc: "Provide liquidity for the top 1% projects on BizMarket; earn a Savvy 10% markup.", status: "Live", link: "/bizswap" },
                                { title: "Bitloans", desc: "Use your BizShares or ETH as collateral and borrow Local StableCoins seamlessly.", status: "Coming Soon" }
                            ].map((p, i) => (
                                <motion.div key={i} variants={fadeUp} className="group grid grid-cols-12 gap-6 items-center bg-[#0D1724] border border-[#1E2F45] rounded-2xl px-8 py-8 transition-all hover:-translate-y-0.5 hover:border-[#2C3E5D]">
                                    <div className="col-span-12 md:col-span-3">
                                        <h3 className="text-3xl font-extrabold text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h3>
                                    </div>
                                    <div className="col-span-12 md:col-span-6">
                                        <p className="text-[#7B8B9A] text-lg leading-relaxed">{p.desc}</p>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 md:text-right flex justify-start md:justify-end">
                                        {p.link ? (
                                            <Link href={p.link} className="text-sm font-bold tracking-widest uppercase text-[#81D7B4] hover:text-white transition-colors inline-flex items-center gap-1">
                                                {p.status} <span>→</span>
                                            </Link>
                                        ) : (
                                            <span className="text-xs font-bold tracking-widest uppercase text-[#81D7B4]/50">{p.status}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* NEWSLETTER */}
                <section className="relative bg-[#0F1825] overflow-hidden py-32">
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.02) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                                <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold leading-[1.06] text-[#F9F9FB] mb-6" style={{ fontFamily: "var(--font-display)" }}>
                                    The art of <span className="text-[#81D7B4]">Savviness.</span>
                                </motion.h2>
                                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed mb-8">
                                    Get smarter with your money — personal and business finance strategies to build growth, delivered straight to your inbox.
                                </motion.p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                                <NewsletterEmbed />
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-[#2C3E5D] py-12 bg-[#0A0F17] relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center">
                        <span className="text-xl font-black tracking-tight text-[#81D7B4]" style={{ fontFamily: "var(--font-display)" }}>BizFi</span>
                    </div>
                    <p className="text-[#7B8B9A] text-sm">© {new Date().getFullYear()} Bitsave Bizfi. All rights reserved.</p>
                    <div className="flex gap-6 text-sm font-medium text-[#9BA8B5]">
                        <a href="https://x.com/bitsaveprotocol" target="_blank" rel="noopener noreferrer" className="hover:text-[#81D7B4] transition-colors">Twitter</a>
                        <a href="https://t.me/+YimKRR7wAkVmZGRk" target="_blank" rel="noopener noreferrer" className="hover:text-[#81D7B4] transition-colors">Telegram</a>
                    </div>
                </div>
            </footer>

            <NotifyModal isOpen={showNotifyModal} onClose={() => setShowNotifyModal(false)} />
        </div>
    );
}
