"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { HiOutlineArrowRight, HiOutlineArrowLeft, HiCheck } from "react-icons/hi2";
import { MarketProposalCard } from "@/components/MarketProposalCard";

const STEPS = [
    {
        id: 'type',
        title: "What are we tokenizing?",
        options: ["A business", "A startup / product", "An idea", "My career / personal brand", "Just an experiment"]
    },
    {
        id: 'name',
        title: "What should we call it publicly?",
        type: 'text',
        placeholder: "e.g. My Awesome Startup"
    },
    {
        id: 'links',
        title: "Any links to socials or website?",
        type: 'text',
        placeholder: "https://x.com/...",
        optional: true
    },
    {
        id: 'description',
        title: "Explain it in a few sentences",
        subtitle: "Pretend you’re explaining it to someone on X scrolling fast.",
        type: 'textarea',
        placeholder: "We are building..."
    },
    {
        id: 'value',
        title: "What value are you providing?",
        subtitle: "And who is your target audience?",
        type: 'textarea',
        placeholder: "Providing X to Y audience..."
    },
    {
        id: 'stage',
        title: "What stage are you at?",
        options: ["Just an idea", "Building", "Launched, no revenue yet", "Making money", "Growing my career fast"]
    },
    {
        id: 'goal',
        title: "Let’s make this interesting 😈",
        subtitle: "What should the market predict?",
        options: ["Revenue goal", "Sales target", "User growth", "Launch milestone", "Social growth"]
    },
    {
        id: 'question',
        title: "Write the prediction in plain English",
        subtitle: "Example: “Will this business make $3,000 in the next 30 days?”",
        type: 'text',
        placeholder: "Will..."
    },
    {
        id: 'duration',
        title: "How long should the prediction run?",
        options: ["7 days", "14 days", "30 days"]
    },
    {
        id: 'chain',
        title: "What chain should I deploy on?",
        options: ["Base", "Monad", "BSC"]
    },
    {
        id: 'vibe',
        title: "What vibe should it have?",
        options: ["Meme", "Serious", "Experimental"]
    },
    {
        id: 'marketing',
        title: "Can I market this publicly for you?",
        options: ["Post on MoltBook", "Spark AI agent debates", "Reply under big accounts", "Go full chaos mode"],
        multiple: true
    },
    {
        id: 'wallet',
        title: "Drop a USDC address for settlement",
        subtitle: "Revenue from the prediction market will come here.",
        type: 'text',
        placeholder: "0x..."
    },
    {
        id: 'review',
        title: "Review & Deploy",
        type: 'review'
    }
];

export const MarketWizard = ({ walletAddress, onSuccess }: { walletAddress?: string, onSuccess?: (data: any) => void }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [proposalData, setProposalData] = useState<any>(null);

    const step = STEPS[currentStepIndex];

    // Auto-fill wallet if available
    useEffect(() => {
        if (walletAddress && !formData.wallet) {
            setFormData(prev => ({ ...prev, wallet: walletAddress }));
        }
    }, [walletAddress]);

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            generateProposal();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleSelectOption = (option: string, multiple = false) => {
        if (multiple) {
            const current = formData[step.id] || [];
            const updated = current.includes(option)
                ? current.filter((o: string) => o !== option)
                : [...current, option];
            setFormData({ ...formData, [step.id]: updated });
        } else {
            setFormData({ ...formData, [step.id]: option });
            setTimeout(handleNext, 300); // Auto-advance for single select
        }
    };

    const handleInputChange = (value: string) => {
        setFormData({ ...formData, [step.id]: value });
    };

    const generateProposal = async () => {
        setIsGenerating(true);
        try {
            // Simplified logic: format data for agentTools.createMarket
            let resolveTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // Default 30 days
            if (formData.duration?.includes('7')) resolveTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
            else if (formData.duration?.includes('14')) resolveTime = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60);

            // Fetch proposal from a new simplified API endpoint to avoid full chat wrapper
            const res = await fetch('/api/bizfun/agent/proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metadataUri: formData.name || `ipfs://mock-metadata-${Date.now()}`,
                    tradingDeadline: resolveTime - 86400, // 1 day before resolve
                    resolveTime: resolveTime,
                    chain: formData.chain || 'Base',
                    description: formData.question,
                    vibe: formData.vibe,
                    wallet: formData.wallet
                })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.proposal) {
                    setProposalData(data.proposal);
                }
            } else {
                console.error("Failed to generate proposal");
            }
        } catch (error) {
            console.error("Error generating proposal:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const isStepValid = () => {
        if (step.optional) return true;
        const val = formData[step.id];
        if (step.id === 'review') return true;
        if (Array.isArray(val)) return val.length > 0;
        return val && val.trim?.() !== '';
    };

    const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

    return (
        <div className="w-full max-w-2xl mx-auto bg-[#0b0c15]/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-[500px]">
            {/* Header Progress */}
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={handlePrev}
                        disabled={currentStepIndex === 0 || !!proposalData}
                        className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-white"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#81D7B4]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <span className="text-xs text-gray-400 font-mono font-bold w-12 text-right">
                        {currentStepIndex + 1} / {STEPS.length}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative">
                <AnimatePresence mode="wait">
                    {proposalData ? (
                        <motion.div
                            key="proposal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full flex flex-col items-center"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Ready to Deploy 🚀</h2>
                            <MarketProposalCard
                                data={proposalData}
                                onSuccess={(id, hash, chainId) => {
                                    if (onSuccess) onSuccess({ id, hash, chainId });
                                }}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                        >
                            <span className="text-[#81D7B4] text-sm font-bold tracking-wider uppercase mb-2 block">
                                Step {currentStepIndex + 1}
                            </span>
                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                {step.title}
                            </h2>
                            {step.subtitle && (
                                <p className="text-gray-400 text-lg mb-8">{step.subtitle}</p>
                            )}
                            <div className={!step.subtitle ? "mt-8" : ""}>
                                {step.options && (
                                    <div className="flex flex-col gap-3">
                                        {step.options.map((opt) => {
                                            const isSelected = step.multiple
                                                ? formData[step.id]?.includes(opt)
                                                : formData[step.id] === opt;

                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleSelectOption(opt, step.multiple)}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${isSelected
                                                        ? 'border-[#81D7B4] bg-[#81D7B4]/10 text-white'
                                                        : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-gray-300'
                                                        }`}
                                                >
                                                    <span className="font-medium text-lg">{opt}</span>
                                                    {isSelected && <HiCheck className="w-5 h-5 text-[#81D7B4]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {step.type === 'text' && (
                                    <input
                                        type="text"
                                        autoFocus
                                        value={formData[step.id] || ''}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder={step.placeholder}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && isStepValid()) handleNext();
                                        }}
                                        className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#81D7B4] py-4 text-2xl text-white placeholder-gray-600 outline-none transition-colors"
                                    />
                                )}

                                {step.type === 'textarea' && (
                                    <textarea
                                        autoFocus
                                        value={formData[step.id] || ''}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        placeholder={step.placeholder}
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl focus:border-[#81D7B4]/50 focus:bg-white/10 p-4 text-lg text-white placeholder-gray-600 outline-none transition-all resize-none"
                                    />
                                )}

                                {step.id === 'review' && (
                                    <div className="space-y-4 text-sm bg-black/20 p-6 rounded-2xl border border-white/5">
                                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                                            <span className="text-gray-500">Name</span>
                                            <span className="col-span-2 text-white font-medium">{formData.name}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                                            <span className="text-gray-500">Question</span>
                                            <span className="col-span-2 text-white font-medium">{formData.question}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                                            <span className="text-gray-500">Duration</span>
                                            <span className="col-span-2 text-[#81D7B4] font-medium">{formData.duration}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-2 border-b border-white/5">
                                            <span className="text-gray-500">Chain</span>
                                            <span className="col-span-2 text-white font-medium">{formData.chain}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 py-2">
                                            <span className="text-gray-500">Wallet</span>
                                            <span className="col-span-2 text-white font-mono break-all text-xs">{formData.wallet}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {
                !proposalData && (
                    <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center">
                        <span className="text-gray-500 text-sm">
                            {step.optional ? 'Press Enter to skip' : 'Press Enter to continue'}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isGenerating}
                            className="px-6 py-3 bg-[#81D7B4] hover:bg-[#6BC5A0] text-[#0b0c15] font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:hover:bg-[#81D7B4]"
                        >
                            {isGenerating ? (
                                <>Generating <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /></>
                            ) : step.id === 'review' ? (
                                "Deploy Prediction Market"
                            ) : (
                                <>Next <HiOutlineArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                )
            }
        </div >
    );
};
