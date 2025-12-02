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
            <div className={`${exo.variable} font-sans min-h-screen bg-[#0A0E0D] flex items-center justify-center`}>
                <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
            </div>
        );
    }

    return (
        <div className={`${exo.variable} font-sans h-[calc(100vh-80px)] bg-[#0A0E0D] text-white flex overflow-hidden`}>
            {/* Contacts Sidebar */}
            <div className="hidden md:flex md:w-80 border-r border-gray-800 flex-col">
                {/* Search */}
                <div className="p-4 border-b border-gray-800">
                    <div className="relative">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#81D7B4] focus:outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto">
                    {CONTACTS.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 ${selectedContact.id === contact.id ? 'bg-gray-800/50' : ''
                                }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-[#81D7B4] flex items-center justify-center font-bold text-gray-900">
                                    {contact.avatar}
                                </div>
                                {contact.status === 'online' && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0E0D]"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-white truncate">{contact.name}</h3>
                                    <span className="text-xs text-gray-400">{contact.time}</span>
                                </div>
                                <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="w-5 h-5 rounded-full bg-[#81D7B4] flex items-center justify-center text-xs font-bold text-gray-900">
                                    {contact.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-[#81D7B4] flex items-center justify-center font-bold text-gray-900">
                                {selectedContact.avatar}
                            </div>
                            {selectedContact.status === 'online' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0E0D]"></div>
                            )}
                        </div>
                        <div>
                            <h2 className="font-bold text-white">{selectedContact.name}</h2>
                            <p className="text-sm text-gray-400 capitalize">{selectedContact.status}</p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <HiOutlineEllipsisVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {MESSAGES.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-md ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                                {!msg.isOwn && (
                                    <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender}</p>
                                )}
                                <div className={`px-4 py-3 rounded-2xl ${msg.isOwn
                                    ? 'bg-[#81D7B4] text-gray-900'
                                    : 'bg-gray-800 text-white'
                                    }`}>
                                    <p>{msg.content}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-1">{msg.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <HiOutlinePaperClip className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <HiOutlineFaceSmile className="w-5 h-5 text-gray-400" />
                        </button>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#81D7B4] focus:outline-none"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && message.trim()) {
                                    // Handle send message
                                    setMessage('');
                                }
                            }}
                        />
                        <button
                            className="p-3 bg-[#81D7B4] text-gray-900 rounded-lg hover:bg-[#6BC4A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!message.trim()}
                        >
                            <HiOutlinePaperAirplane className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
