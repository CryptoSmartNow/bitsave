'use client';

import { LinkSquare01Icon } from "hugeicons-react";
import { motion } from 'framer-motion';

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

                {/* Grid / Carousel on Mobile */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-8 relative md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
                    {/* Timeline connector (desktop) */}
                    <div className="hidden lg:block absolute top-[2.125rem] left-[12.5%] right-[12.5%] h-[2px] z-0">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                            className="w-full h-full bg-gradient-to-r from-[#81D7B4]/20 via-[#81D7B4]/60 to-[#81D7B4]/20 origin-left"
                        />
                    </div>

                    {CREDENTIALS.map((cred, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_45px_rgba(129,215,180,0.12)] border border-gray-100 hover:border-[#81D7B4]/30 transition-all duration-500 flex flex-col h-full group hover:-translate-y-1.5 relative z-10 snap-center shrink-0 min-w-[280px] max-w-[320px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none"
                        >
                            <div className="flex items-center justify-between mb-6">
                                {/* Glowing Timeline Node */}
                                <div className="w-5 h-5 rounded-full border-4 border-[#81D7B4] bg-white flex items-center justify-center shadow-[0_0_12px_rgba(129,215,180,0.4)] relative z-20 group-hover:scale-125 transition-transform duration-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] group-hover:bg-[#5fb392] transition-colors duration-300" />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-gray-300 font-display">0{i + 1}</span>
                                    <span className="w-1 h-1 rounded-full bg-[#81D7B4]/60" />
                                    <span className="text-xs font-extrabold text-[#2D5A4A] uppercase tracking-wider font-display bg-[#81D7B4]/12 px-2.5 py-1 rounded-full">
                                        {cred.month}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-5 flex-grow font-display">
                                {cred.title}
                            </h3>

                            <a
                                href={cred.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5fb392] hover:text-[#2D5A4A] transition-colors mt-auto group-hover:translate-x-0.5 transition-transform duration-300 font-display"
                            >
                                {cred.linkText} <LinkSquare01Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

