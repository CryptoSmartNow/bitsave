import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiOutlineXMark, 
    HiOutlineCalendar, 
    HiOutlineExclamationTriangle, 
    HiOutlineClock,
    HiOutlineChartBar,
} from 'react-icons/hi2';
import Image from 'next/image';
import { NetworkLogoData } from '@/utils/networkLogos';

interface PlanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: any;
    isEth: boolean;
    tokenName: string;
    goodDollarPrice?: number;
    networkLogos?: NetworkLogoData;
}

const getTokenLogo = (tokenName: string, tokenLogo?: string) => {
  if (tokenLogo) return tokenLogo;
  if (tokenName === 'cUSD') return '/cusd.png';
  if (tokenName === 'USDGLO') return '/usdglo.png';
  if (tokenName === 'Gooddollar' || tokenName === '$G') return '/$g.png';
  if (tokenName === 'USDC') return '/usdclogo.png';
  return `/${tokenName.toLowerCase()}.png`;
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    plan, 
    isEth, 
    tokenName, 
    goodDollarPrice = 0.00009189,
    networkLogos = {} 
}) => {
    if (!isOpen || !plan) return null;

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
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
        if (tokenName === 'Gooddollar') return `${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G`;
        return `$${val.toFixed(2)} ${tokenName}`;
    };

    const networkLogoUrl = plan.network && networkLogos[plan.network.toLowerCase()]?.logoUrl;
    const tokenLogoUrl = isEth ? '/eth.png' : getTokenLogo(tokenName, plan.tokenLogo);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_24px_50px_rgba(0,0,0,0.15)] overflow-hidden border border-gray-100/80"
                >
                    {/* Decorative Header Background matching Dashboard cards */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-[#F8FAF9] rounded-t-[2.5rem] border-b border-gray-100 pointer-events-none" />
                    <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#81D7B4]/10 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Header Actions */}
                    <div className="relative flex items-center justify-between p-6 z-10">
                        <div className="flex items-center gap-2">
                             {/* Network Badge purely aesthetic */}
                             {plan.network && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-gray-100">
                                    {networkLogoUrl && (
                                        <Image 
                                            src={networkLogoUrl} 
                                            alt={plan.network} 
                                            width={16} 
                                            height={16} 
                                            className="rounded-full"
                                        />
                                    )}
                                    <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{plan.network}</span>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition-colors"
                        >
                            <HiOutlineXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="px-8 pb-8 relative z-10 pt-2">
                        {/* Hero Section */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="relative mb-5">
                                <div className="w-24 h-24 rounded-[1.8rem] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 flex items-center justify-center p-5 transform hover:scale-105 transition-all duration-300">
                                    <Image
                                        src={tokenLogoUrl}
                                        alt={tokenName}
                                        width={56}
                                        height={56}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-[#81D7B4] text-white text-[10px] font-black px-3 py-1.5 rounded-xl border-[3px] border-white shadow-md uppercase tracking-widest">
                                    ACTIVE
                                </div>
                            </div>
                            
                            <h2 className="text-[26px] font-black text-gray-900 mb-1 tracking-tight leading-tight">{plan.name}</h2>
                            <p className="text-gray-400 text-[12px] font-bold uppercase tracking-widest mb-6">Savings Plan</p>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Portfolio Value</span>
                                <span className="text-[40px] font-black text-black tracking-tighter leading-none">
                                    {formatAmount(plan.currentAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8 bg-[#F8FAF9] p-5 rounded-3xl border border-gray-100">
                            <div className="flex justify-between items-end mb-2.5">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Lock Progress</span>
                                <span className="text-[#2D5A4A] font-black text-sm">{Math.round(plan.progress)}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-200/50 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${plan.progress}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-[#81D7B4] rounded-full shadow-[0_0_10px_rgba(129,215,180,0.5)]" 
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-4 rounded-[1.25rem] bg-white border border-gray-200 hover:border-[#81D7B4]/30 shadow-sm transition-colors text-center">
                                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                    <HiOutlineCalendar className="w-3.5 h-3.5" /> Start Date
                                </div>
                                <div className="font-black text-gray-900 text-[13px]">{formatDate(Number(plan.startTime || 0))}</div>
                            </div>
                            <div className="p-4 rounded-[1.25rem] bg-white border border-gray-200 hover:border-[#81D7B4]/30 shadow-sm transition-colors text-center">
                                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                                    <HiOutlineCalendar className="w-3.5 h-3.5" /> Maturity
                                </div>
                                <div className="font-black text-[#2D5A4A] text-[13px]">{formatDate(Number(plan.maturityTime || 0))}</div>
                            </div>
                        </div>

                        {/* Detailed Stats List */}
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between items-center p-4 rounded-[1.25rem] bg-white border border-gray-200 hover:border-[#81D7B4]/50 shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#2D5A4A] group-hover:scale-110 transition-transform">
                                        <HiOutlineChartBar className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-[13px]">Est. Rewards</span>
                                </div>
                                <span className="font-black text-[#81D7B4] text-[15px]">+{calculateRewards()} $BTS</span>
                            </div>

                            <div className="flex justify-between items-center p-4 rounded-[1.25rem] bg-white border border-gray-200 hover:border-red-200 shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                        <HiOutlineExclamationTriangle className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-[13px]">Early Penalty Fee</span>
                                </div>
                                <span className="font-black text-gray-900 text-[15px]">{plan.penaltyPercentage}%</span>
                            </div>

                            <div className="flex justify-between items-center p-4 rounded-[1.25rem] bg-white border border-gray-200 hover:border-blue-200 shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <HiOutlineClock className="w-4 h-4" strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-[13px]">Total Duration</span>
                                </div>
                                <span className="font-black text-gray-900 text-[15px]">
                                    {Math.ceil((Number(plan.maturityTime) - Number(plan.startTime)) / (24 * 60 * 60))} Days
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PlanDetailsModal;
