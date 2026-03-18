import React from 'react';
import { FaRobot } from 'react-icons/fa6';

interface NLPInputBlockProps {
    nlpText: string;
    setNlpText: (val: string) => void;
    nlpParsed: {
        name?: string; amount?: string; currency?: string;
        network?: string; duration?: number; penalty?: string;
    } | null;
    applyNLPValues: () => void;
    cancelNLP: () => void;
    chains: Array<{ id: string; name: string }>;
}

export default function NLPInputBlock({
    nlpText,
    setNlpText,
    nlpParsed,
    applyNLPValues,
    cancelNLP,
    chains
}: NLPInputBlockProps) {
    const hasParsedData = nlpParsed && Object.keys(nlpParsed).length > 0;
    
    return (
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 lg:px-8">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.03)] p-6 sm:p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                            <FaRobot className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-[#0f172a] tracking-tight">AI Assistant</h3>
                    </div>
                    <p className="text-sm text-[#64748b] mb-6 font-medium">Describe your savings plan normally and the bot will auto-configure it. Make sure to review the interpretation below.</p>
                    
                    <textarea
                        value={nlpText}
                        onChange={(e) => setNlpText(e.target.value)}
                        placeholder='e.g. "Create a Vacation Fund and lock $500 on Base for 6 months with 10% penalty"'
                        className="w-full min-h-[140px] resize-none text-[15px] font-medium leading-relaxed rounded-[16px] border border-gray-200 bg-white px-5 py-4 text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/30 focus:border-[#81D7B4] transition-all shadow-inner"
                        rows={4}
                    />
                    
                    {hasParsedData && (
                        <div className="mt-6 p-5 bg-[#F8FAF9] rounded-[16px] border border-[#81D7B4]/30 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[11px] font-black text-[#81D7B4] uppercase tracking-widest mb-3">AI Interpretation:</p>
                            <div className="text-[15px] sm:text-base text-[#0f172a] leading-relaxed font-medium">
                                I will create a new savings plan named <span className="bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-md font-bold">{nlpParsed.name || "___"}</span>. 
                                We'll lock up <span className="bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-md font-bold">${nlpParsed.amount || "0"} {nlpParsed.currency || "USDC"}</span> 
                                on the <span className="bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-md font-bold">{chains.find(c => c.id === nlpParsed.network)?.name || nlpParsed.network || "Base"}</span> blockchain. 
                                Your funds will be secured for <span className="bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-md font-bold">{nlpParsed.duration ? `${nlpParsed.duration} days` : "___ days"}</span>. 
                                If you withdraw before the lock ends, you will face a <span className="bg-[#81D7B4]/10 text-[#81D7B4] px-2 py-0.5 rounded-md font-bold">{nlpParsed.penalty || "10%"}</span> penalty.
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={cancelNLP}
                            className="bg-white hover:bg-gray-50 border border-gray-200 text-[#64748b] hover:text-[#0f172a] px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={applyNLPValues}
                            disabled={!nlpParsed || !nlpParsed.amount}
                            className="bg-[#81D7B4] hover:bg-[#6BC7A0] disabled:opacity-50 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-[0_4px_14px_rgb(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgb(129,215,180,0.4)]"
                        >
                            Confirm Interpretation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
