'use client';

import React, { useEffect, useState } from 'react';
import { Activity01Icon, Dollar01Icon, Shield01Icon, BarChartIcon, Wallet01Icon, ArrowLeftRightIcon } from "hugeicons-react";
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NewsletterEmbed from '@/app/components/NewsletterEmbed';


const CARDS = [
  {
    title: "BizBond",
    subtitle: "Government Treasury",
    detail: "Monthly payouts",
    apy: "~10% APY",
    risk: "Low Risk",
    accentColor: "#81D7B4",
    cardBg: "#0D1A16",
  },
  {
    title: "BizCredit",
    subtitle: "Private Credit",
    detail: "Quarterly payouts",
    apy: "~4% Qrtly",
    risk: "Medium Risk",
    accentColor: "#F5A623",
    cardBg: "#181409",
  },
  {
    title: "BizYield",
    subtitle: "Real World Business",
    detail: "Weekly payouts",
    apy: "Variable",
    risk: "High Risk",
    accentColor: "#FF6B6B",
    cardBg: "#1A0D0D",
  },
] as const;

function ShufflingCards() {
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const getCardState = (i: number) => {
    const diff = (i - activeIndex + CARDS.length) % CARDS.length;
    if (diff === 0) return "front";
    if (diff === 1) return "mid";
    return "back";
  };

  const layerStyle: Record<string, React.CSSProperties> = {
    front: { transform: "rotateX(48deg) rotateZ(-40deg) translateZ(0px) translateX(0px) translateY(0px)", zIndex: 30, opacity: 1 },
    mid:   { transform: "rotateX(48deg) rotateZ(-40deg) translateZ(-70px) translateX(35px) translateY(35px)", zIndex: 20, opacity: 0.75 },
    back:  { transform: "rotateX(48deg) rotateZ(-40deg) translateZ(-140px) translateX(70px) translateY(70px)", zIndex: 10, opacity: 0.45 },
  };

  return (
    <div style={{ width: 400, height: 580, position: "relative" }}>
      {CARDS.map((card, i) => {
        const state = getCardState(i);
        const style = layerStyle[state];
        return (
          <div
            key={card.title}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 380,
              height: 238,
              marginTop: -119,
              marginLeft: -190,
              borderRadius: 20,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: card.cardBg,
              border: `1px solid ${card.accentColor}35`,
              boxShadow: state === "front"
                ? `0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 ${card.accentColor}20`
                : `0 16px 40px rgba(0,0,0,0.5)`,
              transition: "transform 0.85s cubic-bezier(0.77,0,0.18,1), opacity 0.85s cubic-bezier(0.77,0,0.18,1), box-shadow 0.85s ease",
              ...style,
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                backgroundColor: card.accentColor + "20",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Activity01Icon style={{ width: 20, height: 20, color: card.accentColor }} />
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#F9F9FB", lineHeight: 1 }}>{card.title}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: card.accentColor + "BB", marginTop: 4, letterSpacing: "0.04em" }}>{card.risk}</p>
              </div>
            </div>

            {/* Mid */}
            <div style={{ borderTop: `1px solid ${card.accentColor}15`, paddingTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#F9F9FB", opacity: 0.7, marginBottom: 2 }}>{card.subtitle}</p>
              <p style={{ fontSize: 11, color: "#F9F9FB", opacity: 0.35, fontWeight: 500 }}>{card.detail}</p>
            </div>

            {/* Bottom */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: card.accentColor + "88", marginBottom: 4 }}>Expected Return</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: card.accentColor, lineHeight: 1 }}>{card.apy}</p>
              </div>
              <p style={{ fontSize: 10, color: "#F9F9FB", opacity: 0.2, fontWeight: 600, letterSpacing: "0.1em", marginBottom: 2 }}>BIZSWAP</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
    <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-6 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-5xl rounded-2xl border border-[#2C3E5D]/50 bg-[#0F1825]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="px-6 h-16 flex items-center justify-between">
            <Link href="/bizswap" className="flex items-center gap-3 group">
              <span className="text-xl font-black tracking-tight text-[#81D7B4] transition-colors">BizSwap</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold">
              <a href="#about" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">About</a>
              <a href="#instruments" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">Instruments</a>
              <a href="#how-it-works" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">How it Works</a>
              <a href="#why" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">Why Us</a>
              <a href="https://bizfi.mintlify.app/" target="_blank" rel="noopener noreferrer" className="text-[#9BA8B5] hover:text-[#F9F9FB] transition-colors">Docs</a>
            </div>
            <Link href="/bizswap/app" className="group relative inline-flex items-center justify-center px-5 py-2 font-black text-[#0F1825] bg-[#81D7B4] rounded-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_15px_rgba(129,215,180,0.2)] hover:shadow-[0_0_25px_rgba(129,215,180,0.4)]">
              <span className="relative flex items-center text-sm">
                Launch App
              </span>
            </Link>
          </div>
        </nav>
      </div>

      <main className="relative z-10">
        
        {/* WC26 BANNER */}
        <div className="relative pt-32 px-6 max-w-7xl mx-auto z-20">
          <Link href="/bizswap/wc26" className="block w-full">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A3622] to-[#051A10] border border-[#D4AF37]/40 p-4 md:p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:shadow-[0_0_40px_rgba(212,175,55,0.25)] transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shrink-0">
                  <span className="text-black font-black text-xl">🏆</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">Live Now</span>
                    <h3 className="text-xl md:text-2xl font-black text-white" style={{ fontFamily: "var(--font-display)" }}>WC26 Vouchers</h3>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">Trade temporary instruments backed by World Cup revenue. Expires July 19.</p>
                </div>
              </div>
              <div className="relative z-10 shrink-0">
                <span className="inline-flex items-center justify-center px-6 py-3 font-bold text-black bg-gradient-to-r from-[#D4AF37] to-[#B8860B] rounded-xl transition-transform group-hover:scale-105">
                  Trade Now →
                </span>
              </div>
            </div>
          </Link>
        </div>
        {/* SECTION 1 - HERO */}
        <section className="relative min-h-screen flex items-center overflow-hidden px-6">

          {/* Background UI elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Dot grid */}
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.04) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
            {/* Ambient orb top-left */}
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#81D7B4]/5 blur-[120px]" />
            {/* Ambient orb bottom-right */}
            <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-[#3A4F73]/10 blur-[100px]" />
            {/* Floating grid lines — horizontal */}
            <div className="absolute top-[18%] left-0 right-0 h-px bg-[#81D7B4]/[0.06]" />
            <div className="absolute top-[72%] left-0 right-0 h-px bg-[#81D7B4]/[0.04]" />
            {/* Floating grid lines — vertical */}
            <div className="absolute left-[22%] top-0 bottom-0 w-px bg-[#81D7B4]/[0.05]" />
            <div className="absolute left-[78%] top-0 bottom-0 w-px bg-[#81D7B4]/[0.04]" />
            {/* Corner accent brackets */}
            <div className="absolute top-28 left-8 w-10 h-10 border-t border-l border-[#81D7B4]/20 rounded-tl-lg" />
            <div className="absolute top-28 right-8 w-10 h-10 border-t border-r border-[#81D7B4]/20 rounded-tr-lg" />
            <div className="absolute bottom-12 left-8 w-10 h-10 border-b border-l border-[#81D7B4]/15 rounded-bl-lg" />
            <div className="absolute bottom-12 right-8 w-10 h-10 border-b border-r border-[#81D7B4]/15 rounded-br-lg" />
            {/* Floating tiny badge elements */}
            <div className="absolute top-[30%] left-[6%] w-3 h-3 rounded-full border border-[#81D7B4]/25" />
            <div className="absolute top-[55%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#81D7B4]/20" />
            <div className="absolute top-[42%] right-[7%] w-4 h-4 rounded-full border border-[#3A4F73]/40" />
            <div className="absolute top-[65%] right-[12%] w-2 h-2 rounded-full bg-[#3A4F73]/30" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 w-full pt-32 pb-20">
            <div className="grid lg:grid-cols-2 gap-24 items-center">

              {/* ── LEFT: headline + cta ── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="flex flex-col items-start"
              >
                {/* Headline — Plus Jakarta Sans */}
                <motion.h1
                  variants={fadeUp}
                  className="text-[56px] md:text-[72px] font-extrabold tracking-tight leading-[1.04] text-[#F9F9FB] mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your RWA
                  <br />
                  <span className="text-[#81D7B4]">Yield Aggregator</span>
                </motion.h1>

                {/* Sub-copy */}
                <motion.p
                  variants={fadeUp}
                  className="text-[#7B8B9A] text-lg leading-relaxed max-w-md mb-10"
                >
                  Earn stablecoin yield from real world businesses, private credit, and government
                  treasuries — weekly, monthly or quarterly, straight to your wallet.
                </motion.p>

                {/* CTA */}
                <motion.div variants={fadeUp} className="flex items-center gap-4">
                  <Link
                    href="/bizswap/app"
                    className="px-8 py-3.5 bg-[#81D7B4] text-[#0F1825] font-black rounded-xl text-base transition-all hover:opacity-90 hover:scale-105 hover:shadow-[0_8px_24px_rgba(129,215,180,0.25)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Earn Now
                  </Link>
                  <a
                    href="#about"
                    className="px-8 py-3.5 text-[#9BA8B5] font-semibold text-base border border-[#2C3E5D] rounded-xl transition-all hover:border-[#81D7B4]/40 hover:text-[#F9F9FB]"
                  >
                    Learn More
                  </a>
                </motion.div>
              </motion.div>

              {/* ── RIGHT: shuffling card stack ── */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="hidden lg:flex items-center justify-center"
              >
                <div style={{ perspective: "1400px" }} className="flex items-center justify-center">
                  <ShufflingCards />
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 2 - WHAT IS BIZSWAP */}
        <section id="about" className="py-36 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.03) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

            {/* Top label row */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex items-center gap-2 mb-20">
              <div className="h-px w-8 bg-[#81D7B4]" />
              <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">About BizSwap</span>
            </motion.div>

            {/* Editorial two-column */}
            <div className="grid lg:grid-cols-12 gap-16 items-start">

              {/* Left: large pull headline + body */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={staggerContainer} className="lg:col-span-5">
                <motion.h2
                  variants={fadeUp}
                  className="text-6xl md:text-7xl font-extrabold leading-[1.04] text-[#F9F9FB] mb-10"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Never run<br />out of<br /><span className="text-[#81D7B4]">yield.</span>
                </motion.h2>

                {/* Horizontal stat row */}
                <motion.div variants={fadeUp} className="flex gap-10 mb-10 border-t border-b border-[#1E2F45] py-7">
                  {[
                    { value: "100%", label: "On-Chain" },
                    { value: "3", label: "Instruments" },
                    { value: "USDC", label: "Stablecoin Payouts" },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-2xl font-extrabold text-[#F9F9FB] leading-none mb-1" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                      <p className="text-xs text-[#7B8B9A] font-medium uppercase tracking-wider">{label}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                  BizSwap is the decentralized exchange (DEX) for swapping your stablecoins into BizShares. It provides seamless access to high-quality Real World Assets (RWAs) with transparent, predictable yield schedules.
                </motion.p>
              </motion.div>

              {/* Right: clean swap card + feature list */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-7 flex flex-col gap-6">

                {/* Swap card — icon-minimal */}
                <motion.div variants={fadeUp} className="bg-[#0D1724] border border-[#1E2F45] rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-[#81D7B4]/15" />
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#81D7B4]/4 blur-[60px] rounded-full" />

                  {/* Swap row */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-[#7B8B9A] text-[10px] font-bold uppercase tracking-[0.18em] mb-2">You Supply</p>
                      <p className="font-extrabold text-3xl text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>1,000 USDC</p>
                    </div>
                    <div className="text-[#81D7B4]/40 text-2xl font-thin select-none px-4">→</div>
                    <div className="text-right">
                      <p className="text-[#7B8B9A] text-[10px] font-bold uppercase tracking-[0.18em] mb-2">You Receive</p>
                      <p className="font-extrabold text-3xl text-[#81D7B4]" style={{ fontFamily: "var(--font-display)" }}>BizBond</p>
                    </div>
                  </div>

                  {/* Yield callout */}
                  <div className="bg-[#081018] rounded-2xl px-7 py-6 border border-[#1E2F45]">
                    <p className="text-[#7B8B9A] text-[10px] font-bold uppercase tracking-[0.18em] mb-3">Yield Generated</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-[#81D7B4]" style={{ fontFamily: "var(--font-display)" }}>+10%</span>
                      <span className="text-base font-semibold text-[#7B8B9A]">Annually · Paid quarterly to your wallet</span>
                    </div>
                  </div>
                </motion.div>

                {/* Feature list — text-only, no icon boxes */}
                <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "100% On-Chain", desc: "Every transaction is recorded immutably on-chain. No black boxes, no hidden counterparties." },
                    { label: "Stablecoin Payouts", desc: "Receive yield in USDC or local stablecoins — never in volatile token emissions." },
                  ].map(({ label, desc }) => (
                    <div key={label} className="bg-[#0D1724] border border-[#1E2F45] hover:border-[#81D7B4]/25 rounded-2xl px-6 py-5 transition-colors">
                      <p className="font-bold text-[#F9F9FB] text-sm mb-1.5" style={{ fontFamily: "var(--font-display)" }}>{label}</p>
                      <p className="text-[#7B8B9A] text-sm leading-relaxed">{desc}</p>
                    </div>
                  ))}
                </motion.div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - INSTRUMENTS */}
        <section id="instruments" className="py-36 bg-[#080E18] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.025) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1E2F45]" />
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

            {/* Left-aligned header */}
            <div className="grid lg:grid-cols-12 gap-10 mb-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-5">
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                  <div className="h-px w-8 bg-[#81D7B4]" />
                  <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Our Instruments</span>
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>
                  What are<br /><span className="text-[#81D7B4]">BizShares?</span>
                </motion.h2>
              </motion.div>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="lg:col-span-7 flex items-end">
                <p className="text-[#7B8B9A] text-lg leading-relaxed max-w-xl">
                  Digital certificates representing ownership in Real World Assets — backed by real-world revenue from businesses, private credit pools, and government treasury bills.
                </p>
              </motion.div>
            </div>

            {/* Table-row instrument cards */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="flex flex-col gap-4">
              {[
                {
                  title: "BizYield", risk: "High Risk", riskColor: "#FF6B6B",
                  desc: "Pays monthly for up to 24 months from a business's revenue.",
                  payouts: "Monthly", ret: "Variable APR", min: "$10.00",
                },
                {
                  title: "BizCredit", risk: "Medium Risk", riskColor: "#F5A623",
                  desc: "Backed by BizMarket's vetted SME credit pools.",
                  payouts: "Weekly", ret: "4% Quarterly", min: "$100.00", featured: true,
                },
                {
                  title: "BizBond", risk: "Low Risk", riskColor: "#81D7B4",
                  desc: "Backed by government treasury bills & sovereign instruments.",
                  payouts: "Quarterly", ret: "10% Annually", min: "$1,000.00",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`group relative grid grid-cols-12 gap-6 items-center bg-[#0D1724] border rounded-2xl px-8 py-7 transition-all hover:-translate-y-0.5 overflow-hidden ${item.featured ? "border-[#81D7B4]/35 shadow-[0_0_40px_rgba(129,215,180,0.06)]" : "border-[#1E2F45] hover:border-[#2C3E5D]"}`}
                >
                  {item.featured && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${item.riskColor}50, transparent)` }} />}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: item.riskColor }} />

                  {/* Name + risk */}
                  <div className="col-span-12 md:col-span-3">
                    <h3 className="text-2xl font-extrabold text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                    <span className="text-xs font-bold tracking-widest uppercase mt-1 inline-block" style={{ color: item.riskColor }}>{item.risk}</span>
                  </div>

                  {/* Desc */}
                  <p className="col-span-12 md:col-span-4 text-[#7B8B9A] text-sm leading-relaxed">{item.desc}</p>

                  {/* Stats */}
                  <div className="col-span-12 md:col-span-4 grid grid-cols-3 gap-4 md:border-l border-[#1E2F45] md:pl-6">
                    {[
                      { label: "Payouts", value: item.payouts },
                      { label: "Return", value: item.ret },
                      { label: "Min. Buy-in", value: item.min, accent: true },
                    ].map(({ label, value, accent }) => (
                      <div key={label}>
                        <p className="text-[#7B8B9A] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                        <p className={`font-extrabold text-sm ${accent ? "text-[#81D7B4]" : "text-[#F9F9FB]"}`} style={{ fontFamily: "var(--font-display)" }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="col-span-12 md:col-span-1 flex justify-end">
                    <Link href="/bizswap/app" className="text-xs font-bold text-[#81D7B4] hover:text-[#F9F9FB] transition-colors whitespace-nowrap">
                      Buy in →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION 4 - HOW IT WORKS */}
        <section id="how-it-works" className="py-36 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.03) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-16 items-start">

              {/* Left sticky */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="lg:col-span-4 lg:sticky lg:top-32">
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                  <div className="h-px w-8 bg-[#81D7B4]" />
                  <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Simple Process</span>
                </motion.div>
                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB] mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  How it<br /><span className="text-[#81D7B4]">Works</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                  Three simple steps to start earning real-world yield.
                </motion.p>
              </motion.div>

              {/* Right: numbered vertical steps */}
              <div className="lg:col-span-8 flex flex-col">
                {[
                  { step: "01", title: "Connect", desc: "Connect your wallet. Select an instrument that matches your risk appetite and investment size." },
                  { step: "02", title: "Swap", desc: "Swap your stablecoins directly into your chosen BizShares instrument. Your funds go to work immediately." },
                  { step: "03", title: "Earn", desc: "Receive yield payments directly to your wallet on schedule — weekly, monthly, or quarterly in stablecoins." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="flex gap-10 py-10 border-b border-[#1E2F45] last:border-b-0 group"
                  >
                    <div className="flex-shrink-0 pt-1 w-16">
                      <span className="text-5xl font-black leading-none text-[#1E2F45] group-hover:text-[#81D7B4]/25 transition-colors select-none" style={{ fontFamily: "var(--font-display)" }}>
                        {item.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-extrabold text-[#F9F9FB] mb-3" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                      <p className="text-[#7B8B9A] text-base leading-relaxed max-w-lg">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 5 - WHY BIZSWAP */}
        <section id="why" className="py-36 bg-[#080E18] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.025) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

            {/* Header */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mb-20">
              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-[#81D7B4]" />
                <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Why Choose Us</span>
              </motion.div>
              <div className="grid lg:grid-cols-2 gap-10 items-end">
                <motion.h2 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB]" style={{ fontFamily: "var(--font-display)" }}>
                  Built on Transparency<br />& <span className="text-[#81D7B4]">Real Assets.</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed">
                  We bridge the gap between DeFi liquidity and real-world economic value, offering a sustainable alternative to volatile tokenomics.
                </motion.p>
              </div>
            </motion.div>

            {/* Tiled feature grid — no icons */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 gap-px bg-[#1E2F45] border border-[#1E2F45] rounded-3xl overflow-hidden">
              {[
                { num: "01", title: "Stablecoin Yield Only", desc: "Every payment arrives in your chosen local stablecoin or USDC. No volatile token emissions." },
                { num: "02", title: "Real Assets Underneath", desc: "Every instrument is backed by a real world yield generating activity — a business revenue, a loan book, or a government bond." },
                { num: "03", title: "Direct Oversight", desc: "BizMarket's private equity arm holds a stake in the business for every BizYield listing. We have access to the books." },
                { num: "04", title: "On-Chain Ownership", desc: "Every purchase issues a digital certificate to your wallet. Your ownership is immutable and transparent." },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-[#0D1724] p-10 hover:bg-[#0F1A2A] transition-colors group">
                  <p className="text-xs font-black tracking-[0.2em] text-[#81D7B4]/50 mb-5" style={{ fontFamily: "var(--font-display)" }}>{item.num}</p>
                  <h4 className="text-2xl font-extrabold text-[#F9F9FB] mb-3 group-hover:text-[#81D7B4] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h4>
                  <p className="text-[#7B8B9A] text-base leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom inline CTA */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mt-8 flex items-center justify-between bg-[#0D1724] border border-[#1E2F45] rounded-2xl px-8 py-6">
              <p className="text-[#F9F9FB] font-semibold text-lg">Ready to start earning real yield?</p>
              <Link href="/bizswap/app" className="px-7 py-3 bg-[#81D7B4] text-[#0F1825] font-black rounded-xl text-sm transition-all hover:opacity-90 hover:scale-105" style={{ fontFamily: "var(--font-display)" }}>
                Start Earning
              </Link>
            </motion.div>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-36 relative overflow-hidden bg-[#081018]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.03) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#81D7B4]/5 blur-[120px] rounded-full" />
            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-[#81D7B4]/20" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-[#81D7B4]/20" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-[#81D7B4]/15" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-[#81D7B4]/15" />
          </div>
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px w-8 bg-[#81D7B4]" />
                <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Get Started</span>
                <div className="h-px w-8 bg-[#81D7B4]" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-[#F9F9FB] leading-[1.05]" style={{ fontFamily: "var(--font-display)" }}>
                Your money<br />should be working.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#7B8B9A] text-xl mb-12 leading-relaxed">
                Pick an instrument. Swap in minutes.<br />Start earning real-world yield today.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link href="/bizswap/app" className="inline-flex items-center gap-3 px-12 py-5 bg-[#81D7B4] hover:opacity-90 hover:scale-105 text-[#0F1825] font-black rounded-2xl text-xl transition-all shadow-[0_10px_40px_rgba(129,215,180,0.2)] hover:shadow-[0_15px_60px_rgba(129,215,180,0.35)]" style={{ fontFamily: "var(--font-display)" }}>
                  Access Swap Market
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="relative bg-[#080E18] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-[#1E2F45]" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#1E2F45]" />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(129,215,180,0.025) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-0 min-h-[480px]">

              {/* Left — editorial copy */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="flex flex-col justify-center py-20 lg:pr-20 lg:border-r border-[#1E2F45]"
              >
                <motion.div variants={fadeUp} className="flex items-center gap-2 mb-8">
                  <div className="h-px w-8 bg-[#81D7B4]" />
                  <span className="text-[#81D7B4] text-xs font-bold tracking-[0.2em] uppercase">Newsletter</span>
                </motion.div>

                <motion.h2
                  variants={fadeUp}
                  className="text-5xl md:text-6xl font-extrabold leading-[1.06] text-[#F9F9FB] mb-6"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  The art of<br /><span className="text-[#81D7B4]">Savviness.</span>
                </motion.h2>

                <motion.p variants={fadeUp} className="text-[#7B8B9A] text-lg leading-relaxed mb-12 max-w-md">
                  Get smarter with your money — personal and business finance strategies to build growth, delivered straight to your inbox.
                </motion.p>

                {/* Proof points — text only */}
                <motion.div variants={fadeUp} className="flex flex-col gap-4">
                  {[
                    "Weekly insights on RWA markets and yield strategies",
                    "No spam. Unsubscribe at any time.",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="mt-2 w-1 h-1 rounded-full bg-[#81D7B4] flex-shrink-0" />
                      <p className="text-[#7B8B9A] text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right — form */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex flex-col justify-center py-20 lg:pl-20"
              >
                <NewsletterEmbed />
              </motion.div>

            </div>
          </div>
        </section>
      </main>

            {/* FOOTER */}
      <footer className="border-t border-[#2C3E5D] py-12 bg-[#0A0F17]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            <span className="text-2xl font-black tracking-tight text-[#81D7B4]" style={{ fontFamily: "var(--font-display)" }}>BizSwap</span>
          </div>
          <p className="text-[#7B8B9A] text-sm">© 2026 BizMarket Protocol. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/bizswap/dashboard" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Dashboard</Link>
            <Link href="/bizswap/app" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Market</Link>
            <a href="https://bizfi.mintlify.app/" target="_blank" rel="noopener noreferrer" className="text-[#9BA8B5] hover:text-[#81D7B4] transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
