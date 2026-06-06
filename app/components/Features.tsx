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
        <div className="mb-24 md:mb-32">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
            <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">Core Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-4xl"
          >
            Built for Growth & <span className="text-gradient-animated">Peace of Mind</span>
          </motion.h2>
        </div>

        {/* Grid / Carousel on Mobile */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:pb-0 lg:mx-0 lg:px-0 lg:overflow-visible lg:snap-none">
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-[#81D7B4]/40 hover:shadow-2xl hover:shadow-[#81D7B4]/10 transition-all duration-500 hover:-translate-y-2 snap-center shrink-0 min-w-[280px] max-w-[340px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-[#81D7B4]/0 to-[#5fb392]/0 group-hover:from-[#81D7B4]/3 group-hover:to-[#5fb392]/5 transition-all duration-500 pointer-events-none" />
              
              {/* Icon Container */}
              <div className="mb-8 relative">
                <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#81D7B4] group-hover:to-[#5fb392] group-hover:scale-110 group-hover:rounded-full group-hover:shadow-lg group-hover:shadow-[#81D7B4]/25 transition-all duration-500">
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-500 [&>svg]:stroke-[1.5] [&>svg]:w-10 [&>svg]:h-10">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4 relative">
                <h3 className="font-display text-2xl font-bold text-gray-900 group-hover:text-[#5fb392] transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Detail Pill */}
                <div className="pt-6 border-t border-gray-200/60 mt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300 font-display">
                    {feature.detail}
                    <ArrowUpRight01Icon className="w-5 h-5 text-[#81D7B4] group-hover:rotate-45 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}