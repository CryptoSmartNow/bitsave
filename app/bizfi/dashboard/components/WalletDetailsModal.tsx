"use client";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineCheckCircle, HiOutlineClipboard, HiOutlineArrowTopRightOnSquare, HiOutlineCreditCard, HiOutlineArrowPath } from "react-icons/hi2";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface WalletDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: `0x${string}` | undefined;
    logout: () => void;
}

// Base Mainnet USDC
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function WalletDetailsModal({ isOpen, onClose, address, logout }: WalletDetailsModalProps) {
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { chain } = useAccount();

    // ETH Balance
    const { data: ethBalance, refetch: refetchEth } = useBalance({
        address: address,
    });

    // USDC Balance
    const { data: usdcBalance, refetch: refetchUsdc } = useBalance({
        address: address,
        token: USDC_ADDRESS,
    });

    const handleCopy = async () => {
        if (address) {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const refreshBalances = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchEth(), refetchUsdc()]);
        setTimeout(() => setIsRefreshing(false), 1000); // Minimum spin time for visual feedback
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-sm bg-gray-900/80"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#1A2538]/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden mx-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#81D7B4] p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#1A2538] flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">Wallet Details</h3>
                                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></span>
                                    {chain?.name || 'Base Network'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
                        >
                            <HiOutlineXMark className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Address Section */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#81D7B4]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50 backdrop-blur-sm">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Connected Address</p>
                                <div className="flex flex-col gap-3">
                                    <code className="text-sm sm:text-base font-mono text-white leading-relaxed">
                                        {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : ''}
                                    </code>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-700/50 hover:bg-[#81D7B4]/10 border border-gray-600/50 hover:border-[#81D7B4]/50 text-gray-300 hover:text-[#81D7B4] transition-all font-medium text-sm group/btn"
                                    >
                                        {copied ? (
                                            <>
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                                <span>Copied to Clipboard</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineClipboard className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                <span>Copy Address</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Balances */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Your Assets</h4>
                                <button
                                    onClick={refreshBalances}
                                    disabled={isRefreshing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-800 text-xs font-medium text-[#81D7B4] hover:text-[#6BC4A0] transition-colors disabled:opacity-50"
                                >
                                    <HiOutlineArrowPath className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>

                            <div className="grid gap-3">
                                {/* ETH */}
                                <div className="group flex items-center justify-between p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#627EEA]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6 text-[#627EEA]" viewBox="0 0 32 32" fill="currentColor">
                                                <path d="M15.925 23.96l-9.819-5.796L15.925 32l9.83-13.836-9.83 5.796zM16.075 0L6.255 16.332l9.82 5.806 9.82-5.806L16.075 0zm0 20.686l-8.48-5.013 8.48-14.103 8.486 14.103-8.486 5.013z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">Base ETH</p>
                                            <p className="text-xs text-gray-400">Gas Token</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white font-mono">
                                            {ethBalance ? Number(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4) : '0.0000'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium">ETH</p>
                                    </div>
                                </div>

                                {/* USDC */}
                                <div className="group flex items-center justify-between p-4 rounded-2xl bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#2775CA]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <img src="/usdclogo.png" alt="USDC" className="w-6 h-6 object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">USDC</p>
                                            <p className="text-xs text-gray-400">Stablecoin</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white font-mono">
                                            {usdcBalance ? Number(formatUnits(usdcBalance.value, usdcBalance.decimals)).toFixed(2) : '0.00'}
                                        </p>
                                        <p className="text-xs text-gray-400 font-medium">USDC</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <a
                                href={`https://basescan.org/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gray-800/50 hover:bg-gray-700/50 text-white font-medium transition-all border border-gray-700/50 hover:border-gray-600 hover:-translate-y-0.5"
                            >
                                <div className="p-1 rounded-lg bg-gray-700/50 group-hover:bg-gray-600/50 transition-colors">
                                    <HiOutlineArrowTopRightOnSquare className="w-5 h-5 text-gray-300 group-hover:text-white" />
                                </div>
                                <span>History</span>
                            </a>
                            <button
                                onClick={() => {
                                    const event = new CustomEvent('openBuyCryptoModal');
                                    window.dispatchEvent(event);
                                    onClose();
                                }}
                                className="group flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 text-white font-medium transition-all border border-[#81D7B4]/20 hover:border-[#81D7B4]/40 hover:-translate-y-0.5 whitespace-nowrap"
                            >
                                <div className="p-1 rounded-lg bg-[#81D7B4]/20 group-hover:bg-[#81D7B4]/30 transition-colors">
                                    <HiOutlineCreditCard className="w-5 h-5 text-[#81D7B4]" />
                                </div>
                                <span>Buy Crypto</span>
                            </button>
                        </div>

                        {/* Logout */}
                        <div className="pt-2 border-t border-gray-700/30">
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full py-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-2xl transition-all text-sm font-semibold flex items-center justify-center gap-2 group"
                            >
                                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Disconnect Wallet
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
