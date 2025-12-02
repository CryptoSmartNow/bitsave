"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
    HiOutlineRocketLaunch,
    HiOutlineFire,
    HiOutlineBeaker,
    HiOutlineTrophy,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlineArrowLeft,
    HiOutlineChatBubbleLeftRight,
    HiOutlineClipboardDocumentCheck,
    HiOutlineCheckCircle,
    HiOutlineHome,
    HiOutlineVideoCamera,
    HiOutlineCommandLine,
    HiOutlineChatBubbleBottomCenterText,
    HiOutlineQuestionMarkCircle,
    HiOutlineEllipsisVertical,
    HiOutlineBars3
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import Link from "next/link";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Dashboard Metrics Data
const DASHBOARD_METRICS = [
    {
        label: "Token Price",
        value: "$0.00",
        change: "0%",
        isPositive: true,
        icon: HiOutlineCurrencyDollar
    },
    {
        label: "Market Cap",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineTrophy
    },
    {
        label: "Total Investors",
        value: "0",
        change: "0",
        isPositive: true,
        icon: HiOutlineUsers
    },
    {
        label: "Capital Raised",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineRocketLaunch
    },
    {
        label: "Monthly Revenue",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineCurrencyDollar
    },
    {
        label: "Growth Rate",
        value: "0%",
        change: "0%",
        isPositive: true,
        icon: HiOutlineFire
    },
    {
        label: "Liquidity Available",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineBeaker
    },
    {
        label: "Compliance Status",
        value: "Pending",
        change: "0%",
        isPositive: true,
        icon: HiOutlineTrophy
    }
];

// Tiers
const TIERS = [
    {
        id: 'micro',
        name: 'Micro Business',
        price: 10,
        referralPrice: 6,
        description: 'For small businesses and SMEs earning under $5,000/month (saloons, food vendors, sole traders).'
    },
    {
        id: 'builder',
        name: 'Builder Tier',
        price: 35,
        referralPrice: 30,
        description: 'For idea-stage founders, student entrepreneurs, and early builders launching their startup.'
    },
    {
        id: 'growth',
        name: 'Growth Business',
        price: 60,
        referralPrice: 50,
        description: 'For operational businesses earning over $5,000/month with customers and revenue.'
    },
    {
        id: 'enterprise',
        name: 'Enterprise Projects',
        price: 120,
        referralPrice: 100,
        description: 'For large-scale projects (real estate, agriculture, manufacturing) raising significant capital.'
    }
];

export default function BizFiDashboardPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);
    const [selectedTier, setSelectedTier] = useState(TIERS[0]);
    const [referralCode, setReferralCode] = useState('');
    const [isReferralValid, setIsReferralValid] = useState(false);
    const [showConsultancyModal, setShowConsultancyModal] = useState(false);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleReferralCheck = (code: string) => {
        setReferralCode(code);
        // Mock validation
        if (code.length > 3) {
            setIsReferralValid(true);
        } else {
            setIsReferralValid(false);
        }
    };

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] text-white relative overflow-x-hidden flex`}>
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #81D7B4 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }}></div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed left-0 top-0 h-full w-64 bg-[#0A0E0D] border-r border-gray-800 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Logo */}
                <div className="p-6 border-b border-gray-800">
                    <Link href="/bizfi" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#81D7B4] rounded-lg flex items-center justify-center">
                            <HiOutlineRocketLaunch className="w-6 h-6 text-gray-900" />
                        </div>
                        <span className="text-xl font-bold text-white">BizMarket</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/bizfi/dashboard"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 text-white hover:bg-gray-800 transition-colors"
                    >
                        <HiOutlineHome className="w-5 h-5" />
                        <span className="font-medium">Home</span>
                    </Link>

                    <Link
                        href="/bizfi/dashboard/bizcontent"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
                    >
                        <HiOutlineVideoCamera className="w-5 h-5" />
                        <span className="font-medium">BizContent</span>
                    </Link>

                    <Link
                        href="/bizfi/dashboard/terminal"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
                    >
                        <HiOutlineCommandLine className="w-5 h-5" />
                        <span className="font-medium">Terminal</span>
                    </Link>

                    <Link
                        href="/bizfi/dashboard/chat"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
                    >
                        <HiOutlineChatBubbleBottomCenterText className="w-5 h-5" />
                        <span className="font-medium">Chat</span>
                    </Link>

                    <Link
                        href="/bizfi/dashboard/support"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
                    >
                        <HiOutlineQuestionMarkCircle className="w-5 h-5" />
                        <span className="font-medium">Support</span>
                    </Link>

                    <button
                        onClick={() => {
                            setShowMoreModal(true);
                            setIsSidebarOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors w-full"
                    >
                        <HiOutlineEllipsisVertical className="w-5 h-5" />
                        <span className="font-medium">More</span>
                    </button>
                </nav>

                {/* Create Business Button */}
                <div className="p-4 border-t border-gray-800">
                    <button className="w-full py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-xl hover:bg-[#6BC4A0] transition-all">
                        Create Business
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Header */}
                <div className="relative z-10 border-b border-gray-800 bg-[#0A0E0D]/80 backdrop-blur-md sticky top-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Hamburger Menu for Mobile */}
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <HiOutlineBars3 className="w-6 h-6 text-white" />
                                </button>
                                <h1 className="text-xl font-bold text-white">Business Dashboard</h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowConsultancyModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all border border-gray-700"
                                >
                                    <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                                    <span className="hidden sm:inline">Book Consultancy</span>
                                </button>
                                {address && (
                                    <div className="px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700 text-sm font-mono text-gray-300">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">

                    {/* Metrics Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Your Business Overview</h2>
                            <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full text-xs font-bold border border-[#81D7B4]/20">
                                Live Preview
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {DASHBOARD_METRICS.map((metric, index) => (
                                <motion.div
                                    key={metric.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-5 hover:border-[#81D7B4]/30 transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2 bg-[#81D7B4]/10 rounded-lg">
                                            <metric.icon className="w-5 h-5 text-[#81D7B4]" />
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${metric.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {metric.change}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-1">{metric.label}</p>
                                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pre-Listing Assessment Form */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#81D7B4]/10 rounded-xl">
                                        <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-[#81D7B4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Pre-Listing Assessment</h2>
                                        <p className="text-gray-400 text-sm">Complete this form to check eligibility and start tokenization.</p>
                                    </div>
                                </div>

                                {/* Tier Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-300 mb-3">Select Your Business Tier</label>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {TIERS.map((tier) => (
                                            <button
                                                key={tier.id}
                                                onClick={() => setSelectedTier(tier)}
                                                className={`text-left p-4 rounded-xl border transition-all duration-300 ${selectedTier.id === tier.id
                                                    ? 'bg-[#81D7B4]/10 border-[#81D7B4] ring-1 ring-[#81D7B4]'
                                                    : 'bg-gray-800/30 border-gray-700 hover:border-gray-600'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-bold ${selectedTier.id === tier.id ? 'text-[#81D7B4]' : 'text-white'}`}>
                                                        {tier.name}
                                                    </span>
                                                    <span className="text-sm font-mono text-gray-400">${tier.price}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{tier.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Referral Code */}
                                <div className="mb-8 p-4 bg-[#81D7B4]/5 rounded-xl border border-[#81D7B4]/20">
                                    <label className="block text-sm font-medium text-[#81D7B4] mb-2">Have a Referral Code?</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code to save on listing fees"
                                            value={referralCode}
                                            onChange={(e) => handleReferralCheck(e.target.value)}
                                            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#81D7B4]"
                                        />
                                        {isReferralValid && (
                                            <div className="flex items-center gap-1 text-green-400 text-sm font-bold px-3">
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                                <span>-${selectedTier.price - selectedTier.referralPrice}</span>
                                            </div>
                                        )}
                                    </div>
                                    {isReferralValid && (
                                        <p className="text-xs text-green-400 mt-2">
                                            Code applied! You pay <span className="font-bold">${selectedTier.referralPrice}</span> instead of ${selectedTier.price}.
                                        </p>
                                    )}
                                </div>

                                {/* Dynamic Form Fields based on Tier */}
                                <form className="space-y-6">
                                    {/* Section A: General */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-gray-800">General Information</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                                                <input type="text" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                                                <input type="email" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Country</label>
                                                <input type="text" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                                                <input type="tel" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section B: Business Identity (Dynamic) */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-gray-800">Business Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Business Name</label>
                                                <input type="text" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Business Description</label>
                                                <textarea rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none" placeholder="Briefly describe your business..." />
                                            </div>
                                            {selectedTier.id === 'enterprise' && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 mb-1">Project Executive Summary</label>
                                                    <textarea rows={4} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none" placeholder="Detailed project summary..." />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Section C: Financials */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-gray-800">Financials & Goals</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Monthly Revenue (Avg)</label>
                                                <input type="number" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-1">Target Raise Amount ($)</label>
                                                <input type="number" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            className="w-full py-4 bg-[#81D7B4] text-gray-900 font-bold rounded-xl shadow-lg hover:bg-[#6BC4A0] transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
                                        >
                                            <span>Submit Assessment & Pay ${isReferralValid ? selectedTier.referralPrice : selectedTier.price}</span>
                                            <HiOutlineRocketLaunch className="w-5 h-5" />
                                        </button>
                                        <p className="text-center text-xs text-gray-500 mt-3">
                                            By submitting, you agree to our Terms of Service and Privacy Policy.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Sidebar / Info */}
                        <div className="space-y-6">
                            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Why List on BizFi?</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm text-gray-400">Access global capital from crypto investors.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm text-gray-400">Tokenize equity or revenue streams easily.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm text-gray-400">Automated compliance and investor management.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-br from-[#81D7B4]/20 to-transparent rounded-2xl border border-[#81D7B4]/20 p-6">
                                <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Not sure which tier fits you? Book a free consultancy session with our experts.
                                </p>
                                <button
                                    onClick={() => setShowConsultancyModal(true)}
                                    className="w-full py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-lg hover:bg-[#6BC4A0] transition-all"
                                >
                                    Schedule Call
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Consultancy Modal */}
                <AnimatePresence>
                    {showConsultancyModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowConsultancyModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white">Book Consultancy</h2>
                                    <button
                                        onClick={() => setShowConsultancyModal(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-400 mb-6">
                                    Schedule a 15-minute call with a BizFi representative to discuss your business needs and listing strategy.
                                </p>
                                {/* Mock Calendar Embed Placeholder */}
                                <div className="bg-gray-800 rounded-xl h-64 flex items-center justify-center mb-6 border border-gray-700">
                                    <p className="text-gray-500 text-sm">Calendar Integration Loading...</p>
                                </div>
                                <button
                                    onClick={() => setShowConsultancyModal(false)}
                                    className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-all border border-gray-700"
                                >
                                    Close
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* More Modal */}
                <AnimatePresence>
                    {showMoreModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowMoreModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-[#1a1f1e] rounded-2xl border border-gray-800 shadow-2xl w-full max-w-sm p-6"
                            >
                                <div className="space-y-1 mb-6">
                                    <button className="w-full text-left px-4 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                        BizSwap
                                    </button>
                                    <button className="w-full text-left px-4 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                        Business Listing Policy
                                    </button>
                                    <button className="w-full text-left px-4 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                        DMCA Policy
                                    </button>
                                    <button className="w-full text-left px-4 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                        Trademark Guidelines
                                    </button>
                                    <button className="w-full text-left px-4 py-3 text-white hover:bg-gray-800/50 rounded-lg transition-colors">
                                        How It Works
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-800">
                                    <div className="flex items-center justify-start gap-4">
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                            </svg>
                                        </a>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                        </a>
                                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                        </a>
                                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
