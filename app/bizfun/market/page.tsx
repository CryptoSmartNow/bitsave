
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    HiOutlineRocketLaunch, 
    HiOutlineClock, 
    HiOutlineCurrencyDollar,
    HiOutlineArrowTrendingUp,
    HiOutlineUserGroup,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import Link from "next/link";
import { Exo } from "next/font/google";

const exo = Exo({ 
    subsets: ['latin'],
    variable: '--font-exo'
});

interface Market {
    _id: string;
    question: string;
    description: string;
    vibe: string;
    outcome: string; // "YES" / "NO" / "UNDECIDED"
    tradingDeadline: string;
    chainId: number;
    creator: string;
    createdAt: string;
    volume?: string;
    liquidity?: string;
}

export default function MarketPage() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const res = await fetch('/api/bizfun/markets');
                const data = await res.json();
                if (data.markets) {
                    setMarkets(data.markets);
                }
            } catch (error) {
                console.error("Failed to fetch markets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0b0c15] text-white selection:bg-[#81D7B4] selection:text-[#0b0c15]`}>
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0b0c15]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/bizfun" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0b0c15] transition-all">
                            <HiOutlineRocketLaunch className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">BizFun<span className="text-[#81D7B4]">.Market</span></span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/bizfun/agent" 
                            className="px-4 py-2 text-sm font-medium text-[#81D7B4] bg-[#81D7B4]/10 rounded-lg hover:bg-[#81D7B4] hover:text-[#0b0c15] transition-all border border-[#81D7B4]/20"
                        >
                            Create Market
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Prediction Markets <br />
                        <span className="text-[#81D7B4]">By Agents, For Agents</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Trade on the future of businesses, startups, and ideas. 
                        Markets created by BizMart Agent.
                    </p>
                </div>

                {/* Market Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-12 h-12 border-2 border-[#81D7B4] border-t-transparent rounded-full"></div>
                    </div>
                ) : markets.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                        <HiOutlineRocketLaunch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No Markets Yet</h3>
                        <p className="text-gray-500 mb-6">Be the first to create a prediction market with BizMart.</p>
                        <Link 
                            href="/bizfun/agent" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#81D7B4] text-[#0b0c15] rounded-xl font-bold hover:bg-[#6BC5A0] transition-colors"
                        >
                            Create with Agent
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {markets.map((market) => (
                            <Link href={`/bizfun/market/${market._id}`} key={market._id}>
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative bg-[#151725] border border-white/5 rounded-2xl overflow-hidden hover:border-[#81D7B4] transition-all duration-300 h-full flex flex-col hover:-translate-y-1"
                                >
                                    {/* Vibe Badge */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0b0c15] border border-[#81D7B4]/30 text-[#81D7B4]">
                                            {market.vibe || 'Experimental'}
                                        </span>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        {/* Icon */}
                                        <div className="mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4] font-bold text-xl group-hover:bg-[#81D7B4] group-hover:text-[#0b0c15] transition-colors">
                                                ?
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem] leading-tight group-hover:text-[#81D7B4] transition-colors">
                                            {market.question}
                                        </h3>
                                        
                                        <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                                            {market.description}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0b0c15] border border-white/5 mb-6 group-hover:border-[#81D7B4]/20 transition-colors">
                                            <div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Deadline</div>
                                                <div className="text-sm font-mono text-gray-300 flex items-center gap-1">
                                                    <HiOutlineClock className="w-3 h-3 text-gray-500" />
                                                    {new Date(Number(market.tradingDeadline) * 1000).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Volume</div>
                                                <div className="text-sm font-mono text-[#81D7B4] font-bold">
                                                    ${market.volume || '0'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button className="flex-1 py-3 rounded-xl bg-[#81D7B4]/10 text-[#81D7B4] font-bold text-sm border border-[#81D7B4]/20 hover:bg-[#81D7B4] hover:text-[#0b0c15] transition-all">
                                                Yes
                                            </button>
                                            <button className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                                                No
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
