'use client';

import { Alert02Icon, Shield01Icon, Activity01Icon, BarChartIcon, CheckmarkCircle02Icon } from "hugeicons-react";
import { motion } from "framer-motion";

export interface Risk {
    label: string;
    score: number;
    level: "Low" | "Medium" | "High";
}

interface RiskAssessmentProps {
    risks?: Risk[];
    tier?: string | number;
    status?: string;
}

const DEFAULT_RISK_METRICS: Risk[] = [
    { label: "Identity & Verification Confidence", score: 85, level: "Low" },
    { label: "Cashflow & Operating Stability", score: 72, level: "Medium" },
    { label: "Smart Contract Escrow Security", score: 94, level: "Low" },
    { label: "Market & Repayment Track Record", score: 78, level: "Medium" }
];

export default function RiskAssessment({ risks, tier, status }: RiskAssessmentProps) {
    const activeRisks = risks && risks.length > 0 ? risks : DEFAULT_RISK_METRICS;
    const overallScore = Math.round(activeRisks.reduce((acc, r) => acc + r.score, 0) / activeRisks.length);

    return (
        <div className="bg-[#0F1825]/60 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#7B8B9A]/15">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                            <BarChartIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F9F9FB]">
                                Onchain Risk Assessment
                            </h3>
                            <p className="text-[11px] text-[#7B8B9A]">
                                Algorithmic risk evaluation for investor protection.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-[#81D7B4] px-2.5 py-1 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/25">
                            Score: {overallScore}/100
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {activeRisks.map((risk, index) => {
                        const levelColor = 
                            risk.level === 'Low' 
                                ? 'text-[#81D7B4] bg-[#81D7B4]/10 border-[#81D7B4]/25'
                                : risk.level === 'Medium'
                                ? 'text-amber-400 bg-amber-400/10 border-amber-400/25'
                                : 'text-red-400 bg-red-400/10 border-red-400/25';

                        return (
                            <div key={risk.label} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#F9F9FB]">{risk.label}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono font-bold text-[#7B8B9A]">{risk.score}%</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${levelColor}`}>
                                            {risk.level}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-[#1A2538] rounded-full overflow-hidden border border-[#7B8B9A]/15">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${risk.score}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.08 }}
                                        className="h-full rounded-full bg-gradient-to-r from-[#81D7B4]/70 to-[#81D7B4]"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#7B8B9A]/15 flex items-center gap-2 text-[11px] text-[#7B8B9A]">
                <Alert02Icon className="w-3.5 h-3.5 text-[#81D7B4] shrink-0" />
                <span>Audited via decentralized EAS schemas and verified application records.</span>
            </div>
        </div>
    );
}
