'use client';

import {
  SentIcon,
  Delete02Icon,
  Activity01Icon,
  Cancel01Icon,
  Link01Icon,
  Dollar01Icon,
  UserMultipleIcon,
  Money01Icon,
  Award01Icon,
  Tick01Icon,
  RefreshIcon,
  SparklesIcon,
  BotIcon,
  Share01Icon,
  Idea01Icon,
  Bitcoin01Icon,
  Book01Icon,
  Calendar01Icon,
  Target01Icon,
  Wallet01Icon,
  Alert02Icon
} from "hugeicons-react";
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import toast from 'react-hot-toast';
import { marked } from 'marked';
marked.use({ breaks: true, gfm: true });
import confetti from 'canvas-confetti';
import Link from 'next/link';

const exo = Exo({ subsets: ['latin'], display: 'swap', variable: '--font-exo' });

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

interface ChallengeData {
  title: string;
  description: string;
  duration: string;
  goal: string;
  tips: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

type TabType = 'chat' | 'quizzes' | 'challenges';

const CHAT_PROMPTS = [
  { icon: <Idea01Icon className="w-4 h-4" />, label: 'Savings Tips', prompt: 'What are the best savings strategies on Bitsave?' },
  { icon: <Link01Icon className="w-4 h-4" />, label: 'Compare Networks', prompt: 'Compare Base, Celo, and Lisk networks for savings. Which is cheapest?' },
  { icon: <Alert02Icon className="w-4 h-4" />, label: 'Best Penalties', prompt: 'What penalty percentage should I choose for my savings plan and why?' },
  { icon: <Dollar01Icon className="w-4 h-4" />, label: 'Token Guide', prompt: 'What tokens can I save on Bitsave and what are the benefits of each?' },
  { icon: <UserMultipleIcon className="w-4 h-4" />, label: 'Shared Vaults', prompt: 'How do shared group vaults work on Bitsave?' },
  { icon: <Money01Icon className="w-4 h-4" />, label: '$BTS Rewards', prompt: 'How do I earn more $BTS loyalty tokens on Bitsave?' },
  { icon: <Target01Icon className="w-4 h-4" />, label: 'Create a Goal', prompt: 'Help me create a savings goal. Guide me step by step.' },
  { icon: <SparklesIcon className="w-4 h-4" />, label: 'DeFi Explained', prompt: 'Explain DeFi savings in simple terms for a beginner.' },
];

const QUIZ_TOPICS = [
  { icon: <Book01Icon className="w-4 h-4" />, label: 'DeFi Basics', prompt: 'Generate a quiz about DeFi fundamentals and decentralized finance concepts' },
  { icon: <Money01Icon className="w-4 h-4" />, label: 'Savings Mastery', prompt: 'Generate a quiz about savings strategies, compound interest, and financial planning' },
  { icon: <Bitcoin01Icon className="w-4 h-4" />, label: 'Crypto Terms', prompt: 'Generate a quiz about cryptocurrency terminology and blockchain concepts' },
  { icon: <SparklesIcon className="w-4 h-4" />, label: 'Bitsave Features', prompt: 'Generate a quiz about Bitsave platform features, tokens, networks, and savings plans' },
  { icon: <Award01Icon className="w-4 h-4" />, label: 'Risk Management', prompt: 'Generate a quiz about risk management in crypto and personal finance' },
  { icon: <Wallet01Icon className="w-4 h-4" />, label: 'Personal Finance', prompt: 'Generate a quiz about personal finance fundamentals, budgeting, and money management' },
];

const CHALLENGE_TYPES = [
  { icon: <Calendar01Icon className="w-4 h-4" />, label: '7-Day Saver', prompt: 'Suggest a 7-day savings challenge for a beginner on Bitsave' },
  { icon: <Award01Icon className="w-4 h-4" />, label: '30-Day Streak', prompt: 'Suggest a 30-day savings streak challenge with progressive difficulty' },
  { icon: <Link01Icon className="w-4 h-4" />, label: 'Multi-Chain', prompt: 'Suggest a challenge to save on multiple blockchain networks using Bitsave' },
  { icon: <Bitcoin01Icon className="w-4 h-4" />, label: 'Token Diversity', prompt: 'Suggest a challenge to diversify savings across different tokens on Bitsave' },
  { icon: <UserMultipleIcon className="w-4 h-4" />, label: 'Group Challenge', prompt: 'Suggest a group savings challenge for friends and family on Bitsave' },
  { icon: <SparklesIcon className="w-4 h-4" />, label: 'Surprise Me', prompt: 'Suggest a creative and fun savings challenge on Bitsave' },
];

const playSound = (type: 'send' | 'receive') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio playback ignore
  }
};

export default function SavvyBotPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareType, setShareType] = useState<'quiz' | 'challenge'>('quiz');

  // Challenge state
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeData | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [acceptedChallenges, setAcceptedChallenges] = useState<ChallengeData[]>([]);

  // Load chat history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savvy_bot_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch { /* ignore */ }
    try {
      const savedChallenges = localStorage.getItem('savvy_bot_challenges');
      if (savedChallenges) {
        const parsed = JSON.parse(savedChallenges);
        if (Array.isArray(parsed)) setAcceptedChallenges(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('savvy_bot_history', JSON.stringify(messages.slice(-50)));
      window.dispatchEvent(new Event('savvy_bot_history_updated'));
    }
  }, [messages]);

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const saved = localStorage.getItem('savvy_bot_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.length !== messages.length) {
            setMessages(parsed);
          }
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('savvy_bot_history_updated', handleStorageUpdate);
    return () => window.removeEventListener('savvy_bot_history_updated', handleStorageUpdate);
  }, [messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text?: string) => {
    const question = text || input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    playSound('send');

    try {
      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'User' : 'Assistant',
        content: m.content,
      }));

      const response = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory, mode: 'chat' }),
      });

      if (!response.ok) throw new Error('Network error');

      const contentType = response.headers.get('content-type');
      const botMsgId = `b-${Date.now()}`;

      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'bot',
        content: '',
        timestamp: Date.now(),
      }]);
      setIsLoading(false);

      if (contentType && (contentType.includes('text/event-stream') || contentType.includes('application/octet-stream'))) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulated = '';
        let hasPlayedReceiveSound = false;

        while (reader && !done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            if (!hasPlayedReceiveSound) {
              playSound('receive');
              hasPlayedReceiveSound = true;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const json = JSON.parse(dataStr);
                  if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                    accumulated += json.choices[0].delta.content;
                  } else if (json.message) {
                    accumulated += json.message;
                  } else if (typeof json === 'string') {
                    accumulated += json;
                  }
                } catch {
                  accumulated += dataStr;
                }
              } else if (!line.startsWith(':')) {
                accumulated += line;
              }
            }
            setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: accumulated } : m));
          }
        }
      } else {
        const data = await response.json();
        playSound('receive');
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: data.reply || data.error || 'Hello! How can I assist you with your savings on BitSave today?' } : m));
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: 'Hello! How can I assist you with your BitSave savings plans or features today? Feel free to ask any question!',
        timestamp: Date.now(),
      }]);
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem('savvy_bot_history');
    setShowClearHistoryModal(false);
  };

  // Quiz functions
  const startQuiz = async (prompt: string) => {
    setQuizLoading(true);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, mode: 'quiz' }),
      });

      const data = await response.json();

      if (data.structured && data.structured.questions) {
        setCurrentQuiz(data.structured);
      } else if (data.reply) {
        try {
          const jsonMatch = data.reply.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : data.reply;
          const parsed = JSON.parse(jsonStr);
          if (parsed.questions) setCurrentQuiz(parsed);
        } catch {
          setCurrentQuiz({
            title: 'DeFi & Savings Mastery Quiz',
            questions: [
              { question: 'What does DeFi stand for?', options: ['A) Digital Finance', 'B) Decentralized Finance', 'C) Derivative Finance', 'D) Direct Finance'], correct: 1, explanation: 'DeFi stands for Decentralized Finance — open, permissionless financial tools.' },
              { question: 'What is the main purpose of a savings penalty on Bitsave?', options: ['A) To punish users', 'B) To generate revenue', 'C) To encourage savings discipline', 'D) To increase token value'], correct: 2, explanation: 'Penalties discourage early impulsive withdrawal and help users reach their financial goals.' },
              { question: 'Which Bitsave network is known for sub-cent transaction fees?', options: ['A) Ethereum Mainnet', 'B) Base Network', 'C) Bitcoin', 'D) Solana'], correct: 1, explanation: 'Base (Layer 2) provides low-cost gas fees ideal for micro-savings.' },
              { question: 'What are $BTS tokens?', options: ['A) A stablecoin', 'B) Bitsave loyalty reward tokens', 'C) Bitcoin shares', 'D) A governance token'], correct: 1, explanation: '$BTS are loyalty reward tokens earned through active savings.' },
              { question: 'What is a time-locked savings plan?', options: ['A) An expired contract', 'B) A plan where funds are locked until a selected maturity date', 'C) A variable interest loan', 'D) A staking pool only'], correct: 1, explanation: 'Time-locked plans lock funds until a target date to safeguard savings.' },
            ]
          });
        }
      }
    } catch {
      setCurrentQuiz(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const score = currentQuiz?.questions.reduce((s, q, i) => {
      return s + (quizAnswers[i] === q.correct ? 1 : 0);
    }, 0) || 0;

    if (score >= (currentQuiz?.questions.length || 0) / 2) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setShareType('quiz');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.origin);
        url.pathname = '/share-score';
        url.searchParams.set('score', score.toString());
        url.searchParams.set('total', (currentQuiz?.questions.length || 0).toString());
        url.searchParams.set('title', currentQuiz?.title || 'Quiz');
        setShareUrl(url.toString());
        setTimeout(() => setShowShareModal(true), 1000);
      }
    }
  };

  const getScore = () => {
    if (!currentQuiz) return 0;
    return currentQuiz.questions.reduce((score, q, i) => {
      return score + (quizAnswers[i] === q.correct ? 1 : 0);
    }, 0);
  };

  const shareScore = () => {
    if (!currentQuiz || typeof window === 'undefined') return;
    const score = getScore();
    const total = currentQuiz.questions.length;
    
    const url = new URL(window.location.origin);
    url.pathname = '/share-score';
    url.searchParams.set('score', score.toString());
    url.searchParams.set('total', total.toString());
    url.searchParams.set('title', currentQuiz.title);
    
    const finalUrl = url.toString();
    setShareUrl(finalUrl);
    setShareType('quiz');
    
    navigator.clipboard.writeText(finalUrl).catch(() => {});
    setShowShareModal(true);
  };

  // Challenge functions
  const generateChallenge = async (prompt: string) => {
    setChallengeLoading(true);
    setCurrentChallenge(null);

    try {
      const response = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, mode: 'challenge' }),
      });

      const data = await response.json();

      if (data.structured && data.structured.title) {
        setCurrentChallenge(data.structured);
      } else if (data.reply) {
        try {
          const jsonMatch = data.reply.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : data.reply;
          const parsed = JSON.parse(jsonStr);
          if (parsed.title) setCurrentChallenge(parsed);
        } catch {
          setCurrentChallenge({
            title: '7-Day Consistent Saver Challenge',
            description: 'Save a small amount every day for 7 days on Bitsave. Start with $1 and build consistent financial discipline.',
            duration: '7 days',
            goal: 'Lock at least $5 across 7 days on Base or Celo',
            tips: ['Start with small amounts to build the habit', 'Use Base network for lowest fees', 'Set a 10% penalty to stay committed'],
            difficulty: 'Easy'
          });
        }
      }
    } catch {
      setCurrentChallenge(null);
    } finally {
      setChallengeLoading(false);
    }
  };

  const acceptChallenge = () => {
    if (!currentChallenge || typeof window === 'undefined') return;
    const updated = [...acceptedChallenges, currentChallenge];
    setAcceptedChallenges(updated);
    localStorage.setItem('savvy_bot_challenges', JSON.stringify(updated));
    
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    
    setShareType('challenge');
    const url = new URL(window.location.origin);
    url.pathname = '/share-challenge';
    url.searchParams.set('title', currentChallenge.title);
    url.searchParams.set('goal', currentChallenge.goal);
    setShareUrl(url.toString());
    setTimeout(() => setShowShareModal(true), 1000);
  };

  const TABS: { key: TabType; label: string }[] = [
    { key: 'chat', label: 'Chat' },
    { key: 'quizzes', label: 'Quizzes' },
    { key: 'challenges', label: 'Challenges' },
  ];

  return (
    <div className={`${exo.variable} font-sans flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)] w-full px-4 md:px-0 max-w-4xl mx-auto overflow-hidden`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center text-[#2D5A4A] dark:text-[#81D7B4]">
            <BotIcon className="w-5 h-5 text-[#81D7B4]" />
          </div>
          <div>
            <p className="text-xs text-[#81D7B4] font-bold uppercase tracking-wider">Your Personal Finance Assistant</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-1 gap-1 p-1 bg-gray-100/80 dark:bg-white/5 rounded-xl border border-gray-200/50 dark:border-white/5 relative">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-colors z-10 cursor-pointer ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSavvyTab"
                    className="absolute inset-0 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-xs border border-gray-100 dark:border-white/5"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {activeTab === 'chat' && messages.length > 0 && (
          <button
            onClick={() => setShowClearHistoryModal(true)}
            className="flex items-center justify-center w-9 h-9 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 text-red-500 hover:text-red-600 rounded-xl transition-all shadow-xs shrink-0 border border-red-100 dark:border-red-500/20 cursor-pointer"
            title="Clear Chat History"
          >
            <Delete02Icon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ===== CHAT TAB ===== */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] bg-white dark:bg-[#121212]/60 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-4 sm:p-6 space-y-4 custom-scrollbar relative overflow-hidden">
            <div className="relative z-10 h-full flex flex-col">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-full text-center px-2 sm:px-4 flex-1 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center mb-4 shadow-inner">
                    <BotIcon className="w-7 h-7 text-[#81D7B4]" />
                  </div>
                  <h2 className="text-2xl font-instrument font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Ask me anything!</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium max-w-md mb-6 leading-relaxed">
                    I&apos;m your AI savings assistant. I can help with strategies, explain DeFi concepts, guide you through creating a goal, or answer questions about BitSave.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
                    {CHAT_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        onClick={() => sendMessage(qp.prompt)}
                        className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#81D7B4]/50 hover:bg-gray-100/80 dark:hover:bg-white/10 rounded-xl font-bold text-gray-700 dark:text-gray-300 transition-all group text-left cursor-pointer shadow-xs dark:shadow-none"
                      >
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-all">
                          {qp.icon}
                        </div>
                        <span className="group-hover:text-[#81D7B4] transition-colors text-xs leading-tight">{qp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-4 flex-1">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-[#81D7B4] text-white font-bold rounded-br-xs shadow-xs'
                              : 'bg-gray-50/90 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-white/5 font-medium rounded-bl-xs shadow-xs dark:shadow-none markdown-content'
                          }`}
                          dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : marked.parse(msg.content) as string }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                      <div className="bg-gray-50/90 dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 px-5 py-4 rounded-2xl rounded-bl-xs shadow-xs dark:shadow-none">
                        <div className="flex gap-1.5 items-center h-full">
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#81D7B4] rounded-full" />
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#81D7B4] rounded-full" />
                          <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#81D7B4] rounded-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="mt-3 relative">
            <div className="flex items-center gap-2 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 focus-within:border-[#81D7B4] focus-within:ring-2 focus-within:ring-[#81D7B4]/20 rounded-2xl p-2 pl-4 shadow-xs transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Savvy Bot anything..."
                rows={1}
                className="flex-1 resize-none outline-none text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 py-1.5 max-h-32 bg-transparent"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-xs active:scale-95 cursor-pointer"
              >
                <SentIcon className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2 font-medium">
              Savvy Bot provides general education, not financial advice.
            </p>
          </div>
        </>
      )}

      {/* ===== QUIZZES TAB ===== */}
      {activeTab === 'quizzes' && (
        <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] bg-white dark:bg-[#121212]/60 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-4 sm:p-6 custom-scrollbar relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            {quizLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center">
                  <Activity01Icon className="w-8 h-8 text-[#81D7B4] animate-pulse" />
                </div>
                <p className="text-gray-900 dark:text-white font-instrument text-2xl font-bold tracking-tight">Generating your quiz...</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : currentQuiz ? (
              <div className="space-y-6">
                {/* Quiz Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-instrument font-bold text-gray-900 dark:text-white tracking-tight">{currentQuiz.title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{currentQuiz.questions.length} questions</p>
                  </div>
                  <button
                    onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }}
                    className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-[#81D7B4] flex items-center gap-1.5 transition-colors px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer"
                  >
                    <RefreshIcon className="w-3.5 h-3.5" /> New Quiz
                  </button>
                </div>

                {/* Questions */}
                {currentQuiz.questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50/70 dark:bg-[#1a1a1a]/40 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-xs dark:shadow-none">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-4 leading-relaxed">
                      <span className="text-[#81D7B4] mr-2 text-base font-instrument">{qIdx + 1}.</span>{q.question}
                    </p>
                    <div className="grid gap-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === oIdx;
                        const isCorrect = q.correct === oIdx;
                        let optClass = 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#81D7B4] hover:bg-gray-50/80 dark:hover:bg-white/10';
                        if (quizSubmitted) {
                          if (isCorrect) optClass = 'bg-[#81D7B4]/15 border border-[#81D7B4] text-[#2D5A4A] dark:text-[#81D7B4] font-bold';
                          else if (isSelected && !isCorrect) optClass = 'bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 font-bold';
                          else optClass = 'bg-gray-100/50 dark:bg-white/5 border border-transparent text-gray-400 dark:text-gray-600';
                        } else if (isSelected) {
                          optClass = 'bg-[#81D7B4]/15 border-2 border-[#81D7B4] text-[#2D5A4A] dark:text-white font-bold';
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => selectAnswer(qIdx, oIdx)}
                            disabled={quizSubmitted}
                            className={`px-4 py-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${optClass}`}
                          >
                            {quizSubmitted && isCorrect && <Tick01Icon className="w-4 h-4 text-[#81D7B4] shrink-0" />}
                            {quizSubmitted && isSelected && !isCorrect && <Cancel01Icon className="w-4 h-4 text-red-500 shrink-0" />}
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-3 bg-white dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-white/5 leading-relaxed">
                        {q.explanation}
                      </motion.p>
                    )}
                  </div>
                ))}

                {/* Submit / Results */}
                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== currentQuiz.questions.length}
                    className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs mt-4 cursor-pointer text-sm"
                  >
                    Submit Answers ({Object.keys(quizAnswers).length}/{currentQuiz.questions.length})
                  </button>
                ) : (
                  <div className="bg-white dark:bg-[#1a1a1a]/60 rounded-2xl p-8 border border-gray-100 dark:border-white/10 text-center shadow-xs mt-6 mb-8 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/20 flex items-center justify-center mb-4 text-[#81D7B4]">
                      <Award01Icon className="w-8 h-8" />
                    </div>
                    
                    <div className="text-5xl sm:text-6xl font-instrument font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                      {getScore()}<span className="text-2xl text-gray-400 dark:text-gray-500 font-bold">/{currentQuiz.questions.length}</span>
                    </div>
                    
                    <p className="text-base font-bold text-[#81D7B4] mb-6">
                      {getScore() === currentQuiz.questions.length ? 'Perfect Score! 🌟' : getScore() >= 3 ? 'Great job! 👏' : 'Keep learning! 📚'}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-md">
                      <button
                        onClick={shareScore}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-xl text-xs sm:text-sm transition-all border border-gray-200 dark:border-white/10 cursor-pointer"
                      >
                        <Share01Icon className="w-4 h-4" /> Share Score
                      </button>
                      <button
                        onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                      >
                        <RefreshIcon className="w-4 h-4" /> Try Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Topic Selection */
              <div className="flex flex-col items-center justify-center min-h-full text-center px-2 sm:px-4 flex-1 py-6">
                <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center mb-4">
                  <Activity01Icon className="w-7 h-7 text-[#81D7B4]" />
                </div>
                <h2 className="text-2xl font-instrument font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Test Your Knowledge</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium max-w-md mb-6 leading-relaxed">
                  Take a 5-question quiz on financial literacy, DeFi, or BitSave. Share your score with friends!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                  {QUIZ_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => startQuiz(topic.prompt)}
                      className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#81D7B4]/50 hover:bg-gray-100/80 dark:hover:bg-white/10 rounded-xl font-bold text-gray-700 dark:text-gray-300 transition-all group text-left cursor-pointer shadow-xs dark:shadow-none"
                    >
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-all">
                        {topic.icon}
                      </div>
                      <span className="group-hover:text-[#81D7B4] transition-colors text-xs leading-tight">{topic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== CHALLENGES TAB ===== */}
      {activeTab === 'challenges' && (
        <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] bg-white dark:bg-[#121212]/60 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-4 sm:p-6 custom-scrollbar relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            {challengeLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center">
                  <Award01Icon className="w-8 h-8 text-[#81D7B4] animate-pulse" />
                </div>
                <p className="text-gray-900 dark:text-white font-instrument text-2xl font-bold tracking-tight">Creating your challenge...</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[#81D7B4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : currentChallenge ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentChallenge(null)}
                    className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-[#81D7B4] flex items-center gap-1.5 transition-colors px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer"
                  >
                    <RefreshIcon className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <div className="bg-gray-50/70 dark:bg-[#1a1a1a]/40 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-white/5 shadow-xs dark:shadow-none">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/20 flex items-center justify-center text-[#81D7B4] shrink-0">
                      <Award01Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-instrument font-bold text-gray-900 dark:text-white tracking-tight">{currentChallenge.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          currentChallenge.difficulty === 'Easy' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' :
                          currentChallenge.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                        }`}>{currentChallenge.difficulty}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-white/10">{currentChallenge.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{currentChallenge.description}</p>
                  
                  <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 mb-6 shadow-xs">
                    <p className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-widest mb-1">Goal</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{currentChallenge.goal}</p>
                  </div>
                  
                  <div className="space-y-2.5 mb-8">
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tips for Success</p>
                    {currentChallenge.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-[#81D7B4]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Tick01Icon className="w-3 h-3 text-[#81D7B4]" />
                        </div>
                        <span className="leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>

                  {acceptedChallenges.some(c => c.title === currentChallenge.title) ? (
                    <div className="py-3.5 bg-[#81D7B4]/15 border border-[#81D7B4]/30 text-[#2D5A4A] dark:text-[#81D7B4] font-bold rounded-xl text-center text-xs sm:text-sm flex items-center justify-center gap-2">
                      <Tick01Icon className="w-4 h-4" /> Challenge Accepted!
                    </div>
                  ) : (
                    <button
                      onClick={acceptChallenge}
                      className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs sm:text-sm"
                    >
                      Accept Challenge
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 h-full flex-1 justify-center">
                {/* Challenge Selector */}
                <div className="flex flex-col items-center justify-center min-h-full text-center px-2 sm:px-4 flex-1 py-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center mb-4">
                    <Award01Icon className="w-7 h-7 text-[#81D7B4]" />
                  </div>
                  <h2 className="text-2xl font-instrument font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Savings Challenges</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium max-w-md mb-6 leading-relaxed">
                    Pick a challenge type and the AI will generate a personalized savings challenge for you.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
                    {CHALLENGE_TYPES.map((ct) => (
                      <button
                        key={ct.label}
                        onClick={() => generateChallenge(ct.prompt)}
                        className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#81D7B4]/50 hover:bg-gray-100/80 dark:hover:bg-white/10 rounded-xl font-bold text-gray-700 dark:text-gray-300 transition-all group text-left cursor-pointer shadow-xs dark:shadow-none"
                      >
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-[#81D7B4]/15 dark:bg-[#81D7B4]/25 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-all">
                          {ct.icon}
                        </div>
                        <span className="group-hover:text-[#81D7B4] transition-colors text-xs leading-tight">{ct.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accepted Challenges */}
                {acceptedChallenges.length > 0 && (
                  <div className="mt-4 bg-gray-50/80 dark:bg-[#1a1a1a]/40 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs shrink-0">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2.5 flex items-center gap-2 uppercase tracking-wider">
                      <Activity01Icon className="w-4 h-4 text-[#81D7B4]" /> My Active Challenges
                    </h3>
                    <div className="space-y-2">
                      {acceptedChallenges.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl shadow-xs">
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{c.title}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{c.duration} &middot; {c.difficulty}</p>
                          </div>
                          <span className="text-[10px] font-bold text-[#81D7B4] bg-[#81D7B4]/15 px-2.5 py-1 rounded-md uppercase tracking-wider">Active</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear History Modal */}
      <AnimatePresence>
        {showClearHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowClearHistoryModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 w-full max-w-sm border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowClearHistoryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 text-red-500 mx-auto">
                <Delete02Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-instrument font-bold text-center text-gray-900 dark:text-white mb-2 tracking-tight">
                Clear Chat?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-6 leading-relaxed">
                Are you sure you want to delete your chat history? This action cannot be undone.
              </p>
              
              <div className="flex gap-2.5">
                <button 
                  onClick={() => setShowClearHistoryModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={clearHistory}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Score Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 w-full max-w-sm border border-gray-100 dark:border-white/10 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1.5 rounded-full cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
              
              <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/20 flex items-center justify-center mb-4 text-[#81D7B4] mx-auto">
                <Tick01Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-instrument font-bold text-center text-gray-900 dark:text-white mb-2 tracking-tight">
                {shareType === 'quiz' ? 'Score Copied!' : 'Challenge Accepted!'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs text-center mb-6 leading-relaxed">
                {shareType === 'quiz' 
                  ? 'Your scorecard link is copied to your clipboard. Share it with friends!'
                  : 'You committed to a new challenge. Share it to stay accountable!'}
              </p>
              
              <div className="bg-gray-50 dark:bg-white/5 p-2.5 rounded-xl border border-gray-200/70 dark:border-white/10 flex items-center justify-between mb-6">
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate mr-2 w-full font-mono pl-1 select-all">
                  {shareUrl}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied!');
                  }}
                  className="shrink-0 text-[#81D7B4] hover:text-[#2D5A4A] p-1.5 bg-white dark:bg-white/10 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Link01Icon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareType === 'quiz' 
                    ? `I scored ${getScore()}/${currentQuiz?.questions.length} on the "${currentQuiz?.title}" quiz on @BitsaveProtocol! Check out my score: ` 
                    : `I just accepted the "${currentChallenge?.title}" savings challenge on @BitsaveProtocol! My goal: ${currentChallenge?.goal}. Follow my journey: `
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs transition-all shadow-xs hover:opacity-90"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share on X
                </a>
                
                <Link
                  href={`/dashboard/social?post=${encodeURIComponent(
                    shareType === 'quiz' 
                    ? `I scored ${getScore()}/${currentQuiz?.questions.length} on the "${currentQuiz?.title}" quiz on @BitsaveProtocol! Check out my score: ${shareUrl}` 
                    : `I just accepted the "${currentChallenge?.title}" savings challenge on @BitsaveProtocol! My goal: ${currentChallenge?.goal}. Follow my journey: ${shareUrl}`
                  )}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  <UserMultipleIcon className="w-4 h-4" />
                  Share to Forum
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
