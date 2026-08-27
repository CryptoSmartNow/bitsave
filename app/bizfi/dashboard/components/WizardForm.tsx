'use client';

import { Cancel01Icon, LinkSquare01Icon } from "hugeicons-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UnifiedFiatModal } from "@/components/UnifiedFiatModal";
import CustomDatePicker from "./CustomDatePicker";

type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

interface WizardFormProps {
    selectedTier: {
        id: TierType;
        name: string;
        price: number;
        referralPrice: number;
    };
    referralCode?: string;
    isReferralValid?: boolean;
    address?: string | undefined;
    onClose?: () => void;
    onSuccess?: () => void;
}

const TIER_STEPS = {
    micro: [
        { id: 1, title: "Personal Info", section: "A" },
        { id: 2, title: "Business Identity", section: "B" },
        { id: 3, title: "Operational Data", section: "C" },
        { id: 4, title: "Growth Reflection", section: "D" },
        { id: 5, title: "Declaration", section: "E" }
    ],
    builder: [
        { id: 1, title: "Personal Info", section: "A" },
        { id: 2, title: "Startup Details", section: "B" },
        { id: 3, title: "Startup Potential", section: "C" },
        { id: 4, title: "Commitment", section: "D" },
        { id: 5, title: "Declaration", section: "E" }
    ],
    growth: [
        { id: 1, title: "Personal Info", section: "A" },
        { id: 2, title: "Company Details", section: "B" },
        { id: 3, title: "Finance", section: "C" },
        { id: 4, title: "Operations", section: "D" },
        { id: 5, title: "Declaration", section: "E" }
    ],
    enterprise: [
        { id: 1, title: "Personal Info", section: "A" },
        { id: 2, title: "Company Details", section: "B" },
        { id: 3, title: "Project Summary", section: "C" },
        { id: 4, title: "Financial Req.", section: "D" },
        { id: 5, title: "Funding Plan", section: "E" },
        { id: 6, title: "Declaration", section: "F" }
    ]
};

const INDUSTRIES = [
    "Retail", "Food & Beverage", "Technology", "Logistics", "Services",
    "Healthcare", "Education", "Manufacturing", "Agriculture", "Real Estate",
    "Entertainment", "Fashion", "Other"
];

const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "ZAR", "GHS", "UGX"];

export default function WizardForm({ selectedTier, referralCode = '', isReferralValid = false, address, onClose, onSuccess }: WizardFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [attestationNetwork, setAttestationNetwork] = useState('base');

    const [showNotification, setShowNotification] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ type: 'success', title: '', message: '' });
    const [attestationData, setAttestationData] = useState<{ easUid: string, transactionHash: string } | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // Load saved data from API on mount/address change
    useEffect(() => {
        const loadDraft = async () => {
            if (!address) return;
            try {
                const res = await fetch(`/api/bizfi/draft?address=${address}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.formData) {
                        setFormData(data.formData);
                        if (data.step) setCurrentStep(data.step);
                    }
                }
            } catch (e) {
                console.error("Failed to load draft:", e);
            }
        };
        loadDraft();
    }, [address]);

    // Auto-save draft on changes
    useEffect(() => {
        if (!address || Object.keys(formData).length === 0) return;

        const timer = setTimeout(async () => {
            try {
                await fetch('/api/bizfi/draft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address,
                        formData,
                        step: currentStep
                    })
                });
            } catch (e) {
                console.error("Failed to auto-save draft:", e);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timer);
    }, [formData, currentStep, address]);

    const steps = TIER_STEPS[selectedTier.id];
    const isLastStep = currentStep === steps.length;
    const isFirstStep = currentStep === 1;

    const validateStep = (step: number): boolean => {
        const requiredFields: Record<string, string[]> = {
            '1': ['name', 'email', 'phone', 'birthday', 'bio', 'ownsBusiness'],
        };

        if (selectedTier.id === 'micro') {
            if (step === 2) requiredFields['2'] = ['businessName', 'isRegistered', 'businessType', 'businessDescription', 'yearStarted', 'countryOfOperation', 'cityOfOperation', 'businessAddress', 'ownerName', 'businessEmail', 'businessPhone'];
            if (step === 3) requiredFields['3'] = ['monthlyRevenue', 'monthlyExpenses', 'customersPerMonth', 'salesChannels', 'repeatCustomers', 'hasFinancialRecords'];
            if (step === 4) requiredFields['4'] = ['biggestChallenge', 'raiseAmount', 'fundUsage', 'vision12Months'];
        } else if (selectedTier.id === 'builder') {
            if (step === 2) requiredFields['2'] = ['startupName', 'startupRegistered', 'ideaSummary', 'developmentStage', 'problemSolving', 'targetCustomer', 'solutionWork', 'validation'];
            if (step === 3) requiredFields['3'] = ['hasRevenue', 'capitalUsage'];
            if (step === 4) requiredFields['4'] = ['whyBuilding', 'successVision'];
        } else if (selectedTier.id === 'growth') {
            if (step === 2) requiredFields['2'] = ['registeredBusinessName', 'countryOfRegistration', 'operatingName', 'industry', 'yearsInOperation', 'teamSize', 'ceoName', 'ceoEmail', 'operatingLocations'];
            if (step === 3) requiredFields['3'] = ['revenueRange', 'growthExpenses', 'netProfit', 'customerBaseSize', 'returningCustomersPercent', 'hasDebts'];
            if (step === 4) requiredFields['4'] = ['mainProducts', 'revenueChannels', 'toolsUsed', 'keyMetrics', 'growthChallenge', 'growthRaiseAmount', 'fundsUsage', 'expectedImpact'];
        } else if (selectedTier.id === 'enterprise') {
            if (step === 2) requiredFields['2'] = ['entRegisteredName', 'entCompanyName', 'entCountry', 'companySector', 'projectLocation', 'entYearsInOperation', 'entTeamSize', 'entCeoName', 'entCeoEmail', 'entOperatingLocations'];
            if (step === 3) requiredFields['3'] = ['projectDescription', 'currentStage', 'projectTimeline', 'projectRisks', 'investorProtection'];
            if (step === 4) requiredFields['4'] = ['totalCapitalNeeded', 'raiseOnBizMarket', 'currentAssets', 'currentLiabilities', 'expectedROI', 'revenueModel', 'annualProjection'];
            if (step === 5) requiredFields['5'] = ['fundsUsagePlan', 'expectedMilestones', 'tokenGrowthCorrelation', 'projectAssets'];
        }

        const fieldsToCheck = requiredFields[step.toString()];
        if (!fieldsToCheck) return true;

        const missingFields = fieldsToCheck.filter(field => !formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === ''));

        if (missingFields.length > 0) {
            setNotificationConfig({
                type: 'error',
                title: 'MISSING FIELDS',
                message: `Please fill in all required fields before proceeding: ${missingFields.join(', ')}`
            });
            setShowNotification(true);
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCheckout = async () => {
        if (!validateStep(currentStep)) return;
        if (!agreedToTerms) {
            setNotificationConfig({ type: 'error', title: 'TERMS REQUIRED', message: 'You must agree to the terms to proceed.' });
            setShowNotification(true);
            return;
        }
        
        setIsProcessing(true);
        
        const priceToPay = isReferralValid ? selectedTier.referralPrice : selectedTier.price;

        try {
            const params = new URLSearchParams({
                recipient: process.env.NEXT_PUBLIC_BIZFI_EVM_REVENUE_WALLET!,
                amount: priceToPay.toFixed(2),
                chain: 'BASE',
                token: 'USDC',
                mode: 'buy',
                source: 'bizfi'
            });
            const res = await fetch(`/api/chainrails/session?${params}`);
            const data = await res.json();
            
            const tokenToUse = data.sessionToken || data.token || data.session_token;
            if (tokenToUse) {
                setSessionToken(tokenToUse);
                setIsPaymentModalOpen(true);
            } else {
                throw new Error(data.error || "Failed to create payment session.");
            }
        } catch (error) {
            console.error("Checkout initialization failed:", error);
            setNotificationConfig({
                type: 'error',
                title: 'CHECKOUT FAILED',
                message: 'Failed to initialize payment. Please try again later.'
            });
            setShowNotification(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (txHash: string) => {
        setIsPaymentModalOpen(false);
        try {
            const finalBusinessName = formData.businessName || formData.name || formData.startupName || formData.registeredBusinessName || "";

            // Save final business data to MongoDB
            await fetch('/api/bizfi/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionHash: txHash,
                    owner: address || 'unknown',
                    businessName: finalBusinessName,
                    metadata: formData,
                    tier: selectedTier.id,
                    feePaid: isReferralValid ? selectedTier.referralPrice : selectedTier.price,
                    referralCode: referralCode || "",
                    network: 'chainrails'
                })
            });

            // Get a unique business ID
            let businessId = 0;
            try {
                const counterRes = await fetch('/api/bizfi/counter');
                const counterData = await counterRes.json();
                businessId = counterData.count;
            } catch (err) {
                console.warn("Could not fetch business counter, generating fallback ID");
                businessId = Math.floor(Math.random() * 100000) + 1000;
            }

            // Trigger Automated Server Attestation
            let easUid = 'PENDING_ONCHAIN_ATTESTATION';
            try {
                const attestRes = await fetch('/api/bizfi/attest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        businessId: businessId,
                        recipient: address || '0x0000000000000000000000000000000000000000',
                        verificationData: formData,
                        transactionHash: txHash,
                        network: attestationNetwork
                    })
                });
                const attestData = await attestRes.json();
                if (attestData.easUid) {
                    easUid = attestData.easUid;
                }
            } catch (err) {
                console.error("Attestation failed:", err);
            }

            setAttestationData({
                easUid: easUid,
                transactionHash: txHash
            });

            // Clear saved data
            if (address) {
                await fetch(`/api/bizfi/draft?address=${address}`, { method: 'DELETE' });
            }
            setFormData({});
            setCurrentStep(1);
            setIsRegistered(true);
            onSuccess?.();

        } catch (err: any) {
            console.error("Post-payment submission failed:", err);
            setNotificationConfig({
                type: 'error',
                title: 'REGISTRATION FAILED',
                message: 'Failed to complete registration process. Please contact support.'
            });
            setShowNotification(true);
        }
    };

    const updateFormData = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const calculateProfitMargin = () => {
        const rev = parseFloat(formData.monthlyRevenue || 0);
        const exp = parseFloat(formData.monthlyExpenses || 0);
        if (!rev || rev === 0) return '0%';
        const margin = ((rev - exp) / rev) * 100;
        return `${margin.toFixed(1)}%`;
    };

    if (isRegistered) {
        return (
            <div className="bg-[#0F1825]/60 border border-[#81D7B4]/30 rounded-3xl p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-[#81D7B4]/20 border border-[#81D7B4]/40 flex items-center justify-center text-[#81D7B4]">
                    <LinkSquare01Icon className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-[#F9F9FB]">Registration Submitted!</h3>
                    <p className="text-xs sm:text-sm text-[#7B8B9A] max-w-md">
                        Your registration has been submitted and registered on Base. Our team will verify your attestations.
                    </p>
                </div>

                {attestationData && (
                    <div className="w-full max-w-md bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-2xl p-4 sm:p-5 text-left space-y-3">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#81D7B4]">Attestation Receipt</p>
                        <div className="space-y-2">
                            <div>
                                <p className="text-[10px] uppercase text-[#7B8B9A]">Transaction Hash</p>
                                <code className="text-[#81D7B4] text-xs font-mono break-all">{attestationData.transactionHash}</code>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase text-[#7B8B9A]">EAS UID</p>
                                <code className="text-[#F9F9FB] text-xs font-mono break-all">{attestationData.easUid}</code>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("We’ve officially listed our business on BizFi by @BitsaveProtocol. Taking the first step toward raising capital onchain and expanding globally. Build globally. Raise globally. Own globally.")}&url=${encodeURIComponent('https://bitsave.io/bizfi')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 font-bold text-xs uppercase tracking-wider bg-[#F9F9FB] text-[#0F1825] hover:bg-gray-200 transition-colors rounded-xl text-center"
                    >
                        Share to X
                    </a>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 py-3 font-black text-xs uppercase tracking-wider bg-[#81D7B4] text-[#0F1825] hover:bg-[#9FE0C5] transition-colors rounded-xl shadow-md cursor-pointer"
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Step Progress Header */}
            <div className="bg-[#0F1825]/60 border border-[#7B8B9A]/15 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">
                            {selectedTier.name} — Application Progress
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#81D7B4] px-2 py-0.5 bg-[#81D7B4]/10 rounded-md border border-[#81D7B4]/30">
                            Step {currentStep.toString().padStart(2, '0')} / {steps.length.toString().padStart(2, '0')}
                        </span>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538] transition-colors cursor-pointer"
                                title="Close application"
                            >
                                <Cancel01Icon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 sm:gap-2">
                    {steps.map((step, index) => {
                        const isCompleted = index + 1 <= currentStep;
                        const isCurrent = index + 1 === currentStep;
                        return (
                            <div key={step.id} className="flex flex-col gap-1.5">
                                <div className={`h-1.5 rounded-full transition-all ${
                                    isCompleted ? 'bg-[#81D7B4]' : 'bg-[#1A2538]'
                                } ${isCurrent ? 'ring-1 ring-[#81D7B4]/50' : ''}`} />
                                <span className={`text-[9px] font-bold uppercase tracking-wider truncate hidden sm:block ${
                                    isCompleted ? 'text-[#81D7B4]' : 'text-[#7B8B9A]/60'
                                }`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Section Body */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#0F1825]/40 border border-[#7B8B9A]/15 rounded-2xl p-5 sm:p-6"
                >
                    {renderFormSection(
                        selectedTier.id,
                        currentStep,
                        formData,
                        updateFormData,
                        agreedToTerms,
                        setAgreedToTerms,
                        calculateProfitMargin
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Controls / Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
                <button
                    type="button"
                    onClick={isFirstStep ? onClose : handlePrevious}
                    className="px-5 py-2.5 rounded-xl border border-[#7B8B9A]/20 bg-[#1A2538]/50 hover:bg-[#1A2538] text-xs font-bold text-[#F9F9FB] transition-all cursor-pointer"
                >
                    {isFirstStep ? "Cancel" : "Previous Step"}
                </button>

                {isLastStep ? (
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleCheckout}
                        className="px-6 py-2.5 rounded-xl bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <span>Proceed to Payment (${isReferralValid ? selectedTier.referralPrice : selectedTier.price})</span>
                        )}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] text-xs font-black transition-all shadow-md cursor-pointer"
                    >
                        Continue to Next Step &rarr;
                    </button>
                )}
            </div>

            {/* Notification Toast */}
            {showNotification && (
                <div className={`fixed bottom-6 right-6 max-w-sm p-4 rounded-2xl border shadow-xl z-50 transition-all ${
                    notificationConfig.type === 'error'
                        ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                        : 'bg-[#1A2538]/95 border-[#81D7B4]/30 text-[#F9F9FB]'
                }`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider">{notificationConfig.title}</p>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">{notificationConfig.message}</p>
                        </div>
                        <button
                            onClick={() => setShowNotification(false)}
                            className="p-1 hover:opacity-75 cursor-pointer"
                        >
                            <Cancel01Icon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ChainRails Fiat / Crypto Payment Modal */}
            {isPaymentModalOpen && (
                <UnifiedFiatModal
                    isOpen={isPaymentModalOpen}
                    sessionToken={sessionToken}
                    amount={isReferralValid ? selectedTier.referralPrice : selectedTier.price}
                    userId={address || 'anonymous'}
                    project="bizfi"
                    itemDescription={`BizFi Tier Registration - ${selectedTier.name}`}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

function renderFormSection(
    tier: TierType,
    step: number,
    formData: any,
    update: (k: string, v: any) => void,
    agreed: boolean,
    setAgreed: (v: boolean) => void,
    calcMargin: () => string
) {
    if (step === 1) {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#F9F9FB]">Section A: Founder Identity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Full Name *</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-semibold text-[#F9F9FB] placeholder-[#7B8B9A]/50 outline-none focus:border-[#81D7B4]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Email Address *</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => update('email', e.target.value)}
                            placeholder="founder@company.com"
                            className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-semibold text-[#F9F9FB] placeholder-[#7B8B9A]/50 outline-none focus:border-[#81D7B4]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Phone Number *</label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => update('phone', e.target.value)}
                            placeholder="+1 555 0192"
                            className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-semibold text-[#F9F9FB] placeholder-[#7B8B9A]/50 outline-none focus:border-[#81D7B4]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Date of Birth *</label>
                        <CustomDatePicker
                            value={formData.birthday || ''}
                            onChange={(v) => update('birthday', v)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Founder Bio *</label>
                    <textarea
                        rows={3}
                        value={formData.bio || ''}
                        onChange={(e) => update('bio', e.target.value)}
                        placeholder="Brief summary of your professional background and role..."
                        className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-medium text-[#F9F9FB] placeholder-[#7B8B9A]/50 outline-none focus:border-[#81D7B4] resize-none"
                    />
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="ownsBusiness"
                        checked={formData.ownsBusiness === 'yes'}
                        onChange={(e) => update('ownsBusiness', e.target.checked ? 'yes' : 'no')}
                        className="w-4 h-4 rounded accent-[#81D7B4] cursor-pointer"
                    />
                    <label htmlFor="ownsBusiness" className="text-xs text-[#F9F9FB] cursor-pointer font-medium">
                        I am the majority owner or authorized corporate representative of this enterprise.
                    </label>
                </div>
            </div>
        );
    }

    if (tier === 'micro') {
        if (step === 2) {
            return (
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#F9F9FB]">Section B: Micro Business Identity</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Business Name *</label>
                            <input
                                type="text"
                                value={formData.businessName || ''}
                                onChange={(e) => update('businessName', e.target.value)}
                                placeholder="Apex Bakery"
                                className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-semibold text-[#F9F9FB] outline-none focus:border-[#81D7B4]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#7B8B9A] mb-1.5">Business Type *</label>
                            <input
                                type="text"
                                value={formData.businessType || ''}
                                onChange={(e) => update('businessType', e.target.value)}
                                placeholder="e.g. Retail, Grocery, Salon"
                                className="w-full px-4 py-2.5 bg-[#0F1825]/80 border border-[#7B8B9A]/20 rounded-xl text-xs font-semibold text-[#F9F9FB] outline-none focus:border-[#81D7B4]"
                            />
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Default step declaration / terms
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F9F9FB]">Final Declaration & Agreement</h4>
            <p className="text-xs text-[#7B8B9A] leading-relaxed">
                By submitting this application, you declare that all information provided is accurate, legally valid, and compliant with protocol standards.
            </p>
            <div className="p-4 rounded-xl bg-[#1A2538]/40 border border-[#7B8B9A]/15 space-y-2">
                <div className="flex items-start gap-2.5">
                    <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded accent-[#81D7B4] cursor-pointer"
                    />
                    <label htmlFor="agreeTerms" className="text-xs text-[#F9F9FB] cursor-pointer font-medium leading-relaxed">
                        I agree to the BizFi protocol Terms of Listing, RWA attestation guidelines, and authorize onchain verification of enterprise documentation.
                    </label>
                </div>
            </div>
        </div>
    );
}
