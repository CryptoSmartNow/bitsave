"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import {
    HiOutlinePaperAirplane,
    HiOutlinePaperClip,
    HiOutlineFaceSmile,
    HiOutlineEllipsisVertical,
    HiOutlineChatBubbleLeftRight,
    HiOutlinePencil
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import { format } from "date-fns";
import "../../bizfi-colors.css";
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const ChatDoodle = dynamic(() => import('../components/ChatDoodle'), { ssr: false });

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

interface Message {
    _id: string;
    content: string;
    sender: 'admin' | 'business';
    timestamp: string;
    read: boolean;
    type?: 'text' | 'image';
    attachmentUrl?: string;
}

export default function ChatPage() {
    const { address } = useAccount();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [mounted, setMounted] = useState(false);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showDoodle, setShowDoodle] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Audio refs
    const sentAudioRef = useRef<HTMLAudioElement | null>(null);
    const receivedAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        sentAudioRef.current = new Audio('/sounds/sent.wav');
        receivedAudioRef.current = new Audio('/sounds/received.wav');
    }, []);

    // Draft key
    const DRAFT_KEY = `chat_draft_${address}`;

    useEffect(() => {
        setMounted(true);
        // Load draft
        if (address) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) setMessage(savedDraft);
        }
    }, [address]);

    // Save draft
    useEffect(() => {
        if (mounted && address) {
            localStorage.setItem(DRAFT_KEY, message);
        }
    }, [message, mounted, address]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!address) return;
        const businessId = address.toLowerCase();
        try {
            const res = await fetch(`/api/bizfi/chat/messages?businessId=${businessId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                // Only scroll if new messages arrived
                if (data.length > messages.length) {
                    const lastMsg = data[data.length - 1];
                    // Play sound if new message arrived from admin
                    if (lastMsg.sender === 'admin' && messages.length > 0) {
                        receivedAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
                    }

                    setMessages(data);
                    setTimeout(scrollToBottom, 100);
                } else {
                    setMessages(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    // Poll for messages
    useEffect(() => {
        if (address) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [address]);

    const handleSendMessage = async (overrideContent?: string, type: 'text' | 'image' = 'text', attachmentUrl?: string) => {
        const contentToSend = overrideContent !== undefined ? overrideContent : message;
        if ((!contentToSend.trim() && !attachmentUrl) || !address) return;

        setSending(true);
        try {
            const res = await fetch('/api/bizfi/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: address.toLowerCase(),
                    content: contentToSend,
                    sender: 'business',
                    type,
                    attachmentUrl
                })
            });

            if (res.ok) {
                if (type === 'text') {
                    setMessage('');
                    localStorage.removeItem(DRAFT_KEY);
                }
                sentAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
                fetchMessages();
                setShowEmoji(false);
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

            if (data.success) {
                await handleSendMessage('', 'image', data.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDoodleSend = async (dataUrl: string) => {
        // Convert data URL to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], "signature.png", { type: "image/png" });

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await fetch('/api/bizfi/chat/upload', {
                method: 'POST',
                body: formData
            });
            const data = await uploadRes.json();

            if (data.success) {
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
    };

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center bg-[#0A0E14]`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    if (!address) {
        return (
            <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] flex items-center justify-center bg-[#0A0E14] text-white`}>
                <div className="text-center p-8 bg-[#1A2538]/50 backdrop-blur-xl rounded-2xl border border-[#7B8B9A]/10 max-w-md w-full mx-4 shadow-xl">
                    <div className="w-24 h-24 bg-[#1A2538] rounded-full flex items-center justify-center mb-6 mx-auto border border-[#7B8B9A]/10 shadow-lg shadow-[#81D7B4]/5">
                        <HiOutlineChatBubbleLeftRight className="w-10 h-10 text-[#81D7B4]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-[#F9F9FB] tracking-tight">Connect Wallet</h2>
                    <p className="text-[#9BA8B5] leading-relaxed">Please connect your wallet to access premium support chat and manage your business inquiries.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] text-[#F9F9FB] flex overflow-hidden bg-[#0A0E14]`}>
            {/* Contacts Sidebar - Simplified for Support */}
            <div className="hidden md:flex md:w-80 border-r border-[#7B8B9A]/10 flex-col bg-[#1A2538]/20 backdrop-blur-xl">
                <div className="p-6 border-b border-[#7B8B9A]/10">
                    <h2 className="text-xl font-bold text-[#F9F9FB] tracking-wide">Support</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    <button className="w-full p-4 flex items-center gap-4 bg-[#81D7B4]/10 border border-[#81D7B4]/20 shadow-[0_0_15px_rgba(129,215,180,0.05)] transition-all rounded-xl group hover:bg-[#81D7B4]/15">
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-[#81D7B4] flex items-center justify-center font-bold text-lg text-[#0F1825] shadow-lg shadow-[#81D7B4]/20">
                                S
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#81D7B4] rounded-full border-2 border-[#0A0E14] flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#0F1825] animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <h3 className="font-bold text-[#F9F9FB] group-hover:text-white transition-colors">Bitsave Support</h3>
                            <p className="text-xs text-[#81D7B4] font-medium tracking-wide">Official Support Channel</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0F1825] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+')]"></div>

                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]/30 backdrop-blur-xl relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-[#81D7B4] flex items-center justify-center font-bold text-[#0F1825] shadow-lg shadow-[#81D7B4]/20">
                                S
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#81D7B4] rounded-full border-2 border-[#0A0E14]"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-[#F9F9FB] text-lg leading-tight">Bitsave Support</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                                <p className="text-[10px] text-[#81D7B4] font-medium uppercase tracking-wider">Online</p>
                            </div>
                        </div>
                    </div>
                    <button className="p-2.5 hover:bg-[#1A2538] rounded-xl transition-colors text-[#9BA8B5] hover:text-[#F9F9FB] border border-transparent hover:border-[#7B8B9A]/10">
                        <HiOutlineEllipsisVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 relative z-10 scroll-smooth custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="text-center text-[#9BA8B5] mt-10 p-8 bg-[#1A2538]/30 rounded-2xl border border-[#7B8B9A]/10 max-w-md mx-auto backdrop-blur-sm">
                            <div className="w-16 h-16 bg-[#1A2538] rounded-2xl flex items-center justify-center mb-4 mx-auto text-[#81D7B4]">
                                <HiOutlineChatBubbleLeftRight className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-[#F9F9FB] mb-2">Welcome to Support</h3>
                            <p className="text-sm leading-relaxed">No messages yet. Start a conversation with our support team regarding your business application or account!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] flex flex-col ${msg.sender === 'business' ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-5 py-3.5 shadow-sm text-sm leading-relaxed relative group ${msg.sender === 'business'
                                            ? 'bg-[#81D7B4] text-[#0F1825] rounded-2xl rounded-tr-none'
                                            : 'bg-[#1A2538] text-[#F9F9FB] rounded-2xl rounded-tl-none border border-[#7B8B9A]/10'
                                        }`}>
                                        {msg.type === 'image' && msg.attachmentUrl ? (
                                            <div className="mb-2 rounded-lg overflow-hidden bg-black/10">
                                                <img
                                                    src={msg.attachmentUrl}
                                                    alt="Attachment"
                                                    className="max-w-full h-auto max-h-64 object-contain"
                                                />
                                            </div>
                                        ) : null}
                                        {msg.content && <p>{msg.content}</p>}
                                    </div>
                                    <p className="text-[10px] text-[#7B8B9A] mt-1.5 font-medium px-1 flex items-center gap-1">
                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                        {msg.sender === 'business' && (
                                            <span className="text-[#81D7B4]">✓</span>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-5 border-t border-[#7B8B9A]/10 bg-[#1A2538]/30 backdrop-blur-xl relative z-20">
                    {/* Emoji Picker Popover */}
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-28 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-[#7B8B9A]/10"
                            >
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmoji(false)}
                                        className="absolute -top-2 -right-2 bg-[#1A2538] rounded-full p-1 text-[#9BA8B5] hover:text-[#F9F9FB] z-10 border border-[#7B8B9A]/20"
                                    >
                                        <HiOutlineEllipsisVertical className="w-4 h-4 rotate-90" />
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

                    <div className="flex items-end gap-3 max-w-5xl mx-auto">
                        <div className="flex items-center gap-1 bg-[#1A2538] p-1.5 rounded-xl border border-[#7B8B9A]/10">
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
                                className="p-2.5 hover:bg-[#0F1825] rounded-lg transition-colors text-[#9BA8B5] hover:text-[#81D7B4] disabled:opacity-50 group relative"
                            >
                                <HiOutlinePaperClip className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-[#F9F9FB] bg-[#0F1825] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Attach file</span>
                            </button>
                            <button
                                onClick={() => setShowDoodle(true)}
                                disabled={uploading}
                                className="p-2.5 hover:bg-[#0F1825] rounded-lg transition-colors text-[#9BA8B5] hover:text-[#81D7B4] disabled:opacity-50 group relative"
                            >
                                <HiOutlinePencil className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-[#F9F9FB] bg-[#0F1825] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Draw</span>
                            </button>
                            <button
                                onClick={() => setShowEmoji(!showEmoji)}
                                className={`p-2.5 hover:bg-[#0F1825] rounded-lg transition-colors ${showEmoji ? 'text-[#81D7B4] bg-[#0F1825]' : 'text-[#9BA8B5] hover:text-[#81D7B4]'} group relative`}
                            >
                                <HiOutlineFaceSmile className="w-5 h-5" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-[#F9F9FB] bg-[#0F1825] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Emoji</span>
                            </button>
                        </div>

                        <div className="flex-1 bg-[#1A2538] rounded-2xl border border-[#7B8B9A]/10 focus-within:border-[#81D7B4]/50 focus-within:shadow-[0_0_0_4px_rgba(129,215,180,0.05)] transition-all flex items-center px-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={uploading ? "Uploading..." : "Type your message..."}
                                rows={1}
                                disabled={uploading}
                                className="w-full px-4 py-3.5 bg-transparent border-none text-[#F9F9FB] placeholder-[#7B8B9A]/50 focus:ring-0 focus:outline-none resize-none max-h-32 text-sm leading-relaxed custom-scrollbar"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                        </div>

                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!message.trim() || sending || uploading}
                            className="p-3.5 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#81D7B4]/20 flex-shrink-0"
                        >
                            {sending || uploading ? (
                                <div className="w-6 h-6 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <HiOutlinePaperAirplane className="w-6 h-6 transform -rotate-45 translate-x-0.5" />
                            )}
                        </button>
                    </div>
                </div>

                <ChatDoodle
                    isOpen={showDoodle}
                    onClose={() => setShowDoodle(false)}
                    onSend={handleDoodleSend}
                />
            </div>
        </div>
    );
}
