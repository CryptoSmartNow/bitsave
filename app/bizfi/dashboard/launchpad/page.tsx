'use client';

import { Activity01Icon, Dollar01Icon, RocketIcon, Shield01Icon, CheckmarkCircle02Icon, Calendar03Icon, PlusSignIcon, Copy01Icon, Folder01Icon, ArrowDown01Icon, Building04Icon } from "hugeicons-react";
import { useState, useEffect, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import KYCStatus from "./components/KYCStatus";
import KYCSubmissionForm from "./components/KYCSubmissionForm";
import ProjectTimeline from "./components/ProjectTimeline";
import RiskAssessment from "./components/RiskAssessment";
import BusinessDetailsModal from "./BusinessDetailsModal";
import EmptyState from "@/app/components/EmptyState";
import "../../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

interface BusinessProject {
    businessName: string;
    owner: string;
    tier: number | string;
    tierName?: string;
    status: string;
    totalRaise: number;
    transactionHash: string;
    kycSteps?: any[];
    milestones?: any[];
    risks?: any[];
    metadata?: any;
    createdAt?: string;
}

export default function LaunchPadPage() {
    const { user, authenticated, ready } = usePrivy();
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const router = useRouter();

    const [businesses, setBusinesses] = useState<BusinessProject[]>([]);
    const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [copiedHash, setCopiedHash] = useState(false);

    const isConnected = ready && (authenticated || isWagmiConnected);

    const userIdentifiers = useMemo(() => {
        const ids = new Set<string>();
        if (wagmiAddress) {
            ids.add(wagmiAddress);
            ids.add(wagmiAddress.toLowerCase());
        }
        if (user?.wallet?.address) {
            ids.add(user.wallet.address);
            ids.add(user.wallet.address.toLowerCase());
        }
        if (user?.id) {
            ids.add(user.id);
        }
        if (user?.email?.address) {
            ids.add(user.email.address);
            ids.add(user.email.address.toLowerCase());
        }
        // @ts-ignore
        if (user?.google?.email) {
            // @ts-ignore
            ids.add(user.google.email);
            // @ts-ignore
            ids.add(user.google.email.toLowerCase());
        }
        // @ts-ignore
        if (user?.phone?.number) {
            // @ts-ignore
            ids.add(user.phone.number);
        }

        if (user?.linkedAccounts && Array.isArray(user.linkedAccounts)) {
            user.linkedAccounts.forEach((account: any) => {
                if (account.address) {
                    ids.add(account.address);
                    ids.add(account.address.toLowerCase());
                }
                if (account.email) {
                    ids.add(account.email);
                    ids.add(account.email.toLowerCase());
                }
                if (account.phoneNumber) {
                    ids.add(account.phoneNumber);
                }
            });
        }
        return Array.from(ids).filter(Boolean);
    }, [wagmiAddress, user]);

    const fetchBusinesses = async () => {
        if (!ready) return;

        if (userIdentifiers.length === 0) {
            setLoading(false);
            setBusinesses([]);
            return;
        }

        try {
            setLoading(true);
            const queryParams = encodeURIComponent(userIdentifiers.join(','));
            const res = await fetch(`/api/bizfi/business?owner=${queryParams}`);
            
            if (res.ok) {
                const data = await res.json();
                const list: BusinessProject[] = Array.isArray(data) ? data : (data.businesses || []);
                setBusinesses(list);
                
                if (list.length > 0) {
                    if (!selectedTxHash || !list.some(b => b.transactionHash === selectedTxHash)) {
                        setSelectedTxHash(list[0].transactionHash);
                    }
                } else {
                    setSelectedTxHash(null);
                }
            } else {
                console.error("Failed to fetch businesses:", await res.text());
            }
        } catch (err) {
            console.error("Failed to fetch launchpad businesses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ready) {
            fetchBusinesses();
        }
    }, [ready, userIdentifiers]);

    const activeProject = businesses.find(b => b.transactionHash === selectedTxHash) || businesses[0] || null;

    const handleProjectSelect = (project: BusinessProject) => {
        setSelectedTxHash(project.transactionHash);
        setIsProjectSelectorOpen(false);
    };

    const handleCopyHash = (hash: string) => {
        if (!hash) return;
        navigator.clipboard.writeText(hash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
    };

    const getStatusConfig = (status?: string) => {
        const normalized = (status || 'pending').toLowerCase();
        switch (normalized) {
            case 'approved':
                return {
                    label: 'Approved & Tokenized',
                    color: 'text-[#81D7B4]',
                    bg: 'bg-[#81D7B4]/10',
                    border: 'border-[#81D7B4]/30',
                    dotBg: 'bg-[#81D7B4]'
                };
            case 'under_review':
            case 'submitted':
                return {
                    label: 'Under Compliance Review',
                    color: 'text-amber-400',
                    bg: 'bg-amber-400/10',
                    border: 'border-amber-400/30',
                    dotBg: 'bg-amber-400'
                };
            case 'rejected':
                return {
                    label: 'Application Declined',
                    color: 'text-red-400',
                    bg: 'bg-red-400/10',
                    border: 'border-red-400/30',
                    dotBg: 'bg-red-400'
                };
            default:
                return {
                    label: 'Action Required: Submit KYC',
                    color: 'text-[#81D7B4]',
                    bg: 'bg-[#81D7B4]/10',
                    border: 'border-[#81D7B4]/30',
                    dotBg: 'bg-[#81D7B4]'
                };
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
                <div className="w-8 h-8 border-2 border-[#7B8B9A]/30 border-t-[#81D7B4] rounded-full animate-spin" />
                <p className="text-xs text-[#7B8B9A] font-medium">Loading portfolio...</p>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-lg mx-auto text-center">
                <div className="bg-[#1A2538]/40 backdrop-blur-xl border border-[#7B8B9A]/15 p-8 sm:p-10 rounded-3xl shadow-xl space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mx-auto text-[#81D7B4]">
                        <Building04Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#F9F9FB]">
                            Connect Your Account
                        </h2>
                        <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed">
                            Sign in or connect your wallet to access your business launchpad, compliance status, and tokenization tools.
                        </p>
                    </div>
                    <div className="pt-3 flex justify-center">
                        <BizFiAuthButton />
                    </div>
                </div>
            </div>
        );
    }

    if (!activeProject) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl mx-auto">
                <EmptyState 
                    title="No Registered Businesses Found"
                    description="You have not submitted a business application yet with this account. Register your business to start tokenization and access onchain liquidity."
                    actionLabel="Register a Business"
                    onAction={() => router.push('/bizfi/dashboard')}
                />
            </div>
        );
    }

    const currentStatus = getStatusConfig(activeProject?.status);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Header with Project Selector & Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#7B8B9A]/15">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F9F9FB]">
                        Launchpad <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Console</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7B8B9A] mt-1 font-medium">
                        Track identity verification, milestone progression, onchain risk scoring, and tokenization status.
                    </p>
                </div>

                {/* Switcher & List New CTA */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                    {/* Project Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                            className="flex items-center gap-2 px-3.5 py-2 bg-[#1A2538] hover:bg-[#2C3E5D]/50 border border-[#7B8B9A]/20 hover:border-[#81D7B4]/40 text-[#F9F9FB] rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                        >
                            <Folder01Icon className="w-4 h-4 text-[#81D7B4]" />
                            <span className="truncate max-w-[140px]">
                                {activeProject?.businessName || "Select Business"}
                            </span>
                            <ArrowDown01Icon className={`w-3.5 h-3.5 text-[#7B8B9A] transition-transform ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isProjectSelectorOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-[#0F1825] border border-[#7B8B9A]/25 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7B8B9A] px-3 py-2 border-b border-[#7B8B9A]/15">
                                    Listed Businesses ({businesses.length})
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-1 mt-1">
                                    {businesses.map((b) => (
                                        <button
                                            key={b.transactionHash}
                                            onClick={() => handleProjectSelect(b)}
                                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                b.transactionHash === activeProject?.transactionHash 
                                                    ? 'bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30' 
                                                    : 'text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538]'
                                            }`}
                                        >
                                            <span className="truncate font-bold">{b.businessName}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A2538] text-[#7B8B9A] border border-[#7B8B9A]/20">
                                                Tier {b.tier}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/bizfi/dashboard')}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                    >
                        <PlusSignIcon className="w-3.5 h-3.5" />
                        <span>List Another</span>
                    </button>
                </div>
            </div>

            {/* Active Project Banner & Metadata Overview */}
            <div className="bg-[#1A2538]/30 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-7 shadow-lg">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xl sm:text-2xl font-black text-[#F9F9FB] tracking-tight">
                                {activeProject.businessName}
                            </span>
                            <span className="text-xs font-semibold text-[#81D7B4] px-2.5 py-0.5 bg-[#81D7B4]/10 rounded-md border border-[#81D7B4]/20">
                                Tier {activeProject.tier} {activeProject.tierName ? `(${activeProject.tierName})` : ''}
                            </span>
                            <div className={`px-2.5 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dotBg}`} />
                                <span>{currentStatus.label}</span>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed">
                            {activeProject.metadata?.businessDescription || activeProject.metadata?.ideaSummary || activeProject.metadata?.projectDescription || "Official decentralized enterprise registered on BizFi Protocol."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
                        {/* Copy Transaction Hash */}
                        <button
                            onClick={() => handleCopyHash(activeProject.transactionHash)}
                            className="px-3.5 py-2 rounded-xl bg-[#0F1825] border border-[#7B8B9A]/20 hover:border-[#81D7B4]/40 text-[#7B8B9A] hover:text-[#F9F9FB] flex items-center justify-center gap-2 text-xs font-mono transition-all cursor-pointer"
                            title="Copy Transaction Hash"
                        >
                            <span>{activeProject.transactionHash ? `${activeProject.transactionHash.slice(0, 6)}...${activeProject.transactionHash.slice(-6)}` : 'Onchain Verified'}</span>
                            <Copy01Icon className="w-3.5 h-3.5 text-[#81D7B4]" />
                            {copiedHash && <span className="text-[10px] text-[#81D7B4] font-bold">Copied!</span>}
                        </button>

                        {/* View Dossier Button */}
                        <button
                            onClick={() => setIsDetailsModalOpen(true)}
                            className="px-4 py-2 bg-[#1A2538] hover:bg-[#2C3E5D]/60 border border-[#7B8B9A]/20 text-[#F9F9FB] hover:text-[#81D7B4] rounded-xl text-xs font-semibold transition-all cursor-pointer text-center"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            {/* Lifecycle Stages Component */}
            <KYCStatus 
                status={activeProject.status} 
                steps={activeProject.kycSteps} 
            />

            {/* If KYC is needed, show submission form */}
            {(!activeProject.status || activeProject.status.toLowerCase() === "pending") && (
                <KYCSubmissionForm 
                    business={activeProject} 
                    onSuccess={fetchBusinesses} 
                />
            )}

            {/* Milestones & Risk Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProjectTimeline 
                    milestones={activeProject.milestones}
                    status={activeProject.status}
                />
                <RiskAssessment 
                    risks={activeProject.risks} 
                    tier={activeProject.tier}
                    status={activeProject.status}
                />
            </div>

            {/* Details Modal */}
            <BusinessDetailsModal 
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                data={activeProject.metadata || {}}
                status={activeProject.status}
            />
        </div>
    );
}
