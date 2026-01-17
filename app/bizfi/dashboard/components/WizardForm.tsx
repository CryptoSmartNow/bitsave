"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HiOutlineCheckCircle,
    HiOutlineArrowRight,
    HiOutlineArrowLeft,
    HiOutlineRocketLaunch,
    HiOutlineExclamationCircle,
    HiOutlineCurrencyDollar,
    HiOutlineXMark
} from "react-icons/hi2";
import { useBizFi, ReferralDiscount } from "../../hooks/useBizFi";
import { useAccount } from "wagmi";
import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { parseUnits, zeroAddress, toHex } from "viem";
import PaymentSummaryModal from "./PaymentSummaryModal";

import { initOnRamp } from '@coinbase/cbpay-js';

type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

interface WizardFormProps {
    selectedTier: {
        id: TierType;
        name: string;
        price: number;
        referralPrice: number;
    };
    referralCode: string;
    isReferralValid: boolean;
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

export default function WizardForm({ selectedTier, referralCode, isReferralValid }: WizardFormProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { evmAddress } = useEvmAddress();
    const { isSignedIn } = useIsSignedIn();
    const address = isWagmiConnected ? wagmiAddress : evmAddress;

    const { registerBusiness, loading, error } = useBizFi();
    const [showNotification, setShowNotification] = useState(false);
    const [showPaymentSummary, setShowPaymentSummary] = useState(false);
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

    const handleBuyCrypto = () => {
        // Trigger the Buy Crypto modal in the parent dashboard component
        const event = new CustomEvent('openBuyCryptoModal');
        window.dispatchEvent(event);
    };

    const openCoinbasePay = async () => {
        if (!address) return;
        try {
            const res = await fetch('/api/bizfi/pay/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            const data = await res.json();

            if (res.ok && data.sessionToken) {
                // Secure CB Pay Init with Session Token
                initOnRamp({
                    sessionToken: data.sessionToken,
                    onSuccess: () => {
                        console.log('Onramp success');
                    },
                    onExit: () => {
                        console.log('Onramp exit');
                    },
                }, (error, instance) => {
                    if (instance) instance.open();
                    if (error) console.error("Onramp error:", error);
                });
            } else {
                // Fallback to Standard CB Pay Init
                initOnRamp({
                    appId: process.env.NEXT_PUBLIC_COINBASE_CDP_PROJECT_ID || process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "8fb8463e-ce60-41f1-8dda-e5b2308db356",
                    widgetParameters: {
                        destinationWallets: [{
                            address: address,
                            blockchains: ["ethereum", "optimism", "base", "polygon"],
                        }],
                    },
                    onSuccess: () => {
                        console.log('Onramp success');
                    },
                    onExit: () => {
                        console.log('Onramp exit');
                    },
                }, (error, instance) => {
                    if (instance) instance.open();
                    if (error) console.error("Onramp error:", error);
                });
            }

        } catch (e) {
            console.error("Failed to start onramp:", e);
            setNotificationConfig({
                type: 'error',
                title: 'Coinbase Pay Error',
                message: 'Could not start Coinbase Pay. Please try again.'
            });
            setShowNotification(true);
        }
    };

    // Listen for Coinbase Pay event from modal
    useEffect(() => {
        const handleOpenCoinbasePay = () => {
            openCoinbasePay();
        };
        window.addEventListener('openCoinbasePay', handleOpenCoinbasePay);
        return () => window.removeEventListener('openCoinbasePay', handleOpenCoinbasePay);
    }, [address]);

    const steps = TIER_STEPS[selectedTier.id];
    const isLastStep = currentStep === steps.length;
    const isFirstStep = currentStep === 1;

    const validateStep = (step: number): boolean => {
        const requiredFields: Record<string, string[]> = {
            '1': ['name', 'email', 'phone', 'birthday', 'bio', 'ownsBusiness'],
        };

        // Add tier-specific required fields
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
                title: 'Missing Fields',
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

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;
        try {
            console.log("Submitting form...", formData);

            // Prepare referral data if applicable
            let referralData: {
                code: string;
                discountPercent: number;
                signature?: `0x${string}`;
                referralData?: ReferralDiscount;
            } | undefined;

            const finalBusinessName = formData.businessName || formData.name || formData.startupName || formData.registeredBusinessName || "";

            if (isReferralValid && referralCode) {
                // Fetch valid signature and data from API
                const tierValue = {
                    'micro': 0,
                    'builder': 1,
                    'growth': 2,
                    'enterprise': 3
                }[selectedTier.id] || 0;

                const apiResponse = await fetch('/api/bizfi/referral/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        referralCode,
                        recipient: address,
                        tier: tierValue,
                        businessName: finalBusinessName
                    })
                });

                const apiData = await apiResponse.json();

                if (!apiData.valid || !apiData.signature) {
                    throw new Error("Failed to verify referral code or generate signature. Please try again.");
                }

                referralData = {
                    code: referralCode,
                    discountPercent: apiData.discountPercent,
                    signature: apiData.signature,
                    referralData: {
                        recipient: apiData.referralData.recipient,
                        tier: apiData.referralData.tier,
                        discountedPrice: BigInt(apiData.referralData.discountedPrice),
                        businessName: apiData.referralData.businessName,
                        nonce: BigInt(apiData.referralData.nonce),
                        deadline: BigInt(apiData.referralData.deadline)
                    }
                };
            }

            const receipt = await registerBusiness(
                finalBusinessName,
                formData,
                selectedTier.id,
                referralData
            );

            console.log("Registration successful!", receipt);

            let businessId: string | null = null;
            if (receipt && receipt.logs) {
                for (const log of receipt.logs) {
                    if (log.topics && log.topics.length >= 2) {
                        if (log.address.toLowerCase() === "0x7c24a938e086d01d252f1cde36783c105784c770") {
                            const topicOne = log.topics[1];
                            if (topicOne) {
                                businessId = BigInt(topicOne).toString();
                                break;
                            }
                        }
                    }
                }
            }

            // Save final business data to MongoDB
            try {
                await fetch('/api/bizfi/business', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transactionHash: receipt.transactionHash,
                        owner: address,
                        businessName: formData.businessName || formData.name,
                        metadata: formData,
                        tier: selectedTier.id,
                        feePaid: isReferralValid ? selectedTier.referralPrice : selectedTier.price,
                        referralCode: referralCode || ""
                    })
                });
            } catch (saveErr) {
                console.error("Failed to save business record to DB", saveErr);
            }

            if (businessId) {
                try {
                    const attestRes = await fetch('/api/bizfi/attest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            businessId: businessId,
                            recipient: address,
                            verificationData: formData,
                            transactionHash: receipt.transactionHash
                        })
                    });

                    const attestData = await attestRes.json();

                    if (attestData.success && attestData.easUid) {
                        setAttestationData({
                            easUid: attestData.easUid,
                            transactionHash: attestData.transactionHash
                        });
                    }
                } catch (attestErr) {
                    console.error("Attestation failed during post-registration:", attestErr);
                }
            }

            // Clear saved data
            if (address) {
                await fetch(`/api/bizfi/draft?address=${address}`, { method: 'DELETE' });
            }
            setFormData({});
            setCurrentStep(1);
            setIsRegistered(true);

        } catch (err: any) {
            console.error("Submission failed:", err);

            // Log to server
            try {
                await fetch('/api/bizfi/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        level: 'error',
                        message: err.message || JSON.stringify(err),
                        stack: err.stack,
                        context: 'WizardForm.handleSubmit (Registration)',
                        user: address
                    })
                });
            } catch (logErr) {
                console.error("Failed to send log to server", logErr);
            }

            setNotificationConfig({
                type: 'error',
                title: 'Registration Failed',
                message: err.message || 'An unknown error occurred. Please try again.'
            });
            setShowNotification(true);
        }
    };
    const updateFormData = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const calculateProfitMargin = (): string => {
        const revenue = parseFloat(formData.monthlyRevenue) || 0;
        const expenses = parseFloat(formData.monthlyExpenses) || 0;
        if (revenue === 0) return "0.00";
        return (((revenue - expenses) / revenue) * 100).toFixed(2);
    };

    if (isRegistered) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 text-center space-y-6">
                <div className="w-20 h-20 bg-[#81D7B4]/10 rounded-full flex items-center justify-center mb-2">
                    <HiOutlineCheckCircle className="w-10 h-10 text-[#81D7B4]" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Registration Successful!</h2>
                    <p className="text-gray-400 max-w-lg mx-auto">
                        Welcome to BizFi. Your business has been successfully listed onchain and attested.
                    </p>
                </div>

                {attestationData && (
                    <div className="bg-gray-800/50 rounded-xl p-4 w-full max-w-md border border-gray-700">
                        <p className="text-sm text-gray-400 mb-2">Attestation UID</p>
                        <div className="flex items-center justify-between gap-2 bg-gray-900 rounded-lg p-3 border border-gray-800">
                            <code className="text-[#81D7B4] text-xs truncate">
                                {attestationData.easUid}
                            </code>
                            <a
                                href={`https://base.easscan.org/attestation/view/${attestationData.easUid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-500 hover:text-white underline transition-colors"
                            >
                                View
                            </a>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                    <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("We’ve officially listed our business on BizMarket by @BitsaveProtocol. Taking the first step toward raising capital onchain and expanding globally. Build globally. Raise globally. Own globally.")}&url=${encodeURIComponent(attestationData ? `https://base.easscan.org/attestation/view/${attestationData.easUid}` : 'https://bizfi.io')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Share to X
                    </a>

                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-6 py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-xl hover:bg-[#6BC4A0] transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Application Progress</h3>
                    <span className="text-sm text-gray-400">
                        Step {currentStep} of {steps.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center w-full">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${index + 1 < currentStep
                                        ? 'bg-[#81D7B4] text-gray-900'
                                        : index + 1 === currentStep
                                            ? 'bg-[#81D7B4] text-gray-900 ring-4 ring-[#81D7B4]/20'
                                            : 'bg-gray-800 text-gray-500'
                                        }`}
                                >
                                    {index + 1 < currentStep ? (
                                        <HiOutlineCheckCircle className="w-5 h-5" />
                                    ) : (
                                        step.section
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 mt-2 hidden md:block text-center">
                                    {step.title}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`h-1 flex-1 mx-2 rounded transition-all ${index + 1 < currentStep ? 'bg-[#81D7B4]' : 'bg-gray-800'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8"
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

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <button
                    onClick={handlePrevious}
                    disabled={isFirstStep}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1 whitespace-nowrap"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                    <span>Previous</span>
                </button>

                {isLastStep && (
                    <button
                        onClick={handleBuyCrypto}
                        className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all border-2 border-[#81D7B4]/30 text-[#81D7B4] hover:bg-[#81D7B4]/10 hover:border-[#81D7B4] backdrop-blur-sm order-3 sm:order-2 whitespace-nowrap"
                        style={{ backgroundColor: 'rgba(129, 215, 180, 0.05)' }}
                    >
                        <HiOutlineCurrencyDollar className="w-5 h-5" />
                        <span>Insufficient Funds? Buy Crypto</span>
                    </button>
                )}

                {isLastStep ? (
                    <div className="flex flex-col items-stretch sm:items-end gap-2 sm:gap-3 order-1 sm:order-3 w-full sm:w-auto">
                        <button
                            onClick={() => {
                                if (!validateStep(currentStep)) return;
                                setShowPaymentSummary(true);
                            }}
                            disabled={!agreedToTerms || loading}
                            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-[#81D7B4]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto whitespace-nowrap"
                        >
                            {loading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    Review & Pay ${isReferralValid ? selectedTier.referralPrice : selectedTier.price}
                                    <HiOutlineRocketLaunch className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Mobile Buy Crypto Button */}
                        <button
                            onClick={handleBuyCrypto}
                            className="md:hidden flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all border border-[#81D7B4]/30 text-[#81D7B4] hover:bg-[#81D7B4]/10 w-full whitespace-nowrap"
                            style={{ backgroundColor: 'rgba(129, 215, 180, 0.05)' }}
                        >
                            <HiOutlineCurrencyDollar className="w-4 h-4" />
                            <span>Need Crypto? Buy Instantly</span>
                        </button>

                        {error && (
                            <div className="mt-2 p-4 rounded-xl border border-red-500/30 bg-red-500/5 backdrop-blur-sm max-w-md">
                                <div className="flex items-start gap-3">
                                    <HiOutlineExclamationCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-400 mb-1">Transaction Error</p>
                                        <p className="text-xs text-red-300/80 leading-relaxed break-words">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#81D7B4] text-gray-900 font-bold rounded-xl hover:bg-[#6BC4A0] transition-all order-1 sm:order-3 whitespace-nowrap"
                    >
                        Next
                        <HiOutlineArrowRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Notification Modal */}
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                        style={{ backgroundColor: 'rgba(15, 24, 37, 0.9)' }}
                        onClick={() => setShowNotification(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl border shadow-2xl w-full max-w-md mx-auto overflow-hidden"
                            style={{
                                backgroundColor: 'rgba(26, 37, 56, 0.98)',
                                borderColor: notificationConfig.type === 'success' ? 'rgba(129, 215, 180, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                            }}
                        >
                            <div className="p-6 sm:p-8">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className="p-2 sm:p-3 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: notificationConfig.type === 'success' ? 'rgba(129, 215, 180, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                        }}
                                    >
                                        {notificationConfig.type === 'success' ? (
                                            <HiOutlineCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#81D7B4]" />
                                        ) : (
                                            <HiOutlineExclamationCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg sm:text-xl font-bold mb-2 pr-8" style={{ color: '#F9F9FB' }}>
                                            {notificationConfig.title}
                                        </h3>
                                        <p
                                            className="text-xs sm:text-sm leading-relaxed mb-6 break-words overflow-wrap-anywhere"
                                            style={{
                                                color: '#9BA8B5',
                                                wordBreak: 'break-word',
                                                overflowWrap: 'anywhere',
                                                hyphens: 'auto'
                                            }}
                                        >
                                            {notificationConfig.message}
                                        </p>
                                        <button
                                            onClick={() => setShowNotification(false)}
                                            className="w-full py-2.5 sm:py-3 rounded-xl font-bold transition-all text-sm sm:text-base"
                                            style={{
                                                backgroundColor: notificationConfig.type === 'success' ? '#81D7B4' : 'rgba(239, 68, 68, 0.8)',
                                                color: notificationConfig.type === 'success' ? '#0F1825' : '#FFFFFF'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = notificationConfig.type === 'success' ? '#6BC4A0' : 'rgba(239, 68, 68, 1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = notificationConfig.type === 'success' ? '#81D7B4' : 'rgba(239, 68, 68, 0.8)';
                                            }}
                                        >
                                            {notificationConfig.type === 'success' ? 'Continue' : 'Close'}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowNotification(false)}
                                        className="transition-colors flex-shrink-0 -mt-1 -mr-1"
                                        style={{ color: '#7B8B9A' }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#F9F9FB'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#7B8B9A'}
                                    >
                                        <HiOutlineXMark className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Payment Summary Modal */}
            <PaymentSummaryModal
                isOpen={showPaymentSummary}
                onClose={() => setShowPaymentSummary(false)}
                onConfirm={() => {
                    setShowPaymentSummary(false);
                    handleSubmit();
                }}
                isLoading={loading}
                tier={selectedTier}
                businessName={formData.businessName || formData.name || formData.startupName || formData.registeredBusinessName || formData.entRegisteredName || ''}
                isReferralValid={isReferralValid}
                referralCode={referralCode}
            />
        </div>
    );
}

function renderFormSection(
    tier: TierType,
    step: number,
    formData: any,
    updateFormData: (field: string, value: any) => void,
    agreedToTerms: boolean,
    setAgreedToTerms: (value: boolean) => void,
    calculateProfitMargin: () => string
) {
    // Section A - General Information (common to all tiers)
    if (step === 1) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
                    <p className="text-gray-400 text-sm">Let's start with some details about you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country *</label>
                        <input
                            type="text"
                            value={formData.country || ''}
                            onChange={(e) => updateFormData('country', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
                        <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => updateFormData('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Telegram Handle *</label>
                        <input
                            type="text"
                            placeholder="@username"
                            value={formData.telegram || ''}
                            onChange={(e) => updateFormData('telegram', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Birthday (YY/MM/DD) *</label>
                        <input
                            type="date"
                            value={formData.birthday || ''}
                            onChange={(e) => updateFormData('birthday', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Social Handles <span className="text-gray-500 text-xs">(Optional but Important - 2 credible socials recommended)</span>
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Twitter</label>
                            <input
                                type="url"
                                placeholder="https://twitter.com/username"
                                value={formData.twitter || ''}
                                onChange={(e) => updateFormData('twitter', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">LinkedIn</label>
                            <input
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={formData.linkedin || ''}
                                onChange={(e) => updateFormData('linkedin', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Instagram</label>
                            <input
                                type="url"
                                placeholder="https://instagram.com/username"
                                value={formData.instagram || ''}
                                onChange={(e) => updateFormData('instagram', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Facebook</label>
                            <input
                                type="url"
                                placeholder="https://facebook.com/username"
                                value={formData.facebook || ''}
                                onChange={(e) => updateFormData('facebook', e.target.value)}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Brief Professional Bio *</label>
                    <textarea
                        rows={4}
                        value={formData.bio || ''}
                        onChange={(e) => updateFormData('bio', e.target.value)}
                        placeholder="Tell us about your professional background and experience..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Do you own the business/company you're listing? *</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="ownsBusinessRadio"
                                value="yes"
                                checked={formData.ownsBusiness === 'yes'}
                                onChange={(e) => updateFormData('ownsBusiness', e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="text-white">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="ownsBusinessRadio"
                                value="no"
                                checked={formData.ownsBusiness === 'no'}
                                onChange={(e) => updateFormData('ownsBusiness', e.target.value)}
                                className="w-4 h-4"
                            />
                            <span className="text-white">No</span>
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    // Tier-specific sections
    switch (tier) {
        case 'micro':
            return renderMicroBusinessSection(step, formData, updateFormData, agreedToTerms, setAgreedToTerms, calculateProfitMargin);
        case 'builder':
            return renderBuilderSection(step, formData, updateFormData, agreedToTerms, setAgreedToTerms);
        case 'growth':
            return renderGrowthSection(step, formData, updateFormData, agreedToTerms, setAgreedToTerms);
        case 'enterprise':
            return renderEnterpriseSection(step, formData, updateFormData, agreedToTerms, setAgreedToTerms);
        default:
            return null;
    }
}

// Helper component for input fields
const InputField = ({ label, required = false, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            {label} {required && <span className="text-[#81D7B4]">*</span>}
        </label>
        <input
            {...props}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
        />
    </div>
);

const TextAreaField = ({ label, required = false, rows = 4, ...props }: any) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
            {label} {required && <span className="text-[#81D7B4]">*</span>}
        </label>
        <textarea
            {...props}
            rows={rows}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none"
        />
    </div>
);

// MICRO BUSINESS TIER IMPLEMENTATION
function renderMicroBusinessSection(
    step: number,
    formData: any,
    updateFormData: (field: string, value: any) => void,
    agreedToTerms: boolean,
    setAgreedToTerms: (value: boolean) => void,
    calculateProfitMargin: () => string
) {
    if (step === 2) {
        // Section B - Business Identity
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Business Identity</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your business.</p>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Business Name"
                        required
                        type="text"
                        value={formData.businessName || ''}
                        onChange={(e: any) => updateFormData('businessName', e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Is your business registered in your country? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isRegistered"
                                    value="yes"
                                    checked={formData.isRegistered === 'yes'}
                                    onChange={(e) => updateFormData('isRegistered', e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-white">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isRegistered"
                                    value="no"
                                    checked={formData.isRegistered === 'no'}
                                    onChange={(e) => updateFormData('isRegistered', e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-white">No</span>
                            </label>
                        </div>
                    </div>

                    <InputField
                        label="Business Type"
                        required
                        type="text"
                        placeholder="e.g., vendor, fashion, food, digital service"
                        value={formData.businessType || ''}
                        onChange={(e: any) => updateFormData('businessType', e.target.value)}
                    />

                    <div>
                        <TextAreaField
                            label="Business Description (max 150 words)"
                            required
                            rows={4}
                            value={formData.businessDescription || ''}
                            onChange={(e: any) => updateFormData('businessDescription', e.target.value)}
                            maxLength={750}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {(formData.businessDescription || '').split(' ').filter((w: string) => w).length}/150 words
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <InputField
                            label="Year Started"
                            required
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={formData.yearStarted || ''}
                            onChange={(e: any) => updateFormData('yearStarted', e.target.value)}
                        />
                        <InputField
                            label="Country of Operation"
                            required
                            type="text"
                            value={formData.countryOfOperation || ''}
                            onChange={(e: any) => updateFormData('countryOfOperation', e.target.value)}
                        />
                        <InputField
                            label="City of Operation"
                            required
                            type="text"
                            value={formData.cityOfOperation || ''}
                            onChange={(e: any) => updateFormData('cityOfOperation', e.target.value)}
                        />
                    </div>

                    <TextAreaField
                        label="Business Address"
                        required
                        rows={2}
                        value={formData.businessAddress || ''}
                        onChange={(e: any) => updateFormData('businessAddress', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Business Owner Full Name"
                            required
                            type="text"
                            value={formData.ownerName || ''}
                            onChange={(e: any) => updateFormData('ownerName', e.target.value)}
                        />
                        <InputField
                            label="Business Contact Email"
                            required
                            type="email"
                            value={formData.businessEmail || ''}
                            onChange={(e: any) => updateFormData('businessEmail', e.target.value)}
                        />
                    </div>

                    <InputField
                        label="Business Contact Phone Number"
                        required
                        type="tel"
                        value={formData.businessPhone || ''}
                        onChange={(e: any) => updateFormData('businessPhone', e.target.value)}
                    />

                    <InputField
                        label="Google My Business Link or Google Map Location Pin"
                        type="url"
                        placeholder="https://..."
                        value={formData.googleBusinessLink || ''}
                        onChange={(e: any) => updateFormData('googleBusinessLink', e.target.value)}
                    />

                    <div>
                        <InputField
                            label="Google Drive Link to Business Pictures"
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.businessPicturesLink || ''}
                            onChange={(e: any) => updateFormData('businessPicturesLink', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Include store fronts, logos, social media screenshots where applicable
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 3) {
        // Section C - Operational Data
        const profitMargin = calculateProfitMargin();

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Operational Data</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your growth.</p>
                </div>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Average Monthly Revenue <span className="text-[#81D7B4]">*</span>
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.revenueCurrency || 'USD'}
                                    onChange={(e) => updateFormData('revenueCurrency', e.target.value)}
                                    className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                >
                                    {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.monthlyRevenue || ''}
                                    onChange={(e) => updateFormData('monthlyRevenue', e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Average Monthly Expenses <span className="text-[#81D7B4]">*</span>
                            </label>
                            <div className="flex gap-2">
                                <select
                                    value={formData.expensesCurrency || 'USD'}
                                    onChange={(e) => updateFormData('expensesCurrency', e.target.value)}
                                    className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                >
                                    {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.monthlyExpenses || ''}
                                    onChange={(e) => updateFormData('monthlyExpenses', e.target.value)}
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-lg">
                        <label className="block text-sm font-medium text-[#81D7B4] mb-2">Profit Margin Estimate (Auto-calculated)</label>
                        <div className="text-3xl font-bold text-white">{profitMargin}%</div>
                        <p className="text-xs text-gray-400 mt-1">Formula: (Revenue - Expenses) / Revenue × 100</p>
                    </div>

                    <InputField
                        label="Average Number of Customers Per Month"
                        required
                        type="number"
                        min="0"
                        value={formData.customersPerMonth || ''}
                        onChange={(e: any) => updateFormData('customersPerMonth', e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Primary Sales Channels <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Online', 'Offline', 'Both'].map(channel => (
                                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="salesChannels"
                                        value={channel.toLowerCase()}
                                        checked={formData.salesChannels === channel.toLowerCase()}
                                        onChange={(e) => updateFormData('salesChannels', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{channel}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Do you have repeat customers? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="repeatCustomers"
                                        value={option.toLowerCase()}
                                        checked={formData.repeatCustomers === option.toLowerCase()}
                                        onChange={(e) => updateFormData('repeatCustomers', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Do you have any financial business records? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasFinancialRecords"
                                        value={option.toLowerCase()}
                                        checked={formData.hasFinancialRecords === option.toLowerCase()}
                                        onChange={(e) => updateFormData('hasFinancialRecords', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Receipts, notebooks, POS reports, etc.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 4) {
        // Section D - Growth Reflection
        const challengeWordCount = (formData.biggestChallenge || '').split(' ').filter((w: string) => w).length;
        const fundUsageWordCount = (formData.fundUsage || '').split(' ').filter((w: string) => w).length;

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Growth Reflection</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your business needs.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <TextAreaField
                            label="What is your biggest challenge right now? (max 1,000 words)"
                            required
                            rows={6}
                            value={formData.biggestChallenge || ''}
                            onChange={(e: any) => updateFormData('biggestChallenge', e.target.value)}
                        />
                        <p className={`text-xs mt-1 ${challengeWordCount > 1000 ? 'text-red-400' : 'text-gray-500'}`}>
                            {challengeWordCount}/1,000 words
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            How much do you want to raise? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={formData.raiseCurrency || 'USD'}
                                onChange={(e) => updateFormData('raiseCurrency', e.target.value)}
                                className="px-3 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            >
                                {CURRENCIES.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                            </select>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.raiseAmount || ''}
                                onChange={(e) => updateFormData('raiseAmount', e.target.value)}
                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">USD equivalent will be calculated</p>
                    </div>

                    <div>
                        <TextAreaField
                            label="What would you do with additional funding? (max 2,000 words)"
                            required
                            rows={8}
                            value={formData.fundUsage || ''}
                            onChange={(e: any) => updateFormData('fundUsage', e.target.value)}
                        />
                        <p className={`text-xs mt-1 ${fundUsageWordCount > 2000 ? 'text-red-400' : 'text-gray-500'}`}>
                            {fundUsageWordCount}/2,000 words
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Feel free to include your business records for the past 1 year if available. Upload them on Google Drive and add the link below.
                        </p>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.businessRecordsLink || ''}
                            onChange={(e) => updateFormData('businessRecordsLink', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none mt-2"
                        />
                    </div>

                    <TextAreaField
                        label="Where do you see your business in 12 months?"
                        required
                        rows={4}
                        value={formData.vision12Months || ''}
                        onChange={(e: any) => updateFormData('vision12Months', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 5) {
        return renderDeclarationSection(agreedToTerms, setAgreedToTerms);
    }

    return null;
}

// BUILDER TIER IMPLEMENTATION
function renderBuilderSection(
    step: number,
    formData: any,
    updateFormData: (field: string, value: any) => void,
    agreedToTerms: boolean,
    setAgreedToTerms: (value: boolean) => void
) {
    if (step === 2) {
        // Section B - Startup Details
        const ideaWordCount = (formData.ideaSummary || '').split(' ').filter((w: string) => w).length;

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Startup Details</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your Start-Up</p>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Startup/Project Name"
                        required
                        type="text"
                        value={formData.startupName || ''}
                        onChange={(e: any) => updateFormData('startupName', e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Is your business registered yet? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="startupRegistered"
                                        value={option.toLowerCase()}
                                        checked={formData.startupRegistered === option.toLowerCase()}
                                        onChange={(e) => updateFormData('startupRegistered', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">If it isn't you can contact Timog Services, but continue filing the form.</p>
                    </div>

                    <div>
                        <TextAreaField
                            label="Idea Summary and USP (max 150 words)"
                            required
                            rows={4}
                            value={formData.ideaSummary || ''}
                            onChange={(e: any) => updateFormData('ideaSummary', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">{ideaWordCount}/150 words</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Development Stage <span className="text-[#81D7B4]">*</span>
                        </label>
                        <select
                            value={formData.developmentStage || ''}
                            onChange={(e) => updateFormData('developmentStage', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                        >
                            <option value="">Select stage</option>
                            <option value="idea">Idea</option>
                            <option value="prototype">Prototype</option>
                            <option value="testing">Testing</option>
                            <option value="launch">Launch</option>
                        </select>
                    </div>

                    <TextAreaField
                        label="What problem are you solving?"
                        required
                        rows={3}
                        value={formData.problemSolving || ''}
                        onChange={(e: any) => updateFormData('problemSolving', e.target.value)}
                    />

                    <TextAreaField
                        label="Who is your target customer?"
                        required
                        rows={3}
                        value={formData.targetCustomer || ''}
                        onChange={(e: any) => updateFormData('targetCustomer', e.target.value)}
                    />

                    <TextAreaField
                        label="How will your solution work in the real world?"
                        required
                        rows={3}
                        value={formData.solutionWork || ''}
                        onChange={(e: any) => updateFormData('solutionWork', e.target.value)}
                    />

                    <TextAreaField
                        label="Did you validate your idea, carry out customer interviews or surveys? Describe the results, including links if available."
                        required
                        rows={4}
                        value={formData.validation || ''}
                        onChange={(e: any) => updateFormData('validation', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 3) {
        // Section C - Startup Potential
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Startup Potential</h2>
                    <p className="text-gray-400 text-sm">Let's see your potential</p>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Do you have early users? (How many)"
                        type="number"
                        min="0"
                        value={formData.earlyUsers || ''}
                        onChange={(e: any) => updateFormData('earlyUsers', e.target.value)}
                    />

                    <InputField
                        label="Have you built an MVP? Share the link"
                        type="url"
                        placeholder="https://..."
                        value={formData.mvpLink || ''}
                        onChange={(e: any) => updateFormData('mvpLink', e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Have you earned any revenue yet? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasRevenue"
                                        value={option.toLowerCase()}
                                        checked={formData.hasRevenue === option.toLowerCase()}
                                        onChange={(e) => updateFormData('hasRevenue', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <InputField
                        label="Projected 12-month revenue (estimate)"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="USD"
                        value={formData.projectedRevenue || ''}
                        onChange={(e: any) => updateFormData('projectedRevenue', e.target.value)}
                    />

                    <InputField
                        label="Expected startup cost"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="USD"
                        value={formData.startupCost || ''}
                        onChange={(e: any) => updateFormData('startupCost', e.target.value)}
                    />

                    <div>
                        <TextAreaField
                            label="What will you use the raised capital for?"
                            required
                            rows={4}
                            value={formData.capitalUsage || ''}
                            onChange={(e: any) => updateFormData('capitalUsage', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Feel free to include your business records for the past 1 year if available. Upload them on Google Drive and add the link below.
                        </p>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.builderRecordsLink || ''}
                            onChange={(e) => updateFormData('builderRecordsLink', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none mt-2"
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (step === 4) {
        // Section D - Commitment & Vision
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Commitment & Vision</h2>
                    <p className="text-gray-400 text-sm">How big are you thinking?</p>
                </div>

                <div className="space-y-4">
                    <TextAreaField
                        label="Why are you building this project?"
                        required
                        rows={5}
                        value={formData.whyBuilding || ''}
                        onChange={(e: any) => updateFormData('whyBuilding', e.target.value)}
                    />

                    <TextAreaField
                        label="What will success look like for you in 2 years?"
                        required
                        rows={5}
                        value={formData.successVision || ''}
                        onChange={(e: any) => updateFormData('successVision', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 5) {
        return renderDeclarationSection(agreedToTerms, setAgreedToTerms);
    }

    return null;
}

// GROWTH BUSINESS TIER IMPLEMENTATION
function renderGrowthSection(
    step: number,
    formData: any,
    updateFormData: (field: string, value: any) => void,
    agreedToTerms: boolean,
    setAgreedToTerms: (value: boolean) => void
) {
    if (step === 2) {
        // Section B - Company Details
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Company Details</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your Brand</p>
                </div>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Registered Business Name"
                            required
                            type="text"
                            value={formData.registeredBusinessName || ''}
                            onChange={(e: any) => updateFormData('registeredBusinessName', e.target.value)}
                        />
                        <InputField
                            label="Country of Registration"
                            required
                            type="text"
                            value={formData.countryOfRegistration || ''}
                            onChange={(e: any) => updateFormData('countryOfRegistration', e.target.value)}
                        />
                    </div>

                    <InputField
                        label="Public Registration site for Verification"
                        type="url"
                        placeholder="https://..."
                        value={formData.registrationSite || ''}
                        onChange={(e: any) => updateFormData('registrationSite', e.target.value)}
                    />

                    <InputField
                        label="Operating Name Or Brand"
                        required
                        type="text"
                        value={formData.operatingName || ''}
                        onChange={(e: any) => updateFormData('operatingName', e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Industry <span className="text-[#81D7B4]">*</span>
                        </label>
                        <select
                            value={formData.industry || ''}
                            onChange={(e) => updateFormData('industry', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none"
                        >
                            <option value="">Select industry</option>
                            {INDUSTRIES.map(ind => <option key={ind} value={ind.toLowerCase()}>{ind}</option>)}
                        </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Years in Operation"
                            required
                            type="number"
                            min="0"
                            value={formData.yearsInOperation || ''}
                            onChange={(e: any) => updateFormData('yearsInOperation', e.target.value)}
                        />
                        <InputField
                            label="Team Size"
                            required
                            type="number"
                            min="1"
                            value={formData.teamSize || ''}
                            onChange={(e: any) => updateFormData('teamSize', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Founder/CEO Name"
                            required
                            type="text"
                            value={formData.ceoName || ''}
                            onChange={(e: any) => updateFormData('ceoName', e.target.value)}
                        />
                        <InputField
                            label="CEO Email"
                            required
                            type="email"
                            value={formData.ceoEmail || ''}
                            onChange={(e: any) => updateFormData('ceoEmail', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="CFO Name"
                            type="text"
                            value={formData.cfoName || ''}
                            onChange={(e: any) => updateFormData('cfoName', e.target.value)}
                        />
                        <InputField
                            label="CFO Email"
                            type="email"
                            value={formData.cfoEmail || ''}
                            onChange={(e: any) => updateFormData('cfoEmail', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="COO Name"
                            type="text"
                            value={formData.cooName || ''}
                            onChange={(e: any) => updateFormData('cooName', e.target.value)}
                        />
                        <InputField
                            label="COO Email"
                            type="email"
                            value={formData.cooEmail || ''}
                            onChange={(e: any) => updateFormData('cooEmail', e.target.value)}
                        />
                    </div>

                    <TextAreaField
                        label="Countries/Cities in Operation (List all you operate in)"
                        required
                        rows={2}
                        placeholder="e.g., Nigeria (Lagos, Abuja), Kenya (Nairobi)"
                        value={formData.operatingLocations || ''}
                        onChange={(e: any) => updateFormData('operatingLocations', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 3) {
        // Section C - Finance
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Finance</h2>
                    <p className="text-gray-400 text-sm">Give us estimates not exacts, we'll ask for exacts during KYC & KYB</p>
                </div>

                <div className="space-y-4">
                    <InputField
                        label="Monthly Revenue for Last 6 Months (range)"
                        required
                        type="text"
                        placeholder="e.g., $10,000 - $15,000"
                        value={formData.revenueRange || ''}
                        onChange={(e: any) => updateFormData('revenueRange', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Monthly Expenses"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.growthExpenses || ''}
                            onChange={(e: any) => updateFormData('growthExpenses', e.target.value)}
                        />
                        <InputField
                            label="Net Profit"
                            required
                            type="number"
                            step="0.01"
                            placeholder="USD"
                            value={formData.netProfit || ''}
                            onChange={(e: any) => updateFormData('netProfit', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Customer Base Size"
                            required
                            type="number"
                            min="0"
                            value={formData.customerBaseSize || ''}
                            onChange={(e: any) => updateFormData('customerBaseSize', e.target.value)}
                        />
                        <InputField
                            label="Percentage of Returning Customers"
                            required
                            type="number"
                            min="0"
                            max="100"
                            placeholder="%"
                            value={formData.returningCustomersPercent || ''}
                            onChange={(e: any) => updateFormData('returningCustomersPercent', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Debts or Loans? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4 mb-2">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasDebts"
                                        value={option.toLowerCase()}
                                        checked={formData.hasDebts === option.toLowerCase()}
                                        onChange={(e) => updateFormData('hasDebts', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                        {formData.hasDebts === 'yes' && (
                            <textarea
                                placeholder="Provide details..."
                                value={formData.debtsDetails || ''}
                                onChange={(e) => updateFormData('debtsDetails', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none resize-none"
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Any existing investors? <span className="text-[#81D7B4]">*</span>
                        </label>
                        <div className="flex gap-4">
                            {['Yes', 'No'].map(option => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="hasInvestors"
                                        value={option.toLowerCase()}
                                        checked={formData.hasInvestors === option.toLowerCase()}
                                        onChange={(e) => updateFormData('hasInvestors', e.target.value)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-white">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 4) {
        // Section D - Operations & Business Growth Readiness
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Operations & Business Growth Readiness</h2>
                    <p className="text-gray-400 text-sm">Tell us about your operations</p>
                </div>

                <div className="space-y-4">
                    <TextAreaField
                        label="Main Products/Services"
                        required
                        rows={3}
                        value={formData.mainProducts || ''}
                        onChange={(e: any) => updateFormData('mainProducts', e.target.value)}
                    />

                    <TextAreaField
                        label="Key Revenue Channels"
                        required
                        rows={2}
                        value={formData.revenueChannels || ''}
                        onChange={(e: any) => updateFormData('revenueChannels', e.target.value)}
                    />

                    <InputField
                        label="Do you use POS, accounting tools, or invoices?"
                        required
                        type="text"
                        placeholder="e.g., QuickBooks, Square POS"
                        value={formData.toolsUsed || ''}
                        onChange={(e: any) => updateFormData('toolsUsed', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Inventory Size"
                            type="number"
                            min="0"
                            placeholder="Number of items"
                            value={formData.inventorySize || ''}
                            onChange={(e: any) => updateFormData('inventorySize', e.target.value)}
                        />
                        <InputField
                            label="Inventory Value"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.inventoryValue || ''}
                            onChange={(e: any) => updateFormData('inventoryValue', e.target.value)}
                        />
                    </div>

                    <TextAreaField
                        label="Assets Owned (equipment, vehicles, machinery)"
                        rows={2}
                        value={formData.assetsOwned || ''}
                        onChange={(e: any) => updateFormData('assetsOwned', e.target.value)}
                    />

                    <TextAreaField
                        label="Key metrics you're proud of"
                        required
                        rows={2}
                        value={formData.keyMetrics || ''}
                        onChange={(e: any) => updateFormData('keyMetrics', e.target.value)}
                    />

                    <TextAreaField
                        label="Biggest growth challenge"
                        required
                        rows={3}
                        value={formData.growthChallenge || ''}
                        onChange={(e: any) => updateFormData('growthChallenge', e.target.value)}
                    />

                    <InputField
                        label="What amount do you plan to raise?"
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="USD"
                        value={formData.growthRaiseAmount || ''}
                        onChange={(e: any) => updateFormData('growthRaiseAmount', e.target.value)}
                    />

                    <div>
                        <TextAreaField
                            label="What will the funds be used for?"
                            required
                            rows={4}
                            value={formData.fundsUsage || ''}
                            onChange={(e: any) => updateFormData('fundsUsage', e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Feel free to include your business records for the past 1 year if available. Upload them on Google Drive and add the link below.
                        </p>
                        <input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.growthRecordsLink || ''}
                            onChange={(e) => updateFormData('growthRecordsLink', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-[#81D7B4] focus:outline-none mt-2"
                        />
                    </div>

                    <TextAreaField
                        label="Expected business impact in 2 years"
                        required
                        rows={3}
                        value={formData.expectedImpact || ''}
                        onChange={(e: any) => updateFormData('expectedImpact', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 5) {
        return renderDeclarationSection(agreedToTerms, setAgreedToTerms);
    }

    return null;
}

// ENTERPRISE PROJECT TIER IMPLEMENTATION
function renderEnterpriseSection(
    step: number,
    formData: any,
    updateFormData: (field: string, value: any) => void,
    agreedToTerms: boolean,
    setAgreedToTerms: (value: boolean) => void
) {
    if (step === 2) {
        // Section B - Company Details
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Company Details</h2>
                    <p className="text-gray-400 text-sm">Let's get to know your Company</p>
                </div>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Registered Business Name"
                            required
                            type="text"
                            value={formData.entRegisteredName || ''}
                            onChange={(e: any) => updateFormData('entRegisteredName', e.target.value)}
                        />
                        <InputField
                            label="Company Name"
                            required
                            type="text"
                            value={formData.entCompanyName || ''}
                            onChange={(e: any) => updateFormData('entCompanyName', e.target.value)}
                        />
                    </div>

                    <InputField
                        label="Public Registration site for Verification"
                        type="url"
                        placeholder="https://..."
                        value={formData.entRegistrationSite || ''}
                        onChange={(e: any) => updateFormData('entRegistrationSite', e.target.value)}
                    />

                    <InputField
                        label="Country"
                        required
                        type="text"
                        value={formData.entCountry || ''}
                        onChange={(e: any) => updateFormData('entCountry', e.target.value)}
                    />

                    <InputField
                        label="Company Sector (real estate, agriculture, manufacturing, etc.)"
                        required
                        type="text"
                        placeholder="e.g., Real Estate, Agriculture"
                        value={formData.companySector || ''}
                        onChange={(e: any) => updateFormData('companySector', e.target.value)}
                    />

                    <InputField
                        label="Enterprise Project Location"
                        required
                        type="text"
                        value={formData.projectLocation || ''}
                        onChange={(e: any) => updateFormData('projectLocation', e.target.value)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Years in Operation"
                            required
                            type="number"
                            min="0"
                            value={formData.entYearsInOperation || ''}
                            onChange={(e: any) => updateFormData('entYearsInOperation', e.target.value)}
                        />
                        <InputField
                            label="Team Size"
                            required
                            type="number"
                            min="1"
                            value={formData.entTeamSize || ''}
                            onChange={(e: any) => updateFormData('entTeamSize', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Founder/CEO Name"
                            required
                            type="text"
                            value={formData.entCeoName || ''}
                            onChange={(e: any) => updateFormData('entCeoName', e.target.value)}
                        />
                        <InputField
                            label="CEO Email"
                            required
                            type="email"
                            value={formData.entCeoEmail || ''}
                            onChange={(e: any) => updateFormData('entCeoEmail', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="CFO Name"
                            type="text"
                            value={formData.entCfoName || ''}
                            onChange={(e: any) => updateFormData('entCfoName', e.target.value)}
                        />
                        <InputField
                            label="CFO Email"
                            type="email"
                            value={formData.entCfoEmail || ''}
                            onChange={(e: any) => updateFormData('entCfoEmail', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="COO Name"
                            type="text"
                            value={formData.entCooName || ''}
                            onChange={(e: any) => updateFormData('entCooName', e.target.value)}
                        />
                        <InputField
                            label="COO Email"
                            type="email"
                            value={formData.entCooEmail || ''}
                            onChange={(e: any) => updateFormData('entCooEmail', e.target.value)}
                        />
                    </div>

                    <TextAreaField
                        label="Countries/Cities in Operation (List all you operate in)"
                        required
                        rows={2}
                        placeholder="e.g., Nigeria (Lagos, Abuja), Kenya (Nairobi)"
                        value={formData.entOperatingLocations || ''}
                        onChange={(e: any) => updateFormData('entOperatingLocations', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 3) {
        // Section C - Project Executive Summary
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Project Executive Summary</h2>
                    <p className="text-gray-400 text-sm">Tell us about your project</p>
                </div>

                <div className="space-y-4">
                    <TextAreaField
                        label="Project Description"
                        required
                        rows={5}
                        value={formData.projectDescription || ''}
                        onChange={(e: any) => updateFormData('projectDescription', e.target.value)}
                    />

                    <TextAreaField
                        label="Current Stage (planning, pre-construction, execution, expansion - please give context)"
                        required
                        rows={3}
                        value={formData.currentStage || ''}
                        onChange={(e: any) => updateFormData('currentStage', e.target.value)}
                    />

                    <InputField
                        label="Estimated Project Timeline"
                        required
                        type="text"
                        placeholder="e.g., 18 months"
                        value={formData.projectTimeline || ''}
                        onChange={(e: any) => updateFormData('projectTimeline', e.target.value)}
                    />

                    <TextAreaField
                        label="What are the major project risks?"
                        required
                        rows={4}
                        value={formData.projectRisks || ''}
                        onChange={(e: any) => updateFormData('projectRisks', e.target.value)}
                    />

                    <TextAreaField
                        label="What ensures investor protection?"
                        required
                        rows={4}
                        value={formData.investorProtection || ''}
                        onChange={(e: any) => updateFormData('investorProtection', e.target.value)}
                    />

                    <TextAreaField
                        label="Current regulatory compliance (if applicable)"
                        rows={3}
                        value={formData.regulatoryCompliance || ''}
                        onChange={(e: any) => updateFormData('regulatoryCompliance', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 4) {
        // Section D - Financial Requirements
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Financial Requirements</h2>
                    <p className="text-gray-400 text-sm">Let's understand your financial needs</p>
                </div>

                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Total Capital Needed"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.totalCapitalNeeded || ''}
                            onChange={(e: any) => updateFormData('totalCapitalNeeded', e.target.value)}
                        />
                        <InputField
                            label="Amount You Want to Raise on BizMarket (In USD please)"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.raiseOnBizMarket || ''}
                            onChange={(e: any) => updateFormData('raiseOnBizMarket', e.target.value)}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField
                            label="Current Assets Value"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.currentAssets || ''}
                            onChange={(e: any) => updateFormData('currentAssets', e.target.value)}
                        />
                        <InputField
                            label="Current Liabilities"
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="USD"
                            value={formData.currentLiabilities || ''}
                            onChange={(e: any) => updateFormData('currentLiabilities', e.target.value)}
                        />
                    </div>

                    <InputField
                        label="Expected ROI for investors"
                        required
                        type="text"
                        placeholder="e.g., 15-20% annually"
                        value={formData.expectedROI || ''}
                        onChange={(e: any) => updateFormData('expectedROI', e.target.value)}
                    />

                    <TextAreaField
                        label="Revenue Model Breakdown"
                        required
                        rows={4}
                        value={formData.revenueModel || ''}
                        onChange={(e: any) => updateFormData('revenueModel', e.target.value)}
                    />

                    <TextAreaField
                        label="Annual Projection for ROI (1-3 years)"
                        required
                        rows={3}
                        value={formData.annualProjection || ''}
                        onChange={(e: any) => updateFormData('annualProjection', e.target.value)}
                    />
                </div>
            </div>
        );
    }

    if (step === 5) {
        // Section E - Funding Expectations
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Funding Expectations</h2>
                    <p className="text-gray-400 text-sm">How will you use the funds?</p>
                </div>

                <div className="space-y-4">
                    <TextAreaField
                        label="How do you plan to use the funds raised?"
                        required
                        rows={5}
                        value={formData.fundsUsagePlan || ''}
                        onChange={(e: any) => updateFormData('fundsUsagePlan', e.target.value)}
                    />

                    <TextAreaField
                        label="Expected milestones after funding"
                        required
                        rows={4}
                        value={formData.expectedMilestones || ''}
                        onChange={(e: any) => updateFormData('expectedMilestones', e.target.value)}
                    />

                    <TextAreaField
                        label="How will business growth reflect in token growth?"
                        required
                        rows={4}
                        value={formData.tokenGrowthCorrelation || ''}
                        onChange={(e: any) => updateFormData('tokenGrowthCorrelation', e.target.value)}
                    />

                    <div>
                        <TextAreaField
                            label="List any project assets you have"
                            required
                            rows={4}
                            placeholder="e.g., Land documents, Machinery/equipment lists, Existing buildings or structures, Valuation documents, Film Scripts, Studio etc."
                            value={formData.projectAssets || ''}
                            onChange={(e: any) => updateFormData('projectAssets', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Verification will be done during KYC/KYB (e.g., Land documents, Machinery/equipment lists, Existing buildings or structures, Valuation documents, Film Scripts, Studio etc.)
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 6) {
        return renderDeclarationSection(agreedToTerms, setAgreedToTerms);
    }

    return null;
}

function renderDeclarationSection(agreedToTerms: boolean, setAgreedToTerms: (value: boolean) => void) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Declaration and Consent</h2>
                <p className="text-gray-400 text-sm">Please review and confirm the following.</p>
            </div>

            <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group p-4 sm:p-6 rounded-xl border border-gray-700 hover:border-[#81D7B4]/50 transition-all bg-gray-900/30">
                    <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 text-[#81D7B4] focus:ring-[#81D7B4] focus:ring-offset-0 flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                        I confirm that all the information provided in this application is accurate and truthful to the best of my knowledge.
                        I consent to Bitsave accessing, verifying, and processing all the details and information I have provided for the purpose
                        of evaluating my business listing application. I understand that providing false information may result in the rejection
                        of my application or removal from the platform.
                    </span>
                </label>
            </div>

            <div className="p-4 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-lg">
                <h3 className="text-lg font-bold text-[#81D7B4] mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="text-[#81D7B4] mt-1">•</span>
                        <span>Your application will be reviewed within 24-48 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#81D7B4] mt-1">•</span>
                        <span>We may contact you for additional information or clarification</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#81D7B4] mt-1">•</span>
                        <span>Once approved, you'll receive instructions for KYC/KYB verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-[#81D7B4] mt-1">•</span>
                        <span>After verification, your business will be listed on BizMarket</span>
                    </li>
                </ul>
            </div>

            {!agreedToTerms && (
                <p className="text-sm text-yellow-400">
                    Please check the declaration box above to proceed with submission.
                </p>
            )}
        </div>
    );
}
