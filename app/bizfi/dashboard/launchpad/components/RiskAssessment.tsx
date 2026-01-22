"use client";
import { motion } from "framer-motion";
import { 
    HiOutlineExclamationTriangle, 
    HiOutlineShieldCheck,
    HiOutlineScale,
    HiOutlineChartBar
} from "react-icons/hi2";
import EmptyState from "@/app/components/EmptyState";

export interface Risk {
    label: string;
    score: number;
    level: "Low" | "Medium" | "High";
}

interface RiskAssessmentProps {
    risks?: Risk[];
}

export default function RiskAssessment({ risks }: RiskAssessmentProps) {
    if (!risks || risks.length === 0) {
        return (
            <EmptyState 
                title="Risk Assessment"
                description="Risk analysis data is not available for this project yet."
                icon={HiOutlineChartBar}
            />
        );
    }

    // Calculate overall risk score (average)
    const overallScore = risks.reduce((acc, r) => acc + r.score, 0) / risks.length;
    
    // Using strictly brand colors as requested
    const getRiskColor = (score: number) => {
        // We use the brand color for the bar regardless of score to maintain the theme,
        // but the length of the bar indicates the value.
        return "text-[#81D7B4] bg-[#81D7B4]";
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HiOutlineScale className="w-5 h-5 text-[#81D7B4]" />
                    Risk Assessment
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Overall Score:</span>
                    <span className="text-sm font-bold text-[#81D7B4]">
                        {Math.round(overallScore)}/100
                    </span>
                </div>
            </div>

            <div className="space-y-5">
                {risks.map((risk, index) => {
                    return (
                        <div key={risk.label}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-300">{risk.label}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#81D7B4]/10 text-[#81D7B4]">
                                    {risk.level}
                                </span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${risk.score}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="h-full rounded-full bg-[#81D7B4]"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 flex items-start gap-3">
                <HiOutlineExclamationTriangle className="w-5 h-5 text-[#81D7B4] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                    This assessment is based on self-reported data and automated analysis. 
                    Please complete the <span className="text-[#81D7B4] hover:underline cursor-pointer">full audit</span> for certification.
                </p>
            </div>
        </div>
    );
}
