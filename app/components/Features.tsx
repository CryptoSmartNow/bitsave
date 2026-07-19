'use client';

import { Shield01Icon, Layout01Icon, LockIcon, ArrowUpRight01Icon } from "hugeicons-react";
import { motion } from 'framer-motion'

export default function Features() {
  const featureItems = [
    {
      title: "Secure Savings",
      description: "Bitsave provides goal-based savings plans with non-custodial smart contracts. You own your funds, and withdrawals are completely automated.",
      detail: "Stable & Secure",
      icon: <Shield01Icon className="w-8 h-8" />,
      number: "01"
    },
    {
      title: "Simplicity First",
      description: "Experience a clean and intuitive savings experience. Saving on-chain has never been easier than saving in your traditional bank.",
      detail: "No DeFi Jargon",
      icon: <Layout01Icon className="w-8 h-8" />,
      number: "02"
    },
    {
      title: "Total Control",
      description: "Peace of mind with a non-custodial savings model. Unique 'Parent-child' contracts ensure full isolation and security.",
      detail: "Full Ownership",
      icon: <LockIcon className="w-8 h-8" />,
      number: "03"
    }
  ];

  return (
    <section id="features" className="py-24 md:py-32 lg:py-40 px-4 md:px-8 bg-white relative overflow-hidden">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[#f8fafc]"></div>
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.6 }}></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-28 relative flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-[#5fb392] text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-sm"
          >
            Core Features
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-instrument text-5xl md:text-6xl lg:text-8xl tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Built for Growth & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4] drop-shadow-sm">Peace of Mind</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl"
          >
            Experience the perfect balance of security and simplicity. Our non-custodial smart contracts ensure your assets remain entirely in your control while you grow your wealth.
          </motion.p>
        </div>

        {/* Asymmetrical Bento Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Tall Card on the Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", stiffness: 40 }}
            className="lg:row-span-2 group bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[3rem] p-10 md:p-14 hover:bg-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-[#81D7B4]/40 transition-all duration-500 relative overflow-hidden flex flex-col"
          >
            {/* Watermark Number */}
            <div className="absolute -bottom-10 -right-6 text-[14rem] font-instrument font-bold text-slate-100 pointer-events-none select-none z-0 group-hover:scale-110 transition-transform duration-700">
              {featureItems[0].number}
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-12 text-[#5fb392] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#81D7B4]/10 group-hover:border-[#81D7B4]/20 shadow-sm">
                <div className="[&>svg]:stroke-[1.5]">
                  {featureItems[0].icon}
                </div>
              </div>

              <h3 className="font-instrument text-4xl lg:text-5xl text-slate-900 mb-6">
                {featureItems[0].title}
              </h3>

              <p className="text-slate-500 text-xl leading-relaxed font-light mb-16">
                {featureItems[0].description}
              </p>

              {/* Detail Link */}
              <div className="mt-auto flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest group-hover:text-[#5fb392] transition-colors cursor-pointer w-max">
                {featureItems[0].detail}
                <ArrowUpRight01Icon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </motion.div>

          {/* Cards 2 & 3: Wide Cards on the Right */}
          {featureItems.slice(1).map((feature, index) => (
            <motion.div
              key={index + 1}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.15, type: "spring", stiffness: 40 }}
              className="lg:col-span-2 group bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[3rem] p-10 md:p-12 hover:bg-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-[#81D7B4]/40 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center"
            >
              {/* Watermark Number */}
              <div className="absolute top-1/2 -translate-y-1/2 right-4 text-[12rem] font-instrument font-bold text-slate-100 pointer-events-none select-none z-0 group-hover:scale-105 transition-transform duration-700">
                {feature.number}
              </div>

              <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-[#5fb392] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#81D7B4]/10 group-hover:border-[#81D7B4]/20 shadow-sm relative z-10">
                <div className="[&>svg]:stroke-[1.5]">
                  {feature.icon}
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="font-instrument text-3xl lg:text-4xl text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed font-light mb-8 max-w-xl">
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-widest group-hover:text-[#5fb392] transition-colors cursor-pointer w-max">
                  {feature.detail}
                  <ArrowUpRight01Icon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}