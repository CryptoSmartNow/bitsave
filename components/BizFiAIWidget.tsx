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

export default function BizFiAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('bizfi_ai_widget_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
        }
      } catch { /* ignore */ }
    }
  }, [isOpen]);

  // Save history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('bizfi_ai_widget_history', JSON.stringify(messages.slice(-30)));
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
      const response = await fetch('/api/bizfi/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          chatHistory: messages.slice(-4).map(m => ({ role: m.role === 'user' ? 'User' : 'Assistant', content: m.content })),
          mode: 'chat'
        }),
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
            className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gradient-to-br from-[#0F1825] to-[#1A2538] border border-[#81D7B4]/20 text-[#81D7B4] rounded-full shadow-[0_8px_30px_rgba(15,24,37,0.4)] hover:shadow-[0_8px_40px_rgba(15,24,37,0.6)] hover:border-[#81D7B4]/50 flex items-center justify-center transition-all group"
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
            className="fixed bottom-6 right-6 z-[90] w-[360px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-[#0F1825] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-[#7B8B9A]/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0F1825] to-[#1A2538]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#81D7B4]/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#81D7B4]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#F9F9FB]">BizFi AI</h3>
                  <p className="text-[10px] text-[#81D7B4] font-bold">Business Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/bizfi/dashboard/ai" className="text-[10px] font-bold text-white/80 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg transition-colors">
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
                  <p className="text-sm text-[#7B8B9A] font-medium">Ask about BizShares, tokenization, or business strategy!</p>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#81D7B4] text-white font-bold rounded-br-md'
                        : 'bg-[#1A2538] text-white border border-[#7B8B9A]/20 font-medium rounded-bl-md markdown-content'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : marked.parse(msg.content) as string }}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1A2538] border border-[#7B8B9A]/20 px-4 py-3 rounded-2xl rounded-bl-md">
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
            <div className="p-3 border-t border-[#7B8B9A]/20">
              <div className="flex items-center gap-2 bg-[#1A2538] border border-[#7B8B9A]/20 rounded-xl p-1.5 focus-within:border-[#81D7B4] transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about BizFi..."
                  className="flex-1 bg-transparent outline-none text-[13px] font-medium text-[#F9F9FB] placeholder-[#7B8B9A] px-2.5 py-1.5"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-lg transition-all disabled:opacity-40 shrink-0"
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
