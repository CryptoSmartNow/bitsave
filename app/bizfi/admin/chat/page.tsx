'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
    HiOutlinePaperAirplane,
    HiOutlinePaperClip,
    HiOutlineFaceSmile,
    HiOutlineMagnifyingGlass,
    HiOutlineEllipsisVertical,
    HiOutlineBuildingStorefront,
    HiOutlinePencil
} from 'react-icons/hi2';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
const ChatDoodle = dynamic(() => import('../../dashboard/components/ChatDoodle'), { ssr: false });

interface Message {
    _id: string;
    content: string;
    sender: 'admin' | 'business';
    timestamp: string;
    read: boolean;
    type?: 'text' | 'image';
    attachmentUrl?: string;
}

interface Conversation {
    businessId: string;
    businessName: string;
    businessOwner: string;
    lastMessage: Message;
    unreadCount: number;
}

export default function AdminChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [showDoodle, setShowDoodle] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const initialized = useRef(false);

    // Audio refs
    const sentAudioRef = useRef<HTMLAudioElement | null>(null);
    const receivedAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        sentAudioRef.current = new Audio('/sounds/sent.wav');
        receivedAudioRef.current = new Audio('/sounds/received.wav');
    }, []);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/bizfi/chat/conversations');
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
                return data;
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
        return [];
    };

    // Fetch messages for selected conversation
    const fetchMessages = async (businessId: string) => {
        try {
            const res = await fetch(`/api/bizfi/chat/messages?businessId=${businessId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(prev => {
                    // Play sound if new message arrived from business
                    if (data.length > prev.length) {
                        const lastMsg = data[data.length - 1];
                        if (lastMsg.sender === 'business' && prev.length > 0) {
                            receivedAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
                        }
                    }
                    return data;
                });
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Initial load and polling
    useEffect(() => {
        const init = async () => {
            const data = await fetchConversations();

            // Check for query params to start/open a chat
            const paramId = searchParams.get('businessId');
            if (paramId && !initialized.current) {
                initialized.current = true;
                const found = data.find((c: Conversation) => c.businessId === paramId);

                if (found) {
                    setSelectedConversation(found);
                } else {
                    // Create temporary conversation object for UI
                    const newConv: Conversation = {
                        businessId: paramId,
                        businessName: searchParams.get('businessName') || 'New Business',
                        businessOwner: paramId,
                        lastMessage: {
                            _id: 'temp',
                            content: 'Start a new conversation',
                            sender: 'admin',
                            timestamp: new Date().toISOString(),
                            read: true
                        },
                        unreadCount: 0
                    };
                    setConversations(prev => [newConv, ...prev]);
                    setSelectedConversation(newConv);
                }
            }
        };

        init();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    // Poll messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.businessId);
            const interval = setInterval(() => {
                fetchMessages(selectedConversation.businessId);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation]);

    const handleSendMessage = async (overrideContent?: string, type: 'text' | 'image' = 'text', attachmentUrl?: string) => {
        const contentToSend = overrideContent !== undefined ? overrideContent : newMessage;
        if ((!contentToSend.trim() && !attachmentUrl) || !selectedConversation) return;

        setSending(true);
        try {
            const res = await fetch('/api/bizfi/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: selectedConversation.businessId,
                    content: contentToSend,
                    sender: 'admin',
                    type,
                    attachmentUrl
                })
            });

            if (res.ok) {
                if (type === 'text') {
                    setNewMessage('');
                }
                sentAudioRef.current?.play().catch(e => console.error("Audio play failed", e));
                fetchMessages(selectedConversation.businessId);
                fetchConversations(); // Update last message in sidebar
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
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    return (
        <div className="h-[calc(100vh-80px)] flex bg-[#0A0E14] overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-[#7B8B9A]/10 flex flex-col bg-[#1A2538]/20 backdrop-blur-xl">
                <div className="p-6 border-b border-[#7B8B9A]/10">
                    <h2 className="text-xl font-bold text-[#F9F9FB] mb-6 tracking-wide">Messages</h2>
                    <div className="relative group">
                        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9BA8B5] group-focus-within:text-[#81D7B4] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search businesses..."
                            className="w-full pl-11 pr-4 py-3 bg-[#0F1825]/50 border border-[#7B8B9A]/10 rounded-xl text-[#F9F9FB] placeholder-[#9BA8B5] focus:outline-none focus:border-[#81D7B4]/50 focus:bg-[#0F1825] transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-[#9BA8B5] text-sm flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-[#7B8B9A]/30 border-t-[#81D7B4] animate-spin"></div>
                            Loading conversations...
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-[#9BA8B5] text-sm">No conversations yet</div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.businessId}
                                onClick={() => setSelectedConversation(conv)}
                                className={`w-full p-4 flex items-center gap-3 rounded-xl transition-all duration-200 group ${selectedConversation?.businessId === conv.businessId
                                        ? 'bg-[#81D7B4]/10 border border-[#81D7B4]/20 shadow-[0_0_15px_rgba(129,215,180,0.05)]'
                                        : 'hover:bg-[#1A2538]/50 border border-transparent hover:border-[#7B8B9A]/10'
                                    }`}
                            >
                                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${selectedConversation?.businessId === conv.businessId
                                        ? 'bg-[#81D7B4] text-[#0F1825]'
                                        : 'bg-[#1A2538] text-[#9BA8B5] group-hover:text-[#F9F9FB]'
                                    }`}>
                                    {conv.businessName.charAt(0)}
                                    {conv.unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0A0E14] flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-white">{conv.unreadCount}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold text-sm truncate transition-colors ${selectedConversation?.businessId === conv.businessId ? 'text-[#F9F9FB]' : 'text-[#9BA8B5] group-hover:text-[#F9F9FB]'
                                            }`}>
                                            {conv.businessName}
                                        </h3>
                                        <span className="text-[10px] text-[#7B8B9A] font-mono">
                                            {conv.lastMessage && format(new Date(conv.lastMessage.timestamp), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate transition-colors ${selectedConversation?.businessId === conv.businessId ? 'text-[#F9F9FB]/70' : 'text-[#7B8B9A] group-hover:text-[#9BA8B5]'
                                        }`}>
                                        {conv.lastMessage?.sender === 'admin' ? 'You: ' : ''}{conv.lastMessage?.content}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0F1825] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+')]"></div>

                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]/30 backdrop-blur-xl relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center text-[#0F1825] font-bold shadow-lg shadow-[#81D7B4]/20">
                                    <HiOutlineBuildingStorefront className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#F9F9FB] text-lg leading-tight">{selectedConversation.businessName}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></div>
                                        <p className="text-[10px] text-[#81D7B4] font-medium uppercase tracking-wider">Active Now</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2.5 hover:bg-[#1A2538] rounded-xl text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors border border-transparent hover:border-[#7B8B9A]/10">
                                    <HiOutlineMagnifyingGlass className="w-5 h-5" />
                                </button>
                                <button className="p-2.5 hover:bg-[#1A2538] rounded-xl text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors border border-transparent hover:border-[#7B8B9A]/10">
                                    <HiOutlineEllipsisVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 relative z-10 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[65%] flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-5 py-3.5 shadow-sm text-sm leading-relaxed relative group ${msg.sender === 'admin'
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
                                            {msg.sender === 'admin' && (
                                                <span className="text-[#81D7B4]">✓</span>
                                            )}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
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
                                        <EmojiPicker
                                            theme={"dark" as any}
                                            onEmojiClick={onEmojiClick}
                                            lazyLoadEmojis={true}
                                        />
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
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={uploading ? "Uploading..." : "Type your message..."}
                                        rows={1}
                                        disabled={uploading}
                                        className="w-full px-4 py-3.5 bg-transparent border-none text-[#F9F9FB] placeholder-[#7B8B9A]/50 focus:ring-0 focus:outline-none resize-none max-h-32 text-sm leading-relaxed"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!newMessage.trim() || sending || uploading}
                                    className="p-3.5 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#81D7B4]/20 flex-shrink-0"
                                >
                                    {sending || uploading ? (
                                        <div className="w-6 h-6 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
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
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#9BA8B5] relative z-10">
                        <div className="w-24 h-24 bg-[#1A2538]/50 rounded-3xl border border-[#7B8B9A]/10 flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm">
                            <HiOutlinePaperAirplane className="w-10 h-10 transform -rotate-45 text-[#81D7B4]/50" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#F9F9FB] mb-3">Select a Conversation</h3>
                        <p className="text-[#7B8B9A] max-w-xs text-center leading-relaxed">Choose a business from the sidebar to start messaging and manage support requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
