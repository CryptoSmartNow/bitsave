'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
    HiOutlineArrowLeft,
    HiOutlineBuildingStorefront,
    HiOutlineWallet,
    HiOutlineCalendar,
    HiOutlineCurrencyDollar,
    HiOutlineTicket,
    HiOutlineChatBubbleLeftRight,
    HiOutlineDocumentText,
    HiCheckCircle,
    HiXCircle,
    HiOutlineClock,
    HiOutlineIdentification,
    HiOutlineGlobeAlt,
    HiOutlinePhone,
    HiOutlineArrowDownTray,
    HiOutlineClipboardDocumentCheck,
    HiOutlineTableCells,
    HiOutlineCheckCircle,
    HiOutlineXCircle
} from 'react-icons/hi2';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import LoanAgreementEditor from '../../components/LoanAgreementEditor';

interface Business {
    transactionHash: string;
    owner: string;
    businessName: string;
    tier: string;
    status: string;
    createdAt: string;
    feePaid?: string;
    referralCode?: string;
    metadata?: any;
}

type TabType = 'overview' | 'kyc' | 'raw';

export default function BusinessDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        if (id) {
            fetchBusiness();
        }
    }, [id]);

    const fetchBusiness = async () => {
        try {
            const res = await fetch(`/api/bizfi/business?transactionHash=${id}`);
            if (!res.ok) throw new Error('Failed to fetch business');
            const data = await res.json();
            if (data && data.length > 0) {
                setBusiness(data[0]);
            } else {
                setError('Business not found');
            }
        } catch (err) {
            setError('Error loading business details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!business) return;
        setUpdating(true);
        try {
            const res = await fetch('/api/bizfi/admin/business/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transactionHash: business.transactionHash,
                    owner: business.owner,
                    status: newStatus
                })
            });

            if (res.ok) {
                setBusiness(prev => prev ? { ...prev, status: newStatus } : null);
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Error updating status');
        } finally {
            setUpdating(false);
        }
    };

    const handleMessage = () => {
        if (!business) return;
        const params = new URLSearchParams({
            businessId: business.owner,
            businessName: business.businessName
        });
        router.push(`/bizfi/admin/chat?${params.toString()}`);
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1825] flex flex-col items-center justify-center text-[#9BA8B5] gap-4">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-[#81D7B4]/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-t-4 border-[#81D7B4] rounded-full animate-spin"></div>
                </div>
                <p className="animate-pulse tracking-widest text-sm uppercase font-medium">Loading Business Profile...</p>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="min-h-screen bg-[#0F1825] flex flex-col items-center justify-center text-[#9BA8B5] gap-6">
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <HiXCircle className="w-12 h-12 text-red-500" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-[#F9F9FB]">{error || 'Business not found'}</h2>
                    <p className="text-lg text-[#9BA8B5]">The business profile you requested could not be located.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-8 py-3 bg-[#1A2538] rounded-xl hover:bg-[#1A2538]/80 transition-all border border-[#7B8B9A]/10 text-[#F9F9FB] font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" /> Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[#0F1825] text-[#F9F9FB] pb-20 overflow-x-hidden relative font-sans"
        >
            {/* Background Ambient Effects */}
            <div className="fixed top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-[#1A2538]/50 to-transparent opacity-40 pointer-events-none" />
            <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#81D7B4]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-10 relative z-10">
                {/* Navigation Header */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
                    <button
                        onClick={() => router.back()}
                        className="self-start flex items-center gap-3 text-[#9BA8B5] hover:text-[#F9F9FB] transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-[#1A2538]/50 flex items-center justify-center border border-[#7B8B9A]/10 group-hover:border-[#81D7B4]/30 transition-colors">
                            <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-medium">Back to Businesses</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleMessage}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A2538]/50 backdrop-blur-md text-[#81D7B4] rounded-lg border border-[#81D7B4]/20 hover:bg-[#81D7B4]/10 transition-all font-medium text-sm"
                        >
                            <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
                            <span className="whitespace-nowrap">Message Owner</span>
                        </button>
                        <button
                            onClick={() => setShowAgreement(true)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#81D7B4] text-[#0F1825] rounded-lg font-bold hover:bg-[#6BC4A0] transition-all shadow-lg shadow-[#81D7B4]/20 text-sm"
                        >
                            <HiOutlineDocumentText className="w-4 h-4" />
                            <span className="whitespace-nowrap">Loan Agreement</span>
                        </button>
                    </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="mb-10 relative">
                    <div className="bg-[#1A2538]/30 backdrop-blur-xl rounded-3xl border border-[#7B8B9A]/10 p-8 md:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <HiOutlineBuildingStorefront className="w-64 h-64 text-[#81D7B4]" />
                        </div>

                        <div className="flex flex-col gap-6 relative z-10">
                            {/* Actions Row */}
                            <div className="flex justify-end w-full">
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                    <div className="flex items-center bg-[#0F1825]/80 p-1.5 rounded-xl border border-[#7B8B9A]/10 shadow-inner w-full sm:w-auto backdrop-blur-sm">
                                        {['approved', 'rejected'].map((status) => {
                                            if (business.status === status) return null;
                                            const isApproved = status === 'approved';
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusUpdate(status)}
                                                    disabled={updating}
                                                    className={`
                                                        flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 whitespace-nowrap
                                                        ${isApproved
                                                            ? 'text-[#81D7B4] hover:bg-[#81D7B4]/10 hover:shadow-[0_0_15px_rgba(129,215,180,0.1)]'
                                                            : 'text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(248,113,113,0.1)]'
                                                        }
                                                        disabled:opacity-50 disabled:cursor-not-allowed
                                                    `}
                                                >
                                                    {isApproved ? (
                                                        <HiOutlineCheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <HiOutlineXCircle className="w-4 h-4" />
                                                    )}
                                                    <span>Mark as {isApproved ? 'Approved' : 'Rejected'}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Business Info Row */}
                            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#1A2538] to-[#0F1825] border border-[#7B8B9A]/20 flex items-center justify-center text-[#81D7B4] font-bold text-3xl sm:text-4xl shadow-xl shrink-0">
                                    {business.businessName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F9FB] tracking-tight leading-tight break-words">
                                            {business.businessName}
                                        </h1>
                                        <div className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${business.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            business.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${business.status === 'approved' ? 'bg-green-400' :
                                                business.status === 'pending' ? 'bg-yellow-400' :
                                                    'bg-red-400'
                                                }`} />
                                            {business.status}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-[#9BA8B5] text-xs sm:text-sm">
                                        <div className="flex items-center gap-2 font-mono" title={business.transactionHash}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#7B8B9A]/50"></span>
                                            <span className="truncate">ID: {business.transactionHash.slice(0, 6)}...{business.transactionHash.slice(-4)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <HiOutlineCalendar className="w-4 h-4 text-[#81D7B4] shrink-0" />
                                            <span className="whitespace-nowrap">Joined {format(new Date(business.createdAt), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

                    {/* Left Sidebar: Stats & Owner (4 cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4 sm:space-y-6 lg:sticky lg:top-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <StatCard
                                label="Business Tier"
                                value={business.tier}
                                icon={HiOutlineBuildingStorefront}
                                highlight
                            />
                            <StatCard
                                label="Fee Paid"
                                value={business.feePaid ? `$${business.feePaid}` : 'Free'}
                                icon={HiOutlineCurrencyDollar}
                            />
                        </div>

                        {/* Owner Details Card */}
                        <div className="bg-[#1A2538]/30 backdrop-blur-md rounded-2xl border border-[#7B8B9A]/10 p-4 sm:p-6">
                            <h3 className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider mb-4 sm:mb-5 flex items-center gap-2">
                                <HiOutlineWallet className="w-4 h-4 text-[#81D7B4]" />
                                Owner Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[11px] text-[#9BA8B5] mb-1.5 uppercase font-medium">Wallet Address</p>
                                    <div className="p-3 bg-[#0F1825]/50 rounded-lg border border-[#7B8B9A]/10 font-mono text-xs sm:text-sm text-[#F9F9FB] break-all select-all hover:border-[#81D7B4]/30 transition-colors">
                                        {business.owner}
                                    </div>
                                </div>

                                {business.referralCode && (
                                    <div>
                                        <p className="text-[11px] text-[#9BA8B5] mb-1.5 uppercase font-medium">Referral Code</p>
                                        <div className="flex items-center gap-3 p-3 bg-[#0F1825]/50 rounded-lg border border-[#7B8B9A]/10">
                                            <div className="w-8 h-8 rounded-md bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] shrink-0">
                                                <HiOutlineTicket className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-[#F9F9FB] tracking-wide break-all">{business.referralCode}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content: Tabs (8 cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-8">
                        {/* Custom Tabs */}
                        <div className="flex items-center gap-1 mb-6 p-1 bg-[#1A2538]/30 rounded-xl border border-[#7B8B9A]/10 w-full md:w-fit overflow-x-auto no-scrollbar backdrop-blur-sm">
                            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
                            <TabButton active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} label="KYC & Documents" />
                            <TabButton active={activeTab === 'raw'} onClick={() => setActiveTab('raw')} label="Raw Data" />
                        </div>

                        <div className="min-h-[400px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="bg-[#1A2538]/30 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 p-6 md:p-8">
                                            <div className="mb-8 pb-4 border-b border-[#7B8B9A]/10">
                                                <h2 className="text-xl font-bold text-[#F9F9FB]">Business Details</h2>
                                                <p className="text-sm text-[#9BA8B5] mt-1">Comprehensive information submitted by the business owner</p>
                                            </div>

                                            {business.metadata ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    {Object.entries(business.metadata).map(([key, value]) => {
                                                        if (!value || ['step', 'agreedToTerms', 'kyc'].includes(key)) return null;

                                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                                        let formattedValue: any = value;
                                                        if (typeof value === 'boolean') formattedValue = value ? 'Yes' : 'No';
                                                        if (typeof value === 'object') formattedValue = JSON.stringify(value);

                                                        return (
                                                            <div key={key} className="group">
                                                                <p className="text-xs font-medium text-[#9BA8B5] uppercase tracking-wider mb-1.5 group-hover:text-[#81D7B4] transition-colors">{formattedKey}</p>
                                                                <div className="text-[#F9F9FB] text-base font-medium break-words leading-relaxed py-2 border-b border-[#7B8B9A]/5 group-hover:border-[#7B8B9A]/10 transition-colors">
                                                                    {formattedValue}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 opacity-50">
                                                    <HiOutlineClipboardDocumentCheck className="w-12 h-12 mx-auto mb-4 text-[#9BA8B5]" />
                                                    <p className="text-[#9BA8B5] font-medium">No additional metadata provided.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'kyc' && (
                                    <motion.div
                                        key="kyc"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-6"
                                    >
                                        {business.metadata?.kyc ? (
                                            <div className="bg-[#1A2538]/30 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 p-6 md:p-8">
                                                <div className="mb-8 pb-4 border-b border-[#7B8B9A]/10">
                                                    <h2 className="text-xl font-bold text-[#F9F9FB]">KYC Verification</h2>
                                                    <p className="text-sm text-[#9BA8B5] mt-1">Identity and business registration documents</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                                    <div className="space-y-5">
                                                        <div className="flex items-center gap-2 text-[#81D7B4] font-bold text-sm uppercase tracking-wider mb-2">
                                                            <HiOutlineIdentification className="w-5 h-5" />
                                                            Identity Info
                                                        </div>
                                                        <InfoRow label="ID Type" value={business.metadata.kyc.idType} />
                                                        <InfoRow label="ID Number" value={business.metadata.kyc.idNumber} mono />
                                                        <InfoRow label="Contact" value={business.metadata.kyc.contactChannel} />
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="flex items-center gap-2 text-[#81D7B4] font-bold text-sm uppercase tracking-wider mb-2">
                                                            <HiOutlineBuildingStorefront className="w-5 h-5" />
                                                            Business Status
                                                        </div>
                                                        <InfoRow label="Registered" value={business.metadata.kyc.isRegistered} />
                                                        {business.metadata.kyc.registrationNumber && (
                                                            <InfoRow label="Registration No." value={business.metadata.kyc.registrationNumber} mono />
                                                        )}
                                                        <InfoRow label="Payout Method" value={business.metadata.kyc.payoutMethod} />
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-[#7B8B9A]/10">
                                                    <h3 className="text-xs font-bold text-[#9BA8B5] uppercase tracking-wider mb-6">Documents</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                        <DocumentCard label="ID Document" url={business.metadata.kyc.idDocumentLink} />
                                                        <DocumentCard label="Selfie Photo" url={business.metadata.kyc.selfieLink} />
                                                        <DocumentCard label="Business Docs" url={business.metadata.kyc.businessDocsLink} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-[#1A2538]/30 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 p-12 text-center">
                                                <div className="w-16 h-16 rounded-full bg-[#1A2538] border border-[#7B8B9A]/10 flex items-center justify-center mx-auto mb-4 text-[#9BA8B5]">
                                                    <HiOutlineIdentification className="w-8 h-8" />
                                                </div>
                                                <h3 className="text-lg font-bold text-[#F9F9FB] mb-2">KYC Not Submitted</h3>
                                                <p className="text-[#9BA8B5]">The business has not provided KYC details yet.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'raw' && (
                                    <motion.div
                                        key="raw"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="bg-[#1A2538]/30 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 p-6 overflow-hidden">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-bold text-[#F9F9FB] uppercase tracking-wider">Raw JSON</h3>
                                                <span className="text-[10px] font-mono text-[#9BA8B5] bg-[#0F1825] px-2 py-1 rounded border border-[#7B8B9A]/10">Read-only</span>
                                            </div>
                                            <div className="bg-[#0F1825] rounded-xl p-4 overflow-x-auto border border-[#7B8B9A]/10 custom-scrollbar">
                                                <pre className="text-xs font-mono text-[#81D7B4] leading-relaxed">
                                                    {JSON.stringify(business, null, 2)}
                                                </pre>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Loan Agreement Modal */}
            <AnimatePresence>
                {showAgreement && (
                    <LoanAgreementEditor
                        business={business}
                        onClose={() => setShowAgreement(false)}
                        onSave={async (data) => {
                            console.log('Saved agreement:', data);
                            setShowAgreement(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Sub-components

function StatCard({ label, value, icon: Icon, highlight = false }: { label: string, value: string, icon: any, highlight?: boolean }) {
    return (
        <div className={`p-5 rounded-2xl border transition-all duration-300 group hover:scale-[1.02] ${highlight
            ? 'bg-gradient-to-br from-[#81D7B4]/10 to-[#1A2538]/40 border-[#81D7B4]/20'
            : 'bg-[#1A2538]/30 backdrop-blur-md border-[#7B8B9A]/10 hover:bg-[#1A2538]/50'
            }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${highlight ? 'bg-[#81D7B4]/20 text-[#81D7B4]' : 'bg-[#7B8B9A]/10 text-[#9BA8B5] group-hover:text-[#F9F9FB] transition-colors'
                }`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9BA8B5] mb-1">{label}</p>
            <p className={`text-xl font-bold ${highlight ? 'text-[#81D7B4]' : 'text-[#F9F9FB]'}`}>{value}</p>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative whitespace-nowrap ${active
                ? 'text-[#F9F9FB] shadow-sm'
                : 'text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#F9F9FB]/5'
                }`}
        >
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#7B8B9A]/20 rounded-lg"
                    style={{ borderRadius: 8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <span className="relative z-10">{label}</span>
        </button>
    );
}

function InfoRow({ label, value, mono = false }: { label: string, value: string, mono?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#7B8B9A]/5 last:border-0">
            <span className="text-sm font-medium text-[#9BA8B5]">{label}</span>
            <span className={`text-sm text-[#F9F9FB] text-right truncate max-w-full sm:max-w-[60%] ${mono ? 'font-mono text-xs bg-[#0F1825]/50 px-2 py-1 rounded border border-[#7B8B9A]/10' : 'font-medium'}`} title={typeof value === 'string' ? value : undefined}>
                {value || 'N/A'}
            </span>
        </div>
    );
}

function DocumentCard({ label, url }: { label: string, url: string | undefined }) {
    if (!url) return (
        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-[#0F1825]/30 text-[#9BA8B5]/50 rounded-xl border border-[#7B8B9A]/10 border-dashed">
            <HiOutlineDocumentText className="w-6 h-6" />
            <span className="text-xs font-medium">{label} Missing</span>
        </div>
    );

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-3 p-4 bg-[#1A2538]/40 text-[#81D7B4] rounded-xl border border-[#7B8B9A]/10 hover:border-[#81D7B4]/30 hover:bg-[#1A2538]/60 transition-all group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                <HiOutlineArrowDownTray className="w-5 h-5" />
            </div>
            <div className="text-center relative z-10">
                <span className="block text-xs font-bold text-[#F9F9FB] mb-0.5">{label}</span>
                <span className="text-[10px] text-[#81D7B4] opacity-80 group-hover:opacity-100">
                    View Document
                </span>
            </div>
        </a>
    );
}
