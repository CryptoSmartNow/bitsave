import React from 'react';
import { Cancel01Icon, Calendar01Icon, Alert02Icon, Activity01Icon, BarChartIcon } from "hugeicons-react";
import { motion, AnimatePresence } from 'framer-motion';
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
  if (tokenLogo && !tokenLogo.includes('gooddollar.png')) return tokenLogo;
  if (!tokenName) return '/coin.png';
  const lower = tokenName.toLowerCase();
  if (lower === 'cusd') return '/cusd.png';
  if (lower === 'cngn') return '/cngn.png';
  if (lower === 'usdglo') return '/usdglo.png';
  if (lower === 'gooddollar' || lower === '$g' || lower === 'g$') return '/$g.png';
  if (lower === 'usdc') return '/usdclogo.png';
  if (lower === 'eth' || lower === 'ethereum') return '/eth.png';
  if (lower === 'usdt') return '/usdt.png';
  if (lower === 'celo') return '/celo.png';
  if (lower === 'bnb' || lower === 'bsc') return '/bsc.png';
  if (lower === 'lisk' || lower === 'lsk') return '/lisk.png';
  return '/coin.png';
}

const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({ 
    isOpen, 
    onClose, 
    plan, 
    isEth, 
    tokenName, 
    goodDollarPrice = 0.0001086,
    networkLogos = {} 
}) => {
    if (!isOpen || !plan) return null;

    const formatDate = (timestamp: number) => {
        if (!timestamp || Number(timestamp) === 0) return 'Pending';
        return new Date(timestamp * 1000).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const calculateRewards = () => {
        const rawAmount = parseFloat(plan.currentAmount || '0');
        if (isNaN(rawAmount)) return '0.00';
        let usdValue = rawAmount;
        if (tokenName === 'Gooddollar' || tokenName === '$G') {
            usdValue = rawAmount * goodDollarPrice;
        } else if (isEth) {
            usdValue = rawAmount * 3500;
        }
        return (usdValue * 0.005 * 1000).toFixed(0);
    };

    const formatAmount = (amount: string) => {
        const val = parseFloat(amount || '0');
        if (isNaN(val)) return '0.00';
        if (isEth) return `${val.toFixed(4)} ETH`;
        if (tokenName === 'Gooddollar' || tokenName === '$G') return `${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} $G`;
        return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${tokenName}`;
    };

    const networkLogoUrl = plan.network && networkLogos[plan.network.toLowerCase()]?.logoUrl;
    const tokenLogoUrl = isEth ? '/eth.png' : getTokenLogo(tokenName, plan.tokenLogo);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-[540px] bg-white dark:bg-[#121212] rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden border border-white dark:border-white/10"
                >
                    {/* Decorative Wavy Background */}
                    <div className="absolute top-0 left-0 right-0 h-40 bg-[#FAFCFB] dark:bg-[#1C2420] pointer-events-none overflow-hidden rounded-t-[2rem]">
                        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none" viewBox="0 0 400 260">
                            {[0,1,2,3,4].map(i => (
                                <path key={i} d={`M0 ${20 + i*32} Q100 ${0 + i*32} 200 ${20 + i*32} T400 ${20 + i*32}`} fill="none" stroke="#81D7B4" strokeWidth="2"/>
                            ))}
                        </svg>
                        <div className="absolute inset-0 bg-gradient-to-b from-[#81D7B4]/5 to-transparent"></div>
                    </div>
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 dark:bg-[#1a1a1a]/50 backdrop-blur-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white shadow-sm border border-gray-100/50 dark:border-white/10/50 transition-all z-50"
                    >
                        <Cancel01Icon className="w-4 h-4" />
                    </button>

                    {/* Horizontal Header */}
                    <div className="flex items-center justify-between p-6 pr-14 pt-8 z-20 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-[64px] h-[64px] rounded-[18px] bg-white dark:bg-[#1a1a1a] shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center p-3 relative z-10 transition-transform hover:scale-105 duration-300">
                                <Image
                                    src={tokenLogoUrl}
                                    alt={tokenName}
                                    width={40}
                                    height={40}
                                    className="object-contain drop-shadow-sm"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h2 className="text-[20px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{plan.name}</h2>
                                    <span className="bg-[#81D7B4]/10 text-[#81D7B4] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                        {plan.status === 'Completed' || (plan.maturityTime && Date.now()/1000 > Number(plan.maturityTime)) ? 'Settled' : 'Active'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-300 text-[10.5px] font-bold tracking-widest uppercase">
                                    <span>Savings Plan</span>
                                    {plan.network && (
                                        <>
                                            <span className="opacity-50">•</span>
                                            <span className="flex items-center gap-1">
                                                {networkLogoUrl && <Image src={networkLogoUrl} width={12} height={12} className="rounded-full" alt={plan.network}/>}
                                                {plan.network}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1.5">Total Value</span>
                            <span className="text-[34px] text-gray-900 dark:text-white font-instrument leading-none" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
                                {formatAmount(plan.currentAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar with Integrated Dates */}
                    <div className="px-6 relative z-20 mt-2">
                        <div className="bg-white dark:bg-[#121212] rounded-[1.5rem] p-5 border border-gray-100/80 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lock Progress</span>
                                <span className="text-[#81D7B4] font-black text-[13px]">{Math.round(plan.progress || 45)}%</span>
                            </div>
                            <div className="h-[8px] w-full bg-gray-100 dark:bg-[#1a1a1a] rounded-full overflow-hidden shadow-inner mb-4">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${plan.progress || 45}%` }}
                                    transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[#81D7B4] to-[#5FC49B] rounded-full" 
                                />
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <Calendar01Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> 
                                    <span className="text-gray-400 dark:text-gray-500">Start:</span> 
                                    <span className="text-gray-800 dark:text-gray-100">{formatDate(Number(plan.startTime || 0))}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar01Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" /> 
                                    <span className="text-gray-400 dark:text-gray-500">Maturity:</span> 
                                    <span className="text-gray-800 dark:text-gray-100">{formatDate(Number(plan.maturityTime || 0))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Stats List */}
                    <div className="px-6 pb-6 relative z-20 mt-3">
                        <div className="relative rounded-[1.5rem] border border-[#81D7B4]/20 shadow-[0_8px_32px_rgba(129,215,180,0.08)] flex flex-col overflow-hidden bg-white dark:bg-[#121212] group hover:shadow-[0_12px_40px_rgba(129,215,180,0.12)] transition-all duration-500">
                            {/* Abstract Wavy Background specifically for this card */}
                            <div className="absolute inset-0 pointer-events-none">
                                <svg className="absolute w-full h-full opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-700 ease-in-out" preserveAspectRatio="none" viewBox="0 0 400 200">
                                    <path d="M0 60 Q100 10 200 60 T400 60 L400 200 L0 200 Z" fill="#81D7B4" />
                                    <path d="M0 120 Q100 70 200 120 T400 120 L400 200 L0 200 Z" fill="#5FC49B" />
                                    <path d="M0 160 Q100 130 200 160 T400 160 L400 200 L0 200 Z" fill="#2E9E71" />
                                </svg>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/10 via-transparent to-transparent"></div>
                            </div>
                            
                            <div className="flex justify-between items-center px-6 py-4 border-b border-[#81D7B4]/10 relative z-10 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10/40 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] shadow-[0_0_8px_rgba(129,215,180,0.8)]"></div>
                                    <span className="font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest">Est. Rewards</span>
                                </div>
                                <span className="font-black text-green-500 text-[14px]">+{calculateRewards()} $BTS</span>
                            </div>
                            
                            <div className="flex justify-between items-center px-6 py-4 border-b border-[#81D7B4]/10 relative z-10 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10/40 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
                                    <span className="font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest">Penalty Fee</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-[14px]">{plan.penaltyPercentage || 5}%</span>
                            </div>
                            
                            <div className="flex justify-between items-center px-6 py-4 relative z-10 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-white/10/40 transition-colors">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                                    <span className="font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest">Total Duration</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-[14px]">
                                    {plan.maturityTime && plan.startTime && Number(plan.maturityTime) > Number(plan.startTime)
                                        ? `${Math.ceil((Number(plan.maturityTime) - Number(plan.startTime)) / (24 * 60 * 60))} Days`
                                        : '30 Days'}
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
