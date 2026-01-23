'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiMail } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';

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
    <section id="faq" className="py-16 md:py-24 lg:py-32 px-4 md:px-8 relative bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
            <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">Support</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
          >
            Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#5fb392]">Questions</span>
          </motion.h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-100 last:border-0"
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full py-8 flex items-start justify-between text-left group"
              >
                <div className="flex gap-6 md:gap-8">
                  <span className={`text-xl md:text-2xl font-bold transition-colors duration-300 ${openId === item.id ? 'text-[#81D7B4]' : 'text-gray-300 group-hover:text-gray-400'}`}>
                    {item.id}
                  </span>
                  <h3 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${openId === item.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
                    {item.question}
                  </h3>
                </div>
                <div className={`mt-1 ml-4 p-2 rounded-full transition-colors duration-300 ${openId === item.id ? 'bg-[#81D7B4] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                  {openId === item.id ? <FiMinus className="w-6 h-6" /> : <FiPlus className="w-6 h-6" />}
                </div>
              </button>

              <AnimatePresence>
                {openId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-[calc(2.5rem+1.5rem)] md:pl-[calc(3rem+2rem)] pb-8 pr-4 md:pr-16">
                      <p className="text-lg text-gray-500 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-24 pt-16 border-t border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
              <p className="text-gray-500 text-base">We're here to help you with your savings journey.</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={handleEmailClick}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-full hover:border-[#81D7B4] hover:text-[#81D7B4] transition-colors font-medium shadow-sm hover:shadow-md cursor-pointer"
              >
                <FiMail className="w-5 h-5" />
                <span>Email Support</span>
              </button>
              
              <a 
                href="https://t.me/+YimKRR7wAkVmZGRk" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-[#81D7B4] text-white rounded-full hover:bg-[#6bcb9f] transition-colors font-medium shadow-lg shadow-[#81D7B4]/20"
              >
                <FaTelegramPlane className="w-5 h-5" />
                <span>Join Telegram</span>
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
