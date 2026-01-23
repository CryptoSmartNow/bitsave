'use client'

import { Shield, Layout, Lock, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Features() {
  const featureItems = [
    {
      title: "Secure Savings",
      description: "Bitsave provides goal-based savings plans with non-custodial smart contracts. You own your funds, withdrawals are automated.",
      detail: "Stable & Secure",
      icon: <Shield className="w-10 h-10" />,
    },
    {
      title: "Simplicity First",
      description: "Experience a clean and intuitive savings experience. Saving on-chain has never been easier than saving in your bank.",
      detail: "No DeFi Jargon",
      icon: <Layout className="w-10 h-10" />,
    },
    {
      title: "Total Control",
      description: "Peace of mind with a non-custodial savings model. Unique 'Parent-child' contracts ensure full isolation and security.",
      detail: "Full Ownership",
      icon: <Lock className="w-10 h-10" />,
    }
  ];

  return (
    <section id="features" className="py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.2]" />

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
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight max-w-4xl"
          >
            Built for Growth & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#5fb392]">Peace of Mind</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-[#81D7B4]/50 hover:shadow-2xl hover:shadow-[#81D7B4]/10 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Icon Container */}
              <div className="mb-8 relative">
                <div className="w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:bg-[#81D7B4] group-hover:scale-110 transition-all duration-500">
                  <div className="text-gray-400 group-hover:text-white transition-colors duration-500 [&>svg]:stroke-[1.5] [&>svg]:w-10 [&>svg]:h-10">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#81D7B4] transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-500 text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Detail Pill */}
                <div className="pt-6 border-t border-gray-200/60 mt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                    {feature.detail}
                    <ArrowUpRight className="w-5 h-5 text-[#81D7B4]" />
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