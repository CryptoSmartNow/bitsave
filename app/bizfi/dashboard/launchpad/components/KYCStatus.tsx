"use client";
import { motion } from "framer-motion";
import { 
    HiOutlineCheckCircle, 
    HiOutlineClock, 
    HiOutlineDocumentText, 
    HiOutlineShieldCheck,
    HiOutlineBuildingOffice2
} from "react-icons/hi2";
import EmptyState from "@/app/components/EmptyState";

export interface KYCStep {
    id: number;
    label: string;
    description: string;
    icon?: any;
}

interface KYCStatusProps {
    status?: string;
    steps?: KYCStep[];
}

export default function KYCStatus({ status, steps }: KYCStatusProps) {
    if (!status || !steps || steps.length === 0) {
        return (
            <EmptyState 
                title="KYC Verification Status"
                description="No verification details available for this project."
                icon={HiOutlineShieldCheck}
            />
        );
    }

    // Determine current step based on status
    let currentStep = 1;
    if (status === "under_review") currentStep = 2;
    if (status === "kyb_pending") currentStep = 3;
    if (status === "approved") currentStep = 5; // All done

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 md:p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <HiOutlineShieldCheck className="w-5 h-5 text-[#81D7B4]" />
                Verification Status
            </h3>
            
            <div className="relative">
                {/* Connector Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-800 hidden md:block" />
                
                <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 gap-4">
                    {steps.map((step, index) => {
                        const isCompleted = currentStep > step.id;
                        const isCurrent = currentStep === step.id;
                        // Use default icon if not provided or handle mapping
                        const Icon = step.icon || HiOutlineShieldCheck;
                        
                        return (
                            <div key={step.id} className="relative z-10 flex md:flex-col items-center md:text-center gap-4 md:gap-3">
                                <motion.div 
                                    initial={false}
                                    animate={{ 
                                        backgroundColor: isCompleted ? "#81D7B4" : isCurrent ? "rgba(129, 215, 180, 0.2)" : "rgba(31, 41, 55, 1)",
                                        borderColor: isCompleted || isCurrent ? "#81D7B4" : "#374151"
                                    }}
                                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300`}
                                >
                                    <Icon className={`w-6 h-6 ${isCompleted ? "text-gray-900" : isCurrent ? "text-[#81D7B4]" : "text-gray-500"}`} />
                                </motion.div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis ${isCompleted || isCurrent ? "text-white" : "text-gray-500"}`}>
                                        {step.label}
                                    </h4>
                                    <p className="text-xs text-gray-500 hidden md:block mt-1">
                                        {step.description}
                                    </p>
                                </div>
                                
                                {/* Mobile connector */}
                                {index < steps.length - 1 && (
                                    <div className={`absolute left-6 top-12 bottom-[-24px] w-0.5 md:hidden ${isCompleted ? "bg-[#81D7B4]" : "bg-gray-800"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Desktop Horizontal Line */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-800 hidden md:block -z-10" />
                <motion.div 
                    className="absolute top-6 left-0 h-0.5 bg-[#81D7B4] hidden md:block -z-10" 
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}
