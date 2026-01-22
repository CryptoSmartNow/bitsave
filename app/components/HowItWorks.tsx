'use client'

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { WalletCards, Coins, Sprout, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your preferred Web3 wallet securely. We support Rabby, MetaMask, WalletConnect, and all major providers for seamless access.",
      Icon: WalletCards
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Deposit stablecoins directly into your savings dashboard. We support a select few stablecoins for now to ensure maximum security and stability.",
      Icon: Coins
    },
    {
      number: "03",
      title: "Create Your Savings",
      description: "Set your financial goals and start earning instantly. Create custom savings pools for rent, tuition, or emergencies with flexible lock-up periods.",
      Icon: Sprout
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="mb-24 md:mb-32">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6"
          >
            How it works
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: '100px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-2 bg-[#81D7B4]"
          />
        </div>

        {/* Steps Grid - Flushed Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group pl-4"
            >
              {/* Step Number - Large & Subtle */}
              <div className="text-[120px] leading-none font-bold text-gray-100 opacity-80 absolute -top-16 -left-2 select-none -z-10 transition-colors group-hover:text-[#81D7B4]/20">
                {step.number}
              </div>

              {/* Icon & Content */}
              <div className="flex flex-col gap-6 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#81D7B4] transition-colors duration-300 shadow-sm">
                  <step.Icon className="w-8 h-8 text-[#81D7B4] group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {step.title}
                </h3>
                
                <p className="text-gray-500 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-24"
        >
          <Link 
            href="/dashboard/create-savings"
            className="group inline-flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-[#81D7B4] transition-colors"
          >
            Start Saving Now
            <span className="p-2 rounded-full bg-gray-100 group-hover:bg-[#81D7B4] group-hover:text-white transition-all duration-300">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}