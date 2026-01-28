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
        if (tokenName === 'Gooddollar') return `${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G`;
        return `$${val.toFixed(2)} ${tokenName}`;
    };

    const networkLogoUrl = plan.network && networkLogos[plan.network.toLowerCase()]?.logoUrl;
    const tokenLogoUrl = isEth ? '/eth.png' : getTokenLogo(tokenName, plan.tokenLogo);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Decorative Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#81D7B4]/10 to-transparent pointer-events-none" />
                    
                    {/* Header Actions */}
                    <div className="relative flex items-center justify-between p-4 z-10">
                        <div className="flex items-center gap-2">
                             {/* Network Badge */}
                             {plan.network && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100/80 backdrop-blur-sm border border-gray-200/50">
                                    {networkLogoUrl && (
                                        <Image 
                                            src={networkLogoUrl} 
                                            alt={plan.network} 
                                            width={14} 
                                            height={14} 
                                            className="rounded-full"
                                        />
                                    )}
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{plan.network}</span>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HiOutlineXMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="px-6 pb-6 relative z-10">
                        {/* Hero Section */}
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="relative mb-3">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-gray-100 flex items-center justify-center p-3 border border-gray-50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <Image
                                        src={tokenLogoUrl}
                                        alt={tokenName}
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#81D7B4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                    ACTIVE
                                </div>
                            </div>
                            
                            <h2 className="text-xl font-bold text-gray-900 mb-0.5 tracking-tight">{plan.name}</h2>
                            <p className="text-gray-400 text-xs font-medium mb-3">Savings Plan</p>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Total Saved</span>
                                <span className="text-3xl font-extrabold text-[#81D7B4] tracking-tight">
                                    {formatAmount(plan.currentAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                                <span>Progress</span>
                                <span className="text-[#81D7B4]">{Math.round(plan.progress)}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-[2px]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${plan.progress}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-full bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0] rounded-full shadow-[0_0_10px_rgba(129,215,180,0.3)]" 
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/80 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                    <HiOutlineCalendar className="w-3 h-3" /> Start Date
                                </div>
                                <div className="font-bold text-gray-900 text-xs">{formatDate(Number(plan.startTime || 0))}</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100/80 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                    <HiOutlineCalendar className="w-3 h-3" /> Maturity
                                </div>
                                <div className="font-bold text-gray-900 text-xs">{formatDate(Number(plan.maturityTime || 0))}</div>
                            </div>
                        </div>

                        {/* Detailed Stats List */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2.5 rounded-xl border border-gray-100 hover:border-[#81D7B4]/30 hover:bg-[#81D7B4]/5 transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:scale-110 transition-transform">
                                        <HiOutlineChartBar className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold text-gray-600 text-xs">Est. Rewards</span>
                                </div>
                                <span className="font-bold text-[#81D7B4] text-sm">+{calculateRewards()} $BTS</span>
                            </div>

                            <div className="flex justify-between items-center p-2.5 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                        <HiOutlineExclamationTriangle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold text-gray-600 text-xs">Penalty Fee</span>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{plan.penaltyPercentage}%</span>
                            </div>

                            <div className="flex justify-between items-center p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <HiOutlineClock className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-semibold text-gray-600 text-xs">Duration</span>
                                </div>
                                <span className="font-bold text-gray-900 text-sm">
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