"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
    HiOutlinePaperAirplane,
    HiOutlinePaperClip,
    HiOutlineFaceSmile,
    HiOutlineMagnifyingGlass,
    HiOutlineEllipsisVertical
} from "react-icons/hi2";
import { Exo } from "next/font/google";
import "../../bizfi-colors.css";

const exo = Exo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-exo',
});

// Mock chat data
const CONTACTS = [
    { id: 1, name: "Sarah Chen", avatar: "SC", status: "online", lastMessage: "Thanks for the update!", time: "2m ago", unread: 2 },
    { id: 2, name: "Mike Johnson", avatar: "MJ", status: "online", lastMessage: "When can we schedule a call?", time: "15m ago", unread: 0 },
    { id: 3, name: "Emily Davis", avatar: "ED", status: "offline", lastMessage: "I'll review the proposal", time: "1h ago", unread: 0 },
    { id: 4, name: "Alex Thompson", avatar: "AT", status: "online", lastMessage: "Great progress on the project!", time: "3h ago", unread: 1 },
    { id: 5, name: "Lisa Martinez", avatar: "LM", status: "offline", lastMessage: "See you tomorrow", time: "1d ago", unread: 0 },
];

const MESSAGES = [
    { id: 1, sender: "Sarah Chen", content: "Hi! How's the business listing going?", time: "10:30 AM", isOwn: false },
    { id: 2, sender: "You", content: "Going great! Just finished the assessment form.", time: "10:32 AM", isOwn: true },
    { id: 3, sender: "Sarah Chen", content: "That's awesome! Did you get a chance to review the tokenization options?", time: "10:33 AM", isOwn: false },
    { id: 4, sender: "You", content: "Yes, I'm leaning towards the revenue-sharing model. It seems more sustainable for my business.", time: "10:35 AM", isOwn: true },
    { id: 5, sender: "Sarah Chen", content: "Smart choice! That model has been performing really well for similar businesses.", time: "10:36 AM", isOwn: false },
    { id: 6, sender: "Sarah Chen", content: "Thanks for the update!", time: "10:37 AM", isOwn: false },
];

export default function ChatPage() {
    const [selectedContact, setSelectedContact] = useState(CONTACTS[0]);
    const [message, setMessage] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`${exo.variable} font-sans min-h-screen flex items-center justify-center bg-gray-900`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] text-white flex overflow-hidden bg-gray-950`}>
            {/* Contacts Sidebar */}
            <div className="hidden md:flex md:w-80 border-r border-gray-800 flex-col bg-gray-900/50 backdrop-blur-xl">
                {/* Search */}
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-[#81D7B4] focus:ring-1 focus:ring-[#81D7B4] focus:outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {CONTACTS.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full p-4 flex items-center gap-4 hover:bg-gray-800/50 transition-all border-b border-gray-800/50 ${selectedContact.id === contact.id ? 'bg-gray-800/80 border-l-2 border-l-[#81D7B4]' : 'border-l-2 border-l-transparent'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${selectedContact.id === contact.id ? 'bg-[#81D7B4] text-[#0F1825]' : 'bg-gray-800 text-gray-400'}`}>
                                    {contact.avatar}
                                </div>
                                {contact.status === 'online' && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-gray-900"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`font-semibold truncate ${selectedContact.id === contact.id ? 'text-white' : 'text-gray-300'}`}>{contact.name}</h3>
                                    <span className="text-xs text-gray-500 font-mono">{contact.time}</span>
                                </div>
                                <p className={`text-sm truncate ${selectedContact.id === contact.id ? 'text-gray-300' : 'text-gray-500'}`}>{contact.lastMessage}</p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="w-5 h-5 rounded-full bg-[#81D7B4] flex items-center justify-center text-[10px] font-bold text-[#0F1825]">
                                    {contact.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-950">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#81D7B4] flex items-center justify-center font-bold text-[#0F1825]">
                                {selectedContact.avatar}
                            </div>
                            {selectedContact.status === 'online' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#81D7B4] rounded-full border-2 border-gray-900"></div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-lg">{selectedContact.name}</h2>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${selectedContact.status === 'online' ? 'bg-[#81D7B4]' : 'bg-gray-500'}`}></span>
                                <p className="text-xs text-gray-400 capitalize font-medium">{selectedContact.status}</p>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white">
                        <HiOutlineEllipsisVertical className="w-6 h-6" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-gray-950">
                    {MESSAGES.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                                {!msg.isOwn && (
                                    <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender}</p>
                                )}
                                <div className={`px-5 py-3 rounded-2xl shadow-sm ${msg.isOwn
                                    ? 'bg-[#81D7B4] text-[#0F1825] rounded-tr-sm'
                                    : 'bg-gray-800/80 text-white rounded-tl-sm border border-gray-700'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                                <p className={`text-[10px] mt-1 ml-1 font-mono ${msg.isOwn ? 'text-right text-gray-500' : 'text-gray-600'}`}>{msg.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-end gap-3 max-w-4xl mx-auto">
                        <div className="flex gap-1">
                            <button className="p-3 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-[#81D7B4]">
                                <HiOutlinePaperClip className="w-6 h-6" />
                            </button>
                            <button className="p-3 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-[#81D7B4]">
                                <HiOutlineFaceSmile className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-800/50 rounded-2xl border border-gray-700 focus-within:border-[#81D7B4] transition-all flex items-center px-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                rows={1}
                                className="w-full px-4 py-3 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 resize-none max-h-32 custom-scrollbar"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                                        e.preventDefault();
                                        setMessage('');
                                    }
                                }}
                            />
                        </div>

                        <button
                            className="p-3 bg-[#81D7B4] text-[#0F1825] rounded-xl hover:bg-[#6BC4A0] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_15px_rgba(129,215,180,0.2)]"
                            disabled={!message.trim()}
                        >
                            <HiOutlinePaperAirplane className="w-6 h-6 transform rotate-90" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
