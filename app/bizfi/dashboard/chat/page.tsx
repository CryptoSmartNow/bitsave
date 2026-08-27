'use client';

import { 
    SentIcon, 
    Image01Icon, 
    PaintBoardIcon, 
    SmileIcon, 
    InformationCircleIcon, 
    CheckmarkCircle02Icon, 
    Cancel01Icon, 
    Copy01Icon,
    RefreshIcon,
    Shield01Icon,
    HelpCircleIcon,
    Building04Icon,
    UserIcon
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { Instrument_Serif } from "next/font/google";
import { format, isToday, isYesterday } from "date-fns";
import { BizFiAuthButton } from "@/components/BizFiAuth";
import dynamic from 'next/dynamic';
import "../../bizfi-colors.css";

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const ChatDoodle = dynamic(() => import('../components/ChatDoodle'), { ssr: false });

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-instrument-serif',
});

interface Message {
    _id: string;
    content: string;
    sender: 'admin' | 'business';
    timestamp: string | Date;
    read: boolean;
    type?: 'text' | 'image';
    attachmentUrl?: string;
}

const FAQ_PROMPTS = [
    {
        title: "KYB Verification",
        prompt: "Hello, I would like an update on my business KYB verification and required documentation."
    },
    {
        title: "Tokenization Timeline",
        prompt: "What is the expected timeline for onchain tokenization once compliance review is approved?"
    },
    {
        title: "Liquidity Allocation",
        prompt: "Could you provide details on the liquidity pool matching and investor allocation terms?"
    },
    {
        title: "Tier Upgrade",
        prompt: "I want to explore upgrading my business registration tier to access higher liquidity limits."
    }
];

export default function ChatPage() {
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { user, authenticated, ready } = usePrivy();

    const isConnected = ready && (authenticated || isWagmiConnected);
    const userId = useMemo(() => {
        return (wagmiAddress || user?.wallet?.address || user?.email?.address || user?.id || '').toLowerCase();
    }, [wagmiAddress, user]);

    const displayAddress = useMemo(() => {
        const raw = wagmiAddress || user?.wallet?.address;
        if (raw) return `${raw.slice(0, 6)}...${raw.slice(-4)}`;
        return user?.email?.address || user?.id || 'Connected Account';
    }, [wagmiAddress, user]);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [mounted, setMounted] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showDoodle, setShowDoodle] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [copiedId, setCopiedId] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Audio refs
    const sentAudioRef = useRef<HTMLAudioElement | null>(null);
    const receivedAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        try {
            sentAudioRef.current = new Audio('/sounds/sent.wav');
            receivedAudioRef.current = new Audio('/sounds/received.wav');
        } catch {
            // Audio not supported in environment
        }
    }, []);

    // Draft handling
    const DRAFT_KEY = `chat_draft_${userId}`;

    useEffect(() => {
        setMounted(true);
        if (userId) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) setMessage(savedDraft);
        }
    }, [userId, DRAFT_KEY]);

    useEffect(() => {
        if (mounted && userId) {
            if (message) {
                localStorage.setItem(DRAFT_KEY, message);
            } else {
                localStorage.removeItem(DRAFT_KEY);
            }
        }
    }, [message, mounted, userId, DRAFT_KEY]);

    // Auto-resize textarea smoothly based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
            textareaRef.current.style.height = `${Math.max(newHeight, 38)}px`;
        }
    }, [message]);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const fetchMessages = async (isManual = false) => {
        if (!userId) return;
        if (isManual) setIsRefreshing(true);

        try {
            const res = await fetch(`/api/bizfi/chat/messages?businessId=${encodeURIComponent(userId)}`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    if (data.length > messages.length) {
                        const lastMsg = data[data.length - 1];
                        if (lastMsg.sender === 'admin' && messages.length > 0) {
                            receivedAudioRef.current?.play().catch(() => {});
                        }
                        setMessages(data);
                        setTimeout(() => scrollToBottom('smooth'), 100);
                    } else {
                        setMessages(data);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            if (isManual) {
                setTimeout(() => setIsRefreshing(false), 500);
            }
        }
    };

    // Polling setup
    useEffect(() => {
        if (userId) {
            fetchMessages();
            const interval = setInterval(() => fetchMessages(), 4000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const handleSendMessage = async (overrideContent?: string, type: 'text' | 'image' = 'text', attachmentUrl?: string) => {
        const contentToSend = overrideContent !== undefined ? overrideContent : message;
        if ((!contentToSend.trim() && !attachmentUrl) || !userId) return;

        setSending(true);
        try {
            const res = await fetch('/api/bizfi/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: userId,
                    content: contentToSend.trim(),
                    sender: 'business',
                    type,
                    attachmentUrl
                })
            });

            if (res.ok) {
                if (type === 'text') {
                    setMessage('');
                    localStorage.removeItem(DRAFT_KEY);
                    if (textareaRef.current) {
                        textareaRef.current.style.height = '38px';
                    }
                }
                sentAudioRef.current?.play().catch(() => {});
                fetchMessages();
                setShowEmoji(false);
                setTimeout(() => scrollToBottom('smooth'), 100);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/bizfi/chat/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success && data.url) {
                await handleSendMessage('', 'image', data.url);
            } else {
                alert(data.error || 'Failed to upload image. Max file size is 5MB.');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDoodleSend = async (dataUrl: string) => {
        setUploading(true);
        try {
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "signature.png", { type: "image/png" });

            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fetch('/api/bizfi/chat/upload', {
                method: 'POST',
                body: formData
            });
            const data = await uploadRes.json();

            if (data.success && data.url) {
                await handleSendMessage('', 'image', data.url);
            }
        } catch (error) {
            console.error('Doodle upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const onEmojiClick = (emojiObject: any) => {
        setMessage(prev => prev + emojiObject.emoji);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleCopyId = () => {
        if (!userId) return;
        navigator.clipboard.writeText(userId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const formatMessageDate = (timestamp: string | Date) => {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        if (isToday(d)) return format(d, 'h:mm a');
        if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
        return format(d, 'MMM d, h:mm a');
    };

    // Shared Sidebar / Drawer Component content
    const renderSidebarContent = () => (
        <>
            {/* Body FAQs & Info */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
                {/* Status Card */}
                <div className="p-3.5 bg-[#0F1825] border border-[#7B8B9A]/15 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#7B8B9A] tracking-wider">Desk Status</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20 font-semibold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]" />
                            <span>Online</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-[#7B8B9A] leading-relaxed">
                        Direct channel between registered enterprise founders and BizFi legal & compliance advisors.
                    </p>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#7B8B9A] tracking-wider px-1">
                        Quick Inquiries
                    </span>
                    <div className="space-y-1.5">
                        {FAQ_PROMPTS.map((faq, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setMessage(faq.prompt);
                                    setShowInfoPanel(false);
                                    if (textareaRef.current) {
                                        textareaRef.current.focus();
                                    }
                                }}
                                className="w-full text-left p-2.5 rounded-xl bg-[#1A2538]/70 hover:bg-[#1A2538] border border-[#7B8B9A]/15 hover:border-[#81D7B4]/30 transition-all text-xs text-[#F9F9FB] hover:text-[#81D7B4] cursor-pointer"
                            >
                                <p className="font-semibold">{faq.title}</p>
                                <p className="text-[10px] text-[#7B8B9A] line-clamp-1 mt-0.5">{faq.prompt}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Guidelines Note */}
                <div className="p-3 bg-[#1A2538]/30 border border-[#7B8B9A]/10 rounded-2xl">
                    <p className="text-[10px] text-[#7B8B9A] leading-relaxed">
                        <strong className="text-[#F9F9FB] block mb-0.5">Confidentiality Guarantee:</strong>
                        All submitted documents, financial records, and business disclosures are encrypted and protected under protocol NDA standards.
                    </p>
                </div>
            </div>

            {/* User Account / Identifier Footer */}
            <div className="p-3.5 border-t border-[#7B8B9A]/15 bg-[#0F1825] flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4] shrink-0 font-mono text-xs">
                        <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-[#7B8B9A] font-semibold">Your Session ID</p>
                        <p className="text-xs font-mono text-[#F9F9FB] truncate font-medium">{displayAddress}</p>
                    </div>
                </div>

                <button
                    onClick={handleCopyId}
                    className="p-2 rounded-xl text-[#7B8B9A] hover:text-[#81D7B4] hover:bg-[#1A2538] transition-colors shrink-0 cursor-pointer"
                    title="Copy Full Identifier"
                >
                    {copiedId ? (
                        <span className="text-[10px] font-bold text-[#81D7B4]">✓</span>
                    ) : (
                        <Copy01Icon className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
        </>
    );

    if (!mounted) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
                <div className="w-8 h-8 border-2 border-[#7B8B9A]/30 border-t-[#81D7B4] rounded-full animate-spin" />
                <p className="text-xs text-[#7B8B9A] font-medium">Initializing secure chat session...</p>
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
                            Sign in or connect your wallet to access direct advisory support, compliance reviews, and listing assistance.
                        </p>
                    </div>
                    <div className="pt-3 flex justify-center">
                        <BizFiAuthButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
            {/* Main Chat Container with Mobile Viewport Adaptation */}
            <div className="bg-[#0F1825] border border-[#7B8B9A]/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[calc(100dvh-115px)] sm:h-[calc(100vh-130px)] min-h-[480px] relative">
                
                {/* Desktop Advisory Sidebar (Always visible on lg screens) */}
                <aside className="hidden lg:flex lg:w-72 xl:w-80 border-r border-[#7B8B9A]/15 bg-[#1A2538]/30 flex-col justify-between shrink-0">
                    <div className="p-4 sm:p-5 border-b border-[#7B8B9A]/15 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm sm:text-base font-bold text-[#F9F9FB] flex items-center gap-2">
                                <Shield01Icon className="w-4 h-4 text-[#81D7B4]" />
                                Advisory Desk
                            </h2>
                            <p className="text-[11px] text-[#7B8B9A]">BizFi Compliance & Support</p>
                        </div>
                    </div>
                    {renderSidebarContent()}
                </aside>

                {/* Right / Main Chat Area */}
                <div className="flex-1 flex flex-col h-full bg-[#0F1825] relative min-w-0 overflow-hidden">
                    
                    {/* Chat Header */}
                    <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#7B8B9A]/15 bg-[#1A2538]/50 backdrop-blur-xl flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#81D7B4] flex items-center justify-center text-[#0F1825] font-black text-xs sm:text-sm shadow-md shrink-0">
                                B
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <h1 className="text-xs sm:text-base font-bold text-[#F9F9FB] truncate">
                                        Founder Advisory <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Desk</span>
                                    </h1>
                                    <span className="hidden md:inline-block text-[9px] px-1.5 py-0.5 rounded-md bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20 font-semibold">
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#7B8B9A] truncate">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] shrink-0" />
                                    <span className="truncate">Average response time: &lt; 15 mins</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Header Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <button
                                onClick={() => fetchMessages(true)}
                                disabled={isRefreshing}
                                className={`p-2 rounded-xl text-[#7B8B9A] hover:text-[#81D7B4] hover:bg-[#1A2538] transition-colors border border-transparent hover:border-[#7B8B9A]/20 cursor-pointer ${
                                    isRefreshing ? 'animate-spin text-[#81D7B4]' : ''
                                }`}
                                title="Refresh messages"
                            >
                                <RefreshIcon className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setShowInfoPanel(true)}
                                className="lg:hidden p-2 rounded-xl text-[#7B8B9A] hover:text-[#81D7B4] hover:bg-[#1A2538] border border-[#7B8B9A]/20 cursor-pointer"
                                title="Open Advisory Desk Info"
                            >
                                <InformationCircleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 sm:space-y-4 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 max-w-md mx-auto space-y-4">
                                <div className="w-11 h-11 rounded-2xl bg-[#1A2538] border border-[#7B8B9A]/20 flex items-center justify-center text-[#81D7B4]">
                                    <Shield01Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm sm:text-base font-bold text-[#F9F9FB]">Direct Advisor Communication</h3>
                                    <p className="text-xs text-[#7B8B9A] leading-relaxed">
                                        Send inquiries regarding your business application, compliance requirements, tokenomics structuring, or request a live consultation.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-1">
                                    {FAQ_PROMPTS.slice(0, 2).map((faq, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setMessage(faq.prompt)}
                                            className="p-2.5 rounded-xl bg-[#1A2538]/60 hover:bg-[#1A2538] border border-[#7B8B9A]/15 text-left text-xs text-[#7B8B9A] hover:text-[#81D7B4] transition-all cursor-pointer"
                                        >
                                            <p className="font-bold text-[#F9F9FB]">{faq.title}</p>
                                            <p className="text-[10px] truncate mt-0.5">{faq.prompt}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isBusiness = msg.sender === 'business';
                                return (
                                    <motion.div
                                        key={msg._id || index}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${isBusiness ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[88%] sm:max-w-[70%] flex flex-col ${isBusiness ? 'items-end' : 'items-start'}`}>
                                            {!isBusiness && (
                                                <span className="text-[10px] font-bold text-[#81D7B4] mb-1 px-1 flex items-center gap-1">
                                                    <span>BizFi Compliance Advisor</span>
                                                </span>
                                            )}

                                            <div className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm leading-relaxed shadow-sm ${
                                                isBusiness
                                                    ? 'bg-[#81D7B4] text-[#0F1825] font-medium rounded-2xl rounded-tr-none'
                                                    : 'bg-[#1A2538] text-[#F9F9FB] rounded-2xl rounded-tl-none border border-[#7B8B9A]/20'
                                            }`}>
                                                {msg.type === 'image' && msg.attachmentUrl && (
                                                    <div className="mb-2 rounded-xl overflow-hidden bg-black/20 border border-black/10 cursor-pointer group relative">
                                                        <img
                                                            src={msg.attachmentUrl}
                                                            alt="Attachment"
                                                            onClick={() => setPreviewImage(msg.attachmentUrl || null)}
                                                            className="max-w-full h-auto max-h-60 sm:max-h-64 object-contain rounded-lg group-hover:opacity-90 transition-opacity"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                                            Click to View
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                                            </div>

                                            <p className="text-[9px] sm:text-[10px] text-[#7B8B9A] mt-1 font-mono px-1 flex items-center gap-1">
                                                {formatMessageDate(msg.timestamp)}
                                                {isBusiness && <span className="text-[#81D7B4] font-bold">✓</span>}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mobile-Optimized Input Toolbar & Textarea Box */}
                    <div className="p-2 sm:p-3.5 border-t border-[#7B8B9A]/15 bg-[#1A2538]/40 backdrop-blur-xl relative z-20 shrink-0">
                        
                        {/* Emoji Picker Popover */}
                        <AnimatePresence>
                            {showEmoji && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-16 left-2 sm:left-4 z-50 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-[#7B8B9A]/20"
                                >
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowEmoji(false)}
                                            className="absolute top-2 right-2 bg-[#1A2538] hover:bg-[#2C3E5D] rounded-full p-1 text-[#7B8B9A] hover:text-[#F9F9FB] z-10 border border-[#7B8B9A]/20 cursor-pointer"
                                        >
                                            <Cancel01Icon className="w-3.5 h-3.5" />
                                        </button>
                                        <EmojiPicker
                                            theme={"dark" as any}
                                            onEmojiClick={onEmojiClick}
                                            lazyLoadEmojis={true}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Row */}
                        <div className="flex items-end gap-1.5 sm:gap-2 max-w-4xl mx-auto">
                            {/* Action Buttons: Upload, Doodle, Emoji */}
                            <div className="flex items-center gap-0.5 bg-[#1A2538] p-1 rounded-xl border border-[#7B8B9A]/15 shrink-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                                
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="p-2 hover:bg-[#0F1825] rounded-lg transition-colors text-[#7B8B9A] hover:text-[#81D7B4] disabled:opacity-40 cursor-pointer"
                                    title="Upload Image/Document"
                                >
                                    <Image01Icon className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowDoodle(true)}
                                    disabled={uploading}
                                    className="hidden sm:flex p-2 hover:bg-[#0F1825] rounded-lg transition-colors text-[#7B8B9A] hover:text-[#81D7B4] disabled:opacity-40 cursor-pointer"
                                    title="Attach Signature / Sketch"
                                >
                                    <PaintBoardIcon className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => setShowEmoji(!showEmoji)}
                                    className={`p-2 hover:bg-[#0F1825] rounded-lg transition-colors cursor-pointer ${
                                        showEmoji ? 'text-[#81D7B4] bg-[#0F1825]' : 'text-[#7B8B9A] hover:text-[#81D7B4]'
                                    }`}
                                    title="Insert Emoji"
                                >
                                    <SmileIcon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Auto-expanding Textarea Field */}
                            <div className="flex-1 bg-[#1A2538] rounded-xl sm:rounded-2xl border border-[#7B8B9A]/15 focus-within:border-[#81D7B4]/50 focus-within:ring-1 focus-within:ring-[#81D7B4]/30 transition-all flex items-center min-w-0 px-1">
                                <textarea
                                    ref={textareaRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={uploading ? "Uploading..." : "Type your inquiry..."}
                                    rows={1}
                                    disabled={uploading}
                                    className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-transparent border-none text-[#F9F9FB] placeholder-[#7B8B9A]/50 focus:ring-0 focus:outline-none resize-none text-xs sm:text-sm leading-relaxed custom-scrollbar"
                                    style={{ minHeight: '38px', maxHeight: '120px' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!message.trim() || sending || uploading}
                                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-[#81D7B4] hover:bg-[#9FE0C5] text-[#0F1825] rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0 cursor-pointer"
                                title="Send Message"
                            >
                                {sending || uploading ? (
                                    <div className="w-4 h-4 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <SentIcon className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Slide-Over Drawer for Advisory Desk info (Clean z-50 overlay) */}
            <AnimatePresence>
                {showInfoPanel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-[#070A0F]/80 backdrop-blur-md lg:hidden flex justify-end"
                        onClick={() => setShowInfoPanel(false)}
                    >
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 280 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-xs sm:max-w-sm h-full bg-[#0F1825] border-l border-[#7B8B9A]/20 flex flex-col shadow-2xl relative"
                        >
                            {/* Drawer Header */}
                            <div className="p-4 border-b border-[#7B8B9A]/15 flex items-center justify-between bg-[#1A2538]/60 shrink-0">
                                <div>
                                    <h2 className="text-sm font-bold text-[#F9F9FB] flex items-center gap-2">
                                        <Shield01Icon className="w-4 h-4 text-[#81D7B4]" />
                                        Advisory Desk
                                    </h2>
                                    <p className="text-[10px] text-[#7B8B9A]">BizFi Protocol Compliance & Support</p>
                                </div>
                                <button
                                    onClick={() => setShowInfoPanel(false)}
                                    className="p-1.5 text-[#7B8B9A] hover:text-[#F9F9FB] rounded-xl hover:bg-[#1A2538] cursor-pointer"
                                >
                                    <Cancel01Icon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drawer Body & Footer */}
                            {renderSidebarContent()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Doodle / Signature Modal */}
            <ChatDoodle
                isOpen={showDoodle}
                onClose={() => setShowDoodle(false)}
                onSend={handleDoodleSend}
            />

            {/* Image Zoom Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImage(null)}
                        className="fixed inset-0 z-50 bg-[#070A0F]/90 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-3 right-3 p-2 bg-[#0F1825]/80 hover:bg-[#0F1825] text-white rounded-full transition-colors z-10"
                            >
                                <Cancel01Icon className="w-5 h-5" />
                            </button>
                            <img
                                src={previewImage}
                                alt="Expanded view"
                                className="max-w-full max-h-[85vh] object-contain rounded-2xl"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
