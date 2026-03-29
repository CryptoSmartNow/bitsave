'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlinePaperAirplane } from 'react-icons/hi2';
import { Bot } from 'lucide-react';
import { marked } from 'marked';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

export default function SavvyBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage when widget opens or mounts
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('savvy_bot_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch { /* ignore */ }
    }
  }, [isOpen]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('savvy_bot_history', JSON.stringify(messages.slice(-50)));
      window.dispatchEvent(new Event('savvy_bot_history_updated')); // Dispatch custom event for cross-component sync
    }
  }, [messages]);

  useEffect(() => {
    // Listen for updates from other components (like the main page)
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('savvy_bot_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > messages.length) {
            setMessages(parsed);
          }
        }
      } catch { /* ignore */ }
    };
    
    window.addEventListener('savvy_bot_history_updated', handleStorageUpdate);
    return () => window.removeEventListener('savvy_bot_history_updated', handleStorageUpdate);
  }, [messages.length]);

  // Persist and sync when messages change in the widget
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const saved = localStorage.getItem('savvy_bot_history');
        const currentJSON = JSON.stringify(messages);
        if (saved !== currentJSON) {
          localStorage.setItem('savvy_bot_history', currentJSON);
          window.dispatchEvent(new Event('savvy_bot_history_updated'));
        }
      } catch (e) { console.error('Error saving history:', e); }
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory: messages.slice(-4).map(m => ({ role: m.role === 'user' ? 'User' : 'Assistant', content: m.content })) }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', content: response.ok ? data.reply : 'Sorry, something went wrong.' }]);
    } catch {
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', content: 'Unable to connect. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gradient-to-br from-[#81D7B4] to-[#5CB899] text-white rounded-full shadow-[0_8px_30px_rgba(129,215,180,0.4)] hover:shadow-[0_8px_40px_rgba(129,215,180,0.6)] flex items-center justify-center transition-shadow group"
          >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-[90] w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Savvy Bot</h3>
                  <p className="text-[10px] text-white/70 font-bold">AI Finance Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/savvy-bot" className="text-[10px] font-bold text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg transition-colors">
                  Full Page
                </Link>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white">
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 font-medium">Ask me about savings, DeFi, or Bitsave!</p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#81D7B4] text-white font-bold rounded-br-md'
                      : 'bg-gray-50 text-gray-800 border border-gray-100 font-medium rounded-bl-md markdown-content'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : marked.parse(msg.content) as string }}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent outline-none text-[13px] font-medium text-gray-900 placeholder-gray-400 px-2.5 py-1.5"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-lg transition-all disabled:opacity-40 shrink-0"
                >
                  <HiOutlinePaperAirplane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
