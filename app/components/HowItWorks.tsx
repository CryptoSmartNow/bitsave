'use client';

import { Wallet01Icon, Coins01Icon, Plant01Icon, ArrowRight01Icon } from "hugeicons-react";
import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  const steps = [
    {
      number: "01",
      title: "Connect Wallet",
      description: "Connect your preferred Web3 wallet securely. We support Rabby, MetaMask, WalletConnect, and all major providers for seamless access.",
      Icon: Wallet01Icon
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Deposit stablecoins directly into your savings dashboard. We support a select few stablecoins for now to ensure maximum security and stability.",
      Icon: Coins01Icon
    },
    {
      number: "03",
      title: "Create Your Savings",
      description: "Set your financial goals and start earning instantly. Create custom savings pools for rent, tuition, or emergencies with flexible lock-up periods.",
      Icon: Plant01Icon
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="section-lazy py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6"
          >
            How it works
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: '100px' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1.5 bg-gradient-to-r from-[#81D7B4] to-[#5fb392] rounded-full"
          />
        </div>

        {/* Steps Grid / Carousel on Mobile */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 lg:gap-12 relative md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group p-8 sm:p-10 rounded-[2.5rem] bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-[#81D7B4]/10 transition-all duration-500 snap-center shrink-0 min-w-[280px] max-w-[320px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none flex flex-col items-center text-center"
            >
              {/* Step Number Badge */}
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#81D7B4]/10 text-[#5fb392] text-xs font-bold tracking-widest uppercase mb-8 font-display group-hover:scale-105 transition-transform duration-300">
                Step {step.number}
              </div>

              {/* Icon Container */}
              <div className="w-20 h-20 rounded-full bg-white border border-gray-100 flex items-center justify-center mb-8 shadow-sm group-hover:bg-gradient-to-br group-hover:from-[#81D7B4] group-hover:to-[#5fb392] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#81D7B4]/25 transition-all duration-500">
                <step.Icon className="w-10 h-10 text-gray-400 group-hover:text-white transition-colors duration-500 stroke-[1.5]" />
              </div>

              {/* Content */}
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#5fb392] transition-colors duration-300">
                {step.title}
              </h3>

              <p className="text-gray-500 text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 flex justify-center"
        >
          <Link
            href="/dashboard/create-savings"
            className="group inline-flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-[#5fb392] transition-colors font-display"
          >
            Start Saving Now
            <span className="p-2.5 rounded-full bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-[#81D7B4] group-hover:to-[#5fb392] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#81D7B4]/25 transition-all duration-300 group-hover:scale-110">
              <ArrowRight01Icon className="w-5 h-5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}