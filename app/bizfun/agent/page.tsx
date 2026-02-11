"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import {
    HiOutlineArrowLeft,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineCommandLine,
    HiOutlinePaperAirplane,
    HiOutlineGift,
    HiCheck,
    HiOutlinePresentationChartLine,
    HiOutlineUsers
} from "react-icons/hi2";
import { GiCrabClaw, GiRobotGrab } from "react-icons/gi";
import { Exo } from "next/font/google";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

import { marked } from 'marked';
import { MarketProposalCard } from "@/components/MarketProposalCard";

// ... existing imports ...

// Helper component for rendering Markdown safely
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Remove leading "> " if present (for user messages)
    const cleanContent = content.startsWith('> ') ? content.substring(2) : content;
    
    // Parse markdown to HTML
    const html = marked.parse(cleanContent, { async: false }) as string;

    return (
        <div 
            className="prose prose-invert prose-sm max-w-none 
                prose-p:leading-relaxed prose-p:my-1
                prose-headings:text-[#81D7B4] prose-headings:font-bold prose-headings:my-2
                prose-strong:text-white prose-strong:font-bold
                prose-ul:list-disc prose-ul:pl-4 prose-ul:my-1
                prose-ol:list-decimal prose-ol:pl-4 prose-ol:my-1
                prose-li:my-0.5
                prose-code:text-[#81D7B4] prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs
                prose-pre:bg-black/30 prose-pre:p-2 prose-pre:rounded prose-pre:border prose-pre:border-white/5
                text-gray-200"
            dangerouslySetInnerHTML={{ __html: html }} 
        />
    );
};

// ... existing components ...

const BizMartLink = () => (
    <Link 
        href="https://clanker.world/clanker/0xd5F9B7DB3F9Ec658De934638E07919091983Bb07" 
        target="_blank" 
        rel="noopener noreferrer"
        className="font-bold text-[#81D7B4] hover:text-[#6BC5A0] hover:underline transition-colors inline-flex items-center gap-0.5 cursor-pointer"
    >
        $BizMart
        <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
    </Link>
);

interface AgentStep {
    type: 'thought' | 'action' | 'message' | 'error' | 'proposal';
    content: string;
    data?: any;
    options?: string[];
    checkboxes?: string[];
    timestamp?: string | Date;
}

const StepOptions = ({ step, onSelect }: { step: AgentStep, onSelect: (msg: string) => void }) => {
    const [selected, setSelected] = useState<string[]>([]);

    if (step.options) {
        return (
            <div className="flex flex-wrap gap-2 mt-3">
                {step.options.map((opt, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(opt)}
                        className="px-3 py-1.5 rounded-lg bg-[#81D7B4]/10 border border-[#81D7B4]/30 text-[#81D7B4] hover:bg-[#81D7B4] hover:text-[#0b0c15] transition-all text-xs font-bold"
                    >
                        {opt}
                    </button>
                ))}
            </div>
        );
    }

    if (step.checkboxes) {
        return (
            <div className="flex flex-col gap-2 mt-3">
                {step.checkboxes.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer group w-fit">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(opt) ? 'bg-[#81D7B4] border-[#81D7B4]' : 'border-gray-500 group-hover:border-[#81D7B4]'}`}>
                            {selected.includes(opt) && <HiCheck className="w-3 h-3 text-[#0b0c15]" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={selected.includes(opt)}
                            onChange={() => {
                                setSelected(prev => 
                                    prev.includes(opt) 
                                        ? prev.filter(p => p !== opt)
                                        : [...prev, opt]
                                );
                            }}
                        />
                        <span className={`text-sm ${selected.includes(opt) ? 'text-[#81D7B4]' : 'text-gray-400 group-hover:text-gray-300'}`}>{opt}</span>
                    </label>
                ))}
                <button
                    onClick={() => onSelect(selected.join(', '))}
                    disabled={selected.length === 0}
                    className="mt-2 px-4 py-2 bg-[#81D7B4] text-[#0b0c15] rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-[#6BC5A0] w-fit transition-colors"
                >
                    Confirm Selection
                </button>
            </div>
        );
    }
    return null;
}

const RecentMarkets = () => {
    const [markets, setMarkets] = useState<any[]>([]);
    
    useEffect(() => {
        fetch('/api/bizfun/markets')
            .then(res => res.json())
            .then(data => {
                if (data.markets) setMarkets(data.markets.slice(0, 3)); // Show top 3
            })
            .catch(console.error);
    }, []);

    if (markets.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-4 md:px-0">
                <span className="text-[#81D7B4]">⚡</span> Recent Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
                {markets.map((m) => (
                    <Link href={`/bizfun/market/${m._id}`} key={m._id} className="block group">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-[#81D7B4]/50 transition-all h-full flex flex-col hover:bg-white/10">
                            <h3 className="font-bold text-white group-hover:text-[#81D7B4] transition-colors line-clamp-2 mb-3 text-lg">
                                {m.question}
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
                                        <span className="text-sm font-mono text-white">${m.liquidity || '5000'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const AgentTerminal = ({ walletAddress }: { walletAddress?: string }) => {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<AgentStep[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load history on mount or when wallet changes
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                let url = '/api/bizfun/agent';
                if (walletAddress) {
                    url += `?wallet=${walletAddress}`;
                }
                
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.steps && Array.isArray(data.steps)) {
                        setHistory(data.steps);
                    }
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            }
        };
        fetchHistory();
    }, [walletAddress]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isProcessing) return;

        setIsProcessing(true);
        
        // Add user message to history locally
        setHistory(prev => [...prev, { type: 'message', content: `> ${text}` }]);

        try {
            const res = await fetch('/api/bizfun/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    walletAddress: walletAddress 
                }),
            });

            const data = await res.json();
            
            if (data.steps) {
                // Simulate streaming by adding steps with delays
                for (const step of data.steps) {
                    await new Promise(r => setTimeout(r, 600)); // Visual delay
                    setHistory(prev => [...prev, step]);
                }
            }
        } catch (error) {
            setHistory(prev => [...prev, { type: 'error', content: "Connection to BizMart Agent failed." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;
        const msg = input;
        setInput("");
        await sendMessage(msg);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    return (
        <div className="w-full max-w-5xl mx-auto p-1 rounded-2xl bg-gradient-to-b from-[#81D7B4]/20 to-transparent backdrop-blur-md">
            <div className="bg-[#0b0c15]/90 rounded-xl overflow-hidden border border-white/10 shadow-2xl h-[80vh] flex flex-col">
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="ml-3 flex items-center gap-2 text-xs font-mono text-gray-400">
                            <GiRobotGrab className="text-[#81D7B4]" />
                            <span>bizmart-agent — openclaw</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-mono text-[#81D7B4]/60 px-2 py-0.5 rounded bg-[#81D7B4]/10 border border-[#81D7B4]/20">
                        LIVE CONNECTION
                    </div>
                </div>

                {/* Terminal Body */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 italic">
                            <GiCrabClaw className="w-16 h-16 mb-6 opacity-20" />
                            <p className="text-lg">Initialize communication with <BizMartLink /></p>
                            <p className="text-sm mt-2 opacity-50">Try: "$bizmart"</p>
                        </div>
                    )}

                    {history.map((step, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-3 ${step.type === 'message' && step.content.startsWith('>') ? 'text-white font-bold' : ''}`}
                        >
                            <div className="mt-0.5 shrink-0">
                                {step.type === 'thought' && <span className="text-gray-500">🧠</span>}
                                {step.type === 'action' && <span className="text-yellow-400">⚡</span>}
                                {step.type === 'message' && !step.content.startsWith('>') && <span className="text-[#81D7B4]">💬</span>}
                                {step.type === 'error' && <span className="text-red-400">❌</span>}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {step.type === 'thought' && (
                                    <span className="text-gray-500 italic">{step.content}</span>
                                )}
                                {step.type === 'action' && (
                                    <div className="text-yellow-400/90">
                                        <div className="font-semibold mb-1">EXECUTING: {step.content}</div>
                                        {step.data && (
                                            <pre className="text-xs bg-black/30 p-2 rounded border border-white/5 overflow-x-auto">
                                                {JSON.stringify(step.data, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                )}
                                {step.type === 'proposal' && (
                                    <MarketProposalCard data={step.data} />
                                )}
                                {step.type === 'message' && (
                                    <div className={step.content.startsWith('>') ? 'text-white' : 'text-gray-200'}>
                                        <MarkdownRenderer content={step.content} />
                                        <StepOptions step={step} onSelect={sendMessage} />
                                    </div>
                                )}
                                {step.type === 'error' && (
                                    <span className="text-red-400">{step.content}</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    
                    {isProcessing && (
                        <div className="flex gap-3">
                            <span className="animate-pulse text-[#81D7B4]">▋</span>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/5 border-t border-white/5 shrink-0">
                    {walletAddress ? (
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                            <HiOutlineCommandLine className="w-5 h-5 text-gray-500 absolute left-3 top-6" />
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Command the agent (e.g., 'Tokenize my startup')"
                                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#81D7B4]/50 focus:ring-1 focus:ring-[#81D7B4]/50 transition-all font-mono text-sm resize-none min-h-[50px] max-h-[120px]"
                                rows={1}
                                disabled={isProcessing}
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isProcessing}
                                className="absolute right-2 top-3 p-1.5 text-gray-400 hover:text-[#81D7B4] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                            >
                                <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <p className="text-gray-400 mb-3 text-sm">Please connect your wallet to interact with the agent.</p>
                            <BizFiAuthButton />
                        </div>
                    )}
                </div>
            </div>
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
                        <h1 className="text-3xl font-bold text-white mb-2">Agent Terminal</h1>
                        <p className="text-gray-400">Interact directly with <BizMartLink /> to tokenize businesses and deploy markets.</p>
                    </motion.div>
                    
                    <AgentTerminal walletAddress={activeAddress} />
                    
                    <RecentMarkets />
                </div>
            </main>
        </div>
    );
}
