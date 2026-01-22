"use client";
import { motion } from "framer-motion";
import { HiOutlineFlag, HiOutlineCalendar, HiOutlineCheck } from "react-icons/hi2";
import EmptyState from "@/app/components/EmptyState";

export interface Milestone {
    id: number;
    title: string;
    date: string;
    status: "completed" | "in_progress" | "pending";
}

interface ProjectTimelineProps {
    milestones?: Milestone[];
}

export default function ProjectTimeline({ milestones }: ProjectTimelineProps) {
    if (!milestones || milestones.length === 0) {
        return (
            <EmptyState 
                title="Project Timeline"
                description="No milestones have been set for this project yet."
                icon={HiOutlineFlag}
            />
        );
    }

    const completedCount = milestones.filter(m => m.status === "completed").length;

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HiOutlineFlag className="w-5 h-5 text-[#81D7B4]" />
                    Project Milestones
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#81D7B4]/10 text-[#81D7B4]">
                    {completedCount}/{milestones.length} Completed
                </span>
            </div>

            <div className="space-y-4 relative pl-4">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-2 bottom-4 w-0.5 bg-gray-800" />

                {milestones.map((milestone, index) => {
                    const isCompleted = milestone.status === "completed";
                    const isInProgress = milestone.status === "in_progress";

                    return (
                        <motion.div 
                            key={milestone.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-center gap-4 group"
                        >
                            {/* Dot */}
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-gray-900
                                ${isCompleted || isInProgress ? "border-[#81D7B4] text-[#81D7B4]" : "border-gray-700 text-gray-700"}
                            `}>
                                {isCompleted ? (
                                    <HiOutlineCheck className="w-3.5 h-3.5" />
                                ) : (
                                    <div className={`w-2 h-2 rounded-full ${isInProgress ? "bg-[#81D7B4] animate-pulse" : "bg-gray-700"}`} />
                                )}
                            </div>

                            {/* Content */}
                            <div className={`
                                flex-1 p-3 rounded-xl border transition-all
                                ${isInProgress ? "bg-[#81D7B4]/5 border-[#81D7B4]/30" : "bg-gray-900/30 border-gray-800 hover:border-gray-700"}
                            `}>
                                <div className="flex items-center justify-between">
                                    <h4 className={`text-sm font-semibold ${isCompleted ? "text-gray-300 line-through" : "text-white"}`}>
                                        {milestone.title}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <HiOutlineCalendar className="w-3 h-3" />
                                        {milestone.date}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
