"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
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
    HiOutlineFire
} from "react-icons/hi2";
import "../../bizfi-colors.css";
import BusinessDetailsModal from "./BusinessDetailsModal";

export default function LaunchPadPage() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        const fetchBusinesses = async () => {
            if (!address) return;
            try {
                const response = await fetch(`/api/bizfi/business?owner=${address}`);
                if (response.ok) {
                    const data = await response.json();
                    setBusinesses(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch businesses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBusinesses();
    }, [address]);

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
    const totalRevenue = businesses.reduce((acc, b) => acc + (parseFloat(b.metadata?.monthlyRevenue) || 0), 0);
    const approvedCount = businesses.filter(b => b.status === 'approved').length;

    // Calculate pseudo-growth rate or use placeholder
    const growthRate = totalListings > 0 ? "100%" : "0%";

    const DASHBOARD_METRICS = [
        {
            label: "Total Listings",
            value: totalListings.toString(),
            change: totalListings > 0 ? "+1" : "0",
            isPositive: true,
            icon: HiOutlineBuildingOffice2
        },
        {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "0%", // Dynamic change requires historical data
            isPositive: true,
            icon: HiOutlineCurrencyDollar
        },
        {
            label: "Capital Raised",
            value: "$0", // Placeholder until Capital Raise feature is live
            change: "0%",
            isPositive: true,
            icon: HiOutlineRocketLaunch
        },
        {
            label: "Approved Listings",
            value: approvedCount.toString(),
            change: approvedCount > 0 ? "Active" : "Pending",
            isPositive: approvedCount > 0,
            icon: HiOutlineCheckCircle
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#F9F9FB' }}>LaunchPad Dashboard</h1>
                <p style={{ color: '#7B8B9A' }}>
                    Overview of your business portfolio and performance stats
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {DASHBOARD_METRICS.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 bg-[#81D7B4]/10 rounded-lg">
                                    <Icon className="w-5 h-5 text-[#81D7B4]" />
                                </div>
                                <span className={`text-xs font-semibold ${metric.isPositive ? 'text-[#81D7B4]' : 'text-gray-500'}`}>
                                    {metric.change}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                            <p className="text-xl font-bold text-white">{metric.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Applications List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <HiOutlineChartBar className="w-6 h-6 text-[#81D7B4]" />
                    Your Applications
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
                        <p className="text-gray-400 max-w-md">
                            Start by registering your first business to see it listed here.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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