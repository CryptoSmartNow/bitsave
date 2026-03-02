'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiOutlineUsers, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAccount } from 'wagmi';

interface SharePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
    networkName: string;
    contractAddress?: string;
    chainId?: number;
}

export default function SharePlanModal({
    isOpen,
    onClose,
    planName,
    networkName,
    contractAddress,
    chainId
}: SharePlanModalProps) {
    const { address } = useAccount();
    const [savvyNameInput, setSavvyNameInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        if (!savvyNameInput.trim()) {
            return toast.error("Please enter a Savvy Name");
        }

        // Block raw wallet addresses (simple regex for EVM addresses)
        if (/^0x[a-fA-F0-9]{40}$/.test(savvyNameInput.trim())) {
            return toast.error("Please enter a user's Savvy Name, not their raw wallet address");
        }

        // Allowed pattern checks
        const savvyNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        const cleanedInput = savvyNameInput.trim().replace('@', '');

        if (!savvyNameRegex.test(cleanedInput)) {
            return toast.error("Invalid Savvy Name format. Only letters, numbers, and underscores are allowed.");
        }

        setIsSearching(true);

        try {
            // 1. Check if user exists securely
            const lookupRes = await fetch(`/api/users/lookup?savvyName=${cleanedInput}`);
            const lookupData = await lookupRes.json();

            if (!lookupRes.ok || !lookupData.exists) {
                setIsSearching(false);
                return toast.error(`A user with the Savvy Name @${cleanedInput} could not be found.`);
            }

            setIsSearching(false);
            setIsSharing(true);

            // 2. Share the plan
            const shareRes = await fetch('/api/savings/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerAddress: address,
                    savingName: planName,
                    sharedWithSavvyName: lookupData.savvyName, // use exact cased name from db
                    network: networkName,
                    contractAddress,
                    chainId
                })
            });

            const shareData = await shareRes.json();

            if (shareRes.ok && shareData.success) {
                toast.success(`Successfully added @${lookupData.savvyName} to this plan!`);
                setSavvyNameInput('');
                onClose();
            } else {
                toast.error(shareData.error || 'Failed to share plan');
            }

        } catch (error) {
            console.error('Share plan error:', error);
            toast.error('An unexpected error occurred. Please try again.');
            setIsSearching(false);
        } finally {
            setIsSharing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#81D7B4]/10 to-[#6BC5A0]/10 px-6 py-5 border-b border-[#81D7B4]/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm border border-[#81D7B4]/20 text-[#81D7B4]">
                                <HiOutlineUsers className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Add to Plan</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 bg-white/50 hover:bg-white rounded-full p-1.5 transition-colors"
                        >
                            <HiXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Add someone to the <span className="font-bold text-gray-900">"{planName}"</span> savings plan using their Savvy Name. They will be able to view its progress on their dashboard.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Savvy Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <span className="font-bold">@</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={savvyNameInput}
                                        onChange={(e) => setSavvyNameInput(e.target.value)}
                                        placeholder="username"
                                        className="w-full bg-gray-50 border border-gray-200 focus:border-[#81D7B4] focus:ring-4 focus:ring-[#81D7B4]/10 rounded-xl pl-9 pr-4 py-3 sm:py-4 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleShare()}
                                    />
                                    {isSearching && (
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                            <div className="w-4 h-4 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <HiOutlineMagnifyingGlass className="w-3 h-3" />
                                    Only exact Savvy Names can be added securely
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 sm:py-4 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isSearching || isSharing || !savvyNameInput.trim()}
                                className="flex-[2] px-4 py-3 sm:py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#81D7B4] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSharing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Adding...
                                    </>
                                ) : (
                                    'Add to Plan'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
