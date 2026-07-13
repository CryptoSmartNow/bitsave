'use client';

import { Shield01Icon, Layout01Icon, LockIcon, ArrowUpRight01Icon } from "hugeicons-react";
import { motion } from 'framer-motion'

export default function Features() {
  const featureItems = [
    {
      title: "Secure Savings",
      description: "Bitsave provides goal-based savings plans with non-custodial smart contracts. You own your funds, withdrawals are automated.",
      detail: "Stable & Secure",
      icon: <Shield01Icon className="w-10 h-10" />,
    },
    {
      title: "Simplicity First",
      description: "Experience a clean and intuitive savings experience. Saving on-chain has never been easier than saving in your bank.",
      detail: "No DeFi Jargon",
      icon: <Layout01Icon className="w-10 h-10" />,
    },
    {
      title: "Total Control",
      description: "Peace of mind with a non-custodial savings model. Unique 'Parent-child' contracts ensure full isolation and security.",
      detail: "Full Ownership",
      icon: <LockIcon className="w-10 h-10" />,
    }
  ];

  return (
    <section id="features" className="section-lazy py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="container mx-auto max-w-[1440px] relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Left Column - Sticky Header */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32 lg:pr-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <span className="w-12 h-[2px] bg-[#2D5A4A]"></span>
                <span className="text-sm font-bold text-[#2D5A4A] tracking-widest uppercase font-display">Core Features</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6"
              >
                Built for Growth & <span className="text-[#5fb392]">Peace of Mind</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-md font-medium"
              >
                Experience the perfect balance of security and simplicity. Our non-custodial smart contracts ensure your assets remain entirely in your control while you grow your wealth.
              </motion.p>
            </div>
          </div>

          {/* Right Column - Stacked Horizontal Feature Rows */}
          <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:border-[#81D7B4]/40 hover:bg-white hover:shadow-[0_20px_40px_rgba(129,215,180,0.12)] transition-all duration-500 hover:-translate-y-1 flex flex-col sm:flex-row gap-8 lg:gap-10 items-start overflow-hidden"
              >
                {/* Hover Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#5fb392] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="w-20 h-20 shrink-0 rounded-[1.25rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-[#5fb392] group-hover:text-white transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3">
                  <div className="[&>svg]:stroke-[1.5] [&>svg]:w-10 [&>svg]:h-10">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow">
                  <h3 className="font-display text-2xl lg:text-3xl font-extrabold text-gray-900 group-hover:text-[#2D5A4A] transition-colors duration-300 mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-gray-500 text-[17px] leading-relaxed mb-8 font-medium">
                    {feature.description}
                  </p>

                  {/* Detail Pill */}
                  <div className="mt-auto flex items-center justify-between border-t border-gray-200/60 pt-6">
                    <span className="font-display text-sm font-bold text-gray-900 uppercase tracking-widest">
                      {feature.detail}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#81D7B4]/10 flex items-center justify-center group-hover:bg-[#5fb392] transition-colors duration-300">
                      <ArrowUpRight01Icon className="w-5 h-5 text-[#5fb392] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}