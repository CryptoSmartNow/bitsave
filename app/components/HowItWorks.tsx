'use client'

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Info, HandCoins, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Compatible with Rabby wallet, MetaMask, WalletConnect, and other popular wallets.",
      icon: <Wallet className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Deposit any stable coin like USDC into your connected wallet. We support a select few stable coins for now.",
      icon: <HandCoins className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Create Your Savings",
      description: "With just a few clicks; choose your assets, set your savings goals, and save for your rent, school fees, etc.",
      icon: <Info className="w-6 h-6" />
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-gray-50/50">
      <div className="container mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#81D7B4]"></div>
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Simple Process</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
          >
            How Bitsave Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Start your crypto savings journey in three simple steps. No complexity, just savings.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              {/* Step Number Badge */}
              <div className="w-24 h-24 mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg flex items-center justify-center mb-8 relative z-10 group-hover:scale-105 transition-transform duration-300 group-hover:border-[#81D7B4]/30 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="text-center">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Step</span>
                  <span className="block text-2xl font-bold text-[#81D7B4]">{step.number}</span>
                </div>
                {/* Icon Bubble */}
                <div className="absolute -bottom-4 -right-4 w-10 h-10 rounded-full bg-[#81D7B4] text-white flex items-center justify-center shadow-md">
                  {step.icon}
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300 min-h-[220px] flex flex-col items-center text-center group-hover:-translate-y-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Mobile Connector */}
              {index < steps.length - 1 && (
                <div className="md:hidden w-0.5 h-12 bg-gray-200 mx-auto my-4" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#81D7B4] text-white font-bold rounded-2xl hover:bg-[#6BC5A0] transition-colors shadow-lg hover:shadow-xl hover:shadow-[#81D7B4]/20 hover:-translate-y-0.5">
            Start Saving Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

      </div>
    </section>
  );
}