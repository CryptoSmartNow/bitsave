'use client';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineStar, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

const CREDENTIALS = [
    {
        month: "July",
        title: "Finished 3rd Place in Base Batch 3",
        icon: <HiOutlineCalendar className="w-6 h-6" />,
        link: "https://x.com/BitsaveProtocol/status/1947312149342146604?s=20",
        linkText: "Check Out the Base Tweet here",
        color: "bg-[#0F1825] text-[#81D7B4]"
    },
    {
        month: "September",
        title: "Launched our MiniApp on Farcaster and TBA",
        icon: <HiOutlineCalendar className="w-6 h-6" />,
        link: "https://x.com/BitsaveProtocol/status/1970191674459783434?s=20",
        linkText: "View the Farcaster Launch",
        color: "bg-[#0F1825] text-[#81D7B4]"
    },
    {
        month: "October",
        title: "Came 2nd Place with our MiniApp on Onchain Summer as Top New MiniApp",
        icon: <HiOutlineCalendar className="w-6 h-6" />,
        link: "https://x.com/base/status/1975593334333911144?s=20",
        linkText: "View Onchain Summer Results",
        color: "bg-[#0F1825] text-[#81D7B4]"
    },
    {
        month: "November",
        title: "Made it to Top 50 Finalist in Base Batch 2, sponsored by Base to DevCon to pitch Bitsave",
        icon: <HiOutlineCalendar className="w-6 h-6" />,
        link: "https://x.com/base/status/1986191402037084294?s=20",
        linkText: "View Base Batch Announcement",
        color: "bg-[#0F1825] text-[#81D7B4]"
    }
];

export default function CredibilitySection() {
    return (
        <section className="py-24 bg-gray-50 border-t border-b border-gray-100 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-[-10%] w-96 h-96 bg-[#81D7B4]/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#81D7B4]/10 text-[#2D5A4A] text-sm font-bold mb-6"
                    >
                        Our Journey
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
                    >
                        Built with Trust <span className="text-[#81D7B4]">and Credibility</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto font-medium"
                    >
                        We have been consistently recognized by leading ecosystem partners for our innovative approach to decentralized savings.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CREDENTIALS.map((cred, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(129,215,180,0.12)] border border-gray-100 hover:border-[#81D7B4]/20 transition-all flex flex-col h-full group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cred.color}`}>
                                    {cred.icon}
                                </div>
                                <span className="text-sm font-black text-gray-300 uppercase tracking-wider group-hover:text-[#81D7B4] transition-colors">
                                    {cred.month}
                                </span>
                            </div>

                            <h3 className="text-[17px] font-bold text-gray-900 leading-snug mb-4 flex-grow">
                                {cred.title}
                            </h3>

                            <a
                                href={cred.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6BC4A0] hover:text-[#81D7B4] transition-colors mt-auto"
                            >
                                {cred.linkText} <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

