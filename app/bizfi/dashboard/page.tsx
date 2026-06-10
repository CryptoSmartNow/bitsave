'use client';

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import { usePrivy } from "@privy-io/react-auth";
import WizardForm from "./components/WizardForm";
import "../bizfi-colors.css";

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
    const { user, authenticated, logout: privyLogout, ready } = usePrivy();

    // Use Privy user ID or email as the primary identifier
    const address = user?.id || user?.email?.address;

    const handleLogout = async () => {
        await privyLogout();
    };

    const [mounted, setMounted] = useState(false);
    const [selectedTier, setSelectedTier] = useState(TIERS[0]);
    const [referralCode, setReferralCode] = useState('');
    const [isReferralValid, setIsReferralValid] = useState(false);
    const [showConsultancyModal, setShowConsultancyModal] = useState(false);
    const [businessCount, setBusinessCount] = useState(1000);
    const [validatingReferral, setValidatingReferral] = useState(false);

    useEffect(() => {
        setMounted(true);

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

        const loadDraft = async () => {
            if (!address) return;
            try {
                const res = await fetch(`/api/bizfi/draft?address=${address}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        const savedCode = data.referralCode || (data.formData && data.formData.referralCode);
                        if (savedCode) {
                            setReferralCode(savedCode);
                            validateReferralCode(savedCode);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to load draft:', e);
            }
        };

        if (address) {
            loadDraft();
        }
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

        if (!code || code.trim().length === 0) {
            setIsReferralValid(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            validateReferralCode(code);
            if (address) {
                fetch('/api/bizfi/draft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        formData: { referralCode: code },
                        referralCode: code,
                        step: 1
                    })
                }).catch(e => console.error('Failed to save referral code:', e));
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    };

    if (!mounted) {
        return (
            <div className="font-sans min-h-screen flex items-center justify-center bg-[#0F1825]">
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="font-sans bg-[#0F1825] min-h-screen text-[#F9F9FB]">
            <style dangerouslySetInnerHTML={{ __html: `
                @media (min-width: 1024px) {
                    html { font-size: 90% !important; }
                }
            `}} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-[#1E2F45] pb-8">
                    <div className="space-y-2">
                        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-[1.1] text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>
                            BUSINESS <span className="text-[#81D7B4]">DASHBOARD</span>
                        </h1>
                        <p className="text-base md:text-lg font-medium text-[#7B8B9A]">Manage your business listing and track performance.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-4">
                        <button
                            onClick={() => setShowConsultancyModal(true)}
                            className="px-6 py-3 font-bold text-sm tracking-wide uppercase bg-[#0D1724] border border-[#81D7B4] text-[#81D7B4] hover:bg-[#81D7B4] hover:text-[#0F1825] transition-all"
                        >
                            BOOK CONSULTANCY
                        </button>
                        {authenticated && address && (
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-3 bg-[#0D1724] border border-[#1E2F45] text-xs font-bold text-gray-300 uppercase tracking-widest">
                                    {user?.email?.address || 'AUTHENTICATED'}
                                </span>
                                <button
                                    onClick={() => handleLogout()}
                                    className="px-4 py-3 bg-transparent text-[#7B8B9A] hover:text-red-400 font-bold text-sm tracking-wide uppercase transition-colors"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="inline-block px-6 py-4 bg-[#0D1724] border border-[#1E2F45]">
                        <p className="text-sm md:text-base font-medium tracking-wide uppercase text-[#7B8B9A]">
                            <span className="text-[#81D7B4] font-bold text-lg mr-2">{(1000 + businessCount).toLocaleString()}</span> 
                            REAL WORLD BUSINESSES LISTED ONCHAIN
                        </p>
                    </div>
                </motion.div>

                {!authenticated ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="bg-[#0D1724] border border-[#1E2F45] p-12 max-w-xl w-full text-center">
                            <h2 className="text-[32px] font-extrabold mb-4 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>ACCESS BIZFI</h2>
                            <p className="mb-10 text-[#7B8B9A] leading-relaxed">
                                Log in with your email or social accounts to list your business and access the dashboard features.
                            </p>
                            <div className="flex justify-center w-full">
                                <BizFiAuthButton className="w-full" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-[#0D1724] border border-[#1E2F45] p-8 md:p-10">
                                <div className="mb-8">
                                    <h2 className="text-[32px] font-extrabold tracking-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>LIST YOUR BUSINESS</h2>
                                    <p className="text-[#7B8B9A]">Fill the form to bring your business onchain, raise capital, and expand globally.</p>
                                </div>

                                <div className="mb-10">
                                    <label className="block text-xs font-bold tracking-widest uppercase mb-4 text-[#7B8B9A]">SELECT YOUR BUSINESS TIER</label>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {TIERS.map((tier) => (
                                            <button
                                                key={tier.id}
                                                onClick={() => setSelectedTier(tier)}
                                                className={`text-left p-6 border transition-all duration-300 ${selectedTier.id === tier.id
                                                    ? 'bg-[#1E2F45]/30 border-[#81D7B4]'
                                                    : 'bg-[#080E18] border-[#1E2F45] hover:border-[#7B8B9A]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="font-bold text-lg tracking-wide uppercase" style={{ color: selectedTier.id === tier.id ? '#81D7B4' : '#F9F9FB', fontFamily: "var(--font-display)" }}>
                                                        {tier.name}
                                                    </span>
                                                    <span className="text-lg font-mono font-bold text-[#F9F9FB]">${tier.price}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-[#7B8B9A]">{tier.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-12 p-6 bg-[#080E18] border border-[#1E2F45]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                        <label className="text-sm font-bold tracking-wide uppercase text-[#81D7B4]">
                                            HAVE A REFERRAL CODE?
                                        </label>
                                        <span className="inline-block px-3 py-1 text-xs font-bold bg-[#81D7B4]/10 text-[#81D7B4] uppercase tracking-widest">
                                            SAVE UP TO 40%
                                        </span>
                                    </div>
                                    <p className="text-sm mb-4 text-[#7B8B9A]">
                                        Don't have one?{' '}
                                        <Link href="/dashboard/referrals" className="text-[#81D7B4] hover:underline font-bold uppercase tracking-wide">
                                            GET ONE HERE
                                        </Link>
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="ENTER CODE"
                                            value={referralCode}
                                            onChange={(e) => handleReferralCheck(e.target.value)}
                                            className="flex-1 px-4 py-3 bg-[#0D1724] border border-[#1E2F45] text-white focus:border-[#81D7B4] focus:outline-none font-mono uppercase"
                                        />
                                        {validatingReferral && (
                                            <div className="flex items-center gap-2 px-4 text-[#7B8B9A] uppercase tracking-widest text-xs font-bold">
                                                VALIDATING...
                                            </div>
                                        )}
                                        {!validatingReferral && isReferralValid && (
                                            <div className="flex items-center gap-2 px-4 text-[#81D7B4] font-bold text-lg font-mono">
                                                -${selectedTier.price - selectedTier.referralPrice}
                                            </div>
                                        )}
                                    </div>
                                    {!validatingReferral && isReferralValid && (
                                        <p className="text-sm mt-4 text-[#81D7B4] font-bold tracking-wide">
                                            CODE APPLIED! YOU PAY ${selectedTier.referralPrice} INSTEAD OF ${selectedTier.price}.
                                        </p>
                                    )}
                                    {!validatingReferral && referralCode && !isReferralValid && (
                                        <p className="text-sm mt-4 text-[#FF6B6B] font-bold tracking-wide uppercase">
                                            INVALID REFERRAL CODE
                                        </p>
                                    )}
                                </div>
                                
                                <WizardForm
                                    selectedTier={selectedTier}
                                    referralCode={referralCode}
                                    isReferralValid={isReferralValid}
                                    address={address}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-[#0D1724] border border-[#1E2F45] p-8">
                                <h3 className="text-lg font-bold mb-6 tracking-wide uppercase text-[#F9F9FB]">WHY LIST ON BIZFI?</h3>
                                <div className="space-y-6">
                                    <div className="border-l-2 border-[#81D7B4] pl-4">
                                        <h4 className="font-bold text-[#F9F9FB] mb-1">GLOBAL ACCESS</h4>
                                        <p className="text-sm text-[#7B8B9A]">Connect with investors from the web3 space.</p>
                                    </div>
                                    <div className="border-l-2 border-[#81D7B4] pl-4">
                                        <h4 className="font-bold text-[#F9F9FB] mb-1">EASY TOKENIZATION</h4>
                                        <p className="text-sm text-[#7B8B9A]">Tokenize equity or revenue streams seamlessly.</p>
                                    </div>
                                    <div className="border-l-2 border-[#81D7B4] pl-4">
                                        <h4 className="font-bold text-[#F9F9FB] mb-1">AUTOMATED COMPLIANCE</h4>
                                        <p className="text-sm text-[#7B8B9A]">Built-in investor management and compliance.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0D1724] border border-[#1E2F45] p-8">
                                <h3 className="text-lg font-bold mb-4 tracking-wide uppercase text-[#F9F9FB]">NEED HELP?</h3>
                                <p className="text-sm text-[#7B8B9A] mb-8 leading-relaxed">
                                    Not sure which tier fits you? Book a free consultancy session with our experts.
                                </p>
                                <a
                                    href="https://calendly.com/cryptosmartnow/15min"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-4 font-bold text-sm tracking-wide uppercase text-center border border-[#81D7B4] text-[#81D7B4] hover:bg-[#81D7B4] hover:text-[#0F1825] transition-all"
                                >
                                    SCHEDULE CALL
                                </a>
                                <div className="pt-8 mt-8 border-t border-[#1E2F45]">
                                    <p className="text-xs font-bold tracking-widest uppercase mb-4 text-[#7B8B9A]">COMMUNITY SUPPORT</p>
                                    <div className="space-y-3">
                                        <a
                                            href="https://t.me/bitsaveprotocol"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3 font-bold text-sm tracking-wide uppercase text-center bg-[#080E18] text-[#F9F9FB] hover:bg-[#1E2F45] transition-colors"
                                        >
                                            JOIN TELEGRAM
                                        </a>
                                        <a
                                            href="https://whatsapp.com/biz/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-3 font-bold text-sm tracking-wide uppercase text-center bg-[#080E18] text-[#F9F9FB] hover:bg-[#1E2F45] transition-colors"
                                        >
                                            WHATSAPP SUPPORT
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showConsultancyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        style={{ backgroundColor: 'rgba(15, 24, 37, 0.9)' }}
                        onClick={() => setShowConsultancyModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0D1724] border border-[#1E2F45] w-full max-w-md p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold tracking-wide uppercase text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>BOOK CONSULTANCY</h2>
                                <button
                                    onClick={() => setShowConsultancyModal(false)}
                                    className="text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors text-sm font-bold tracking-widest uppercase"
                                >
                                    CLOSE
                                </button>
                            </div>
                            <p className="mb-8 text-[#7B8B9A] leading-relaxed">
                                Schedule a 15-minute call with a BizFi representative to discuss your business needs and listing strategy.
                            </p>
                            <div className="h-64 flex items-center justify-center mb-8 bg-[#080E18] border border-[#1E2F45]">
                                <p className="text-sm font-bold tracking-widest uppercase text-[#7B8B9A]">CALENDAR LOADING...</p>
                            </div>
                            <button
                                onClick={() => setShowConsultancyModal(false)}
                                className="w-full py-4 font-bold text-sm tracking-wide uppercase bg-[#1E2F45] text-[#F9F9FB] hover:bg-[#2A3F5C] transition-colors"
                            >
                                CANCEL
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
