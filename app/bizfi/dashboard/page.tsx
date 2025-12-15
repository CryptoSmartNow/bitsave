"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import {
    HiOutlineRocketLaunch,
    HiOutlineFire,
    HiOutlineBeaker,
    HiOutlineTrophy,
    HiOutlineUsers,
    HiOutlineCurrencyDollar,
    HiOutlineChatBubbleLeftRight,
    HiOutlineClipboardDocumentCheck,
    HiOutlineCheckCircle,
    HiOutlineClipboard,
    HiOutlineArrowRightOnRectangle,
    HiOutlineArrowRight
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import WizardForm from "./components/WizardForm";
import "../bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});



// Tiers
type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

const TIERS: Array<{
    id: TierType;
    name: string;
    price: number;
    referralPrice: number;
    description: string;
}> = [
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
            description: 'For idea-stage founders, entrepreneurs, and builders launching their startup or prototype, tech start-ups and more.'
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
    const { user, authenticated, login, logout } = usePrivy();
    const address = user?.wallet?.address;
    const [mounted, setMounted] = useState(false);
    const [selectedTier, setSelectedTier] = useState(TIERS[0]);
    const [referralCode, setReferralCode] = useState('');
    const [isReferralValid, setIsReferralValid] = useState(false);
    const [showConsultancyModal, setShowConsultancyModal] = useState(false);
    const [businessCount, setBusinessCount] = useState(1000);
    const [copiedAddress, setCopiedAddress] = useState(false);
    const [showBuyCryptoModal, setShowBuyCryptoModal] = useState(false);
    const [validatingReferral, setValidatingReferral] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Fetch and increment global business counter
        const fetchCounter = async () => {
            try {
                const response = await fetch('/api/bizfi/counter');
                const data = await response.json();
                setBusinessCount(data.count);
            } catch (error) {
                console.error('Failed to fetch business counter:', error);
            }
        };

        fetchCounter();

        // Load saved referral code from draft
        const loadDraft = async () => {
            if (!address) return;
            try {
                const res = await fetch(`/api/bizfi/draft?address=${address}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.referralCode) {
                        setReferralCode(data.referralCode);
                        // Validate the loaded referral code
                        validateReferralCode(data.referralCode);
                    }
                }
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        };

        if (address) {
            loadDraft();
        }

        // Listen for Buy Crypto modal event from WizardForm
        const handleOpenBuyCryptoModal = () => {
            setShowBuyCryptoModal(true);
        };
        window.addEventListener('openBuyCryptoModal', handleOpenBuyCryptoModal);
        return () => window.removeEventListener('openBuyCryptoModal', handleOpenBuyCryptoModal);
    }, [address]);

    const validateReferralCode = async (code: string) => {
        if (!code || code.trim().length === 0) {
            setIsReferralValid(false);
            return;
        }

        setValidatingReferral(true);
        try {
            const response = await fetch('/api/bizfi/referral/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: code.trim() })
            });
            const data = await response.json();
            setIsReferralValid(data.valid);
        } catch (error) {
            console.error('Failed to validate referral code:', error);
            setIsReferralValid(false);
        } finally {
            setValidatingReferral(false);
        }
    };

    const handleReferralCheck = (code: string) => {
        setReferralCode(code);
        // Debounce validation
        const timeoutId = setTimeout(() => {
            validateReferralCode(code);
            // Save to draft
            if (address) {
                fetch('/api/bizfi/draft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        referralCode: code,
                        step: 1
                    })
                }).catch(e => console.error('Failed to save referral code:', e));
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    const handleCopyAddress = async () => {
        if (!address) return;
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)' }}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans`} style={{ background: 'linear-gradient(180deg, #0F1825 0%, #1A2538 100%)', minHeight: '100vh' }}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#F9F9FB' }}>Business Dashboard</h1>
                        <p className="text-sm sm:text-base" style={{ color: '#7B8B9A' }}>Manage your business listing and track performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowConsultancyModal(true)}
                            className="flex items-center gap-2 px-4 sm:px-6 py-3 font-bold rounded-xl transition-all"
                            style={{ backgroundColor: '#81D7B4', color: '#0F1825' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6BC4A0'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#81D7B4'}
                        >
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                            <span className="hidden sm:inline">Book Consultancy</span>
                            <span className="sm:hidden">Book</span>
                        </button>
                        {address && (
                            <>
                                <button
                                    onClick={handleCopyAddress}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-[#81D7B4]/10 border border-gray-700 hover:border-[#81D7B4]"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', color: copiedAddress ? '#81D7B4' : '#9BA8B5' }}
                                >
                                    {copiedAddress ? (
                                        <>
                                            <HiOutlineCheckCircle className="w-4 h-4" />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <HiOutlineClipboard className="w-4 h-4" />
                                            <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600"
                                    style={{ color: '#9BA8B5' }}
                                    title="Logout"
                                >
                                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                                    <span className="hidden lg:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Business Counter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border" style={{ background: 'linear-gradient(90deg, rgba(44, 62, 93, 0.5) 0%, rgba(129, 215, 180, 0.1) 100%)', borderColor: 'rgba(129, 215, 180, 0.3)' }}>
                        <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                        <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#7B8B9A' }}>
                            <span className="text-[#81D7B4] font-bold">{(1000 + businessCount).toLocaleString()}</span> Real World Businesses have listed Onchain
                        </p>
                    </div>
                </motion.div>

                {!authenticated ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="backdrop-blur-sm rounded-2xl border p-8 max-w-lg w-full text-center" style={{ backgroundColor: 'rgba(44, 62, 93, 0.4)', borderColor: 'rgba(123, 139, 154, 0.2)' }}>
                            <div className="p-4 rounded-full inline-block mb-4" style={{ backgroundColor: 'rgba(129, 215, 180, 0.1)' }}>
                                <HiOutlineRocketLaunch className="w-10 h-10 text-[#81D7B4]" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4" style={{ color: '#F9F9FB' }}>Connect Your Wallet</h2>
                            <p className="mb-8" style={{ color: '#7B8B9A' }}>
                                You need to connect your wallet to list your business and access the dashboard features.
                            </p>
                            <button
                                onClick={login}
                                className="w-full py-3.5 font-bold rounded-xl transition-all shadow-lg hover:scale-[1.02]"
                                style={{ backgroundColor: '#81D7B4', color: '#0F1825' }}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(129, 215, 180, 0.15)' }}>
                                        <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-[#81D7B4]" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold" style={{ color: '#F9F9FB' }}>List Your Business</h2>
                                        <p className="text-sm" style={{ color: '#7B8B9A' }}>Fill the form to bring your business onchain</p>
                                    </div>
                                </div>

                                <div className="mb-6 p-4 rounded-xl border" style={{ background: 'linear-gradient(90deg, rgba(129, 215, 180, 0.1) 0%, transparent 100%)', borderColor: 'rgba(129, 215, 180, 0.2)' }}>
                                    <p className="text-sm leading-relaxed" style={{ color: '#F9F9FB' }}>
                                        Fill the Form to Bring your business onchain, <span className="text-[#81D7B4] font-bold">raise capital</span> to expand globally, and get new customers.
                                    </p>
                                </div>

                                {/* Tier Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm font-medium mb-3 text-gray-400">Select Your Business Tier</label>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {TIERS.map((tier) => (
                                            <button
                                                key={tier.id}
                                                onClick={() => setSelectedTier(tier)}
                                                className={`text-left p-4 rounded-xl border transition-all duration-300 ${selectedTier.id === tier.id
                                                    ? ''
                                                    : ''
                                                    }`}
                                                style={{
                                                    backgroundColor: selectedTier.id === tier.id ? 'rgba(129, 215, 180, 0.1)' : 'rgba(31, 41, 55, 0.5)',
                                                    borderColor: selectedTier.id === tier.id ? '#81D7B4' : 'rgba(55, 65, 81, 0.5)',
                                                    boxShadow: selectedTier.id === tier.id ? '0 0 0 1px #81D7B4' : 'none'
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold" style={{ color: selectedTier.id === tier.id ? '#81D7B4' : '#F9F9FB' }}>
                                                        {tier.name}
                                                    </span>
                                                    <span className="text-sm font-mono" style={{ color: '#7B8B9A' }}>${tier.price}</span>
                                                </div>
                                                <p className="text-xs leading-relaxed" style={{ color: '#7B8B9A' }}>{tier.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Referral Code */}
                                <div className="mb-8 p-4 rounded-xl border" style={{ backgroundColor: 'rgba(129, 215, 180, 0.05)', borderColor: 'rgba(129, 215, 180, 0.2)' }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium text-[#81D7B4]">Have a Referral Code?</label>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code to save on listing fees"
                                            value={referralCode}
                                            onChange={(e) => handleReferralCheck(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-lg focus:outline-none bg-gray-800 border border-gray-700 text-white"
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#81D7B4'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(55, 65, 81, 1)'}
                                        />
                                        {validatingReferral && (
                                            <div className="flex items-center gap-1 text-sm font-bold px-3" style={{ color: '#7B8B9A' }}>
                                                <div className="w-4 h-4 border-2 border-[#7B8B9A] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {!validatingReferral && isReferralValid && (
                                            <div className="flex items-center gap-1 text-sm font-bold px-3" style={{ color: '#81D7B4' }}>
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                                <span>-${selectedTier.price - selectedTier.referralPrice}</span>
                                            </div>
                                        )}
                                    </div>
                                    {!validatingReferral && isReferralValid && (
                                        <p className="text-xs mt-2" style={{ color: '#81D7B4' }}>
                                            Code applied! You pay <span className="font-bold">${selectedTier.referralPrice}</span> instead of ${selectedTier.price}.
                                        </p>
                                    )}
                                    {!validatingReferral && referralCode && !isReferralValid && (
                                        <p className="text-xs mt-2 text-red-400">
                                            Invalid referral code
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Wizard Form */}
                            <WizardForm
                                selectedTier={selectedTier}
                                referralCode={referralCode}
                                isReferralValid={isReferralValid}
                            />
                        </div>

                        {/* Sidebar / Info */}
                        <div className="space-y-6">
                            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                                <h3 className="text-lg font-bold mb-4" style={{ color: '#F9F9FB' }}>Why List on BizFi?</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm" style={{ color: '#7B8B9A' }}>Access global investors from the web3 space.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm" style={{ color: '#7B8B9A' }}>Tokenize equity or revenue streams easily.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1"><HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" /></div>
                                        <p className="text-sm" style={{ color: '#7B8B9A' }}>Automated compliance and investor management.</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6">
                                <h3 className="text-lg font-bold mb-2 text-white">Need Help?</h3>
                                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                    Not sure which tier fits you? Book a free consultancy session with our experts.
                                </p>

                                <a
                                    href="https://calendly.com/cryptosmartnow/15min"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 px-4 font-bold rounded-xl text-center transition-all bg-transparent border border-[#81D7B4] text-[#81D7B4] hover:bg-[#81D7B4] hover:text-[#0F1825]"
                                >
                                    Schedule Call
                                </a>
                                <div className="pt-3 mt-6 border-t border-[#81D7B4]/20">
                                    <p className="text-xs mb-3 text-[#7B8B9A]">Join our community for updates and support:</p>
                                    <a
                                        href="https://t.me/bitsaveprotocol"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 font-bold rounded-lg transition-all border border-[#81D7B4]/30 text-[#81D7B4] hover:bg-[#81D7B4]/10"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z" />
                                        </svg>
                                        Join Telegram
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Consultancy Modal */}
            <AnimatePresence>
                {showConsultancyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        style={{ backgroundColor: 'rgba(15, 24, 37, 0.8)' }}
                        onClick={() => setShowConsultancyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl border shadow-2xl w-full max-w-md p-6"
                            style={{ backgroundColor: 'rgba(44, 62, 93, 0.95)', borderColor: 'rgba(123, 139, 154, 0.3)' }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold" style={{ color: '#F9F9FB' }}>Book Consultancy</h2>
                                <button
                                    onClick={() => setShowConsultancyModal(false)}
                                    className="transition-colors"
                                    style={{ color: '#7B8B9A' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mb-6" style={{ color: '#7B8B9A' }}>
                                Schedule a 15-minute call with a BizFi representative to discuss your business needs and listing strategy.
                            </p>
                            {/* Mock Calendar Embed Placeholder */}
                            <div className="rounded-xl h-64 flex items-center justify-center mb-6 border" style={{ backgroundColor: 'rgba(26, 37, 56, 0.8)', borderColor: 'rgba(123, 139, 154, 0.3)' }}>
                                <p className="text-sm" style={{ color: '#7B8B9A' }}>Calendar Integration Loading...</p>
                            </div>
                            <button
                                onClick={() => setShowConsultancyModal(false)}
                                className="w-full py-3 font-bold rounded-lg transition-all border"
                                style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', color: '#F9F9FB', borderColor: 'rgba(123, 139, 154, 0.3)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.7)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(44, 62, 93, 0.5)'}
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Buy Crypto Modal */}
            <AnimatePresence>
                {showBuyCryptoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        style={{ backgroundColor: 'rgba(15, 24, 37, 0.9)' }}
                        onClick={() => setShowBuyCryptoModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl border shadow-2xl w-full max-w-lg p-8"
                            style={{ backgroundColor: 'rgba(26, 37, 56, 0.98)', borderColor: 'rgba(129, 215, 180, 0.3)' }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold" style={{ color: '#F9F9FB' }}>Get Crypto</h2>
                                <button
                                    onClick={() => setShowBuyCryptoModal(false)}
                                    className="transition-colors"
                                    style={{ color: '#7B8B9A' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="mb-8 text-base" style={{ color: '#9BA8B5' }}>
                                Choose how you'd like to get USDC to complete your business listing:
                            </p>

                            <div className="space-y-4">
                                {/* Telegram Option */}
                                <a
                                    href="https://t.me/bitsaveprotocol"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-6 rounded-xl border transition-all hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 group"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(123, 139, 154, 0.3)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-[#81D7B4]/10 group-hover:bg-[#81D7B4]/20 transition-colors">
                                            <svg className="w-6 h-6 text-[#81D7B4]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-2 text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors">
                                                Join Our Telegram
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: '#9BA8B5' }}>
                                                Get personalized help from our team. We'll guide you through buying crypto and completing your listing.
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#81D7B4]">
                                                <span>Get Help Now</span>
                                                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </a>

                                {/* Coinbase Pay Option */}
                                <button
                                    onClick={() => {
                                        setShowBuyCryptoModal(false);
                                        // Trigger Coinbase Pay from WizardForm
                                        const event = new CustomEvent('openCoinbasePay');
                                        window.dispatchEvent(event);
                                    }}
                                    className="w-full p-6 rounded-xl border transition-all hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 group text-left"
                                    style={{ backgroundColor: 'rgba(44, 62, 93, 0.5)', borderColor: 'rgba(123, 139, 154, 0.3)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-[#81D7B4]/10 group-hover:bg-[#81D7B4]/20 transition-colors">
                                            <HiOutlineCurrencyDollar className="w-6 h-6 text-[#81D7B4]" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold mb-2 text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors">
                                                Buy with Coinbase Pay
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: '#9BA8B5' }}>
                                                Purchase USDC instantly using your credit card, debit card, or bank account through Coinbase.
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#81D7B4]">
                                                <span>Buy Instantly</span>
                                                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(129, 215, 180, 0.05)', borderColor: 'rgba(129, 215, 180, 0.2)' }}>
                                <p className="text-xs leading-relaxed" style={{ color: '#9BA8B5' }}>
                                    <span className="font-semibold text-[#81D7B4]">Note:</span> You'll need USDC (on Base network) to complete your business listing. The amount depends on your selected tier.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
