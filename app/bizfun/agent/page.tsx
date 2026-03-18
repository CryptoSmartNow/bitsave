"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import { HiOutlineArrowLeft, HiOutlineGift } from "react-icons/hi2";
import LanguageSelector from "@/components/LanguageSelector";
import { Exo } from "next/font/google";
import Link from "next/link";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

import { MarketWizard } from "@/components/MarketWizard";

const BizMartLink = () => (
    <span className="font-bold text-[#81D7B4]">
        $BizMart
    </span>
);

import { HiOutlinePresentationChartLine, HiOutlineUsers } from "react-icons/hi2";

const RecentMarkets = ({ walletAddress }: { walletAddress?: string }) => {
    const [markets, setMarkets] = useState<any[]>([]);
    const [userMarkets, setUserMarkets] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'mine' | 'all'>('mine');

    useEffect(() => {
        fetch('/api/bizfun/markets')
            .then(res => res.json())
            .then(data => {
                if (data.markets) setMarkets(data.markets.slice(0, 3));
            })
            .catch(console.error);

        if (walletAddress) {
            fetch(`/api/bizfun/markets?creator=${walletAddress}`)
                .then(res => res.json())
                .then(data => {
                    if (data.markets) setUserMarkets(data.markets.slice(0, 3));
                })
                .catch(console.error);
        }
    }, [walletAddress]);

    const getMarketName = (m: any) => {
        if (m.data?.predictionQuestion) return m.data.predictionQuestion;
        if (m.question) {
            if (m.question.startsWith('ipfs://')) return "Untitled Market";
            if (m.question.startsWith('Create Market: ipfs://')) return "Untitled Market";
            return m.question;
        }
        return "Untitled Market";
    };

    const displayMarkets = activeTab === 'all' ? markets : userMarkets;
    const showEmptyState = activeTab === 'mine' && userMarkets.length === 0;

    if (markets.length === 0 && userMarkets.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-20 px-4 md:px-0">
            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <button
                    onClick={() => setActiveTab('mine')}
                    className={`text-lg font-bold flex items-center gap-2 transition-colors relative pb-1 ${activeTab === 'mine' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <HiOutlineUsers className={`w-5 h-5 ${activeTab === 'mine' ? 'text-[#81D7B4]' : 'text-gray-500'}`} />
                    My Predictions
                    {activeTab === 'mine' && <div className="absolute bottom-[-17px] left-0 w-full h-0.5 bg-[#81D7B4]"></div>}
                </button>
                <div className="w-px h-5 bg-white/10 mx-2"></div>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`text-lg font-bold flex items-center gap-2 transition-colors relative pb-1 ${activeTab === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <HiOutlinePresentationChartLine className={`w-5 h-5 ${activeTab === 'all' ? 'text-[#81D7B4]' : 'text-gray-500'}`} />
                    All Markets
                    {activeTab === 'all' && <div className="absolute bottom-[-17px] left-0 w-full h-0.5 bg-[#81D7B4]"></div>}
                </button>
            </div>

            {showEmptyState ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                    <HiOutlinePresentationChartLine className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No Predictions Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first prediction market above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {displayMarkets.map((m) => (
                        <Link href={`/bizfun/market/${m._id}`} key={m._id} className="block group">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#81D7B4]/50 transition-all h-full flex flex-col hover:bg-white/10">
                                <h3 className="font-bold text-white group-hover:text-[#81D7B4] transition-colors line-clamp-2 mb-3 text-lg">
                                    {getMarketName(m)}
                                </h3>
                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse" />
                                        <span>Active Market</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Volume</span>
                                            <span className="text-sm font-mono text-white">${m.volume || '0'}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Liquidity</span>
                                            <span className="text-sm font-mono text-white">${m.liquidity || '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};



export default function AgentPage() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { user, authenticated, ready } = usePrivy();

    const activeAddress = isConnected ? address : (ready && authenticated ? user?.wallet?.address : undefined);

    return (
        <div className={`${exo.variable} font-[family-name:var(--font-exo)] min-h-screen text-white bg-[#0b0c15] selection:bg-[#81D7B4]/30 selection:text-white overflow-hidden flex flex-col`}>
            {/* Header */}
            <header className="shrink-0 bg-[#0b0c15]/80 backdrop-blur-xl border-b border-white/5 py-4 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <Link href="/bizfun" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/50 flex items-center justify-center text-[#81D7B4] shadow-[0_0_15px_rgba(129,215,180,0.3)] transition-transform group-hover:scale-105">
                                    <HiOutlineGift className="w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white font-mono">BizFun</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:block">
                            <LanguageSelector />
                        </div>

                        <Link
                            href="/bizfun"
                            className="text-sm font-medium text-gray-400 hover:text-[#81D7B4] transition-colors flex items-center gap-2 mr-4"
                        >
                            <HiOutlineArrowLeft className="w-4 h-4" />
                            Go to market
                        </Link>

                        <BizFiAuthButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center relative">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#81D7B4]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
                </div>

                <div className="relative z-10 w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Create Prediction</h1>
                        <p className="text-gray-400">Tokenize business metrics and ideas into predictions with <BizMartLink />.</p>
                    </motion.div>

                    {activeAddress ? (
                        <MarketWizard walletAddress={activeAddress} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-white/5 border border-white/10 rounded-xl max-w-2xl mx-auto backdrop-blur-xl">
                            <p className="text-gray-400 mb-4 text-lg">Connect your wallet to start creating prediction markets</p>
                            <BizFiAuthButton />
                        </div>
                    )}

                    <RecentMarkets walletAddress={activeAddress} />
                </div>
            </main>
        </div>
    );
}
