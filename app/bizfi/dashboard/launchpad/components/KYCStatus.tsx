'use client';

import { Tick01Icon, Activity01Icon, Shield01Icon, CheckmarkCircle02Icon } from "hugeicons-react";

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

const DEFAULT_LIFECYCLE_STEPS: KYCStep[] = [
    {
        id: 1,
        label: "Listing Application",
        description: "Assessment & fee recorded onchain",
        icon: CheckmarkCircle02Icon
    },
    {
        id: 2,
        label: "KYC / KYB Verification",
        description: "Identity & document verification",
        icon: Shield01Icon
    },
    {
        id: 3,
        label: "Compliance Audit",
        description: "Risk assessment & EAS attestation",
        icon: Activity01Icon
    },
    {
        id: 4,
        label: "BizShares Tokenization",
        description: "Liquidity pool & investor launch",
        icon: Tick01Icon
    }
];

export default function KYCStatus({ status = "pending", steps }: KYCStatusProps) {
    const activeSteps = steps && steps.length > 0 ? steps : DEFAULT_LIFECYCLE_STEPS;

    let currentStep = 1;
    const normalized = status.toLowerCase();
    if (normalized === "pending") currentStep = 2;
    else if (normalized === "under_review" || normalized === "submitted") currentStep = 3;
    else if (normalized === "approved") currentStep = 4;

    return (
        <div className="bg-[#0F1825]/60 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-[#7B8B9A]/15">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                        <Shield01Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F9F9FB]">
                            Compliance & Listing Lifecycle
                        </h3>
                        <p className="text-[11px] text-[#7B8B9A]">
                            Step-by-step progress towards complete onchain tokenization.
                        </p>
                    </div>
                </div>

                <span className="text-[11px] font-mono font-semibold text-[#81D7B4] px-2.5 py-0.5 bg-[#81D7B4]/10 rounded-lg border border-[#81D7B4]/20">
                    Step {currentStep} of {activeSteps.length}
                </span>
            </div>
            
            <div className="relative">
                {/* Progress Line */}
                <div className="hidden md:block absolute left-[12%] right-[12%] top-5 h-0.5 bg-[#7B8B9A]/15 z-0" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 relative z-10">
                    {activeSteps.map((step, index) => {
                        const stepNum = index + 1;
                        const isCompleted = stepNum < currentStep || (stepNum === 1 && currentStep >= 2);
                        const isCurrent = stepNum === currentStep;
                        const Icon = step.icon || Shield01Icon;
                        
                        return (
                            <div key={step.id || index} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 p-3 md:p-2 rounded-2xl md:rounded-none bg-[#1A2538]/30 md:bg-transparent border border-[#7B8B9A]/10 md:border-0">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isCompleted
                                        ? 'bg-[#81D7B4] text-[#0F1825]'
                                        : isCurrent
                                        ? 'bg-[#81D7B4]/15 border-2 border-[#81D7B4] text-[#81D7B4]'
                                        : 'bg-[#1A2538] border border-[#7B8B9A]/20 text-[#7B8B9A]'
                                }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-xs font-semibold leading-tight ${
                                        isCompleted || isCurrent ? 'text-[#F9F9FB]' : 'text-[#7B8B9A]'
                                    }`}>
                                        {step.label}
                                    </h4>
                                    <p className="text-[11px] text-[#7B8B9A] mt-0.5 leading-snug">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
