"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineDocumentText,
    HiOutlineBuildingOffice2,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineTag,
    HiOutlineChartBar,
    HiOutlineUsers,
    HiOutlineRocketLaunch,
    HiOutlineFire,
    HiOutlinePlus,
    HiOutlineChevronDown,
    HiOutlineFolder
} from "react-icons/hi2";
import "../../bizfi-colors.css";
import BusinessDetailsModal from "./BusinessDetailsModal";
import KYCStatus from "./components/KYCStatus";
import ProjectTimeline from "./components/ProjectTimeline";
import RiskAssessment from "./components/RiskAssessment";
import EmptyState from "@/app/components/EmptyState";

export default function LaunchPadPage() {
    const { address } = useAccount();
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeProject, setActiveProject] = useState<any>(null);
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null); // For modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const fetchBusinesses = async () => {
            if (!address) return;
            try {
                const response = await fetch(`/api/bizfi/business?owner=${address}`);
                if (response.ok) {
                    const data = await response.json();
                    setBusinesses(data || []);
                    // Set initial active project if not set
                    if (data && data.length > 0 && !activeProject) {
                        setActiveProject(data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch businesses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [address]);

    // Update active project if businesses change (e.g. after create) and no active project
    useEffect(() => {
        if (!activeProject && businesses.length > 0) {
            setActiveProject(businesses[0]);
        }
    }, [businesses, activeProject]);

    const handleProjectSelect = (project: any) => {
        setActiveProject(project);
        setIsProjectSelectorOpen(false);
    };

    const getStatusConfig = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || 'submitted';
        switch (normalizedStatus) {
            case "draft":
                return { icon: HiOutlineDocumentText, color: "text-gray-400", bg: "bg-gray-800/30", label: "Draft" };
            case "pending":
                return { icon: HiOutlineClock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Pending" };
            case "submitted":
            case "registered":
                return { icon: HiOutlineCheckCircle, color: "text-blue-400", bg: "bg-blue-500/10", label: "Submitted" };
            case "under_review":
                return { icon: HiOutlineClock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Under Review" };
            case "approved":
                return { icon: HiOutlineCheckCircle, color: "text-[#81D7B4]", bg: "bg-[#81D7B4]/10", label: "Approved" };
            case "rejected":
                return { icon: HiOutlineXCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Rejected" };
            default:
                return { icon: HiOutlineClock, color: "text-gray-400", bg: "bg-gray-800", label: status };
        }
    };

    const getTierLabel = (tierId: any) => {
        const tiers: Record<string, string> = {
            'micro': 'Micro Business',
            'builder': 'Builder Tier',
            'growth': 'Growth Business',
            'enterprise': 'Enterprise Projects',
            '0': 'Micro Business',
            '1': 'Builder Tier',
            '2': 'Growth Business',
            '3': 'Enterprise Projects'
        };
        return tiers[String(tierId)] || 'Standard Tier';
    };

    const handleViewDetails = (business: any) => {
        setSelectedBusiness(business);
        setShowDetailsModal(true);
    };

    // Derived Metrics
    const totalListings = businesses.length;
    
    // Calculate total revenue across all businesses
    const totalRevenue = businesses.reduce((acc, business) => {
        return acc + (parseFloat(business.metadata?.monthlyRevenue) || 0);
    }, 0);

    // Calculate capital raised (using raiseAmount as a proxy for now, or 0 if not funded yet)
    // In a real scenario, this would be the actual amount raised, not just requested.
    // Assuming for now we show 0 or track it if available.
    // If 'raiseAmount' is the target, we might need another field for 'raised'.
    // For now, let's assume 0 as per the image default, or sum if we had a 'raised' field.
    const capitalRaised = 0; 

    // Count approved listings
    const approvedListings = businesses.filter(b => b.status === 'approved').length;
    
    const DASHBOARD_METRICS = [
        {
            label: "Total Listings",
            value: totalListings,
            change: "+1", // Example static change
            icon: HiOutlineBuildingOffice2,
            isStatus: false
        },
        {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "0%", // Example static change
            icon: HiOutlineCurrencyDollar,
            isStatus: false
        },
        {
            label: "Capital Raised",
            value: `$${capitalRaised.toLocaleString()}`,
            change: "0%", // Example static change
            icon: HiOutlineRocketLaunch,
            isStatus: false
        },
        {
            label: "Approved Listings",
            value: approvedListings,
            change: "Pending", // Status text
            icon: HiOutlineCheckCircle,
            isStatus: true
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#81D7B4]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-20 px-5 md:px-8 lg:px-10 pt-6 max-w-[1920px] mx-auto">
            {/* Header & Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Launchpad</h1>
                    <p className="text-sm md:text-base text-gray-400">Manage your business listings and track performance</p>
                </div>
                
                {/* Project Selector & Create Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    {/* Project Selector Dropdown */}
                    {businesses.length > 0 && (
                        <div className="relative flex-1 sm:flex-initial">
                            <button
                                onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
                                className="w-full flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white hover:bg-gray-800 transition-colors sm:min-w-[200px] justify-between"
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <HiOutlineFolder className="w-5 h-5 text-[#81D7B4] shrink-0" />
                                    <span className="truncate max-w-[140px] whitespace-nowrap">
                                        {activeProject ? activeProject.businessName : "Select Project"}
                                    </span>
                                </div>
                                <HiOutlineChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isProjectSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProjectSelectorOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 left-0 sm:left-auto mt-2 w-full sm:w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="p-2 space-y-1">
                                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Your Projects
                                            </div>
                                            {businesses.map((business) => (
                                                <button
                                                    key={business._id || business.transactionHash}
                                                    onClick={() => handleProjectSelect(business)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        activeProject === business 
                                                            ? "bg-[#81D7B4]/10 text-[#81D7B4]" 
                                                            : "text-gray-300 hover:bg-gray-800"
                                                    }`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${activeProject === business ? "bg-[#81D7B4]" : "bg-gray-600"}`} />
                                                    <span className="truncate">{business.businessName}</span>
                                                    {activeProject === business && (
                                                        <HiOutlineCheckCircle className="w-4 h-4 ml-auto" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#81D7B4] text-[#0B1221] rounded-xl font-bold hover:bg-[#6bcb9f] transition-colors whitespace-nowrap"
                        onClick={() => window.location.href = '/bizfi/dashboard/create-savings'}
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        New Project
                    </motion.button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {DASHBOARD_METRICS.map((metric, index) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#0F1825] p-5 rounded-2xl border border-gray-800 relative h-[140px] flex flex-col justify-between"
                    >
                        {/* Top Row: Icon and Change/Status */}
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 rounded-xl bg-[#81D7B4]/10 text-[#81D7B4]">
                                <metric.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-bold whitespace-nowrap ${metric.isStatus ? 'text-gray-400' : 'text-[#81D7B4]'}`}>
                                {metric.change}
                            </span>
                        </div>

                        {/* Bottom Row: Label and Value */}
                        <div>
                            <h3 className="text-gray-400 text-sm font-medium mb-1">{metric.label}</h3>
                            <p className="text-2xl font-bold text-white">{metric.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Active Project Overview Section */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 overflow-hidden">
                        <HiOutlineRocketLaunch className="w-6 h-6 text-[#81D7B4] shrink-0" />
                        <span className="truncate">
                            {activeProject ? `Project Status: ${activeProject.businessName}` : "Project Status"}
                        </span>
                    </h2>
                    {activeProject && (
                        <span className="text-xs text-[#81D7B4] border border-[#81D7B4]/30 px-3 py-1 rounded-full flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0">
                            <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse" />
                            Active Context
                        </span>
                    )}
                </div>

                {!activeProject ? (
                     <div className="py-12">
                        <EmptyState 
                            title="No Project Selected"
                            description="Select a project from the dropdown above or create a new one to view details."
                            icon={HiOutlineFolder}
                            actionLabel="Create New Project"
                            onAction={() => window.location.href = '/bizfi/dashboard/create-savings'}
                        />
                     </div>
                ) : (
                    <>
                        {/* KYC Process */}
                        <motion.div
                            key={`kyc-${activeProject._id || activeProject.transactionHash}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <KYCStatus 
                                status={activeProject?.status} 
                                steps={activeProject?.kycSteps}
                            />
                        </motion.div>

                        {/* Milestones & Risk Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8">
                            <motion.div
                                key={`timeline-${activeProject._id || activeProject.transactionHash}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <ProjectTimeline milestones={activeProject?.milestones} />
                            </motion.div>
                            <motion.div
                                key={`risk-${activeProject._id || activeProject.transactionHash}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <RiskAssessment risks={activeProject?.risks} />
                            </motion.div>
                        </div>
                    </>
                )}
            </div>

            {/* Applications List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HiOutlineChartBar className="w-6 h-6 text-[#81D7B4]" />
                    All Applications
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#81D7B4]"></div>
                    </div>
                ) : businesses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-gray-700 bg-gray-900/30"
                    >
                        <div className="p-4 rounded-full bg-gray-800/50 mb-4">
                            <HiOutlineBuildingOffice2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
                        <p className="text-gray-400 max-w-md mb-6">
                            Start by registering your first business to see it listed here.
                        </p>
                        <button className="px-6 py-2 bg-[#81D7B4] text-gray-900 rounded-lg font-bold text-sm hover:bg-[#6BC4A0] transition-colors">
                            Start Registration
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {businesses.map((business, index) => {
                            const statusConfig = getStatusConfig(business.status || 'submitted');
                            const StatusIcon = statusConfig.icon;
                            const tierLabel = getTierLabel(business.tier);
                            const revenue = business.metadata?.monthlyRevenue
                                ? `$${Number(business.metadata.monthlyRevenue).toLocaleString()}`
                                : 'N/A';

                            return (
                                <motion.div
                                    key={business.transactionHash || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 hover:border-[#81D7B4]/30 hover:shadow-lg hover:shadow-[#81D7B4]/5 transition-all"
                                >
                                    {/* Header: Name & Status */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 text-[#81D7B4] border border-gray-700 group-hover:border-[#81D7B4]/30 group-hover:text-[#81D7B4] transition-colors">
                                                <HiOutlineBuildingOffice2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-[#81D7B4] transition-colors">
                                                    {business.businessName || 'Unnamed Business'}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                                                    <span>
                                                        {business.createdAt
                                                            ? new Date(business.createdAt).toLocaleDateString()
                                                            : 'Recent'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} border border-transparent`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusConfig.label}
                                        </div>
                                    </div>

                                    {/* Key Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                <HiOutlineTag className="w-3 h-3" /> Tier
                                            </p>
                                            <p className="text-sm font-semibold text-gray-200 truncate">{tierLabel}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                <HiOutlineCurrencyDollar className="w-3 h-3" /> Monthly Revenue
                                            </p>
                                            <p className="text-sm font-semibold text-gray-200">{revenue}</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                                        <span className="text-xs text-gray-500">
                                            ID: {business.transactionHash ? `${business.transactionHash.slice(0, 6)}...${business.transactionHash.slice(-4)}` : 'N/A'}
                                        </span>
                                        <button
                                            onClick={() => handleViewDetails(business)}
                                            className="flex items-center gap-2 text-sm font-semibold text-[#81D7B4] hover:text-[#6BC4A0] transition-colors"
                                        >
                                            <HiOutlineDocumentText className="w-4 h-4" />
                                            View Full Details
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <BusinessDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                data={selectedBusiness?.metadata}
                status={selectedBusiness?.status || 'Submitted'}
            />
        </div>
    );
}
