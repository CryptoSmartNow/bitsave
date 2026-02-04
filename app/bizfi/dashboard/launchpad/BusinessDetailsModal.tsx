"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    HiOutlineXMark,
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineCurrencyDollar,
    HiOutlineUsers,
    HiOutlineGlobeAlt,
    HiOutlineBriefcase,
    HiOutlineLightBulb,
    HiOutlineClipboardDocumentCheck
} from "react-icons/hi2";

interface BusinessDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any; // Raw metadata
    status?: string | null; // Pass status for the pill
}

// Grouped Fields based on WizardForm.tsx
const SECTIONS = [
    {
        id: 'overview',
        label: 'Identity & Overview',
        icon: HiOutlineBuildingOffice2,
        fields: [
            // Core
            'businessName', 'startupName', 'registeredBusinessName', 'entRegisteredName',
            'entCompanyName', 'operatingName', 'businessType', 'industry', 'companySector',
            'businessDescription', 'projectDescription', 'ideaSummary',
            // Registration
            'isRegistered', 'startupRegistered', 'registrationSite', 'entRegistrationSite',
            'yearStarted', 'yearsInOperation', 'entYearsInOperation',
            // Location
            'country', 'countryOfOperation', 'cityOfOperation', 'businessAddress',
            'operatingLocations', 'entOperatingLocations', 'projectLocation', 'entCountry'
        ]
    },
    {
        id: 'financials',
        label: 'Financials & Funding',
        icon: HiOutlineCurrencyDollar,
        fields: [
            // Revenue/Expenses
            'monthlyRevenue', 'revenueCurrency', 'monthlyExpenses', 'expensesCurrency',
            'revenueRange', 'growthExpenses', 'netProfit', 'projectedRevenue',
            // Assets/Liabilities
            'startupCost', 'inventoryValue', 'currentAssets', 'currentLiabilities',
            'hasDebts', 'debtsDetails',
            // Funding Request
            'raiseAmount', 'raiseCurrency', 'growthRaiseAmount', 'raiseOnBizMarket', 'totalCapitalNeeded',
            // Investment
            'hasInvestors', 'expectedROI', 'annualProjection', 'hasRevenue'
        ]
    },
    {
        id: 'products',
        label: 'Products & Operations',
        icon: HiOutlineBriefcase,
        fields: [
            'mainProducts', 'revenueChannels', 'salesChannels', 'revenueModel',
            'customersPerMonth', 'customerBaseSize', 'earlyUsers', 'repeatCustomers', 'returningCustomersPercent',
            'targetCustomer', 'developmentStage', 'currentStage', 'projectTimeline',
            'keyMetrics', 'toolsUsed', 'inventorySize', 'assetsOwned'
        ]
    },
    {
        id: 'vision',
        label: 'Strategy & Vision',
        icon: HiOutlineLightBulb,
        fields: [
            // Problem/Solution
            'problemSolving', 'solutionWork', 'validation',
            // Future
            'vision12Months', 'successVision', 'whyBuilding', 'biggestChallenge', 'growthChallenge', 'projectRisks',
            // Plans
            'fundUsage', 'capitalUsage', 'fundsUsage', 'fundsUsagePlan', 'expectedMilestones', 'expectedImpact',
            'tokenGrowthCorrelation', 'investorProtection', 'regulatoryCompliance'
        ]
    },
    {
        id: 'team',
        label: 'Team & Management',
        icon: HiOutlineUsers,
        fields: [
            'name', 'email', 'phone', 'ownerName', 'businessEmail', 'businessPhone',
            'teamSize', 'entTeamSize',
            'ceoName', 'ceoEmail', 'cfoName', 'cfoEmail', 'cooName', 'cooEmail',
            'entCeoName', 'entCeoEmail', 'entCfoName', 'entCfoEmail', 'entCooName', 'entCooEmail'
        ]
    },
    {
        id: 'socials',
        label: 'Online Presence & Links',
        icon: HiOutlineGlobeAlt,
        fields: [
            'website', 'twitter', 'linkedin', 'instagram', 'facebook', 'telegram', 'discord',
            'whitepaperUrl', 'pitchDeckUrl', 'mvpLink', 'googleBusinessLink',
            'businessPicturesLink', 'businessRecordsLink', 'builderRecordsLink', 'growthRecordsLink'
        ]
    }
];

export default function BusinessDetailsModal({ isOpen, onClose, data, status = 'Submitted' }: BusinessDetailsModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Helper to format keys for display
    const formatLabel = (key: string) => {
        const overrides: Record<string, string> = {
            monthlyRevenue: 'Monthly Revenue',
            monthlyExpenses: 'Monthly Expenses',
            entRegisteredName: 'Registered Name (Ent)',
            entCompanyName: 'Company Name',
            entRegistrationSite: 'Registration Site',
            entCountry: 'Country',
            entYearsInOperation: 'Years in Operation',
            entTeamSize: 'Team Size',
            mvpLink: 'MVP Link',
            googleBusinessLink: 'Google Maps/Business',
            businessPicturesLink: 'Business Pics (Drive)',
            businessRecordsLink: 'Records (Drive)',
            builderRecordsLink: 'Records (Drive)',
            growthRecordsLink: 'Records (Drive)',
            entCeoName: 'CEO Name',
            entCeoEmail: 'CEO Email',
            entCfoName: 'CFO Name',
            entCooName: 'COO Name',
            ceoName: 'CEO Name',
            cfoName: 'CFO Name',
            cooName: 'COO Name'
        };
        if (overrides[key]) return overrides[key];
        // Convert camelCase to Title Case
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    const formatValue = (key: string, value: any) => {
        if (!value) return 'N/A';
        const strVal = String(value);

        // Currencies
        if (
            key.toLowerCase().includes('revenue') ||
            key.toLowerCase().includes('expenses') ||
            key.toLowerCase().includes('cost') ||
            key.toLowerCase().includes('amount') ||
            key.toLowerCase().includes('profit') ||
            key.toLowerCase().includes('assets') ||
            key.toLowerCase().includes('liabilities') ||
            key.toLowerCase().includes('capital')
        ) {
            // If it's just a number, format it. If it already has symbols, leave it.
            if (!isNaN(Number(strVal)) && strVal.trim() !== '') {
                return `$${Number(strVal).toLocaleString()}`;
            }
            return strVal;
        }

        // Links
        if (
            key.toLowerCase().includes('url') ||
            key.toLowerCase().includes('link') ||
            key.toLowerCase().includes('site') ||
            key.toLowerCase().includes('twitter') ||
            key.toLowerCase().includes('linkedin') ||
            key.toLowerCase().includes('instagram') ||
            key.toLowerCase().includes('facebook')
        ) {
            return (
                <a href={strVal} target="_blank" rel="noopener noreferrer" className="text-[#81D7B4] hover:underline truncate block break-all">
                    {strVal}
                </a>
            );
        }
        return strVal;
    };

    const getStatusColor = (s: string | null | undefined) => {
        const normalized = s?.toLowerCase() || 'submitted';
        switch (normalized) {
            case 'approved': return 'bg-[#81D7B4]/10 text-[#81D7B4] border-[#81D7B4]/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'under_review':
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    if (!isOpen || !data || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(15, 24, 37, 0.95)' }} // Hardcoded Brand Darkest Blue
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl md:rounded-3xl border shadow-2xl"
                    style={{
                        borderColor: 'rgba(129, 215, 180, 0.2)', // Brand Green Border
                        backgroundColor: '#0F1825', // Brand Dark Blue
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 md:px-8 py-5 border-b border-gray-800 bg-[#0A1016]">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className="p-2.5 rounded-xl bg-[#81D7B4]/10 text-[#81D7B4] flex-shrink-0">
                                <HiOutlineDocumentText className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                                    {data.businessName || data.name || data.startupName || "Application Details"}
                                </h2>
                                <p className="text-sm text-gray-400 hidden sm:block">
                                    Full Application Breakdown
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(status)}`}>
                                {status || 'Submitted'}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                            >
                                <HiOutlineXMark className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar bg-[#0F1825]">
                        {SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            
                            // Helper to get value from nested structures (like kyc)
                            const getValue = (data: any, field: string) => {
                                if (data[field] !== undefined) return data[field];
                                if (data.kyc && data.kyc[field] !== undefined) return data.kyc[field];
                                return undefined;
                            };

                            // Check if any fields in this section have data
                            const hasData = section.fields.some(field => {
                                const val = getValue(data, field);
                                return val && String(val).trim() !== '';
                            });
                            
                            if (!hasData) return null;

                            return (
                                <div key={section.id} className="space-y-4">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-800/80">
                                        <SectionIcon className="w-5 h-5 text-[#81D7B4]" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                                            {section.label}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                                        {section.fields.map(field => {
                                            const value = getValue(data, field);
                                            if (!value || (typeof value === 'string' && value.trim() === '')) return null;

                                            // Determine if this field should span row (long text)
                                            const isLongText = String(value).length > 60 ||
                                                ['businessDescription', 'projectDescription', 'problemSolving',
                                                    'solutionWork', 'validation', 'whyBuilding', 'successVision',
                                                    'fundUsage', 'fundsUsagePlan', 'projectRisks'].includes(field);

                                            return (
                                                <div
                                                    key={field}
                                                    className={`p-4 rounded-xl bg-[#152030] border border-gray-800/50 hover:border-[#81D7B4]/30 transition-all ${isLongText ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}`}
                                                >
                                                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                                        {formatLabel(field)}
                                                    </p>
                                                    <div className={`text-sm text-gray-200 ${isLongText ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>
                                                        {formatValue(field, value)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 md:px-8 py-5 border-t border-gray-800 bg-[#0A1016] flex flex-col md:flex-row gap-4 justify-end">
                        {data.attestationUid && (
                            <a
                                href={`https://base.easscan.org/attestation/view/${data.attestationUid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 text-[#81D7B4] px-8 py-3 rounded-xl text-sm font-bold transition-all border border-[#81D7B4]/20 hover:border-[#81D7B4]/40 flex items-center justify-center gap-2"
                            >
                                <HiOutlineClipboardDocumentCheck className="w-5 h-5" />
                                View Attestation
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="w-full md:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-colors border border-gray-700 hover:border-gray-600"
                        >
                            Close Viewer
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
