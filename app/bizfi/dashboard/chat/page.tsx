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
// import ChatDoodle from "../components/ChatDoodle";

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
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center bg-gray-900`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    if (!address) {
        return (
            <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] flex items-center justify-center bg-gray-950 text-white`}>
                <div className="text-center">
                    <HiOutlineChatBubbleLeftRight className="w-16 h-16 text-[#81D7B4] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                    <p className="text-gray-400">Please connect your wallet to access support chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] text-white flex overflow-hidden bg-gray-950`}>
            {/* Contacts Sidebar - Simplified for Support */}
            <div className="hidden md:flex md:w-80 border-r border-gray-800 flex-col bg-gray-900/50 backdrop-blur-xl">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Support</h2>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <button className="w-full p-4 flex items-center gap-4 bg-gray-800/80 border-l-2 border-l-[#81D7B4] transition-all rounded-r-xl">
                        <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-[#81D7B4] flex items-center justify-center font-bold text-lg text-[#0F1825]">
                                S
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <h3 className="font-semibold text-white">Bitsave Support</h3>
                            <p className="text-sm text-gray-300">Official Support Channel</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-950">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#81D7B4] flex items-center justify-center font-bold text-[#0F1825]">
                                S
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">Bitsave Support</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#81D7B4]"></span>
                                <p className="text-xs text-gray-400 font-medium">Online</p>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white">
                        <HiOutlineEllipsisVertical className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#0F1825] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgxMjMsIDEzOSwgMTU0LCAwLjA1KSIvPgo8L3N2Zz4=')]">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <p>No messages yet. Start a conversation with support!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <motion.div
                                key={msg._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.sender === 'business' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] ${msg.sender === 'business' ? 'order-2' : 'order-1'}`}>
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                                        msg.sender === 'business'
                                            ? 'bg-[#81D7B4] text-[#0F1825] rounded-tr-sm'
                                            : 'bg-gray-800/80 text-white rounded-tl-sm border border-gray-700'
                                    }`}>
                                        {msg.type === 'image' && msg.attachmentUrl ? (
                                            <div className="mb-2 rounded-lg overflow-hidden bg-black/20">
                                                <img 
                                                    src={msg.attachmentUrl} 
                                                    alt="Attachment" 
                                                    className="max-w-full h-auto max-h-60 object-contain"
                                                />
                                            </div>
                                        ) : null}
                                        {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                                    </div>
                                    <p className={`text-[10px] mt-1 ml-1 font-mono ${
                                        msg.sender === 'business' ? 'text-right text-gray-500' : 'text-gray-600'
                                    }`}>
                                        {format(new Date(msg.timestamp), 'PP p')}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md relative">
                    {/* Emoji Picker Popover */}
                    <AnimatePresence>
                        {showEmoji && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-24 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden"
                            >
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowEmoji(false)}
                                        className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white z-10 border border-gray-700"
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

                    <div className="flex items-end gap-3 max-w-4xl mx-auto">
                        <div className="flex gap-1">
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
                                className="p-3 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-[#81D7B4] disabled:opacity-50"
                                title="Attach Image"
                            >
                                <HiOutlinePaperClip className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => setShowDoodle(true)}
                                disabled={uploading}
                                className="p-3 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-[#81D7B4] disabled:opacity-50"
                                title="Draw Signature"
                            >
                                <HiOutlinePencil className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => setShowEmoji(!showEmoji)}
                                className={`p-3 hover:bg-gray-800 rounded-xl transition-colors ${showEmoji ? 'text-[#81D7B4] bg-gray-800' : 'text-gray-400 hover:text-[#81D7B4]'}`}
                                title="Emoji"
                            >
                                <HiOutlineFaceSmile className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-800/50 rounded-2xl border border-gray-700 transition-all flex items-center px-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={uploading ? "Uploading..." : "Type a message..."}
                                rows={1}
                                disabled={uploading}
                                className="w-full px-4 py-3 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none resize-none max-h-32 custom-scrollbar"
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
                            className="p-3 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(129,215,180,0.2)]"
                        >
                            {sending || uploading ? (
                                <div className="w-6 h-6 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <HiOutlinePaperAirplane className="w-6 h-6" />
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
