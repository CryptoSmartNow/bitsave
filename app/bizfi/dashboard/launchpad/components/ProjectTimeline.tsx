'use client';

import { Activity01Icon, Calendar01Icon, Tick01Icon, Flag01Icon } from "hugeicons-react";
import { motion } from "framer-motion";

export interface Milestone {
    id: number;
    title: string;
    date: string;
    status: "completed" | "in_progress" | "pending";
}

interface ProjectTimelineProps {
    milestones?: Milestone[];
    status?: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
    {
        id: 1,
        title: "Protocol Application & Intake",
        date: "Completed",
        status: "completed"
    },
    {
        id: 2,
        title: "KYC / KYB Verification & Identity Audit",
        date: "In Progress",
        status: "in_progress"
    },
    {
        id: 3,
        title: "Smart Contract Escrow & Collateral Setup",
        date: "Upcoming",
        status: "pending"
    },
    {
        id: 4,
        title: "BizShares Liquidity Pool & Investor Launch",
        date: "Upcoming",
        status: "pending"
    }
];

export default function ProjectTimeline({ milestones, status }: ProjectTimelineProps) {
    const activeMilestones = milestones && milestones.length > 0 ? milestones : DEFAULT_MILESTONES;
    const completedCount = activeMilestones.filter(m => m.status === "completed").length;

    return (
        <div className="bg-[#0F1825]/60 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-7 shadow-lg flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#7B8B9A]/15">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                            <Activity01Icon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#F9F9FB]">
                                Project Milestones
                            </h3>
                            <p className="text-[11px] text-[#7B8B9A]">
                                Execution timeline from listing to liquidity.
                            </p>
                        </div>
                    </div>
                    
                    <span className="text-[11px] font-mono font-bold text-[#81D7B4] px-2.5 py-1 rounded-xl bg-[#81D7B4]/10 border border-[#81D7B4]/25">
                        {completedCount}/{activeMilestones.length} Done
                    </span>
                </div>

                <div className="space-y-3.5 relative pl-2">
                    {/* Vertical Line */}
                    <div className="absolute left-[20px] top-3 bottom-5 w-0.5 bg-[#7B8B9A]/15" />

                    {activeMilestones.map((milestone, index) => {
                        const isCompleted = milestone.status === "completed";
                        const isInProgress = milestone.status === "in_progress";

                        return (
                            <motion.div 
                                key={milestone.id || index}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-center gap-3.5 group"
                            >
                                {/* Indicator Dot */}
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-[#0F1825] transition-all
                                    ${isCompleted 
                                        ? "border-[#81D7B4] bg-[#81D7B4] text-[#0F1825]" 
                                        : isInProgress 
                                        ? "border-[#81D7B4] text-[#81D7B4] ring-4 ring-[#81D7B4]/20" 
                                        : "border-[#7B8B9A]/30 text-[#7B8B9A]"
                                    }
                                `}>
                                    {isCompleted ? (
                                        <Tick01Icon className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                        <div className={`w-1.5 h-1.5 rounded-full ${isInProgress ? "bg-[#81D7B4]" : "bg-[#7B8B9A]/40"}`} />
                                    )}
                                </div>

                                {/* Content Box */}
                                <div className={`
                                    flex-1 p-3 rounded-xl border transition-all
                                    ${isInProgress 
                                        ? "bg-[#81D7B4]/10 border-[#81D7B4]/30" 
                                        : isCompleted 
                                        ? "bg-[#1A2538]/30 border-[#7B8B9A]/15" 
                                        : "bg-[#1A2538]/20 border-[#7B8B9A]/10"
                                    }
                                `}>
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className={`text-xs font-bold ${isCompleted ? "text-[#7B8B9A]" : "text-[#F9F9FB]"}`}>
                                            {milestone.title}
                                        </h4>
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-[#7B8B9A] shrink-0">
                                            <Calendar01Icon className="w-3 h-3" />
                                            {milestone.date}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
