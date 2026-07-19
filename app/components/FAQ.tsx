'use client';

import { PlusSignIcon, MinusSignIcon, Mail01Icon, TelegramIcon } from "hugeicons-react";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '01',
    question: "What fees do I pay to use BitSave?",
    answer: "You pay a $1 fee per savings plan, split evenly between the CryptoSmart wallet (for operational costs) and the Buy Back Wallet (for $BTS buybacks)."
  },
  {
    id: '02',
    question: "Can I create multiple savings plans?",
    answer: "Yes, users can create multiple savings plans, each with its own principal, lock period, and penalty settings (10%–30%)."
  },
  {
    id: '03',
    question: "What is the penalty for breaking a savings plan?",
    answer: "You set the penalty (10%–30% of your savings) when creating the plan. If you break it early, this penalty is deducted and sent to the CryptoSmart wallet."
  }
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('01');

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = 'support';
    const domain = 'bitsave.io';
    window.location.href = `mailto:${user}@${domain}`;
  };

  return (
    <section id="faq" className="section-lazy py-24 md:py-32 lg:py-40 px-4 md:px-8 bg-[#f8fafc] relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Sticky Header & Contact */}
          <div className="lg:w-5/12 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-[0.25em] mb-8 shadow-sm"
            >
              Support & FAQ
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-instrument text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6"
            >
              Common <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4] drop-shadow-sm">Questions</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-md"
            >
              Everything you need to know about decentralized savings, security, and how to maximize your growth on Bitsave.
            </motion.p>

            {/* Contact Support Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-[2rem] bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm"
            >
              <h3 className="font-instrument text-2xl font-bold mb-2 text-slate-900">Still have questions?</h3>
              <p className="text-slate-500 text-base mb-8">We're here to help you with your decentralized savings journey.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleEmailClick}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-bold text-sm shadow-sm group"
                >
                  <Mail01Icon className="w-5 h-5 text-slate-400 group-hover:text-[#5fb392] transition-colors" />
                  <span>Email Support</span>
                </button>
                
                <a 
                  href="https://t.me/+YimKRR7wAkVmZGRk" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-[#81D7B4] to-[#5fb392] text-white rounded-2xl hover:shadow-lg transition-all font-bold text-sm group"
                >
                  <TelegramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Join Telegram</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Accordion Items */}
          <div className="lg:w-7/12 w-full space-y-4">
            {faqData.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 40 }}
                  className={`bg-white/70 backdrop-blur-xl border rounded-[2rem] overflow-hidden transition-all duration-500 ${
                    isOpen 
                    ? 'border-[#81D7B4]/50 shadow-[0_15px_40px_rgba(129,215,180,0.1)]' 
                    : 'border-slate-200 hover:border-[#81D7B4]/30 hover:shadow-md'
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                    className="w-full p-6 md:p-8 flex items-start md:items-center justify-between text-left group gap-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1">
                      <span className={`text-xl font-instrument font-bold transition-colors duration-500 ${isOpen ? 'text-[#5fb392]' : 'text-slate-300 group-hover:text-[#5fb392]'}`}>
                        {item.id}
                      </span>
                      <h3 className={`font-instrument text-2xl lg:text-3xl font-bold transition-colors duration-500 ${isOpen ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-500 mt-1 md:mt-0 ${
                      isOpen 
                      ? 'bg-[#81D7B4]/10 border-[#81D7B4]/20 text-[#5fb392] rotate-180' 
                      : 'bg-white border-slate-100 text-slate-400 group-hover:bg-slate-50 group-hover:border-slate-200 group-hover:text-slate-600 rotate-0 shadow-sm'
                    }`}>
                      {isOpen ? <MinusSignIcon className="w-6 h-6" /> : <PlusSignIcon className="w-6 h-6" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-8 pt-2 md:pl-[calc(2rem+48px)]">
                          <p className="text-lg text-slate-500 leading-relaxed font-medium">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
