'use client';

import { 
    Search01Icon, 
    ArrowDown01Icon, 
    HelpCircleIcon, 
    InformationCircleIcon, 
    Video01Icon, 
    RocketIcon,
    Message02Icon, 
    Shield01Icon,
    Mail01Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import Link from 'next/link';
import { Instrument_Serif } from "next/font/google";
import HelpAndFeedback from "@/components/HelpAndFeedback";
import "../../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

interface FAQItem {
    id: string;
    category: string;
    q: string;
    a: string;
    tags: string[];
}

const CATEGORIES = [
    "All Topics",
    "Listing & Tiers",
    "Tokenization & Shares",
    "KYB & Compliance",
    "Liquidity & Pools",
    "Fees & Payouts"
];

const FAQ_DATABASE: FAQItem[] = [
    {
        id: "faq-1",
        category: "Listing & Tiers",
        q: "How do I list and register my business on BizFi?",
        a: "To list your business, navigate to the Biz Dashboard or Launchpad, complete the Pre-Listing Assessment wizard with your company details (CEO identity, business registration documents, and fundraising goals), select your target tier, and confirm the listing transaction. Our compliance team verifies submissions within 24 to 48 hours.",
        tags: ["list", "register", "onboarding", "wizard", "start"]
    },
    {
        id: "faq-2",
        category: "Listing & Tiers",
        q: "What are the four registration tiers and their funding limits?",
        a: "BizFi provides 4 structured tiers: Micro Business ($10 listing fee, up to $2,500 target), Builder Tier ($35 listing fee, up to $10,000 target), Growth Business ($60 listing fee, up to $25,000 target), and Enterprise ($120 listing fee, custom/unlimited target). Higher tiers include dedicated compliance advisory, ERC-3643 smart contract deployment, and institutional liquidity pool access.",
        tags: ["tiers", "micro", "builder", "growth", "enterprise", "pricing", "limits"]
    },
    {
        id: "faq-3",
        category: "Tokenization & Shares",
        q: "How does real-world asset (RWA) business tokenization work on BizFi?",
        a: "BizFi converts a defined percentage of your company's equity or validated revenue stream into digital BizShares on the Base network. Each BizShare represents a legally bound fractional claim on business performance, allowing global investors to fund your venture transparently onchain without intermediaries.",
        tags: ["tokenization", "rwa", "equity", "shares", "bizshares", "base"]
    },
    {
        id: "faq-4",
        category: "Tokenization & Shares",
        q: "Can founders buy back or burn their tokenized shares?",
        a: "Yes. Founders retain full repurchase and buyback rights through the protocol. You can execute market buybacks or trigger scheduled treasury redemption contracts at any time to regain majority equity ownership as your business scales.",
        tags: ["buyback", "burn", "redeem", "equity", "treasury"]
    },
    {
        id: "faq-5",
        category: "KYB & Compliance",
        q: "What documentation is required for KYB (Know Your Business) approval?",
        a: "Required documents include Certificate of Incorporation/Business Registration, government-issued photo ID of the founder/CEO, proof of operating address, and optional pitch deck or audited financial statements. All submissions are encrypted and reviewed under standard protocol NDA guidelines.",
        tags: ["kyb", "compliance", "documents", "id", "passport", "legal", "nda"]
    },
    {
        id: "faq-6",
        category: "KYB & Compliance",
        q: "What is the ERC-3643 Permissioned Token Standard?",
        a: "ERC-3643 is the premier institutional standard for compliant tokenized securities. It embeds onchain identity attestations (ONCHAINID) into the smart contract, ensuring only verified and accredited investors can hold, buy, or trade your company's tokenized shares.",
        tags: ["erc-3643", "standard", "smart contract", "permissioned", "security"]
    },
    {
        id: "faq-7",
        category: "Liquidity & Pools",
        q: "How does investor matching and liquidity pool allocation work?",
        a: "Once your business is verified, your listing enters the Launchpad where community backers, angel syndicates, and protocol liquidity vaults match capital against your BizShare issuance. Funds are held in audited escrow smart contracts and disbursed according to milestone achievements.",
        tags: ["liquidity", "investors", "pools", "escrow", "milestones"]
    },
    {
        id: "faq-8",
        category: "Fees & Payouts",
        q: "What network fees and protocol commissions are charged?",
        a: "BizFi does not charge monthly subscription fees. Beyond the one-time registration tier fee, the protocol collects a low 2.5% protocol settlement fee solely upon successful milestone disbursement or secondary market trades.",
        tags: ["fees", "commission", "payout", "settlement", "costs"]
    },
    {
        id: "faq-9",
        category: "Fees & Payouts",
        q: "Which cryptocurrencies and payment methods are supported?",
        a: "BizFi natively supports cryptocurrency payments in USDC, USDT, and ETH on Base, Arbitrum, and Ethereum mainnet, as well as integrated fiat on-ramps via credit card and direct bank wire transfers through certified payment partners.",
        tags: ["payment", "usdc", "usdt", "eth", "fiat", "crypto"]
    }
];

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState<'faqs' | 'ticket'>('faqs');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Topics');
    const [openFAQs, setOpenFAQs] = useState<Record<string, boolean>>({ 'faq-1': true });
    const [copiedFaq, setCopiedFaq] = useState<string | null>(null);

    // Filter FAQs based on search and category
    const filteredFAQs = useMemo(() => {
        return FAQ_DATABASE.filter(item => {
            const matchesCategory = selectedCategory === 'All Topics' || item.category === selectedCategory;
            if (!matchesCategory) return false;

            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase().trim();
            return (
                item.q.toLowerCase().includes(query) ||
                item.a.toLowerCase().includes(query) ||
                item.tags.some(tag => tag.toLowerCase().includes(query)) ||
                item.category.toLowerCase().includes(query)
            );
        });
    }, [searchQuery, selectedCategory]);

    const toggleFAQ = (id: string) => {
        setOpenFAQs(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const expandAll = () => {
        const allOpen: Record<string, boolean> = {};
        filteredFAQs.forEach(f => { allOpen[f.id] = true; });
        setOpenFAQs(allOpen);
    };

    const collapseAll = () => {
        setOpenFAQs({});
    };

    const handleCopyQuestion = (item: FAQItem) => {
        navigator.clipboard.writeText(`${item.q}\n\n${item.a}`);
        setCopiedFaq(item.id);
        setTimeout(() => setCopiedFaq(null), 2000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
            
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#7B8B9A]/15">
                <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/25 text-[#81D7B4] text-xs font-semibold">
                        <Shield01Icon className="w-3.5 h-3.5" />
                        <span>Protocol Knowledge Base & Advisory Desk</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-[#F9F9FB] tracking-tight">
                        Support & <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Knowledge Center</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed">
                        Find verified answers regarding listing requirements, legal KYB attestations, ERC-3643 token standards, or contact our dedicated compliance officer.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-[#1A2538]/70 border border-[#7B8B9A]/20 rounded-2xl shrink-0 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('faqs')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'faqs'
                                ? 'bg-[#81D7B4] text-[#0F1825] shadow-md'
                                : 'text-[#7B8B9A] hover:text-[#F9F9FB]'
                        }`}
                    >
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>FAQs & Guides</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ticket')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'ticket'
                                ? 'bg-[#81D7B4] text-[#0F1825] shadow-md'
                                : 'text-[#7B8B9A] hover:text-[#F9F9FB]'
                        }`}
                    >
                        <HelpCircleIcon className="w-4 h-4" />
                        <span>Submit Ticket</span>
                    </button>
                </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                    href="/bizfi/dashboard/chat"
                    className="p-5 rounded-2xl bg-[#1A2538]/30 hover:bg-[#1A2538]/70 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 transition-all group shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] mb-3 group-hover:scale-105 transition-transform">
                            <Message02Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#F9F9FB] group-hover:text-[#81D7B4] transition-colors">Founder Advisory Desk</h3>
                        <p className="text-xs text-[#7B8B9A] mt-1 line-clamp-2">Direct real-time channel with BizFi compliance officers.</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#81D7B4] mt-3 inline-flex items-center gap-1">
                        Open Chat &rarr;
                    </span>
                </Link>

                <Link
                    href="/bizfi/dashboard/launchpad"
                    className="p-5 rounded-2xl bg-[#1A2538]/30 hover:bg-[#1A2538]/70 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 transition-all group shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-105 transition-transform">
                            <RocketIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#F9F9FB] group-hover:text-blue-400 transition-colors">Launchpad Console</h3>
                        <p className="text-xs text-[#7B8B9A] mt-1 line-clamp-2">Track your listed businesses, fundraising progress, and allocations.</p>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-400 mt-3 inline-flex items-center gap-1">
                        View Launchpad &rarr;
                    </span>
                </Link>

                <Link
                    href="/bizfi/dashboard/bizcontent"
                    className="p-5 rounded-2xl bg-[#1A2538]/30 hover:bg-[#1A2538]/70 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 transition-all group shadow-sm flex flex-col justify-between"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                            <Video01Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#F9F9FB] group-hover:text-purple-400 transition-colors">BizContent Studio</h3>
                        <p className="text-xs text-[#7B8B9A] mt-1 line-clamp-2">Founder video pitch uploads, updates, and community media.</p>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-400 mt-3 inline-flex items-center gap-1">
                        Open Studio &rarr;
                    </span>
                </Link>

                <div
                    onClick={() => setActiveTab('ticket')}
                    className="p-5 rounded-2xl bg-[#1A2538]/30 hover:bg-[#1A2538]/70 border border-[#7B8B9A]/15 hover:border-[#81D7B4]/40 transition-all group shadow-sm flex flex-col justify-between cursor-pointer"
                >
                    <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                            <HelpCircleIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#F9F9FB] group-hover:text-amber-400 transition-colors">Submit Support Ticket</h3>
                        <p className="text-xs text-[#7B8B9A] mt-1 line-clamp-2">Report technical issues or request custom enterprise support.</p>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-400 mt-3 inline-flex items-center gap-1">
                        New Ticket &rarr;
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'ticket' ? (
                <div className="bg-[#1A2538]/30 backdrop-blur-xl border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-[#7B8B9A]/15 pb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-[#F9F9FB]">Direct Developer & Compliance Ticket</h2>
                            <p className="text-xs text-[#7B8B9A]">Your inquiry is prioritized and sent directly to the core engineering and compliance team</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('faqs')}
                            className="text-xs text-[#81D7B4] hover:underline font-semibold cursor-pointer shrink-0"
                        >
                            &larr; Back to FAQs
                        </button>
                    </div>
                    <HelpAndFeedback appContext="BizFi Dashboard" embedded={true} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Search, Categories & Accordions (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Search Input Bar */}
                        <div className="relative">
                            <Search01Icon className="w-5 h-5 text-[#7B8B9A] absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search questions, ERC standards, tokenization rules, fees..."
                                className="w-full pl-12 pr-10 py-3.5 bg-[#1A2538]/50 border border-[#7B8B9A]/20 focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4]/30 rounded-2xl text-xs sm:text-sm text-[#F9F9FB] placeholder-[#7B8B9A]/60 outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7B8B9A] hover:text-[#F9F9FB] rounded-lg cursor-pointer"
                                >
                                    <Cancel01Icon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category Pills & Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                            selectedCategory === category
                                                ? 'bg-[#81D7B4] text-[#0F1825] shadow-sm font-bold'
                                                : 'bg-[#1A2538]/60 text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#1A2538] border border-[#7B8B9A]/15'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-[#7B8B9A]">
                                <button
                                    onClick={expandAll}
                                    className="hover:text-[#81D7B4] transition-colors cursor-pointer font-medium"
                                >
                                    Expand All
                                </button>
                                <span>•</span>
                                <button
                                    onClick={collapseAll}
                                    className="hover:text-[#81D7B4] transition-colors cursor-pointer font-medium"
                                >
                                    Collapse All
                                </button>
                            </div>
                        </div>

                        {/* Search Feedback */}
                        {searchQuery && (
                            <div className="text-xs text-[#7B8B9A]">
                                Showing <strong className="text-[#81D7B4]">{filteredFAQs.length}</strong> results for &ldquo;{searchQuery}&rdquo;
                            </div>
                        )}

                        {/* FAQ List */}
                        <div className="space-y-3">
                            {filteredFAQs.length === 0 ? (
                                <div className="p-8 text-center bg-[#1A2538]/20 border border-[#7B8B9A]/15 rounded-3xl space-y-3">
                                    <HelpCircleIcon className="w-8 h-8 text-[#7B8B9A] mx-auto" />
                                    <p className="text-sm font-bold text-[#F9F9FB]">No matching questions found</p>
                                    <p className="text-xs text-[#7B8B9A]">
                                        Try adjusting your search keywords or submit a direct inquiry to our advisory team.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('ticket')}
                                        className="px-4 py-2 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <HelpCircleIcon className="w-3.5 h-3.5" />
                                        <span>Submit Inquiry</span>
                                    </button>
                                </div>
                            ) : (
                                filteredFAQs.map((faq) => {
                                    const isOpen = !!openFAQs[faq.id];
                                    return (
                                        <div
                                            key={faq.id}
                                            className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 hover:border-[#7B8B9A]/30 rounded-2xl overflow-hidden transition-colors"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(faq.id)}
                                                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer gap-3"
                                            >
                                                <div className="space-y-1 pr-2">
                                                    <span className="text-[10px] uppercase font-bold text-[#81D7B4] tracking-wider">
                                                        {faq.category}
                                                    </span>
                                                    <h3 className="text-xs sm:text-sm font-bold text-[#F9F9FB]">
                                                        {faq.q}
                                                    </h3>
                                                </div>
                                                <div className={`w-7 h-7 rounded-lg bg-[#0F1825] border border-[#7B8B9A]/20 flex items-center justify-center text-[#7B8B9A] shrink-0 transition-transform duration-200 ${
                                                    isOpen ? 'transform rotate-180 text-[#81D7B4] border-[#81D7B4]/30' : ''
                                                }`}>
                                                    <ArrowDown01Icon className="w-3.5 h-3.5" />
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-4 sm:p-5 pt-0 border-t border-[#7B8B9A]/10 bg-[#0F1825]/40 space-y-3">
                                                            <p className="text-xs sm:text-sm text-[#7B8B9A] leading-relaxed pt-3">
                                                                {faq.a}
                                                            </p>
                                                            
                                                            <div className="flex items-center justify-between pt-2 border-t border-[#7B8B9A]/10 text-[11px] text-[#7B8B9A]">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    {faq.tags.slice(0, 3).map((t, idx) => (
                                                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-[#1A2538] text-[10px] font-mono text-[#7B8B9A]">
                                                                            #{t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCopyQuestion(faq);
                                                                    }}
                                                                    className="hover:text-[#81D7B4] transition-colors cursor-pointer flex items-center gap-1"
                                                                >
                                                                    {copiedFaq === faq.id ? (
                                                                        <span className="text-[#81D7B4] font-bold">✓ Copied</span>
                                                                    ) : (
                                                                        <span>Copy Answer</span>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Column: Support Status & Contact Channels (4 cols) */}
                    <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                        
                        {/* Live Advisory Box */}
                        <div className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                                        <Shield01Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#F9F9FB]">Live Advisory</h3>
                                        <p className="text-[10px] text-[#7B8B9A]">Direct Protocol Channel</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1 text-[10px] text-[#81D7B4] font-semibold bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                                    <span>Active</span>
                                </span>
                            </div>

                            <p className="text-xs text-[#7B8B9A] leading-relaxed">
                                Need custom structuring or have urgent listing questions? Chat directly with an authorized compliance officer.
                            </p>

                            <Link
                                href="/bizfi/dashboard/chat"
                                className="w-full py-2.5 px-4 bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                                <Message02Icon className="w-4 h-4" />
                                <span>Enter Advisory Desk</span>
                            </Link>
                        </div>

                        {/* Official Support Channels */}
                        <div className="bg-[#1A2538]/40 border border-[#7B8B9A]/15 rounded-3xl p-5 sm:p-6 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7B8B9A]">Official Channels</h3>
                            
                            <div className="space-y-3 text-xs">
                                <div className="p-3 rounded-xl bg-[#0F1825]/60 border border-[#7B8B9A]/10 flex items-center gap-3">
                                    <Mail01Icon className="w-4 h-4 text-[#81D7B4] shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-[#7B8B9A] font-semibold">Official Email</p>
                                        <a href="mailto:support@bitsave.io" className="text-[#F9F9FB] hover:text-[#81D7B4] truncate font-mono block">
                                            support@bitsave.io
                                        </a>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-[#0F1825]/60 border border-[#7B8B9A]/10 flex items-center gap-3">
                                    <Shield01Icon className="w-4 h-4 text-[#81D7B4] shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-[#7B8B9A] font-semibold">Protocol Network</p>
                                        <p className="text-[#F9F9FB] font-medium">SaveFi & BizFi Foundation</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 text-[11px] text-[#7B8B9A] border-t border-[#7B8B9A]/10">
                                <p>Standard response SLA: <strong className="text-[#F9F9FB]">&lt; 24 business hours</strong>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
