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
    <section id="how-it-works" ref={sectionRef} className="section-lazy py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[#81D7B4]/4 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="mb-24 md:mb-32">
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
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-12 lg:gap-24 relative md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
          {/* Connecting Line (desktop only) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[20%] right-[20%] h-[1px]">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="w-full h-full bg-gradient-to-r from-[#81D7B4]/30 via-[#81D7B4]/60 to-[#81D7B4]/30 origin-left"
              style={{ transformOrigin: 'left center' }}
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group pl-4 snap-center shrink-0 min-w-[280px] max-w-[320px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none"
            >
              {/* Step Number - Gradient Text */}
              <div className="text-[120px] leading-none font-extrabold absolute -top-16 -left-2 select-none -z-10 font-display text-gradient opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                {step.number}
              </div>

              {/* Icon & Content */}
              <div className="flex flex-col gap-6 pt-8">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-[#81D7B4] transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-[#81D7B4]/20 group-hover:scale-105 group-hover:rotate-3">
                  <step.Icon className="w-8 h-8 text-[#81D7B4] group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="font-display text-xl md:text-2xl font-bold text-gray-900">
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
            className="group inline-flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-[#5fb392] transition-colors font-display"
          >
            Start Saving Now
            <span className="p-2.5 rounded-full bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-[#81D7B4] group-hover:to-[#5fb392] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#81D7B4]/25 transition-all duration-300 group-hover:scale-110">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}