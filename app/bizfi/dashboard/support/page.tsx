"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    HiOutlineQuestionMarkCircle,
    HiOutlineChatBubbleLeftRight,
    HiOutlineEnvelope,
    HiOutlineChevronDown,
    HiOutlineCheckCircle,
    HiOutlineVideoCamera,
    HiOutlineBookOpen
} from "react-icons/hi2";
import { Exo } from "next/font/google";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// FAQ Data
const FAQ_ITEMS = [
    {
        category: "Getting Started",
        questions: [
            {
                q: "How do I list my business on BizMarket?",
                a: "To list your business, complete the Pre-Listing Assessment form on your dashboard. Select your business tier, provide required information, and pay the listing fee. Our team will review your submission within 48 hours."
            },
            {
                q: "What are the different business tiers?",
                a: "We offer four tiers: Micro Business ($10), Builder Tier ($35), Growth Business ($60), and Enterprise Projects ($120). Each tier is designed for different business sizes and revenue levels."
            },
            {
                q: "How long does the approval process take?",
                a: "Most applications are reviewed within 24-48 hours. Complex enterprise projects may take up to 5 business days for thorough evaluation."
            }
        ]
    },
    {
        category: "Tokenization",
        questions: [
            {
                q: "What is business tokenization?",
                a: "Business tokenization converts your business equity or revenue streams into digital tokens that can be traded on the blockchain. This allows you to raise capital from global investors."
            },
            {
                q: "How are token prices determined?",
                a: "Token prices are based on your business valuation, which considers factors like revenue, growth rate, market potential, and comparable businesses. Our team works with you to set a fair initial price."
            },
            {
                q: "Can I buy back my tokens?",
                a: "Yes, you can buy back tokens from the secondary market at any time. Some business owners use this to maintain majority ownership while still accessing capital."
            }
        ]
    },
    {
        category: "Payments & Fees",
        questions: [
            {
                q: "What payment methods do you accept?",
                a: "We accept cryptocurrency payments (ETH, USDC, USDT) and traditional payment methods (credit card, bank transfer) for listing fees."
            },
            {
                q: "Are there ongoing fees?",
                a: "We charge a 2.5% transaction fee on token trades. There are no monthly fees or hidden charges."
            },
            {
                q: "Do you offer refunds?",
                a: "Listing fees are non-refundable once your application is approved. However, if your application is rejected, you'll receive a full refund."
            }
        ]
    }
];

export default function SupportPage() {
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
    };

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] text-white p-4 sm:p-6 lg:p-8`}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Support Center</h1>
                <p className="text-sm sm:text-base text-gray-400">Get help with your BizMarket journey</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Quick Help Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 hover:border-[#81D7B4]/30 transition-all cursor-pointer">
                            <HiOutlineVideoCamera className="w-8 h-8 text-[#81D7B4] mb-3" />
                            <h3 className="font-bold text-white mb-2">Video Tutorials</h3>
                            <p className="text-sm text-gray-400">Step-by-step guides</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 hover:border-[#81D7B4]/30 transition-all cursor-pointer">
                            <HiOutlineBookOpen className="w-8 h-8 text-[#81D7B4] mb-3" />
                            <h3 className="font-bold text-white mb-2">Documentation</h3>
                            <p className="text-sm text-gray-400">Detailed guides</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 hover:border-[#81D7B4]/30 transition-all cursor-pointer">
                            <HiOutlineChatBubbleLeftRight className="w-8 h-8 text-[#81D7B4] mb-3" />
                            <h3 className="font-bold text-white mb-2">Live Chat</h3>
                            <p className="text-sm text-gray-400">Chat with support</p>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {FAQ_ITEMS.map((category, categoryIndex) => (
                                <div key={categoryIndex}>
                                    <h3 className="text-lg font-bold text-[#81D7B4] mb-4">{category.category}</h3>
                                    <div className="space-y-3">
                                        {category.questions.map((item, index) => {
                                            const faqKey = `${categoryIndex}-${index}`;
                                            const isOpen = openFAQ === faqKey;

                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => setOpenFAQ(isOpen ? null : faqKey)}
                                                        className="w-full p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                                                    >
                                                        <span className="font-medium text-white text-left">{item.q}</span>
                                                        <HiOutlineChevronDown
                                                            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                    <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: 'auto' }}
                                                                exit={{ height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 pt-0 text-gray-400 border-t border-gray-800">
                                                                    {item.a}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Form Sidebar */}
                <div>
                    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 sticky top-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-[#81D7B4]/10 rounded-xl">
                                <HiOutlineEnvelope className="w-6 h-6 text-[#81D7B4]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Contact Us</h2>
                                <p className="text-sm text-gray-400">We'll respond within 24h</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Subject</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    <option value="listing">Business Listing</option>
                                    <option value="tokenization">Tokenization</option>
                                    <option value="payment">Payment Issues</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={5}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-lg hover:bg-[#6BC4A0] transition-all flex items-center justify-center gap-2"
                            >
                                <HiOutlineCheckCircle className="w-5 h-5" />
                                Send Message
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <p className="text-sm text-gray-400 mb-3">Other ways to reach us:</p>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-300">📧 support@bizmarket.io</p>
                                <p className="text-gray-300">💬 Live chat (9AM-5PM EST)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
