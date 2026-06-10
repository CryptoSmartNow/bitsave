'use client';

import { LinkSquare01Icon } from "hugeicons-react";
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const CREDENTIALS = [
    {
        month: "July",
        title: "Finished 3rd Place in Base Batch 3",
        link: "https://x.com/BitsaveProtocol/status/1947312149342146604?s=20",
        linkText: "Tick Out the Base Tweet here"
    },
    {
        month: "September",
        title: "Launched our MiniApp on Farcaster and TBA",
        link: "https://x.com/BitsaveProtocol/status/1970191674459783434?s=20",
        linkText: "View the Farcaster Launch"
    },
    {
        month: "October",
        title: "Came 2nd Place with our MiniApp on Onchain Summer as Top New MiniApp",
        link: "https://x.com/base/status/1975593334333911144?s=20",
        linkText: "View Onchain Summer Results"
    },
    {
        month: "November",
        title: "Made it to Top 50 Finalist in Base Batch 2, sponsored by Base to DevCon to pitch Bitsave",
        link: "https://x.com/base/status/1986191402037084294?s=20",
        linkText: "View Base Batch Announcement"
    }
];

export default function CredibilitySection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });
    
    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section className="section-lazy py-24 bg-gray-50/50 border-t border-b border-gray-100/80 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-[-10%] w-96 h-96 bg-[#81D7B4]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-[-5%] w-72 h-72 bg-[#5fb392]/4 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#81D7B4]/15 text-[#2D5A4A] text-xs font-bold uppercase tracking-wider mb-6 font-display"
                    >
                        Our Journey
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="font-display text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight"
                    >
                        Built with Trust <span className="text-gradient">and Credibility</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium"
                    >
                        We have been consistently recognized by leading ecosystem partners for our innovative approach to decentralized savings.
                    </motion.p>
                </div>

                {/* Vertical Timeline Journey */}
                <div ref={containerRef} className="relative max-w-4xl mx-auto py-10 md:py-20 mt-10">
                    {/* Animated Center Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-100 -translate-x-1/2">
                        <motion.div 
                            style={{ height: lineHeight }} 
                            className="w-full bg-gradient-to-b from-[#81D7B4] via-[#5fb392] to-transparent"
                        />
                    </div>

                    <div className="space-y-16 md:space-y-24 relative">
                        {CREDENTIALS.map((cred, i) => {
                            const isEven = i % 2 === 0;
                            return (
                                <div key={i} className="relative flex flex-col md:flex-row items-center w-full">
                                    
                                    {/* Timeline Dot (Desktop) */}
                                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm items-center justify-center z-10 transition-all duration-500 hover:scale-110 hover:border-[#81D7B4] group">
                                        <div className="w-4 h-4 rounded-full bg-gray-200 group-hover:bg-[#81D7B4] transition-colors" />
                                    </div>

                                    {/* Content Container */}
                                    <div className={`w-full md:w-1/2 flex ${isEven ? 'md:pr-16 md:justify-end text-left md:text-right' : 'md:pl-16 md:ml-auto md:justify-start text-left'}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: isEven ? -40 : 40, y: 20 }}
                                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            className="group relative"
                                        >
                                            <div className={`flex flex-col ${isEven ? 'md:items-end' : 'md:items-start'} items-start`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-4xl font-black text-gray-100 font-display -mt-1 group-hover:text-[#81D7B4]/20 transition-colors">0{i + 1}</span>
                                                    <span className="text-sm font-bold text-[#5fb392] uppercase tracking-widest bg-[#81D7B4]/10 px-3 py-1.5 rounded-full border border-[#81D7B4]/20">
                                                        {cred.month}
                                                    </span>
                                                </div>

                                                <h3 className="font-display text-2xl md:text-3xl font-bold text-gray-900 mb-6 group-hover:text-[#5fb392] transition-colors max-w-sm">
                                                    {cred.title}
                                                </h3>

                                                <a
                                                    href={cred.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[15px] font-bold text-[#81D7B4] hover:text-[#5fb392] transition-colors group-hover:translate-x-1 duration-300"
                                                >
                                                    {cred.linkText} <LinkSquare01Icon className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

