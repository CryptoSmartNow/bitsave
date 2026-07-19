'use client';

import { Wallet01Icon, Coins01Icon, Plant01Icon, ArrowRight01Icon } from "hugeicons-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your preferred Web3 wallet securely. We support all major providers for seamless access to your dashboard.",
      Icon: Wallet01Icon,
      rotation: "-rotate-6 md:-translate-x-16 lg:-translate-x-24",
      scale: "scale-95 md:scale-90",
      zIndex: "z-0",
      glow: "shadow-[0_0_30px_rgba(255,255,255,0.02)]",
      border: "border-slate-700/50"
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Deposit stablecoins directly into your savings dashboard. We ensure maximum security and stability for your funds.",
      Icon: Coins01Icon,
      rotation: "rotate-0",
      scale: "scale-100 md:scale-105",
      zIndex: "z-10",
      glow: "shadow-[0_0_60px_rgba(129,215,180,0.2)]",
      border: "border-[#81D7B4]/60" // Highlighted center card
    },
    {
      number: "03",
      title: "Create Your Savings",
      description: "Set your financial goals and start earning instantly. Create custom pools with flexible lock-up periods.",
      Icon: Plant01Icon,
      rotation: "rotate-6 md:translate-x-16 lg:translate-x-24",
      scale: "scale-95 md:scale-90",
      zIndex: "z-0",
      glow: "shadow-[0_0_30px_rgba(255,255,255,0.02)]",
      border: "border-slate-700/50"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 bg-[#050B14] relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#81D7B4]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center">

        {/* Section Header */}
        <div className="mb-16 md:mb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[#81D7B4] text-xs font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md"
          >
            Workflow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent"
          >
            How it Works
          </motion.h2>
        </div>

        {/* Fanned Cards Layout */}
        <div className="flex flex-col md:flex-row justify-center items-center w-full max-w-6xl relative gap-8 md:gap-0 mt-4">
          
          {/* Decorative Flow Lines Behind Cards */}
          <div className="absolute inset-0 pointer-events-none hidden md:flex justify-center items-center z-0">
            <svg width="100%" height="200" viewBox="0 0 1000 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
              <path d="M50 100 C 300 150, 700 50, 950 100" stroke="url(#flow-gradient-1)" strokeWidth="3" strokeDasharray="8 8" />
              <path d="M50 100 C 300 50, 700 150, 950 100" stroke="url(#flow-gradient-2)" strokeWidth="1.5" />
              <defs>
                <linearGradient id="flow-gradient-1" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#81D7B4" stopOpacity="0"/>
                  <stop offset="0.5" stopColor="#81D7B4"/>
                  <stop offset="1" stopColor="#81D7B4" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="flow-gradient-2" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6BC5A0" stopOpacity="0"/>
                  <stop offset="0.5" stopColor="#6BC5A0" stopOpacity="0.5"/>
                  <stop offset="1" stopColor="#6BC5A0" stopOpacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.2, type: "spring", stiffness: 40 }}
                className={`group relative w-full max-w-[380px] lg:max-w-[420px] flex-shrink-0 rounded-[2.5rem] p-10 lg:p-12 flex flex-col items-center text-center backdrop-blur-2xl bg-gradient-to-b from-white/[0.06] to-transparent ${step.border} border transition-all duration-500 hover:scale-[1.08] hover:z-20 ${step.rotation} ${step.scale} ${step.zIndex} ${step.glow} overflow-hidden`}
              >
                {/* Massive Watermark Number */}
                <div className="absolute top-0 right-4 text-[8rem] md:text-[10rem] lg:text-[12rem] font-instrument font-bold text-white/[0.05] leading-none select-none z-0 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  {step.number}
                </div>

                {/* Content wrapper to float above watermark */}
                <div className="relative z-10 flex flex-col items-center w-full">
                  
                  {/* Icon */}
                  <div className="mb-10 text-[#81D7B4] p-6 rounded-3xl bg-gradient-to-b from-[#81D7B4]/20 to-transparent border border-[#81D7B4]/20 shadow-inner">
                    <step.Icon className="w-12 h-12 stroke-[1.5]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-instrument text-4xl lg:text-5xl text-white mb-4 tracking-tight drop-shadow-md">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-300 text-base lg:text-lg leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-20 md:mt-28 relative z-20"
        >
          <Link
            href="/dashboard/create-savings"
            className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#81D7B4] to-[#5fb392] rounded-xl text-[#050B14] font-display text-lg font-bold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(129,215,180,0.25)] hover:shadow-[0_0_40px_rgba(129,215,180,0.4)]"
          >
            <span>Start Saving Now</span>
            <ArrowRight01Icon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}