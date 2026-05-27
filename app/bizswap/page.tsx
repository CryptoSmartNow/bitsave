"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HiOutlineArrowRight,
  HiOutlineCurrencyDollar,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
  HiOutlineArrowsRightLeft,
  HiOutlineBuildingLibrary,
  HiOutlineCheckBadge,
  HiOutlineWallet
} from 'react-icons/hi2';

export default function BizSwapLandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0F1825] text-[#F9F9FB] font-sans overflow-x-hidden selection:bg-[#81D7B4] selection:text-[#0F1825]">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#81D7B4] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#3A4F73] opacity-[0.05] blur-[100px]" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[60%] h-[20%] rounded-full bg-[#81D7B4] opacity-[0.02] blur-[150px]" />
      </div>

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#7B8B9A]/10 bg-[#0F1825]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/bizswap" className="flex items-center gap-3 group">
            <Image src="/bitsavelogo.png" alt="BizMarket" width={120} height={38} className="object-contain transition-opacity group-hover:opacity-80" priority />
            <span className="text-[#7B8B9A] font-light text-lg">/</span>
            <span className="text-[#F9F9FB] font-bold tracking-widest text-sm uppercase">BizSwap</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">About</a>
            <a href="#instruments" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Instruments</a>
            <a href="#how-it-works" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">How it Works</a>
            <a href="#why" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Why Us</a>
          </div>
          <Link href="/bizswap/app" className="group relative inline-flex items-center justify-center px-6 py-2.5 font-bold text-[#0F1825] bg-[#81D7B4] rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(129,215,180,0.3)]">
            <span className="relative flex items-center gap-2">
              Launch App <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10">
        {/* SECTION 1 - HERO */}
        <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
          <div className="max-w-4xl mx-auto text-center">

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
              Your RWA <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC4A0]">Yield Aggregator</span>
            </motion.h1>
            <motion.p initial="hidden" animate="visible" variants={fadeUp} className="text-[#9BA8B5] text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Earn yield in stablecoins from real world businesses, private credit, and government treasuries, weekly, monthly or quarterly payouts directly to your wallet.
            </motion.p>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/bizswap/app" className="w-full sm:w-auto px-8 py-4 bg-[#81D7B4] hover:bg-[#6BC4A0] text-[#0F1825] font-black rounded-xl text-lg transition-all shadow-[0_0_30px_rgba(129,215,180,0.2)] hover:shadow-[0_0_40px_rgba(129,215,180,0.4)] hover:-translate-y-1">
                Earn Now
              </Link>
              <a href="#about" className="w-full sm:w-auto px-8 py-4 bg-[#1A2538] hover:bg-[#2C3E5D] text-[#F9F9FB] border border-[#2C3E5D] hover:border-[#3A4F73] font-bold rounded-xl text-lg transition-all">
                Learn More
              </a>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2 - WHAT IS BIZSWAP */}
        <section id="about" className="py-24 border-y border-[#7B8B9A]/10 bg-[#0A0F17]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <h2 className="text-4xl md:text-5xl font-black mb-6">Never run out of yield.</h2>
                <p className="text-[#9BA8B5] text-lg leading-relaxed mb-8">
                  BizSwap is the decentralized exchange (DEX) for swapping your stablecoins into BizShares. It provides seamless access to high-quality Real World Assets (RWAs) with transparent, predictable yield schedules.
                </p>
                <div className="flex items-center gap-4 text-[#F9F9FB]">
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckBadge className="w-6 h-6 text-[#81D7B4]" />
                    <span className="font-bold">100% On-Chain</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiOutlineCheckBadge className="w-6 h-6 text-[#81D7B4]" />
                    <span className="font-bold">Stablecoin Payouts</span>
                  </div>
                </div>
              </motion.div>

              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#81D7B4]/20 to-transparent blur-3xl rounded-full" />
                <div className="relative bg-[#1A2538] border border-[#2C3E5D] rounded-3xl p-8 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-[#2C3E5D] pb-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2C3E5D] rounded-full flex items-center justify-center">
                        <HiOutlineCurrencyDollar className="w-6 h-6 text-[#81D7B4]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#9BA8B5]">You supply</p>
                        <p className="font-bold text-xl">1,000 USDC</p>
                      </div>
                    </div>
                    <HiOutlineArrowsRightLeft className="w-6 h-6 text-[#7B8B9A]" />
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm text-[#9BA8B5]">You receive</p>
                        <p className="font-bold text-xl text-[#81D7B4]">BizBond</p>
                      </div>
                      <div className="w-12 h-12 bg-[#81D7B4]/10 border border-[#81D7B4]/30 rounded-full flex items-center justify-center">
                        <HiOutlineShieldCheck className="w-6 h-6 text-[#81D7B4]" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0F1825] rounded-xl p-6">
                    <p className="text-center font-bold text-lg mb-2">Yield Generated</p>
                    <p className="text-center text-3xl font-black text-[#81D7B4]">+ 10% Annually</p>
                    <p className="text-center text-sm text-[#7B8B9A] mt-2">Paid directly to your wallet every quarter</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - WHAT ARE BIZSHARES */}
        <section id="instruments" className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6">What are BizShares?</h2>
              <p className="text-[#9BA8B5] text-lg max-w-3xl mx-auto">
                BizShares are digital certificates representing ownership in Real World Assets. They are backed by real-world revenue from businesses, private credit pools, and government treasury bills.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-6"
            >
              {/* BizYield */}
              <motion.div variants={fadeUp} className="group bg-[#1A2538] border border-[#2C3E5D] hover:border-[#81D7B4]/50 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(129,215,180,0.15)]">
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-14 h-14 bg-[#FF6B6B]/10 rounded-2xl flex items-center justify-center">
                    <HiOutlineChartBar className="w-7 h-7 text-[#FF6B6B]" />
                  </div>
                  <span className="px-3 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] text-xs font-black tracking-widest uppercase rounded-full">High Risk</span>
                </div>
                <h3 className="text-2xl font-black mb-2">BizYield</h3>
                <p className="text-[#9BA8B5] text-sm mb-6 h-10">Backed by real business revenue sharing agreements.</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Payouts</span>
                    <span className="font-bold text-[#F9F9FB]">Monthly</span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Return</span>
                    <span className="font-bold text-[#F9F9FB]">Variable APR</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-[#7B8B9A]">Min. Buy-in</span>
                    <span className="font-bold text-[#81D7B4]">$10.00</span>
                  </li>
                </ul>
              </motion.div>

              {/* BizCredit */}
              <motion.div variants={fadeUp} className="group bg-[#1A2538] border border-[#2C3E5D] hover:border-[#81D7B4]/50 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(129,215,180,0.15)] relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-14 h-14 bg-[#F5A623]/10 rounded-2xl flex items-center justify-center">
                    <HiOutlineCurrencyDollar className="w-7 h-7 text-[#F5A623]" />
                  </div>
                  <span className="px-3 py-1 bg-[#F5A623]/10 text-[#F5A623] text-xs font-black tracking-widest uppercase rounded-full">Mid Risk</span>
                </div>
                <h3 className="text-2xl font-black mb-2">BizCredit</h3>
                <p className="text-[#9BA8B5] text-sm mb-6 h-10">Backed by BizMarket's vetted SME credit pools.</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Payouts</span>
                    <span className="font-bold text-[#F9F9FB]">Weekly</span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Return</span>
                    <span className="font-bold text-[#F9F9FB]">4% Quarterly</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-[#7B8B9A]">Min. Buy-in</span>
                    <span className="font-bold text-[#81D7B4]">$100.00</span>
                  </li>
                </ul>
              </motion.div>

              {/* BizBond */}
              <motion.div variants={fadeUp} className="group bg-[#1A2538] border border-[#2C3E5D] hover:border-[#81D7B4]/50 rounded-3xl p-8 transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(129,215,180,0.15)]">
                <div className="mb-6 flex justify-between items-start">
                  <div className="w-14 h-14 bg-[#81D7B4]/10 rounded-2xl flex items-center justify-center">
                    <HiOutlineBuildingLibrary className="w-7 h-7 text-[#81D7B4]" />
                  </div>
                  <span className="px-3 py-1 bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-black tracking-widest uppercase rounded-full">Low Risk</span>
                </div>
                <h3 className="text-2xl font-black mb-2">BizBond</h3>
                <p className="text-[#9BA8B5] text-sm mb-6 h-10">Backed by government treasury bills & sovereign instruments.</p>

                <ul className="space-y-4 mb-8">
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Payouts</span>
                    <span className="font-bold text-[#F9F9FB]">Quarterly</span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-b border-[#2C3E5D] pb-3">
                    <span className="text-[#7B8B9A]">Return</span>
                    <span className="font-bold text-[#F9F9FB]">110% Annually</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-[#7B8B9A]">Min. Buy-in</span>
                    <span className="font-bold text-[#81D7B4]">$1,000.00</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 - HOW IT WORKS */}
        <section id="how-it-works" className="py-24 border-y border-[#7B8B9A]/10 bg-[#0A0F17]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6">How it Works</h2>
              <p className="text-[#9BA8B5] text-lg">Three simple steps to start earning real-world yield.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-[#2C3E5D] via-[#81D7B4]/30 to-[#2C3E5D]" />

              {[
                { step: '01', title: 'Connect', desc: 'Connect your wallet. Select an instrument that matches your risk appetite and investment size.', icon: HiOutlineWallet },
                { step: '02', title: 'Swap', desc: 'Swap your stablecoins directly into your chosen BizShares instrument. Your funds go to work immediately.', icon: HiOutlineArrowsRightLeft },
                { step: '03', title: 'Earn', desc: 'Receive yield payments directly to your wallet on schedule, weekly, monthly, or quarterly in stablecoins.', icon: HiOutlineCurrencyDollar }
              ].map((item, i) => (
                <div key={i} className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto bg-[#0F1825] border-2 border-[#2C3E5D] rounded-full flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    <item.icon className="w-10 h-10 text-[#81D7B4]" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                  <p className="text-[#9BA8B5] leading-relaxed px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 - WHY BIZMARKET */}
        <section id="why" className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5">
                <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Built on Transparency & Real Assets.</h2>
                <Link href="/bizswap/app" className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A2538] hover:bg-[#2C3E5D] border border-[#2C3E5D] hover:border-[#81D7B4]/50 text-[#F9F9FB] font-bold rounded-xl text-lg transition-all">
                  Start Earning Now <HiOutlineArrowRight />
                </Link>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
                {[
                  { title: 'Stablecoin Yield Only', desc: 'Every payment arrives in your chosen local stablecoin or USDC. No volatile token emissions.' },
                  { title: 'Real Assets Underneath', desc: 'Every instrument is backed by a real world yield generating activity; a business revenue, a loan book, or a government bond.' },
                  { title: 'Direct Oversight', desc: "BizMarket's private equity arm holds a stake in the business for every BizYield listing. We have access to the books." },
                  { title: 'On-Chain Ownership', desc: 'Every purchase issues a digital certificate to your wallet. Your ownership is immutable and transparent.' }
                ].map((item, i) => (
                  <div key={i} className="bg-[#0A0F17] border border-[#2C3E5D] rounded-2xl p-6">
                    <div className="w-10 h-10 bg-[#81D7B4]/10 rounded-lg flex items-center justify-center mb-4">
                      <HiOutlineCheckBadge className="w-6 h-6 text-[#81D7B4]" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-[#7B8B9A] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-32 bg-[#81D7B4] text-[#0F1825] text-center px-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Your money should be working.</h2>
          <p className="text-[#1A2538] text-xl mb-10 max-w-2xl mx-auto font-medium">
            Pick an instrument. Swap in minutes. Start earning real-world yield today.
          </p>
          <Link href="/bizswap/app" className="inline-flex px-10 py-5 bg-[#0F1825] hover:bg-[#1A2538] text-[#F9F9FB] font-black rounded-xl text-xl transition-all shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1">
            Access Swap Market
          </Link>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#2C3E5D] py-12 bg-[#0A0F17]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/bitsavelogo.png" alt="BizMarket" width={100} height={32} className="object-contain" />
            <span className="text-[#7B8B9A] font-light">|</span>
            <span className="text-[#F9F9FB] font-bold tracking-widest text-xs uppercase">BizSwap</span>
          </div>
          <p className="text-[#7B8B9A] text-sm">© 2026 BizMarket Protocol. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/bizswap/dashboard" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Dashboard</Link>
            <Link href="/bizswap/app" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Market</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
