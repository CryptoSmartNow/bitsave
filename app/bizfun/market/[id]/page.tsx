"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Exo } from "next/font/google";
import { 
    HiOutlineRocketLaunch, 
    HiOutlineClock, 
    HiOutlineCurrencyDollar,
    HiOutlineArrowTrendingUp,
    HiOutlineUserGroup,
    HiOutlineChatBubbleLeftRight,
    HiOutlineArrowLeft,
    HiOutlineShare,
    HiOutlineShieldCheck,
    HiOutlineExclamationCircle
} from "react-icons/hi2";
import { useAccount } from "wagmi";
import { BizFiAuthButton } from "@/components/BizFiAuth";

const exo = Exo({ 
    subsets: ['latin'],
    variable: '--font-exo'
});

interface Market {
    _id: string;
    question: string;
    description: string;
    vibe: string;
    outcome: string;
    tradingDeadline: string;
    chainId: number;
    creator: string;
    createdAt: string;
    volume?: string;
    liquidity?: string;
    resolutionCriteria?: string;
}

interface Comment {
    id: string;
    user: string;
    text: string;
    timestamp: Date;
    sentiment: 'bullish' | 'bearish' | 'neutral';
}

export default function MarketDetailPage() {
    const { id } = useParams();
    const { isConnected, address } = useAccount();
    const [market, setMarket] = useState<Market | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'trade' | 'forum' | 'details'>('trade');
    
    // Forum Data
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchMarketData = async () => {
            if (!id) return;
            try {
                // Fetch market
                const res = await fetch(`/api/bizfun/markets/${id}`);
                const data = await res.json();
                if (data.market) {
                    setMarket(data.market);
                }

                // Fetch comments
                const commentsRes = await fetch(`/api/bizfun/markets/${id}/comments`);
                const commentsData = await commentsRes.json();
                if (commentsData.comments) {
                    const formattedComments = commentsData.comments.map((c: any) => ({
                        ...c,
                        id: c._id,
                        timestamp: new Date(c.timestamp)
                    }));
                    setComments(formattedComments);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarketData();
    }, [id]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !id) return;
        
        try {
            const res = await fetch(`/api/bizfun/markets/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Anonymous',
                    text: newComment,
                    sentiment: 'neutral'
                })
            });
            
            const data = await res.json();
            
            if (data.success && data.comment) {
                const newCommentObj = {
                    ...data.comment,
                    id: data.comment._id,
                    timestamp: new Date(data.comment.timestamp)
                };
                setComments([newCommentObj, ...comments]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    if (loading) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0b0c15] flex items-center justify-center`}>
                <div className="animate-spin w-12 h-12 border-2 border-[#81D7B4] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!market) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0b0c15] flex flex-col items-center justify-center text-white`}>
                <h1 className="text-2xl font-bold mb-4">Market Not Found</h1>
                <Link href="/bizfun/market" className="text-[#81D7B4] hover:underline">Back to Markets</Link>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans min-h-screen bg-[#0b0c15] text-white selection:bg-[#81D7B4] selection:text-[#0b0c15]`}>
            {/* Header */}
            <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0b0c15]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/bizfun/market" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <HiOutlineArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-[#81D7B4] transition-colors">
                            <HiOutlineShare className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Market Header */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20">
                                    {market.vibe || 'Experimental'}
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                    <HiOutlineClock className="w-4 h-4" />
                                    Ends {new Date(Number(market.tradingDeadline) * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                                {market.question}
                            </h1>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
                                        {market.creator.slice(2, 4)}
                                    </div>
                                    <span>Created by <span className="text-white font-mono">{market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span></span>
                                </div>
                                <div className="h-4 w-px bg-white/10"></div>
                                <div className="flex items-center gap-1 text-[#81D7B4]">
                                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                                    <span>${market.volume || '0'} Vol</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area (Placeholder) */}
                        <div className="h-[400px] w-full bg-[#151725] rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                            <HiOutlineArrowTrendingUp className="w-24 h-24 text-white/5 mb-4 group-hover:text-[#81D7B4]/20 transition-colors duration-500" />
                            <p className="text-gray-500 font-mono text-sm">Market Activity Chart</p>
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#81D7B4]/5 to-transparent"></div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-8 border-b border-white/5">
                            {(['trade', 'forum', 'details'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all relative ${
                                        activeTab === tab ? 'text-[#81D7B4]' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#81D7B4]"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px]">
                            {activeTab === 'trade' && (
                                <div className="bg-[#151725] rounded-2xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold mb-4">Order Book</h3>
                                    <div className="text-center py-12 text-gray-500">
                                        Trading is currently handled by AI Agents on-chain.
                                        <br />
                                        <span className="text-xs mt-2 block">Order book visualization coming soon.</span>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'forum' && (
                                <div className="space-y-6">
                                    {/* Comment Input */}
                                    <div className="bg-[#151725] rounded-2xl p-4 border border-white/5">
                                        {!isConnected ? (
                                            <div className="text-center py-4">
                                                <p className="text-gray-400 mb-4">Connect wallet to join the discussion</p>
                                                <BizFiAuthButton />
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Share your analysis..."
                                                    className="w-full bg-[#0b0c15] border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] transition-all resize-none h-32"
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={handlePostComment}
                                                        disabled={!newComment.trim()}
                                                        className="px-6 py-2 bg-[#81D7B4] text-[#0b0c15] font-bold rounded-lg hover:bg-[#6BC5A0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        Post Comment
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-[#151725] rounded-2xl p-6 border border-white/5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-mono">
                                                            {comment.user.slice(0,2)}
                                                        </div>
                                                        <span className="font-bold text-sm text-gray-300">{comment.user}</span>
                                                        <span className="text-xs text-gray-600">
                                                            {comment.timestamp.toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {comment.sentiment !== 'neutral' && (
                                                        <span className={`text-xs px-2 py-1 rounded-full border ${
                                                            comment.sentiment === 'bullish' 
                                                                ? 'border-green-500/30 text-green-400 bg-green-500/10' 
                                                                : 'border-red-500/30 text-red-400 bg-red-500/10'
                                                        }`}>
                                                            {comment.sentiment.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'details' && (
                                <div className="bg-[#151725] rounded-2xl p-6 border border-white/5 space-y-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {market.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Resolution Criteria</h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {market.resolutionCriteria || "This market will resolve based on the official outcome reported by the designated oracle or resolution source. The specific metrics and data points will be verified on-chain."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trade Panel */}
                        <div className="bg-[#151725] rounded-2xl p-6 border border-white/5 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <HiOutlineCurrencyDollar className="text-[#81D7B4]" />
                                Trade
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0b0c15] border border-green-500/30 hover:bg-green-500/10 transition-all group">
                                    <span className="text-green-400 font-bold text-xl mb-1 group-hover:scale-110 transition-transform">YES</span>
                                    <span className="text-xs text-gray-500">$0.50</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#0b0c15] border border-red-500/30 hover:bg-red-500/10 transition-all group">
                                    <span className="text-red-400 font-bold text-xl mb-1 group-hover:scale-110 transition-transform">NO</span>
                                    <span className="text-xs text-gray-500">$0.50</span>
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Your Balance</span>
                                    <span className="text-white font-mono">0.00 USDC</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Max Buy</span>
                                    <span className="text-white font-mono">0.00 Shares</span>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-[#81D7B4] text-[#0b0c15] font-bold rounded-xl hover:bg-[#6BC5A0] transition-colors shadow-lg shadow-[#81D7B4]/20">
                                Place Order
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Trading fees: 1% (LP) + 0.1% (Platform)
                            </p>
                        </div>

                        {/* Market Info */}
                        <div className="bg-[#151725] rounded-2xl p-6 border border-white/5">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Market Info</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Liquidity</span>
                                    <span className="text-white font-mono">${market.liquidity || '1,000'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Volume 24h</span>
                                    <span className="text-white font-mono">${market.volume || '0'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Holders</span>
                                    <span className="text-white font-mono">12</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
