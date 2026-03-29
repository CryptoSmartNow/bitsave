'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlinePaperAirplane, HiOutlineTrash, HiOutlineChatBubbleLeftRight,
  HiOutlineCalculator, HiOutlineBriefcase, HiOutlineSparkles,
  HiOutlineBuildingStorefront, HiOutlineChartBar, HiOutlineDocumentText,
  HiOutlineUserGroup, HiOutlineCurrencyDollar, HiOutlineLightBulb,
  HiOutlineRocketLaunch, HiOutlineShieldCheck
} from 'react-icons/hi2';
import { Bot } from 'lucide-react';
import { marked } from 'marked';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

type BizFiMode = 'chat' | 'valuation' | 'advisor';

const CHAT_PROMPTS = [
  { icon: <HiOutlineBuildingStorefront className="w-4 h-4" />, label: 'How to List', prompt: 'How do I list my business on BizMarket?' },
  { icon: <HiOutlineChartBar className="w-4 h-4" />, label: 'Best BizShares', prompt: 'Give me the best equity BizShares projecting 10% annual growth' },
  { icon: <HiOutlineShieldCheck className="w-4 h-4" />, label: 'Verification', prompt: 'How does business verification and attestation work on BizFi?' },
  { icon: <HiOutlineCurrencyDollar className="w-4 h-4" />, label: 'Token Pricing', prompt: 'How should I price my BizShare tokens?' },
  { icon: <HiOutlineUserGroup className="w-4 h-4" />, label: 'For Investors', prompt: 'How do I evaluate a business listing before buying BizShares?' },
  { icon: <HiOutlineDocumentText className="w-4 h-4" />, label: 'KYC Process', prompt: 'What documents do I need for KYC/KYB on BizMarket?' },
];

const VALUATION_PROMPTS = [
  { icon: <HiOutlineCalculator className="w-4 h-4" />, label: 'Start Valuation', prompt: 'I want to estimate my business valuation. Let\'s begin.' },
  { icon: <HiOutlineBuildingStorefront className="w-4 h-4" />, label: 'Startup', prompt: 'Help me value my early-stage startup for BizMarket listing' },
  { icon: <HiOutlineChartBar className="w-4 h-4" />, label: 'Established Biz', prompt: 'Help me value my established business with existing revenue' },
];

const ADVISOR_PROMPTS = [
  { icon: <HiOutlineRocketLaunch className="w-4 h-4" />, label: 'Generate Pitch', prompt: 'Generate a BizMarket listing pitch for my business' },
  { icon: <HiOutlineLightBulb className="w-4 h-4" />, label: 'Growth Strategy', prompt: 'What growth strategies would you recommend for a small business in Nigeria?' },
  { icon: <HiOutlineSparkles className="w-4 h-4" />, label: 'Tokenization Plan', prompt: 'Help me create a tokenization strategy for my business' },
  { icon: <HiOutlineBriefcase className="w-4 h-4" />, label: 'Funding Plan', prompt: 'Help me create a fundraising plan using BizShares' },
  { icon: <HiOutlineDocumentText className="w-4 h-4" />, label: 'Business Plan', prompt: 'Help me outline a business plan for my BizMarket listing' },
  { icon: <HiOutlineChartBar className="w-4 h-4" />, label: 'Financial Model', prompt: 'Help me create financial projections for my business' },
];

const MODES: { key: BizFiMode; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'chat', label: 'Chat', icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" />, color: '#81D7B4' },
  { key: 'valuation', label: 'Valuation', icon: <HiOutlineCalculator className="w-4 h-4" />, color: '#81D7B4' },
  { key: 'advisor', label: 'Advisor', icon: <HiOutlineBriefcase className="w-4 h-4" />, color: '#81D7B4' },
];

export default function BizFiAI() {
  const [mode, setMode] = useState<BizFiMode>('chat');
  const [messages, setMessages] = useState<Record<BizFiMode, Message[]>>({
    chat: [],
    valuation: [],
    advisor: [],
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = messages[mode];

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bizfi_ai_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setMessages(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const hasMessages = Object.values(messages).some(m => m.length > 0);
    if (hasMessages) {
      const trimmed = {
        chat: messages.chat.slice(-30),
        valuation: messages.valuation.slice(-30),
        advisor: messages.advisor.slice(-30),
      };
      localStorage.setItem('bizfi_ai_history', JSON.stringify(trimmed));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const question = text || input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages(prev => ({ ...prev, [mode]: [...prev[mode], userMsg] }));
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = currentMessages.slice(-8).map(m => ({
        role: m.role === 'user' ? 'User' : 'Assistant',
        content: m.content,
      }));

      const response = await fetch('/api/bizfi/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory, mode }),
      });

      const data = await response.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: response.ok ? data.reply : (data.error || 'Sorry, I encountered an issue.'),
        timestamp: Date.now(),
      };

      setMessages(prev => ({ ...prev, [mode]: [...prev[mode], botMsg] }));
    } catch {
      setMessages(prev => ({
        ...prev,
        [mode]: [...prev[mode], {
          id: `b-${Date.now()}`,
          role: 'bot',
          content: 'Unable to connect. Please check your connection.',
          timestamp: Date.now(),
        }],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentMessages, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages(prev => ({ ...prev, [mode]: [] }));
  };

  const getPrompts = () => {
    switch (mode) {
      case 'valuation': return VALUATION_PROMPTS;
      case 'advisor': return ADVISOR_PROMPTS;
      default: return CHAT_PROMPTS;
    }
  };

  const getModeInfo = () => {
    switch (mode) {
      case 'valuation':
        return { title: 'Valuation Estimator', subtitle: 'Get an AI-powered estimate of your business value', icon: <HiOutlineCalculator className="w-10 h-10 text-[#81D7B4]" /> };
      case 'advisor':
        return { title: 'Business Advisor', subtitle: 'Get strategic advice, pitch generation, and growth plans', icon: <HiOutlineBriefcase className="w-10 h-10 text-[#81D7B4]" /> };
      default:
        return { title: 'Ask me anything!', subtitle: 'I can help with BizShares, tokenization, verification, and more', icon: <Bot className="w-10 h-10 text-[#81D7B4]" /> };
    }
  };

  const modeInfo = getModeInfo();
  const prompts = getPrompts();

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F1825] to-[#1A2538] flex items-center justify-center shadow-lg shadow-[#1A2538]/20 border border-[#81D7B4]/20">
            <Bot className="w-6 h-6 text-[#81D7B4]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#F9F9FB] tracking-tight">BizFi AI</h1>
            <p className="text-xs text-[#81D7B4] font-bold uppercase tracking-wider">Business Intelligence Assistant</p>
          </div>
        </div>
        {currentMessages.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 bg-[#1A2538] border border-[#7B8B9A]/30 text-[#7B8B9A] hover:text-red-400 hover:border-red-400/50 rounded-xl text-sm font-bold transition-all">
            <HiOutlineTrash className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-[#1A2538] border border-[#7B8B9A]/20 rounded-2xl mb-4">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              mode === m.key
                ? 'bg-[#0F1825] border border-[#81D7B4]/30 text-[#81D7B4] shadow-md'
                : 'text-[#7B8B9A] hover:text-[#F9F9FB]'
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-[2rem] bg-[#1A2538] border border-[#7B8B9A]/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] p-4 sm:p-6 space-y-4 custom-scrollbar">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6">
              {modeInfo.icon}
            </div>
            <h2 className="text-2xl font-black text-[#F9F9FB] mb-2 tracking-tight">{modeInfo.title}</h2>
            <p className="text-[#B0BEC5] text-sm font-medium max-w-md mb-8">{modeInfo.subtitle}</p>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${prompts.length > 4 ? 'lg:grid-cols-3' : ''} gap-3 w-full`}>
              {prompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => sendMessage(p.prompt)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-[#0F1825] border border-[#7B8B9A]/20 hover:border-[#81D7B4] hover:bg-[#81D7B4]/10 hover:shadow-[0_8px_25px_rgba(129,215,180,0.15)] rounded-2xl text-sm font-bold text-[#F9F9FB] transition-all group text-left"
                >
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#0F1825] transition-colors">
                    {p.icon}
                  </div>
                  <span className="group-hover:text-[#2D5A4A] transition-colors text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {currentMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#81D7B4] text-white font-bold rounded-br-md'
                        : 'bg-[#0F1825] text-white border border-[#7B8B9A]/20 font-medium rounded-bl-md markdown-content'
                    }`}
                    dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : marked.parse(msg.content) as string }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-[#0F1825] border border-[#7B8B9A]/20 px-5 py-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 relative">
        <div className="flex items-end gap-3 bg-[#1A2538] border border-[#7B8B9A]/20 focus-within:border-[#81D7B4] focus-within:ring-2 focus-within:ring-[#81D7B4]/20 rounded-2xl p-2 shadow-sm transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'valuation' ? 'Tell me about your business...' :
              mode === 'advisor' ? 'Ask for business advice...' :
              'Ask about BizFi, BizShares, tokenization...'
            }
            rows={1}
            className="flex-1 resize-none outline-none text-sm font-medium text-[#F9F9FB] placeholder-[#7B8B9A] px-3 py-2.5 max-h-32 bg-transparent"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
          >
            <HiOutlinePaperAirplane className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-[#7B8B9A] text-center mt-2 font-medium">
          BizFi AI provides general guidance, not financial or legal advice. Powered by ChainGPT.
        </p>
      </div>
    </div>
  );
}
