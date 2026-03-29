'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import {
  HiOutlinePaperAirplane, HiOutlineTrash, HiOutlineLightBulb, HiOutlineLink,
  HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineBanknotes,
  HiOutlineAcademicCap, HiOutlineTrophy, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineArrowPath, HiOutlineShare, HiOutlineSparkles, HiOutlineFlag,
  HiOutlineChatBubbleLeftRight, HiOutlineBookOpen, HiOutlinePuzzlePiece
} from 'react-icons/hi2';
import { Bot } from 'lucide-react';
import { marked } from 'marked';

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
  { icon: <HiOutlineLightBulb className="w-4 h-4" />, label: 'Savings Tips', prompt: 'What are the best savings strategies on Bitsave?' },
  { icon: <HiOutlineLink className="w-4 h-4" />, label: 'Compare Networks', prompt: 'Compare Base, Celo, and Lisk networks for savings. Which is cheapest?' },
  { icon: <HiOutlineClock className="w-4 h-4" />, label: 'Best Penalties', prompt: 'What penalty percentage should I choose for my savings plan and why?' },
  { icon: <HiOutlineCurrencyDollar className="w-4 h-4" />, label: 'Token Guide', prompt: 'What tokens can I save on Bitsave and what are the benefits of each?' },
  { icon: <HiOutlineUsers className="w-4 h-4" />, label: 'Group Savings', prompt: 'How does group savings work on Bitsave?' },
  { icon: <HiOutlineBanknotes className="w-4 h-4" />, label: '$BTS Rewards', prompt: 'How do I earn more $BTS loyalty tokens on Bitsave?' },
  { icon: <HiOutlineFlag className="w-4 h-4" />, label: 'Create a Goal', prompt: 'Help me create a savings goal. Guide me step by step.' },
  { icon: <HiOutlineSparkles className="w-4 h-4" />, label: 'DeFi Explained', prompt: 'Explain DeFi savings in simple terms for a beginner.' },
];

const QUIZ_TOPICS = [
  { icon: <HiOutlineAcademicCap className="w-4 h-4" />, label: 'DeFi Basics', prompt: 'Generate a quiz about DeFi fundamentals and decentralized finance concepts' },
  { icon: <HiOutlineBanknotes className="w-4 h-4" />, label: 'Savings Mastery', prompt: 'Generate a quiz about savings strategies, compound interest, and financial planning' },
  { icon: <HiOutlinePuzzlePiece className="w-4 h-4" />, label: 'Crypto Terms', prompt: 'Generate a quiz about cryptocurrency terminology and blockchain concepts' },
  { icon: <HiOutlineLightBulb className="w-4 h-4" />, label: 'Bitsave Features', prompt: 'Generate a quiz about Bitsave platform features, tokens, networks, and savings plans' },
  { icon: <HiOutlineTrophy className="w-4 h-4" />, label: 'Risk Management', prompt: 'Generate a quiz about risk management in crypto and personal finance' },
  { icon: <HiOutlineBookOpen className="w-4 h-4" />, label: 'Personal Finance', prompt: 'Generate a quiz about personal finance fundamentals, budgeting, and money management' },
];

const CHALLENGE_TYPES = [
  { icon: <HiOutlineFlag className="w-4 h-4" />, label: '7-Day Saver', prompt: 'Suggest a 7-day savings challenge for a beginner on Bitsave' },
  { icon: <HiOutlineTrophy className="w-4 h-4" />, label: '30-Day Streak', prompt: 'Suggest a 30-day savings streak challenge with progressive difficulty' },
  { icon: <HiOutlineLink className="w-4 h-4" />, label: 'Multi-Chain', prompt: 'Suggest a challenge to save on multiple blockchain networks using Bitsave' },
  { icon: <HiOutlineCurrencyDollar className="w-4 h-4" />, label: 'Token Diversity', prompt: 'Suggest a challenge to diversify savings across different tokens on Bitsave' },
  { icon: <HiOutlineUsers className="w-4 h-4" />, label: 'Group Challenge', prompt: 'Suggest a group savings challenge for friends and family on Bitsave' },
  { icon: <HiOutlineSparkles className="w-4 h-4" />, label: 'Surprise Me', prompt: 'Suggest a creative and fun savings challenge on Bitsave' },
];

export default function SavvyBotPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

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

    try {
      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role === 'user' ? 'User' : 'Assistant',
        content: m.content,
      }));

      const response = await fetch('/api/savvy-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory }),
      });

      const data = await response.json();

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: response.ok ? data.reply : (data.error || 'Sorry, I encountered an issue. Please try again.'),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'bot',
        content: 'Unable to connect to Savvy Bot. Please check your connection and try again.',
        timestamp: Date.now(),
      }]);
    } finally {
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
        // Try to parse from raw reply
        try {
          const jsonMatch = data.reply.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : data.reply;
          const parsed = JSON.parse(jsonStr);
          if (parsed.questions) setCurrentQuiz(parsed);
        } catch {
          // Fallback: generate a default quiz
          setCurrentQuiz({
            title: 'Financial Literacy Quiz',
            questions: [
              { question: 'What does DeFi stand for?', options: ['A) Digital Finance', 'B) Decentralized Finance', 'C) Derivative Finance', 'D) Direct Finance'], correct: 1, explanation: 'DeFi stands for Decentralized Finance — financial services built on blockchain technology.' },
              { question: 'What is the main purpose of a savings penalty on Bitsave?', options: ['A) To punish users', 'B) To generate revenue', 'C) To encourage savings discipline', 'D) To increase token value'], correct: 2, explanation: 'Penalties discourage early withdrawal and help users maintain their savings discipline.' },
              { question: 'Which Bitsave network is known for the lowest transaction fees?', options: ['A) Ethereum Mainnet', 'B) Base', 'C) Bitcoin', 'D) Solana'], correct: 1, explanation: 'Base (an L2) offers very low transaction fees, making it ideal for frequent savings.' },
              { question: 'What are $BTS tokens?', options: ['A) A stablecoin', 'B) Bitsave loyalty reward tokens', 'C) Bitcoin shares', 'D) A governance token'], correct: 1, explanation: '$BTS are loyalty tokens earned through savings activity on Bitsave.' },
              { question: 'What is a time-locked savings plan?', options: ['A) A plan that expires', 'B) A plan where funds are locked until a set date', 'C) A plan that changes with time zones', 'D) A plan only available at certain times'], correct: 1, explanation: 'Time-locked plans lock your funds until a maturity date, helping you avoid impulsive withdrawals.' },
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
  };

  const getScore = () => {
    if (!currentQuiz) return 0;
    return currentQuiz.questions.reduce((score, q, i) => {
      return score + (quizAnswers[i] === q.correct ? 1 : 0);
    }, 0);
  };

  const shareScore = () => {
    if (!currentQuiz) return;
    const score = getScore();
    const total = currentQuiz.questions.length;
    
    // Create shareable URL
    const url = new URL(window.location.origin);
    url.pathname = '/share-score';
    url.searchParams.set('score', score.toString());
    url.searchParams.set('total', total.toString());
    url.searchParams.set('title', currentQuiz.title);
    
    const finalUrl = url.toString();
    setShareUrl(finalUrl);
    
    // Copy to clipboard
    navigator.clipboard.writeText(finalUrl).catch(() => {});
    
    // Show modal instead of alert
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
            title: 'Weekly Saver Challenge',
            description: 'Save a small amount every day for 7 days on Bitsave. Start with $1 and increase by $1 each day.',
            duration: '7 days',
            goal: 'Save a total of $28 by the end of the week',
            tips: ['Start with the lowest amount to build the habit', 'Use Base network for the lowest fees', 'Set a 10% penalty to keep yourself accountable'],
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
    if (!currentChallenge) return;
    const updated = [...acceptedChallenges, currentChallenge];
    setAcceptedChallenges(updated);
    localStorage.setItem('savvy_bot_challenges', JSON.stringify(updated));
  };

  const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'chat', label: 'Chat', icon: <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> },
    { key: 'quizzes', label: 'Quizzes', icon: <HiOutlineAcademicCap className="w-4 h-4" /> },
    { key: 'challenges', label: 'Challenges', icon: <HiOutlineTrophy className="w-4 h-4" /> },
  ];

  return (
    <div className={`${exo.variable} font-sans flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#81D7B4] to-[#6BC4A0] flex items-center justify-center shadow-lg shadow-[#81D7B4]/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Savvy Bot</h1>
            <p className="text-xs text-[#81D7B4] font-bold uppercase tracking-wider">Your Personal Finance Assistant</p>
          </div>
        </div>
        {activeTab === 'chat' && messages.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 rounded-xl text-sm font-bold transition-all">
            <HiOutlineTrash className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== CHAT TAB ===== */}
      {activeTab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6">
                  <Bot className="w-10 h-10 text-[#81D7B4]" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Ask me anything!</h2>
                <p className="text-gray-500 text-sm font-medium max-w-md mb-8">
                  I&apos;m your AI savings assistant. I can help with strategies, explain DeFi concepts, guide you through creating a goal, or answer questions about Bitsave.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                  {CHAT_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.prompt)}
                      className="flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 hover:shadow-[0_8px_25px_rgba(129,215,180,0.1)] rounded-2xl text-sm font-bold text-gray-700 transition-all group text-left"
                    >
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-colors">
                        {qp.icon}
                      </div>
                      <span className="group-hover:text-[#81D7B4] transition-colors text-xs">{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
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
                          : 'bg-[#F8FAF9] text-gray-800 border border-gray-100 font-medium rounded-bl-md markdown-content'
                        }`}
                        dangerouslySetInnerHTML={{ __html: msg.role === 'user' ? msg.content : marked.parse(msg.content) as string }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-[#F8FAF9] border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-md">
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

          {/* Input Area */}
          <div className="mt-4 relative">
            <div className="flex items-end gap-3 bg-white border border-gray-200 focus-within:border-[#81D7B4] focus-within:ring-2 focus-within:ring-[#81D7B4]/20 rounded-2xl p-2 shadow-sm transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Savvy Bot anything..."
                rows={1}
                className="flex-1 resize-none outline-none text-sm font-medium text-gray-900 placeholder-gray-400 px-3 py-2.5 max-h-32 bg-transparent"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center bg-[#81D7B4] hover:bg-[#6BC4A0] text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm"
              >
                <HiOutlinePaperAirplane className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 font-medium">
              Savvy Bot provides general education, not financial advice. Powered by ChainGPT.
            </p>
          </div>
        </>
      )}

      {/* ===== QUIZZES TAB ===== */}
      {activeTab === 'quizzes' && (
        <div className="flex-1 overflow-y-auto rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 custom-scrollbar">
          {quizLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center">
                <HiOutlineAcademicCap className="w-8 h-8 text-[#81D7B4] animate-pulse" />
              </div>
              <p className="text-gray-500 font-bold text-sm">Generating your quiz...</p>
              <div className="flex gap-1.5">
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
                  <h2 className="text-lg font-black text-gray-900 tracking-tight">{currentQuiz.title}</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{currentQuiz.questions.length} questions</p>
                </div>
                <button onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <HiOutlineArrowPath className="w-3.5 h-3.5" /> New Quiz
                </button>
              </div>

              {/* Questions */}
              {currentQuiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="font-bold text-gray-900 text-sm mb-3">
                    <span className="text-[#81D7B4] mr-2">{qIdx + 1}.</span>{q.question}
                  </p>
                  <div className="grid gap-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = q.correct === oIdx;
                      let optClass = 'bg-white border border-gray-200 text-gray-700 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5';
                      if (quizSubmitted) {
                        if (isCorrect) optClass = 'bg-[#81D7B4]/10 border border-[#81D7B4] text-[#2D5A4A]';
                        else if (isSelected && !isCorrect) optClass = 'bg-red-50 border border-red-300 text-red-700';
                        else optClass = 'bg-gray-50 border border-gray-100 text-gray-400';
                      } else if (isSelected) {
                        optClass = 'bg-[#81D7B4]/10 border-2 border-[#81D7B4] text-[#2D5A4A]';
                      }
                      return (
                        <button
                          key={oIdx}
                          onClick={() => selectAnswer(qIdx, oIdx)}
                          disabled={quizSubmitted}
                          className={`px-4 py-3 rounded-xl text-left text-sm font-medium transition-all flex items-center gap-3 ${optClass}`}
                        >
                          {quizSubmitted && isCorrect && <HiOutlineCheckCircle className="w-5 h-5 text-[#81D7B4] shrink-0" />}
                          {quizSubmitted && isSelected && !isCorrect && <HiOutlineXCircle className="w-5 h-5 text-red-500 shrink-0" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-gray-500 mt-3 bg-white p-3 rounded-xl border border-gray-100">
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
                  className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answers ({Object.keys(quizAnswers).length}/{currentQuiz.questions.length})
                </button>
              ) : (
                <div className="bg-gradient-to-br from-[#81D7B4]/10 to-[#81D7B4]/5 rounded-2xl p-6 border border-[#81D7B4]/20 text-center">
                  <div className="text-4xl font-black text-[#2D5A4A] mb-2">{getScore()}/{currentQuiz.questions.length}</div>
                  <p className="text-sm font-bold text-[#81D7B4] mb-4">
                    {getScore() === currentQuiz.questions.length ? 'Perfect Score!' : getScore() >= 3 ? 'Great job!' : 'Keep learning!'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={shareScore} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:border-[#81D7B4] font-bold rounded-xl text-sm transition-all">
                      <HiOutlineShare className="w-4 h-4" /> Share Score
                    </button>
                    <button onClick={() => { setCurrentQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-bold rounded-xl text-sm transition-all">
                      <HiOutlineArrowPath className="w-4 h-4" /> Try Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Topic Selection */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6">
                <HiOutlineAcademicCap className="w-10 h-10 text-[#81D7B4]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Test Your Knowledge</h2>
              <p className="text-gray-500 text-sm font-medium max-w-md mb-8">
                Take a 5-question quiz on financial literacy, DeFi, or Bitsave. Share your score with friends!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                {QUIZ_TOPICS.map((topic) => (
                  <button
                    key={topic.label}
                    onClick={() => startQuiz(topic.prompt)}
                    className="flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 hover:shadow-[0_8px_25px_rgba(129,215,180,0.1)] rounded-2xl text-sm font-bold text-gray-700 transition-all group text-left"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-colors">
                      {topic.icon}
                    </div>
                    <span className="group-hover:text-[#81D7B4] transition-colors">{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== CHALLENGES TAB ===== */}
      {activeTab === 'challenges' && (
        <div className="flex-1 overflow-y-auto rounded-[2rem] bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 sm:p-6 custom-scrollbar">
          {challengeLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-full bg-[#81D7B4]/10 flex items-center justify-center">
                <HiOutlineTrophy className="w-8 h-8 text-[#81D7B4] animate-pulse" />
              </div>
              <p className="text-gray-500 font-bold text-sm">Creating your challenge...</p>
            </div>
          ) : currentChallenge ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentChallenge(null)} className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <HiOutlineArrowPath className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#81D7B4]/10 to-transparent rounded-2xl p-6 border border-[#81D7B4]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#81D7B4] flex items-center justify-center text-white">
                    <HiOutlineTrophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">{currentChallenge.title}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        currentChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        currentChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{currentChallenge.difficulty}</span>
                      <span className="text-xs text-gray-500 font-medium">{currentChallenge.duration}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{currentChallenge.description}</p>
                <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Goal</p>
                  <p className="text-sm font-bold text-gray-900">{currentChallenge.goal}</p>
                </div>
                <div className="space-y-2 mb-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tips</p>
                  {currentChallenge.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <HiOutlineCheckCircle className="w-4 h-4 text-[#81D7B4] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                {acceptedChallenges.some(c => c.title === currentChallenge.title) ? (
                  <div className="py-3 bg-[#81D7B4]/10 text-[#2D5A4A] font-bold rounded-xl text-center text-sm">
                    Challenge Accepted!
                  </div>
                ) : (
                  <button
                    onClick={acceptChallenge}
                    className="w-full py-3.5 bg-[#81D7B4] hover:bg-[#6BC4A0] text-white font-black rounded-xl transition-all"
                  >
                    Accept Challenge
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Challenge Selector */}
              <div className="flex flex-col items-center text-center px-4 pt-4">
                <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center mb-6">
                  <HiOutlineTrophy className="w-10 h-10 text-[#81D7B4]" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Savings Challenges</h2>
                <p className="text-gray-500 text-sm font-medium max-w-md mb-8">
                  Pick a challenge type and the AI will generate a personalized savings challenge for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CHALLENGE_TYPES.map((ct) => (
                  <button
                    key={ct.label}
                    onClick={() => generateChallenge(ct.prompt)}
                    className="flex items-center gap-3 px-4 py-3.5 bg-white border border-gray-100 hover:border-[#81D7B4] hover:bg-[#81D7B4]/5 hover:shadow-[0_8px_25px_rgba(129,215,180,0.1)] rounded-2xl text-sm font-bold text-gray-700 transition-all group text-left"
                  >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-colors">
                      {ct.icon}
                    </div>
                    <span className="group-hover:text-[#81D7B4] transition-colors">{ct.label}</span>
                  </button>
                ))}
              </div>

              {/* Accepted Challenges */}
              {acceptedChallenges.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                    <HiOutlineFlag className="w-4 h-4 text-[#81D7B4]" /> My Active Challenges
                  </h3>
                  <div className="space-y-2">
                    {acceptedChallenges.map((c, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#81D7B4]/5 border border-[#81D7B4]/15 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{c.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">{c.duration} &middot; {c.difficulty}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#81D7B4] uppercase tracking-wider">Active</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Share Score Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl z-10 w-full max-w-sm border border-gray-100 relative"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiOutlineXCircle className="w-6 h-6" />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-[#81D7B4]/20 flex items-center justify-center mb-4 text-[#81D7B4] mx-auto">
                <HiOutlineCheckCircle className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-black text-center text-gray-900 mb-2">Score Copied!</h3>
              <p className="text-gray-500 text-sm text-center mb-6 font-medium">
                The link to your interactive scorecard has been copied to your clipboard. Anyone with the link can view your score.
              </p>
              
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between mb-6">
                <span className="text-xs text-gray-500 truncate mr-2 w-full select-all focus:outline-none bg-transparent">
                  {shareUrl}
                </span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                  className="shrink-0 text-[#81D7B4] hover:text-[#2D5A4A]"
                >
                  <HiOutlineLink className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${getScore()}/${currentQuiz?.questions.length} on the "${currentQuiz?.title}" quiz on @BitsaveProtocol! Check out my score: `)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-black text-white font-bold rounded-xl text-sm transition-all shadow-[0_4px_10px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Share on X
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
