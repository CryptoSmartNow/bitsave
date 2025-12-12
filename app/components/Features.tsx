'use client'

import { Shield, Layout, Lock, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Features() {
  const featureItems = [
    {
      title: "Designed for Secure Savings",
      description: "Bitsave provides goal-based savings plans with non-custodial smart contracts. You own your funds, withdrawals are automated.",
      detail: "Stable & Secure",
      icon: <Shield className="w-8 h-8 text-[#81D7B4]" />,
    },
    {
      title: "Designed for Simplicity",
      description: "Experience a clean and intuitive savings experience. Saving on-chain has never been easier than saving in your bank.",
      detail: "No DeFi Jargon",
      icon: <Layout className="w-8 h-8 text-[#81D7B4]" />,
    },
    {
      title: "Security & Control",
      description: "Peace of mind with a non-custodial savings model. Unique 'Parent-child' contracts ensure full isolation and security.",
      detail: "Full Ownership",
      icon: <Lock className="w-8 h-8 text-[#81D7B4]" />,
    }
  ];

  return (
    <section id="features" className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-white">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.3]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Core Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
          >
            Built for Growth & <span className="text-[#81D7B4]">Peace of Mind</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Everything you need for successful crypto savings, wrapped in a simple, secure interface.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featureItems.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-[#81D7B4]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-[#81D7B4]/5 hover:-translate-y-1"
            >
              {/* Icon Container */}
              <div className="mb-8 relative">
                <div className="w-16 h-16 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center group-hover:bg-[#81D7B4] transition-colors duration-300">
                  <div className="text-[#81D7B4] group-hover:text-white transition-colors duration-300 [&>svg]:text-current">
                    {feature.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#81D7B4] transition-colors">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed min-h-[80px]">
                  {feature.description}
                </p>

                {/* Detail Pill */}
                <div className="pt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm font-medium text-gray-600 group-hover:bg-[#81D7B4]/10 group-hover:text-[#81D7B4] group-hover:border-[#81D7B4]/20 transition-all">
                    {feature.detail}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
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