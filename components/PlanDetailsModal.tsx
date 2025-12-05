import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineExclamationTriangle, HiOutlineClock } from 'react-icons/hi2';

interface PlanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any; // Type should be properly defined in a real app, using 'any' for now to match dashboard usage
    isEth: boolean; // Helper to avoid checking inside the modal if passed directly
    tokenName: string; // Helper
    goodDollarPrice?: number; // Needed for reward calc if not passed in plan
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ isOpen, onClose, plan, isEth, tokenName, goodDollarPrice = 0.00009189 }) => {
    if (!isOpen || !plan) return null;

    // Helper formats
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const calculateRewards = () => {
        const rawRewards = parseFloat(plan.currentAmount) * 0.005 * 1000;
        if (tokenName === 'Gooddollar') {
            const usdValue = parseFloat(plan.currentAmount) * goodDollarPrice;
            return (usdValue * 0.005 * 1000).toFixed(2);
        }
        return rawRewards.toFixed(2);
    };

    const formatAmount = (amount: string) => {
        const val = parseFloat(amount);
        if (isEth) return `${val.toFixed(4)} ETH`;
        if (tokenName === 'Gooddollar') return `${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} $G`;
        return `$${val.toFixed(2)} ${tokenName}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-xl font-bold text-gray-900">Plan Details</h3>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                            <HiOutlineXMark className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Title Section */}
                        <div className="text-center mb-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] text-sm font-medium">
                                {formatAmount(plan.currentAmount)} Saved
                            </div>
                        </div>

                        {/* Grid Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <HiOutlineCalendar className="w-4 h-4" /> Created
                                </div>
                                <div className="font-semibold text-gray-900">{formatDate(Number(plan.startTime || 0))}</div>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                    <HiOutlineCalendar className="w-4 h-4" /> Maturity
                                </div>
                                <div className="font-semibold text-gray-900">{formatDate(Number(plan.maturityTime || 0))}</div>
                            </div>
                        </div>

                        {/* Detailed Info List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[#81D7B4]/10 text-[#81D7B4]">
                                        <HiOutlineCurrencyDollar className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-700">Estimated Rewards</span>
                                </div>
                                <span className="font-bold text-[#81D7B4]">+{calculateRewards()} $BTS</span>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-orange-100 text-orange-500">
                                        <HiOutlineExclamationTriangle className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-700">Penalty Fee</span>
                                </div>
                                <span className="font-bold text-gray-900">{plan.penaltyPercentage}%</span>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 text-blue-500">
                                        <HiOutlineClock className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-gray-700">Duration</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {Math.ceil((Number(plan.maturityTime) - Number(plan.startTime)) / (24 * 60 * 60))} Days
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar in Details */}
                        <div className="pt-2">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-semibold text-gray-900">{Math.round(plan.progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#81D7B4]" style={{ width: `${plan.progress}%` }}></div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            Close Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PlanDetailsModal;
