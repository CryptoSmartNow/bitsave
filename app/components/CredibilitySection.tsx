'use client';

import { ArrowRight01Icon } from "hugeicons-react";
import { motion } from 'framer-motion';

const CREDENTIALS = [
    {
        month: "July",
        title: "Finished 3rd Place in Base Batch 3",
        link: "https://x.com/BitsaveProtocol/status/1947312149342146604?s=20",
        linkText: "View Base Tweet"
    },
    {
        month: "September",
        title: "Launched our MiniApp on Farcaster and TBA",
        link: "https://x.com/BitsaveProtocol/status/1970191674459783434?s=20",
        linkText: "View Farcaster Launch"
    },
    {
        month: "October",
        title: "Came 2nd Place with our MiniApp on Onchain Summer as Top New MiniApp",
        link: "https://x.com/base/status/1975593334333911144?s=20",
        linkText: "View Results"
    },
    {
        month: "November",
        title: "Made it to Top 50 Finalist in Base Batch 2, sponsored by Base to DevCon",
        link: "https://x.com/base/status/1986191402037084294?s=20",
        linkText: "View Announcement"
    }
];

export default function CredibilitySection() {
    return (
        <section className="py-24 md:py-32 bg-[#f8fafc] relative overflow-hidden">
            {/* Subtle Tech Dot Pattern Background */}
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }}></div>

            {/* Glowing Accent Orbs in Light Mode */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#81D7B4]/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-200/20 blur-[150px] rounded-full pointer-events-none mix-blend-multiply" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-24 relative flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="inline-block px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[#5fb392] text-xs font-bold uppercase tracking-[0.25em] mb-6"
                    >
                        Our Journey
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight text-slate-900"
                    >
                        Built with Trust <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4]">and Credibility</span>
                    </motion.h2>
                </div>

                {/* 4-Column Bento Card Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {CREDENTIALS.map((cred, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: i * 0.15, type: "spring", stiffness: 40 }}
                            className="group relative flex flex-col h-full bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-8 hover:bg-white transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(129,215,180,0.15)] overflow-hidden"
                        >
                            {/* Decorative Top Accent Line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#81D7B4] to-[#5fb392] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            {/* Faint massive month watermark inside the card */}
                            <div className="absolute -bottom-4 -right-4 text-8xl font-instrument font-bold text-slate-100 pointer-events-none select-none z-0 transition-transform duration-500 group-hover:scale-110">
                                {cred.month.slice(0,3)}
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                {/* Month/Date Heading */}
                                <div className="mb-8">
                                    <h3 className="font-instrument text-4xl lg:text-5xl text-slate-900 tracking-tight">
                                        {cred.month}
                                    </h3>
                                    <div className="w-8 h-1 bg-[#81D7B4] mt-4 rounded-full" />
                                </div>

                                {/* Content */}
                                <div className="flex-grow">
                                    <p className="font-display text-lg font-bold text-slate-700 leading-snug mb-8">
                                        {cred.title}
                                    </p>
                                </div>

                                {/* Action Link */}
                                <a
                                    href={cred.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-display font-bold text-[#5fb392] group-hover:text-[#3d8367] transition-colors mt-auto"
                                >
                                    {cred.linkText} 
                                    <ArrowRight01Icon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

