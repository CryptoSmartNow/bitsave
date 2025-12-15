"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineXCircle,
    HiOutlineDocumentText,
    HiOutlineChartBar,
    HiOutlineShieldCheck,
    HiOutlineRocketLaunch,
    HiOutlineCurrencyDollar,
    HiOutlineUsers,
    HiOutlineFire,
    HiOutlineBeaker,
    HiOutlineTrophy
} from "react-icons/hi2";
import "../../bizfi-colors.css";

// Dashboard Metrics Data (Initial State)
const INITIAL_METRICS = [
    {
        label: "Token Price",
        value: "$0.00",
        change: "0%",
        isPositive: true,
        icon: HiOutlineCurrencyDollar
    },
    {
        label: "Market Cap",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineTrophy
    },
    {
        label: "Total Investors",
        value: "0",
        change: "0",
        isPositive: true,
        icon: HiOutlineUsers
    },
    {
        label: "Capital Raised",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineRocketLaunch
    },
    {
        label: "Monthly Revenue",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineCurrencyDollar
    },
    {
        label: "Growth Rate",
        value: "0%",
        change: "0%",
        isPositive: true,
        icon: HiOutlineFire
    },
    {
        label: "Liquidity Available",
        value: "$0",
        change: "0%",
        isPositive: true,
        icon: HiOutlineBeaker
    },
    {
        label: "Compliance Status",
        value: "Pending",
        change: "0%",
        isPositive: true,
        icon: HiOutlineTrophy
    }
];

const INSTRUMENT_TYPES = [
    { id: "equity", name: "Tokenized Equity Instrument" },
    { id: "debt", name: "Tokenized Debt Instrument" },
    { id: "revenue", name: "Tokenized Revenue Instrument" }
];

export default function LaunchPadPage() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const [applicationStatus, setApplicationStatus] = useState<"draft" | "submitted" | "under_review" | "approved" | "rejected">("draft");
    const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
    const [metrics, setMetrics] = useState(INITIAL_METRICS);
    const [businessData, setBusinessData] = useState<any>(null);

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!address) return;
            try {
                const response = await fetch(`/api/bizfi/business?owner=${address}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        const business = data[0]; // Get the latest business
                        setBusinessData(business);
                        setApplicationStatus("submitted"); // Assume submitted if record exists

                        // Update Metrics based on business data
                        const newMetrics = [...INITIAL_METRICS];
                        
                        // Map fields from metadata to metrics
                        // Monthly Revenue
                        const revenue = business.metadata?.monthlyRevenue || "0";
                        newMetrics[4] = { ...newMetrics[4], value: `$${revenue}` };

                        // Compliance Status
                        newMetrics[7] = { ...newMetrics[7], value: "Under Review" };
                        
                        setMetrics(newMetrics);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch business data:", error);
            }
        };

        fetchBusinessData();
    }, [address]);

    const getStatusConfig = (status: typeof applicationStatus) => {
        switch (status) {
            case "draft":
                return { icon: HiOutlineDocumentText, color: "text-gray-400", bg: "bg-gray-800/30", label: "Draft" };
            case "submitted":
                return { icon: HiOutlineCheckCircle, color: "text-blue-400", bg: "bg-blue-500/10", label: "Submitted" };
            case "under_review":
                return { icon: HiOutlineClock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Under Review" };
            case "approved":
                return { icon: HiOutlineCheckCircle, color: "text-[#81D7B4]", bg: "bg-[#81D7B4]/10", label: "Approved" };
            case "rejected":
                return { icon: HiOutlineXCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Rejected" };
        }
    };

    const statusConfig = getStatusConfig(applicationStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#F9F9FB' }}>LaunchPad</h1>
                <p style={{ color: '#7B8B9A' }}>
                    {businessData ? `Track ${businessData.businessName}'s listing progress` : "Track your business listing progress and metrics"}
                </p>
            </div>

            {/* Listing Status & Readiness */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
            >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <HiOutlineShieldCheck className="w-6 h-6 text-[#81D7B4]" />
                    Listing Status & Readiness
                </h2>

                <div className={`flex items-center gap-3 p-4 rounded-xl ${statusConfig.bg} border border-gray-700`}>
                    <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
                    <div>
                        <p className="text-sm text-gray-400">Application Status</p>
                        <p className={`text-lg font-bold ${statusConfig.color}`}>{statusConfig.label}</p>
                    </div>
                </div>
            </motion.div>

            {/* BizMarket Instrument Type */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-6"
            >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <HiOutlineChartBar className="w-6 h-6 text-[#81D7B4]" />
                    BizMarket Instrument Category
                </h2>

                <div className="space-y-3">
                    {INSTRUMENT_TYPES.map((instrument) => (
                        <div
                            key={instrument.id}
                            className={`p-4 rounded-xl border transition-all ${selectedInstrument === instrument.id
                                ? 'bg-[#81D7B4]/10 border-[#81D7B4] ring-1 ring-[#81D7B4]'
                                : 'bg-gray-800/30 border-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                {selectedInstrument === instrument.id && (
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                                )}
                                <span className={selectedInstrument === instrument.id ? 'text-white font-semibold' : 'text-gray-400'}>
                                    {instrument.name}
                                </span>
                            </div>
                        </div>
                    ))}
                    {!selectedInstrument && (
                        <p className="text-sm text-gray-500 mt-2">
                            Your instrument category will be determined during our review process
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Business Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-xl font-bold text-white mb-4">Business Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        return (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.05 }}
                                className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-[#81D7B4]/10 rounded-lg">
                                        <Icon className="w-5 h-5 text-[#81D7B4]" />
                                    </div>
                                    <span className={`text-xs font-semibold ${metric.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {metric.change}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">{metric.label}</p>
                                <p className="text-xl font-bold text-white">{metric.value}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}