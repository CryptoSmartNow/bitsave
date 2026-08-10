'use client';

import { useState, useRef, useEffect } from 'react';
import { Cancel01Icon, SentIcon, BotIcon } from 'hugeicons-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function formatText(text: string) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  
  return { __html: html };
}

export default function BizswapChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const playSound = (type: 'sent' | 'received') => {
    const audio = new Audio(`/sounds/${type}.wav`);
    audio.play().catch(e => console.error('Audio play failed:', e));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('bizagent-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
    
    setMessages([
      {
        role: 'assistant',
        content: 'Hi! I am the BizAgent. How can I help you understand BizShares and our inaugural projects (BizYield, BizCredit, and BizBond) today?'
      }
    ]);
  }, []);

  useEffect(() => {
    if (isMounted && messages.length > 0) {
      localStorage.setItem('bizagent-chat-history', JSON.stringify(messages));
    }
  }, [messages, isMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    playSound('sent');

    try {
      const response = await fetch('/api/bizswap/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Instead of throwing an error which triggers the Next.js dev overlay,
        // we gracefully show the error message in the chat.
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.error || 'Sorry, I encountered a network error. Please try again.' 
        }]);
        playSound('received');
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      playSound('received');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 px-5 py-3.5 bg-[#81D7B4] hover:bg-[#6BC19D] text-[#0A0F17] rounded-full shadow-lg transition-transform hover:scale-105 z-50 flex items-center justify-center gap-2 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <BotIcon className="w-6 h-6" />
        <span className="font-bold text-sm">BizAgent</span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-[#0A0F17] border border-[#1C2538] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#1C2538] border-b border-[#2C3E5D]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#81D7B4]/10 rounded-full flex items-center justify-center border border-[#81D7B4]/20">
                  <BotIcon className="w-5 h-5 text-[#81D7B4]" />
                </div>
                <div>
                  <h3 className="text-[#F9F9FB] font-bold text-sm">BizAgent</h3>
                  <p className="text-[#7B8B9A] text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#7B8B9A] hover:text-[#F9F9FB] hover:bg-[#2C3E5D] rounded-lg transition-colors"
              >
                <Cancel01Icon className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#81D7B4] text-[#0A0F17] rounded-br-sm'
                        : 'bg-[#1C2538] text-[#F9F9FB] border border-[#2C3E5D] rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <div dangerouslySetInnerHTML={formatText(msg.content)} className="space-y-1" />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1C2538] border border-[#2C3E5D] text-[#F9F9FB] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#1C2538] bg-[#0A0F17]">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about BizShares..."
                  className="w-full bg-[#1C2538] border border-[#2C3E5D] rounded-xl pl-4 pr-12 py-3 text-sm text-[#F9F9FB] placeholder:text-[#7B8B9A] focus:outline-none focus:border-[#81D7B4] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#81D7B4] text-[#0A0F17] rounded-lg hover:bg-[#6BC19D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <SentIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
