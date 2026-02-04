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
    HiOutlineClock
} from 'react-icons/hi2';
import { motion } from 'framer-motion';
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

export default function BusinessDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showAgreement, setShowAgreement] = useState(false);

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

    const DetailCard = ({ label, value, icon: Icon }: { label: string; value: string | number | undefined; icon?: any }) => (
        <div className="bg-[#1A2538] p-4 rounded-xl border border-[#7B8B9A]/10 flex items-start gap-4">
            {Icon && (
                <div className="w-10 h-10 rounded-lg bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#9BA8B5] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[#F9F9FB] font-medium break-words">{value || 'N/A'}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1825] flex items-center justify-center text-[#9BA8B5]">
                <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full mr-3"></div>
                Loading details...
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="min-h-screen bg-[#0F1825] flex flex-col items-center justify-center text-[#9BA8B5] gap-4">
                <p className="text-red-400">{error || 'Business not found'}</p>
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A2538] rounded-lg hover:bg-[#1A2538]/80 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="self-start flex items-center gap-2 text-[#9BA8B5] hover:text-[#81D7B4] transition-colors mb-2 md:mb-0"
                    >
                        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Businesses
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleMessage}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1A2538] text-[#81D7B4] rounded-lg border border-[#81D7B4]/20 hover:bg-[#81D7B4]/10 transition-all"
                        >
                            <HiOutlineChatBubbleLeftRight className="w-5 h-5" />
                            Message
                        </button>
                        <button 
                            onClick={() => setShowAgreement(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#81D7B4] text-[#0F1825] rounded-lg font-bold hover:bg-[#81D7B4]/90 transition-all"
                        >
                            <HiOutlineDocumentText className="w-5 h-5" />
                            Loan Agreement
                        </button>
                    </div>
                </div>

                {/* Title Section */}
                <div className="flex items-start gap-6 bg-[#1A2538]/50 p-6 rounded-2xl border border-[#7B8B9A]/10 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] font-bold text-4xl border border-[#81D7B4]/20">
                        {business.businessName.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#F9F9FB] mb-2">{business.businessName}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-[#9BA8B5] font-mono text-sm">
                            <span className="bg-[#0F1825] px-2 py-1 rounded border border-[#7B8B9A]/20">
                                ID: {business.transactionHash}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>Joined {format(new Date(business.createdAt), 'PPpp')}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                         <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                            business.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            business.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                            {business.status === 'approved' && <HiCheckCircle className="w-5 h-5" />}
                            {business.status === 'pending' && <HiOutlineClock className="w-5 h-5" />}
                            {business.status === 'rejected' && <HiXCircle className="w-5 h-5" />}
                            <span className="font-bold capitalize">{business.status}</span>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                            {business.status !== 'approved' && (
                                <button
                                    onClick={() => handleStatusUpdate('approved')}
                                    disabled={updating}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded hover:bg-green-500/30 transition-colors"
                                >
                                    Approve
                                </button>
                            )}
                            {business.status !== 'rejected' && (
                                <button
                                    onClick={() => handleStatusUpdate('rejected')}
                                    disabled={updating}
                                    className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded hover:bg-red-500/30 transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DetailCard 
                        label="Business Tier" 
                        value={business.tier} 
                        icon={HiOutlineBuildingStorefront} 
                    />
                    <DetailCard 
                        label="Owner Address" 
                        value={`${business.owner.slice(0, 6)}...${business.owner.slice(-4)}`} 
                        icon={HiOutlineWallet} 
                    />
                    <DetailCard 
                        label="Fee Paid" 
                        value={business.feePaid ? `$${business.feePaid}` : 'Free'} 
                        icon={HiOutlineCurrencyDollar} 
                    />
                    <DetailCard 
                        label="Referral Code" 
                        value={business.referralCode || 'None'} 
                        icon={HiOutlineTicket} 
                    />
                </div>

                {/* KYC Data Section */}
                {business.metadata?.kyc && (
                    <div className="bg-[#1A2538] rounded-2xl border border-[#7B8B9A]/10 overflow-hidden">
                        <div className="p-6 border-b border-[#7B8B9A]/10 bg-[#1A2538]/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <HiOutlineDocumentText className="w-6 h-6 text-[#81D7B4]" />
                                KYC Verification Data
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="break-words">
                                    <p className="text-xs font-medium text-[#9BA8B5] mb-1">ID Type</p>
                                    <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 uppercase">
                                        {business.metadata.kyc.idType}
                                    </p>
                                </div>
                                <div className="break-words">
                                    <p className="text-xs font-medium text-[#9BA8B5] mb-1">ID Number</p>
                                    <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 font-mono">
                                        {business.metadata.kyc.idNumber}
                                    </p>
                                </div>
                                <div className="break-words">
                                    <p className="text-xs font-medium text-[#9BA8B5] mb-1">Payout Details</p>
                                    <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10">
                                        {business.metadata.kyc.payoutDetails} ({business.metadata.kyc.payoutMethod})
                                    </p>
                                </div>
                                <div className="break-words">
                                    <p className="text-xs font-medium text-[#9BA8B5] mb-1">Registered Business?</p>
                                    <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 capitalize">
                                        {business.metadata.kyc.isRegistered}
                                    </p>
                                </div>
                                {business.metadata.kyc.registrationNumber && (
                                    <div className="break-words">
                                        <p className="text-xs font-medium text-[#9BA8B5] mb-1">Registration Number</p>
                                        <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 font-mono">
                                            {business.metadata.kyc.registrationNumber}
                                        </p>
                                    </div>
                                )}
                                <div className="break-words">
                                    <p className="text-xs font-medium text-[#9BA8B5] mb-1">Contact Channel</p>
                                    <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 capitalize">
                                        {business.metadata.kyc.contactChannel}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {business.metadata.kyc.idDocumentLink && (
                                    <a 
                                        href={business.metadata.kyc.idDocumentLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg hover:bg-[#81D7B4]/20 transition-colors border border-[#81D7B4]/20"
                                    >
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                        <span className="text-sm font-bold truncate">View ID Document</span>
                                    </a>
                                )}
                                {business.metadata.kyc.selfieLink && (
                                    <a 
                                        href={business.metadata.kyc.selfieLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg hover:bg-[#81D7B4]/20 transition-colors border border-[#81D7B4]/20"
                                    >
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                        <span className="text-sm font-bold truncate">View Selfie</span>
                                    </a>
                                )}
                                {business.metadata.kyc.businessDocsLink && (
                                    <a 
                                        href={business.metadata.kyc.businessDocsLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-[#81D7B4]/10 text-[#81D7B4] rounded-lg hover:bg-[#81D7B4]/20 transition-colors border border-[#81D7B4]/20"
                                    >
                                        <HiOutlineDocumentText className="w-5 h-5" />
                                        <span className="text-sm font-bold truncate">View Business Docs</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Business Metadata Section */}
                <div className="bg-[#1A2538] rounded-2xl border border-[#7B8B9A]/10 overflow-hidden">
                    <div className="p-6 border-b border-[#7B8B9A]/10 bg-[#1A2538]/50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <HiOutlineBuildingStorefront className="w-6 h-6 text-[#81D7B4]" />
                            Business / Project Details
                        </h2>
                    </div>
                    <div className="p-6">
                        {business.metadata ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(business.metadata).map(([key, value]) => {
                                    // Skip internal fields and KYC (already displayed)
                                    if (!value || key === 'step' || key === 'agreedToTerms' || key === 'kyc') return null;
                                    
                                    // Format key
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    
                                    // Format value
                                    let formattedValue: any = value;
                                    if (typeof value === 'boolean') formattedValue = value ? 'Yes' : 'No';
                                    if (typeof value === 'object') formattedValue = JSON.stringify(value);

                                    return (
                                        <div key={key} className="break-words">
                                            <p className="text-xs font-medium text-[#9BA8B5] mb-1">{formattedKey}</p>
                                            <p className="text-[#F9F9FB] bg-[#0F1825] p-3 rounded-lg border border-[#7B8B9A]/10 text-sm">
                                                {formattedValue}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-[#9BA8B5]">
                                No additional metadata available.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loan Agreement Modal */}
            {showAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1825]/90 backdrop-blur-sm">
                    <div className="bg-[#1A2538] w-full max-w-4xl h-[80vh] rounded-2xl flex flex-col relative">
                        <button 
                            onClick={() => setShowAgreement(false)}
                            className="absolute top-4 right-4 p-2 bg-[#0F1825] rounded-full text-[#9BA8B5] hover:text-white z-10"
                        >
                            <HiXCircle className="w-6 h-6" />
                        </button>
                        <div className="flex-1 overflow-hidden p-2">
                            <LoanAgreementEditor 
                                business={business} 
                                onClose={() => setShowAgreement(false)} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
