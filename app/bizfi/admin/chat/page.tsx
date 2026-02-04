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
// import ChatDoodle from '../../dashboard/components/ChatDoodle';

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
        <div className="h-[calc(100vh-80px)] flex bg-[#0F1825] overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-[#7B8B9A]/10 flex flex-col bg-[#1A2538]/50">
                <div className="p-4 border-b border-[#7B8B9A]/10">
                    <h2 className="text-xl font-bold text-[#F9F9FB] mb-4">Messages</h2>
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9BA8B5]" />
                        <input
                            type="text"
                            placeholder="Search businesses..."
                            className="w-full pl-10 pr-4 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl text-[#F9F9FB] placeholder-[#9BA8B5] focus:outline-none focus:border-[#81D7B4] transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-[#9BA8B5]">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-[#9BA8B5]">No conversations yet</div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.businessId}
                                onClick={() => setSelectedConversation(conv)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-[#7B8B9A]/5 transition-colors border-b border-[#7B8B9A]/5 ${
                                    selectedConversation?.businessId === conv.businessId ? 'bg-[#7B8B9A]/10 border-l-2 border-l-[#81D7B4]' : 'border-l-2 border-l-transparent'
                                }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                                    <HiOutlineBuildingStorefront className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-[#F9F9FB] truncate">{conv.businessName}</h3>
                                        <span className="text-xs text-[#9BA8B5]">
                                            {conv.lastMessage && format(new Date(conv.lastMessage.timestamp), 'HH:mm')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#9BA8B5] truncate">
                                        {conv.lastMessage?.sender === 'admin' ? 'You: ' : ''}{conv.lastMessage?.content}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-[#81D7B4] flex items-center justify-center text-[10px] font-bold text-[#0F1825]">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0F1825]">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[#7B8B9A]/10 flex items-center justify-between bg-[#1A2538]/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
                                    <HiOutlineBuildingStorefront className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-[#F9F9FB]">{selectedConversation.businessName}</h2>
                                    <p className="text-xs text-[#9BA8B5] font-mono">{selectedConversation.businessId}</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-[#7B8B9A]/10 rounded-lg text-[#9BA8B5] transition-colors">
                                <HiOutlineEllipsisVertical className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0icmdiYSgxMjMsIDEzOSwgMTU0LCAwLjA1KSIvPgo8L3N2Zz4=')]">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${msg.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                                            msg.sender === 'admin'
                                                ? 'bg-[#81D7B4] text-[#0F1825] rounded-tr-sm'
                                                : 'bg-[#1A2538] text-[#F9F9FB] rounded-tl-sm border border-[#7B8B9A]/20'
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
                                        <p className={`text-[10px] mt-1 px-1 font-mono ${
                                            msg.sender === 'admin' ? 'text-right text-[#9BA8B5]' : 'text-[#9BA8B5]'
                                        }`}>
                                            {format(new Date(msg.timestamp), 'PP p')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-[#7B8B9A]/10 bg-[#1A2538]/50 relative">
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
                                        className="p-3 hover:bg-[#7B8B9A]/10 rounded-xl transition-colors text-[#9BA8B5] hover:text-[#81D7B4] disabled:opacity-50"
                                        title="Attach Image"
                                    >
                                        <HiOutlinePaperClip className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => setShowDoodle(true)}
                                        disabled={uploading}
                                        className="p-3 hover:bg-[#7B8B9A]/10 rounded-xl transition-colors text-[#9BA8B5] hover:text-[#81D7B4] disabled:opacity-50"
                                        title="Draw Signature"
                                    >
                                        <HiOutlinePencil className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => setShowEmoji(!showEmoji)}
                                        className={`p-3 hover:bg-[#7B8B9A]/10 rounded-xl transition-colors ${showEmoji ? 'text-[#81D7B4] bg-[#7B8B9A]/10' : 'text-[#9BA8B5] hover:text-[#81D7B4]'}`}
                                        title="Emoji"
                                    >
                                        <HiOutlineFaceSmile className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 bg-[#0F1825] rounded-2xl border border-[#7B8B9A]/20 transition-all flex items-center px-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={uploading ? "Uploading..." : "Type a message..."}
                                        rows={1}
                                        disabled={uploading}
                                        className="w-full px-4 py-3 bg-transparent border-none text-[#F9F9FB] placeholder-[#9BA8B5] focus:ring-0 focus:outline-none resize-none max-h-32"
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
                                    className="p-3 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#81D7B4]/20"
                                >
                                    {sending || uploading ? (
                                        <div className="w-6 h-6 border-2 border-[#0F1825] border-t-transparent rounded-full animate-spin" />
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
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#9BA8B5]">
                        <div className="w-20 h-20 bg-[#1A2538] rounded-full flex items-center justify-center mb-4">
                            <HiOutlinePaperAirplane className="w-10 h-10 transform rotate-90 text-[#81D7B4]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#F9F9FB] mb-2">Select a Conversation</h3>
                        <p>Choose a business from the sidebar to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
