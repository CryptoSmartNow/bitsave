"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineCurrencyDollar, HiOutlineArrowsRightLeft, HiOutlineLink, HiOutlineBanknotes } from 'react-icons/hi2';
import { usePaymentSession, PaymentModal as ChainrailsModal } from "@chainrails/react";

interface FiatRampModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress?: string;
    defaultMode?: 'ONRAMP' | 'OFFRAMP';
    theme?: 'light' | 'dark';
}

type ProviderChoice = 'CHAINRAILS' | 'DEXPAY' | null;

export default function FiatRampModal({
    isOpen,
    onClose,
    walletAddress,
    defaultMode = 'ONRAMP',
    theme = 'dark'
}: FiatRampModalProps) {
    const [providerChoice, setProviderChoice] = useState<ProviderChoice>(null);
    const [mode, setMode] = useState<'ONRAMP' | 'OFFRAMP'>(defaultMode);

    const isLight = theme === 'light';

    // -- Chainrails Setup -- //
    const [crSession, setCrSession] = useState('');

    useEffect(() => {
        if (!walletAddress) return;
        const fetchSession = async () => {
            try {
                const res = await fetch(`/api/chainrails/session?recipient=${walletAddress}`);
                const data = await res.json();
                if (data && typeof data === 'string') {
                    setCrSession(data);
                } else if (data && data.token) {
                    setCrSession(data.token);
                } else if (data && data.session_token) {
                    setCrSession(data.session_token);
                }
            } catch (e) {
                console.error("Failed to fetch CR session", e);
            }
        };
        fetchSession();
    }, [walletAddress]);

    const cr = usePaymentSession({
        session_url: crSession,
        onSuccess: () => {
            console.log("Chainrails Payment Successful");
        }
    });

    const handleSelectProvider = (provider: ProviderChoice) => {
        setProviderChoice(provider);
        if (provider === 'CHAINRAILS') {
            cr.open();
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setProviderChoice(null);
            setMode(defaultMode);
        }
    }, [isOpen, defaultMode]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                {providerChoice === 'CHAINRAILS' && <ChainrailsModal {...cr} />}

                {(!providerChoice || providerChoice === 'DEXPAY') && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className={`rounded-2xl w-full max-w-md overflow-hidden border shadow-2xl ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#0B1218] border-white/10 text-white'}`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between p-6 border-b ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#111A22] border-white/5'}`}>
                            <h2 className={`text-xl font-bold flex items-center gap-2 border-b-0 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                <HiOutlineArrowsRightLeft className={`w-5 h-5 ${isLight ? 'text-green-600' : 'text-[#81D7B4]'}`} />
                                Fiat Bridge
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors border-0 ${isLight ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-200' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Provider Selection */}
                        {!providerChoice && (
                            <div className="p-6 space-y-6">
                                <div className="text-center mb-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>Choose a Provider</h3>
                                    <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Select how you would like to {mode === 'ONRAMP' ? 'buy' : 'sell'} USDC.</p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleSelectProvider('CHAINRAILS')}
                                        className={`w-full relative group overflow-hidden rounded-xl border p-4 text-left transition-all focus:outline-none ${isLight ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'bg-[#16202A] border-white/10 hover:bg-[#1A2634] hover:shadow-[0_0_20px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/50'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out ${isLight ? 'via-green-500/5' : 'via-[#81D7B4]/5'}`} />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center text-xl shadow-inner ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/40 border-white/5 text-white'}`}>
                                                <HiOutlineLink className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className={`text-base font-bold transition-colors ${isLight ? 'text-gray-900 group-hover:text-green-600' : 'text-white group-hover:text-[#81D7B4]'}`}>Chainrails</h4>
                                                <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Cross-chain swaps & direct card payments.</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleSelectProvider('DEXPAY')}
                                        className={`w-full relative group overflow-hidden rounded-xl border p-4 text-left transition-all focus:outline-none ${isLight ? 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]' : 'bg-[#16202A] border-white/10 hover:bg-[#1A2634] hover:border-[#F2A900]/50 hover:shadow-[0_0_20px_rgba(242,169,0,0.15)]'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out ${isLight ? 'via-yellow-500/5' : 'via-[#F2A900]/5'}`} />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center text-xl shadow-inner ${isLight ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/40 border-white/5 text-white'}`}>
                                                <HiOutlineBanknotes className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className={`text-base font-bold transition-colors ${isLight ? 'text-gray-900 group-hover:text-yellow-600' : 'text-white group-hover:text-[#F2A900]'}`}>DexPay (B2B)</h4>
                                                <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Direct Bank (Fiat) to Stablecoin Settlement.</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {providerChoice === 'DEXPAY' && (
                            <div className="p-6 relative z-10">
                                <div className="text-center mb-6">
                                    <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>DexPay Checkout</h3>
                                    <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Specify amount to {mode === 'ONRAMP' ? 'buy' : 'sell'}.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl border space-y-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#16202A] border-white/5'}`}>
                                        <div>
                                            <label className={`block text-xs mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Amount (Local Fiat)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="100.00"
                                                    className={`w-full border rounded-lg py-2 pl-8 pr-4 focus:outline-none focus:border-[#F2A900] transition-colors ${isLight ? 'bg-white border-gray-200 text-gray-900 placeholder-gray-400' : 'bg-[#0B1218] border-white/10 text-white placeholder-gray-600'}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center px-1 text-sm">
                                            <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>Est. Received (USDC)</span>
                                            <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>~ 0.00</span>
                                        </div>
                                    </div>

                                    <button
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F2A900] to-[#e69f00] text-[#0B1218] font-bold shadow-lg hover:shadow-[#F2A900]/30 transition-all hover:-translate-y-0.5"
                                    >
                                        Get Quote & Proceed
                                    </button>

                                    <button
                                        onClick={() => setProviderChoice(null)}
                                        className={`w-full py-3 rounded-lg bg-transparent border-0 hover:underline transition-colors font-medium text-sm ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Back to Providers
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
