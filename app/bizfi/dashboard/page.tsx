'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useEffect, useState, useMemo } from "react";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import WizardForm from "./components/WizardForm";
import { Instrument_Serif } from "next/font/google";
import { 
    Building04Icon, 
    RocketIcon, 
    CheckmarkCircle02Icon, 
    Calendar03Icon, 
    InformationCircleIcon, 
    TelegramIcon, 
    HelpCircleIcon,
    Cancel01Icon,
    DiscountTag01Icon,
    Dollar01Icon,
    Shield01Icon
} from "hugeicons-react";
import "../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

interface TierItem {
    id: TierType;
    name: string;
    price: number;
    referralPrice: number;
    description: string;
    tag: string;
}

const TIERS: TierItem[] = [
    {
        id: 'micro',
        name: 'Micro Business',
        price: 10,
        referralPrice: 6,
        description: 'For small businesses and SMEs earning under $5,000/mo (saloons, food vendors, sole traders).',
        tag: 'Entry'
    },
    {
        id: 'builder',
        name: 'Builder Tier',
        price: 35,
        referralPrice: 30,
        description: 'For idea-stage founders, entrepreneurs, and builders launching their startup, prototype, or tech MVP.',
        tag: 'Popular'
    },
    {
        id: 'growth',
        name: 'Growth Business',
        price: 60,
        referralPrice: 50,
        description: 'For operational businesses earning over $5,000/mo with established customer traction and cash flow.',
        tag: 'Scaling'
    },
    {
        id: 'enterprise',
        name: 'Enterprise Projects',
        price: 120,
        referralPrice: 100,
        description: 'For large-scale real estate, agriculture, infrastructure, or manufacturing raising substantial capital.',
        tag: 'Institutional'
    }
];

export default function BizFiDashboardPage() {
    const router = useRouter();
    const { user, authenticated, logout: privyLogout, ready } = usePrivy();
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { disconnect: wagmiDisconnect } = useDisconnect();

    const isConnected = ready && (authenticated || isWagmiConnected);
    const walletAddress = wagmiAddress || user?.wallet?.address;
    const address = walletAddress || user?.email?.address || user?.id;

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
        if (user?.email?.address) {
            ids.add(user.email.address);
            ids.add(user.email.address.toLowerCase());
        }
        if (user?.id) {
            ids.add(user.id);
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
            });
        }
        return Array.from(ids).filter(Boolean);
    }, [wagmiAddress, user]);

    const displayAddress = walletAddress
        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
        : user?.email?.address || "Connected";

    const [mounted, setMounted] = useState(false);
    const [activeTier, setActiveTier] = useState<TierType>('builder');
    const [selectedTierForForm, setSelectedTierForForm] = useState<TierType | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    const [businessCount, setBusinessCount] = useState<number>(142);
    const [referralCode, setReferralCode] = useState('');
    const [appliedReferral, setAppliedReferral] = useState(false);
    const [referralDiscount, setReferralDiscount] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchBusinessCount = async () => {
            try {
                const res = await fetch('/api/bizfi/business?limit=1');
                if (res.ok) {
                    const totalHeader = res.headers.get('X-Total-Count');
                    if (totalHeader) {
                        setBusinessCount(parseInt(totalHeader, 10));
                    } else {
                        const data = await res.json();
                        const list = Array.isArray(data) ? data : (data.businesses || []);
                        if (list.length > 0) setBusinessCount(list.length);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch business count:", err);
            }
        };

        fetchBusinessCount();
    }, []);

    useEffect(() => {
        const checkExisting = async () => {
            if (userIdentifiers.length === 0) return;
            try {
                const queryParams = encodeURIComponent(userIdentifiers.join(','));
                const res = await fetch(`/api/bizfi/business?owner=${queryParams}`);
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : (data.businesses || []);
                    if (list.length > 0) {
                        setIsRegistered(true);
                    }
                }
            } catch (err) {
                console.error("Failed to check registration:", err);
            }
        };

        if (isConnected) {
            checkExisting();
        }
    }, [isConnected, userIdentifiers]);

    const handleApplyReferral = () => {
        if (referralCode.trim().toLowerCase() === 'bizfi10' || referralCode.trim().length >= 4) {
            setAppliedReferral(true);
            setReferralDiscount(10);
        } else {
            alert('Invalid referral code');
        }
    };

    const getDisplayPrice = (tier: TierItem) => {
        if (appliedReferral) {
            return tier.referralPrice;
        }
        return tier.price;
    };

    if (!mounted) {
        return (
            <div className="font-sans min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#7B8B9A]/30 border-t-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    const selectedTierObj = selectedTierForForm ? TIERS.find(t => t.id === selectedTierForForm) : null;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
            
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#7B8B9A]/15">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F9F9FB]">
                        Business <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Registration</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7B8B9A] mt-1 font-medium">
                        Select your tier, complete compliance verification, and tokenize your enterprise on Base.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isRegistered && (
                        <Link 
                            href="/bizfi/dashboard/launchpad"
                            className="flex items-center gap-2 px-4 py-2 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-xl text-xs font-bold text-[#81D7B4] hover:bg-[#81D7B4]/20 transition-all shadow-sm"
                        >
                            <RocketIcon className="w-4 h-4" />
                            <span>View Listed Business</span>
                        </Link>
                    )}
                    <BizFiAuthButton />
                </div>
            </div>

            {/* Tiers Grid & Wizard Component */}
            <div className="space-y-6">
                {/* Tiers Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {TIERS.map((tier) => {
                        const isSelected = activeTier === tier.id;
                        const price = getDisplayPrice(tier);
                        return (
                            <motion.div
                                key={tier.id}
                                whileHover={{ y: -3 }}
                                onClick={() => setActiveTier(tier.id)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                                    isSelected
                                        ? 'bg-[#1A2538]/80 border-[#81D7B4] shadow-[0_0_25px_rgba(129,215,180,0.15)]'
                                        : 'bg-[#1A2538]/30 border-[#7B8B9A]/15 hover:border-[#7B8B9A]/30'
                                }`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                            isSelected ? 'bg-[#81D7B4]/20 text-[#81D7B4]' : 'bg-[#0F1825] text-[#7B8B9A]'
                                        }`}>
                                            {tier.tag}
                                        </span>
                                        {appliedReferral && (
                                            <span className="text-[10px] text-[#81D7B4] font-bold flex items-center gap-0.5">
                                                <DiscountTag01Icon className="w-3 h-3" /> 10% OFF
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-[#F9F9FB]">{tier.name}</h3>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-2xl font-black text-[#81D7B4]">${price}</span>
                                            <span className="text-[11px] text-[#7B8B9A]">/ registration</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-[#7B8B9A] leading-relaxed">
                                        {tier.description}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTierForForm(tier.id);
                                    }}
                                    className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] shadow-md'
                                            : 'bg-[#0F1825] hover:bg-[#1A2538] text-[#F9F9FB] border border-[#7B8B9A]/20'
                                    }`}
                                >
                                    <span>Start Registration</span>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Registration Form Modal / Panel */}
                {selectedTierObj && (
                    <div className="mt-8">
                        <WizardForm 
                            selectedTier={selectedTierObj}
                            referralCode={referralCode}
                            isReferralValid={appliedReferral}
                            address={address}
                            onClose={() => setSelectedTierForForm(null)}
                            onSuccess={() => {
                                setIsRegistered(true);
                                setSelectedTierForForm(null);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
