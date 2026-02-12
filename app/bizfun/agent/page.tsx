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

    const getMarketName = (m: any) => {
        if (m.data?.predictionQuestion) return m.data.predictionQuestion;
        if (m.question) {
            if (m.question.startsWith('ipfs://')) return "Untitled Market";
            if (m.question.startsWith('Create Market: ipfs://')) return "Untitled Market";
            return m.question;
        }
        return "Untitled Market";
    };

    if (markets.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 mb-20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 px-4 md:px-0">
                <HiOutlinePresentationChartLine className="w-6 h-6 text-[#81D7B4]" /> Recent Markets
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
                {markets.map((m) => (
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
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-[#0b0c15]/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[75vh]">
                {/* Chat Header */}
                <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/20 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                            <GiRobotGrab className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm">BizMart Agent</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-gray-400">Online & Ready</span>
                            </div>
                        </div>
                    </div>
                    {walletAddress && (
                         <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
                            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </div>
                    )}
                </div>

                {/* Chat Messages */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {history.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-[#81D7B4]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <GiCrabClaw className="w-10 h-10 text-[#81D7B4]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Welcome to BizMart</h3>
                            <p className="text-gray-200 font-medium max-w-lg mx-auto mb-8 text-lg">
                                Hey 👋 I’m <span className="text-[#81D7B4] font-bold">BizMart</span>. I help tokenize ideas, businesses, and even careers and launch their prediction markets. Takes about 10 minutes. If you’re ready just type <span className="text-[#81D7B4] font-bold font-mono bg-[#81D7B4]/10 px-2 py-1 rounded-lg border border-[#81D7B4]/20">BizMart</span> or <span className="text-[#81D7B4] font-bold font-mono bg-[#81D7B4]/10 px-2 py-1 rounded-lg border border-[#81D7B4]/20">Savvy</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                                {["BizMart", "Savvy", "Help me"].map((cmd) => (
                                    <button 
                                        key={cmd}
                                        onClick={() => sendMessage(cmd)}
                                        className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#81D7B4]/50 rounded-xl text-sm text-gray-300 hover:text-white transition-all text-left"
                                    >
                                        {cmd}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {history.map((step, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex w-full ${step.type === 'message' && step.content.startsWith('>') ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${step.type === 'message' && step.content.startsWith('>') ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className="shrink-0 mt-1">
                                    {step.type === 'message' && step.content.startsWith('>') ? (
                                        <div className="w-8 h-8 rounded-full bg-[#81D7B4] flex items-center justify-center shadow-lg">
                                            <HiOutlineUsers className="w-4 h-4 text-[#0b0c15]" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[#1a1b26] border border-white/10 flex items-center justify-center shadow-lg">
                                            {step.type === 'thought' ? <span className="text-xs">🧠</span> : 
                                             step.type === 'action' ? <span className="text-xs">⚡</span> :
                                             step.type === 'error' ? <span className="text-xs">❌</span> :
                                             <GiRobotGrab className="w-4 h-4 text-[#81D7B4]" />}
                                        </div>
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col ${step.type === 'message' && step.content.startsWith('>') ? 'items-end' : 'items-start'}`}>
                                    {step.type === 'thought' && (
                                        <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-xs text-gray-400 italic mb-1">
                                            {step.content}
                                        </div>
                                    )}

                                    {step.type === 'action' && (
                                        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl rounded-tl-none text-sm text-yellow-200 mb-1 w-full">
                                            <div className="font-bold text-xs uppercase tracking-wider mb-1 opacity-70">Executing Action</div>
                                            <div className="font-mono">{step.content}</div>
                                            {step.data && (
                                                <pre className="mt-2 text-[10px] bg-black/20 p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(step.data, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    )}

                                    {step.type === 'proposal' && (
                                        <div className="w-full">
                                            <MarketProposalCard data={step.data} />
                                        </div>
                                    )}

                                    {step.type === 'error' && (
                                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-none text-sm text-red-300">
                                            {step.content}
                                        </div>
                                    )}

                                    {step.type === 'message' && (
                                        <div className={`
                                            px-5 py-3.5 shadow-md text-sm leading-relaxed
                                            ${step.content.startsWith('>') 
                                                ? 'bg-[#81D7B4] text-[#0b0c15] rounded-2xl rounded-tr-none font-medium' 
                                                : 'bg-[#1a1b26] border border-white/10 text-gray-100 rounded-2xl rounded-tl-none'}
                                        `}>
                                            {step.content.startsWith('>') ? (
                                                step.content.substring(2)
                                            ) : (
                                                <>
                                                    <MarkdownRenderer content={step.content} />
                                                    <StepOptions step={step} onSelect={sendMessage} />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {isProcessing && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start w-full"
                        >
                            <div className="flex gap-3 max-w-[75%]">
                                <div className="w-8 h-8 rounded-full bg-[#1a1b26] border border-white/10 flex items-center justify-center shrink-0">
                                    <GiRobotGrab className="w-4 h-4 text-[#81D7B4]" />
                                </div>
                                <div className="bg-[#1a1b26] border border-white/10 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#0b0c15] border-t border-white/5 shrink-0">
                    {walletAddress ? (
                        <form onSubmit={handleSubmit} className="relative flex items-center gap-3 max-w-3xl mx-auto">
                            <div className="relative flex-1 group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative flex items-center bg-[#151725] border border-white/10 rounded-xl focus-within:border-[#81D7B4]/50 transition-colors">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                        placeholder="Type bizmart"
                                        className="w-full bg-transparent border-none py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:ring-0 text-sm resize-none min-h-[56px] max-h-[120px]"
                                        rows={1}
                                        disabled={isProcessing}
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!input.trim() || isProcessing}
                                        className="absolute right-2 p-2 bg-[#81D7B4] text-[#0b0c15] rounded-lg hover:bg-[#6BC5A0] disabled:opacity-50 disabled:bg-white/10 disabled:text-gray-500 transition-all shadow-lg shadow-[#81D7B4]/20"
                                    >
                                        <HiOutlinePaperAirplane className="w-4 h-4 -rotate-45 translate-x-0.5 -translate-y-0.5" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-2 text-center">
                            <p className="text-gray-500 mb-3 text-xs uppercase tracking-widest font-bold">Connect Wallet to Chat</p>
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
