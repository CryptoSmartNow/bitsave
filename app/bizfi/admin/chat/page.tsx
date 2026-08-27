'use client';

import {
  SentIcon,
  Search01Icon,
  Edit02Icon,
  ArrowLeft02Icon,
  Image01Icon,
  SmileIcon,
  Message02Icon,
  Building04Icon
} from "hugeicons-react";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  const sentAudioRef = useRef<HTMLAudioElement | null>(null);
  const receivedAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      sentAudioRef.current = new Audio('/sounds/sent.wav');
      receivedAudioRef.current = new Audio('/sounds/received.wav');
    } catch (e) {
      // Audio not supported or missing
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/bizfi/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setConversations(data);
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
    return [];
  };

  const fetchMessages = async (businessId: string) => {
    try {
      const res = await fetch(`/api/bizfi/chat/messages?businessId=${encodeURIComponent(businessId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(prev => {
            if (data.length > prev.length) {
              const lastMsg = data[data.length - 1];
              if (lastMsg.sender === 'business' && prev.length > 0) {
                receivedAudioRef.current?.play().catch(() => {});
              }
            }
            return data;
          });
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const init = async () => {
      const data = await fetchConversations();

      const paramId = searchParams.get('businessId');
      if (paramId && !initialized.current) {
        initialized.current = true;
        const found = data.find((c: Conversation) => c.businessId === paramId);

        if (found) {
          setSelectedConversation(found);
        } else {
          const newConv: Conversation = {
            businessId: paramId,
            businessName: searchParams.get('businessName') || 'Business Partner',
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
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.businessId);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.businessId);
      }, 3500);
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
        sentAudioRef.current?.play().catch(() => {});
        fetchMessages(selectedConversation.businessId);
        fetchConversations();
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

  const filteredConversations = conversations.filter(c =>
    c.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.businessOwner?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-100px)] flex bg-[#0F1825] rounded-3xl border border-[#7B8B9A]/20 overflow-hidden relative shadow-2xl">
      <ChatDoodle
        isOpen={showDoodle}
        onClose={() => setShowDoodle(false)}
        onSend={handleDoodleSend}
      />

      {/* Conversations Master List */}
      <div className={`w-full md:w-80 border-r border-[#7B8B9A]/20 flex flex-col bg-[#1A2538]/60 backdrop-blur-xl absolute md:relative z-20 h-full transition-transform duration-300 ${
        selectedConversation ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
      }`}>
        <div className="p-5 border-b border-[#7B8B9A]/20 space-y-4">
          <div className="flex items-center gap-2.5">
            <Message02Icon className="w-5 h-5 text-[#81D7B4]" />
            <h2 className="text-lg font-black text-[#F9F9FB]">Direct Channels</h2>
          </div>
          <div className="relative">
            <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B8B9A]" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl text-xs text-[#F9F9FB] placeholder-[#7B8B9A]/60 focus:outline-none focus:border-[#81D7B4]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="p-8 text-center text-[#7B8B9A] text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-[#7B8B9A]/30 border-t-[#81D7B4] animate-spin"></div>
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-[#7B8B9A] text-xs">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.businessId}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 flex items-center gap-3 rounded-2xl transition-all cursor-pointer text-left ${
                  selectedConversation?.businessId === conv.businessId
                    ? 'bg-[#81D7B4]/15 border border-[#81D7B4]/30'
                    : 'hover:bg-[#0F1825]/60 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                  selectedConversation?.businessId === conv.businessId
                    ? 'bg-[#81D7B4] text-[#0F1825]'
                    : 'bg-[#0F1825] text-[#81D7B4] border border-[#7B8B9A]/20'
                }`}>
                  {(conv.businessName || 'B').charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="font-bold text-xs text-[#F9F9FB] truncate">
                      {conv.businessName}
                    </h4>
                    {conv.lastMessage?.timestamp && (
                      <span className="text-[10px] text-[#7B8B9A] font-mono shrink-0 ml-1">
                        {format(new Date(conv.lastMessage.timestamp), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9BA8B5] truncate">
                    {conv.lastMessage?.sender === 'admin' ? 'You: ' : ''}{conv.lastMessage?.content || 'Sent attachment'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message View Area */}
      <div className={`flex-1 flex flex-col bg-[#0F1825] relative w-full md:w-auto h-full z-10 transition-transform duration-300 ${
        !selectedConversation ? 'translate-x-full md:translate-x-0' : 'translate-x-0'
      }`}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#7B8B9A]/20 flex items-center justify-between bg-[#1A2538]/40 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 text-[#9BA8B5] hover:text-[#F9F9FB] hover:bg-[#1A2538] rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft02Icon className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-[#81D7B4] text-[#0F1825] flex items-center justify-center font-black text-sm shrink-0">
                  {(selectedConversation.businessName || 'B').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-[#F9F9FB] truncate">
                    {selectedConversation.businessName}
                  </h3>
                  <p className="text-[10px] text-[#81D7B4] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] animate-pulse"></span>
                    <span>Business Chat</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#7B8B9A] text-xs">
                  <Message02Icon className="w-10 h-10 opacity-30 text-[#81D7B4] mb-2" />
                  <p className="font-bold text-[#F9F9FB]">No messages in channel</p>
                  <p>Send a message below to start the conversation.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'admin'
                          ? 'bg-[#81D7B4] text-[#0F1825] font-medium rounded-tr-none shadow-md shadow-[#81D7B4]/10'
                          : 'bg-[#1A2538] text-[#F9F9FB] rounded-tl-none border border-[#7B8B9A]/20 shadow-md'
                      }`}>
                        {msg.type === 'image' && msg.attachmentUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-60">
                            <img src={msg.attachmentUrl} alt="Attachment" className="object-contain max-h-60" />
                          </div>
                        )}
                        {msg.content && <p className="break-words">{msg.content}</p>}
                      </div>
                      <span className="text-[10px] text-[#7B8B9A] mt-1 px-1 font-mono">
                        {msg.timestamp ? format(new Date(msg.timestamp), 'HH:mm') : ''}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-[#7B8B9A]/20 bg-[#1A2538]/40 backdrop-blur-xl relative">
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#7B8B9A]/20"
                  >
                    <EmojiPicker
                      theme={"dark" as any}
                      onEmojiClick={(e) => setNewMessage(prev => prev + e.emoji)}
                      lazyLoadEmojis
                      width={300}
                      height={380}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 max-w-4xl mx-auto">
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
                  className="p-2.5 bg-[#0F1825] hover:bg-[#1A2538] text-[#9BA8B5] hover:text-[#81D7B4] rounded-xl border border-[#7B8B9A]/20 transition-colors cursor-pointer"
                  title="Upload Image"
                >
                  <Image01Icon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowDoodle(true)}
                  disabled={uploading}
                  className="hidden sm:flex p-2.5 bg-[#0F1825] hover:bg-[#1A2538] text-[#9BA8B5] hover:text-[#81D7B4] rounded-xl border border-[#7B8B9A]/20 transition-colors cursor-pointer"
                  title="Draw signature / doodle"
                >
                  <Edit02Icon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`p-2.5 bg-[#0F1825] rounded-xl border border-[#7B8B9A]/20 transition-colors cursor-pointer ${
                    showEmoji ? 'text-[#81D7B4] border-[#81D7B4]' : 'text-[#9BA8B5] hover:text-[#81D7B4]'
                  }`}
                  title="Insert emoji"
                >
                  <SmileIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 bg-[#0F1825] border border-[#7B8B9A]/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#F9F9FB] placeholder-[#7B8B9A]/60 focus:outline-none focus:border-[#81D7B4]"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || sending || uploading}
                  className="p-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl font-bold transition-all shadow-md shadow-[#81D7B4]/20 cursor-pointer disabled:opacity-40"
                >
                  <SentIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7B8B9A]">
            <div className="w-16 h-16 rounded-3xl bg-[#1A2538] border border-[#7B8B9A]/20 flex items-center justify-center text-[#81D7B4] mb-4">
              <Message02Icon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#F9F9FB] mb-1">Select a Conversation</h3>
            <p className="text-xs text-[#9BA8B5] max-w-sm">
              Choose a business from the left sidebar to inspect communications or message owners directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
