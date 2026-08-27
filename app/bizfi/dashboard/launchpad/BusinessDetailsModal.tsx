'use client';

import { Cancel01Icon, Activity01Icon, Dollar01Icon, UserMultipleIcon, Building04Icon, Briefcase01Icon, BulbIcon, GlobeIcon, LinkSquare01Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
        icon: Building04Icon,
        fields: [
            'businessName', 'startupName', 'registeredBusinessName', 'entRegisteredName',
            'entCompanyName', 'operatingName', 'businessType', 'industry', 'companySector',
            'businessDescription', 'projectDescription', 'ideaSummary',
            'isRegistered', 'startupRegistered', 'registrationSite', 'entRegistrationSite',
            'yearStarted', 'yearsInOperation', 'entYearsInOperation',
            'country', 'countryOfOperation', 'cityOfOperation', 'businessAddress',
            'operatingLocations', 'entOperatingLocations', 'projectLocation', 'entCountry'
        ]
    },
    {
        id: 'financials',
        label: 'Financials & Funding',
        icon: Dollar01Icon,
        fields: [
            'monthlyRevenue', 'revenueCurrency', 'monthlyExpenses', 'expensesCurrency',
            'revenueRange', 'growthExpenses', 'netProfit', 'projectedRevenue',
            'startupCost', 'inventoryValue', 'currentAssets', 'currentLiabilities',
            'hasDebts', 'debtsDetails',
            'raiseAmount', 'raiseCurrency', 'growthRaiseAmount', 'raiseOnBizMarket', 'totalCapitalNeeded',
            'hasInvestors', 'expectedROI', 'annualProjection', 'hasRevenue'
        ]
    },
    {
        id: 'products',
        label: 'Products & Operations',
        icon: Briefcase01Icon,
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
        icon: BulbIcon,
        fields: [
            'problemSolving', 'solutionWork', 'validation',
            'vision12Months', 'successVision', 'whyBuilding', 'biggestChallenge', 'growthChallenge', 'projectRisks',
            'fundUsage', 'capitalUsage', 'fundsUsage', 'fundsUsagePlan', 'expectedMilestones', 'expectedImpact',
            'tokenGrowthCorrelation', 'investorProtection', 'regulatoryCompliance'
        ]
    },
    {
        id: 'team',
        label: 'Team & Management',
        icon: UserMultipleIcon,
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
        icon: GlobeIcon,
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
            cfoName: 'CEO Email',
            cooName: 'COO Name'
        };
        if (overrides[key]) return overrides[key];
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    const formatValue = (key: string, value: any) => {
        if (!value) return 'N/A';
        const strVal = String(value);

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
            if (!isNaN(Number(strVal)) && strVal.trim() !== '') {
                return `$${Number(strVal).toLocaleString()}`;
            }
            return strVal;
        }

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
                <a 
                    href={strVal.startsWith('http') ? strVal : `https://${strVal}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#81D7B4] hover:underline flex items-center gap-1.5 truncate break-all"
                >
                    <span className="truncate">{strVal}</span>
                    <LinkSquare01Icon className="w-3.5 h-3.5 shrink-0" />
                </a>
            );
        }
        return strVal;
    };

    const getStatusColor = (s: string | null | undefined) => {
        const normalized = s?.toLowerCase() || 'submitted';
        switch (normalized) {
            case 'approved': return 'bg-[#81D7B4]/10 text-[#81D7B4] border-[#81D7B4]/25';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/25';
            case 'under_review':
            case 'pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/25';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
        }
    };

    if (!isOpen || !data || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#0F1825]/90 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 15 }}
                    className="relative w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden rounded-3xl border border-[#7B8B9A]/20 bg-[#0F1825] shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#7B8B9A]/15 bg-[#1A2538]/40">
                        <div className="flex items-center gap-3.5 overflow-hidden">
                            <div className="p-2.5 rounded-2xl bg-[#81D7B4]/15 text-[#81D7B4] shrink-0 border border-[#81D7B4]/30">
                                <Activity01Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-black text-[#F9F9FB] truncate">
                                    {data.businessName || data.name || data.startupName || "Application Details"}
                                </h2>
                                <p className="text-xs text-[#7B8B9A]">
                                    Complete Metadata Record & Verification Dossier
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${getStatusColor(status)}`}>
                                {status || 'Submitted'}
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-[#0F1825] hover:bg-[#1A2538] border border-[#7B8B9A]/20 text-[#7B8B9A] hover:text-[#F9F9FB] transition-colors cursor-pointer"
                            >
                                <Cancel01Icon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                        {SECTIONS.map((section) => {
                            const SectionIcon = section.icon;
                            
                            const getValue = (record: any, field: string) => {
                                if (record[field] !== undefined) return record[field];
                                if (record.kyc && record.kyc[field] !== undefined) return record.kyc[field];
                                return undefined;
                            };

                            const hasData = section.fields.some(field => {
                                const val = getValue(data, field);
                                return val && String(val).trim() !== '';
                            });
                            
                            if (!hasData) return null;

                            return (
                                <div key={section.id} className="space-y-3.5">
                                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#7B8B9A]/15">
                                        <SectionIcon className="w-4 h-4 text-[#81D7B4]" />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-[#F9F9FB]">
                                            {section.label}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {section.fields.map(field => {
                                            const value = getValue(data, field);
                                            if (!value || (typeof value === 'string' && value.trim() === '')) return null;

                                            const isLongText = String(value).length > 60 ||
                                                ['businessDescription', 'projectDescription', 'problemSolving',
                                                    'solutionWork', 'validation', 'whyBuilding', 'successVision',
                                                    'fundUsage', 'fundsUsagePlan', 'projectRisks'].includes(field);

                                            return (
                                                <div
                                                    key={field}
                                                    className={`p-3.5 rounded-2xl bg-[#1A2538]/30 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/30 transition-all ${
                                                        isLongText ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''
                                                    }`}
                                                >
                                                    <p className="text-[10px] font-bold text-[#7B8B9A] mb-1 uppercase tracking-wider">
                                                        {formatLabel(field)}
                                                    </p>
                                                    <div className={`text-xs sm:text-sm font-medium text-[#F9F9FB] ${isLongText ? 'leading-relaxed whitespace-pre-wrap' : ''}`}>
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
                    <div className="px-6 sm:px-8 py-4 border-t border-[#7B8B9A]/15 bg-[#1A2538]/30 flex items-center justify-between">
                        <span className="text-xs text-[#7B8B9A]">
                            BizFi Attestation Registry
                        </span>
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                            Close Dossier
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
