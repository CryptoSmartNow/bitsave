'use client';

import { UserIcon, Activity01Icon, GlobeIcon, ArrowUpRight01Icon, LockIcon, Shield01Icon, CursorPointer01Icon, Wallet01Icon, UserMultipleIcon, ArrowDown01Icon } from "hugeicons-react";
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, inView: boolean = false) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, inView]);

  return count;
}

export default function Security() {
  const problems = [
    {
      id: 1,
      person: "Ifeanyi",
      role: "Web3 User",
      story: "Earns in crypto but lacks onchain savings options. Only finds complex DeFi investment protocols.",
      painPoints: [
        "No simple savings protocols",
        "DeFi UX is too complex",
        "Risk of market volatility"
      ]
    },
    {
      id: 2,
      person: "Rukevwe",
      role: "Bank User",
      story: "Wants to escape inflation but faces high barriers to dollar savings in traditional banks.",
      painPoints: [
        "Inflation eats savings",
        "High minimum deposits ($100+)",
        "Expensive fees"
      ]
    }
  ];

  const marketStats = [
    {
      label: "Frequent Traders",
      value: 70,
      suffix: "%+",
      desc: "of onchain users have no structured savings behavior.",
      icon: <ArrowDown01Icon className="w-5 h-5 text-[#81D7B4]" />
    },
    {
      label: "Dipping into Savings",
      value: 60,
      suffix: "%+",
      desc: "of Web3 earners use savings for essentials like rent/bills.",
      icon: <Wallet01Icon className="w-5 h-5 text-[#81D7B4]" />
    },
    {
      label: "Web3 Earners",
      value: 190,
      suffix: "k+",
      desc: "people earning in Web3 with no dedicated savings protocol.",
      icon: <UserMultipleIcon className="w-5 h-5 text-[#81D7B4]" />
    }
  ];

  const solutions = [
    {
      title: "Simple UX Design",
      desc: "Intuitive interface designed for both Web3 natives and newcomers.",
      icon: <CursorPointer01Icon />
    },
    {
      title: "Goal-Based Locked Savings",
      desc: "Set savings goals and lock your funds until you reach them.",
      icon: <LockIcon />
    },
    {
      title: "Earn $BTS Tokens",
      desc: "Get rewarded with $BTS tokens for consistent saving habits.",
      icon: <ArrowUpRight01Icon />
    },
    {
      title: "Child-Parent Security",
      desc: "Enhanced security through our innovative contract structure.",
      icon: <Shield01Icon />
    }
  ];

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  return (
    <section id="security" className="section-lazy py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
      <div className="container mx-auto max-w-7xl relative z-10">

        {/* SECTION 1: THE PROBLEM */}
        <div className="mb-32">
          <div className="mb-24 md:mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
              <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">The Gap</span>
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-4xl">
              Today's <span className="text-gradient-animated">Savings Reality</span>
            </h2>
          </div>

          <div className="flex flex-col gap-20 relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-10 bottom-10 w-[1px] bg-gradient-to-b from-gray-200 via-gray-100 to-transparent hidden md:block" />

            {problems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="relative md:pl-24 group"
              >
                {/* Timeline node */}
                <div className="hidden md:flex absolute left-8 -translate-x-1/2 top-4 w-4 h-4 rounded-full bg-white border-2 border-gray-200 group-hover:border-[#81D7B4] group-hover:bg-[#81D7B4]/20 transition-all duration-300 shadow-sm" />

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
                  {/* Persona Info */}
                  <div className="lg:w-1/3 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(129,215,180,0.3)] transition-all duration-500">
                      <UserIcon className="w-10 h-10 text-gray-400 group-hover:text-[#81D7B4] transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-bold text-gray-900 leading-none mb-2">{problem.person}</h3>
                      <span className="inline-block text-[#5fb392] text-sm font-bold uppercase tracking-widest font-display">
                        {problem.role}
                      </span>
                    </div>
                  </div>

                  {/* Story & Pain Points */}
                  <div className="lg:w-2/3">
                    <div className="mb-10 relative">
                      <span className="absolute -top-8 -left-6 text-8xl text-gray-100/60 font-serif leading-none z-0 select-none transition-all duration-500 group-hover:text-[#81D7B4]/10 group-hover:-translate-y-2">"</span>
                      <p className="text-2xl lg:text-3xl font-medium text-gray-700 leading-snug relative z-10 font-display">
                        {problem.story}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {problem.painPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-red-50/50 border border-red-100/50 px-4 py-2.5 rounded-xl group-hover:border-red-200 group-hover:bg-red-50 transition-colors duration-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span className="text-gray-600 font-medium text-sm">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: THE SOLUTION */}
        <div className="mb-32">
          <div className="mb-24 md:mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
              <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">The Solution</span>
            </motion.div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-4xl">
              Why <span className="text-gradient-animated">Bitsave</span> Works
            </h2>
          </div>

          {/* Modern Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {solutions.map((sol, index) => {
              // Create an asymmetric zig-zag bento layout
              const isLarge = index === 1 || index === 2;
              const isPrimary = index === 2; // Make the "Earn Tokens" card pop with green

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`group relative overflow-hidden p-8 sm:p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#81D7B4]/15 ${isLarge ? 'lg:col-span-2' : 'lg:col-span-1'
                    } ${isPrimary
                      ? 'bg-[#5fb392] border border-[#81D7B4]/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[#5fb392]/40'
                      : 'bg-gray-50/80 border border-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,1)] hover:border-[#81D7B4]/40 hover:bg-white'
                    }`}
                >
                  {/* Subtle Background Textures & Glows */}
                  {!isPrimary && (
                    <>
                      {/* Grid Pattern */}
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />
                      {/* Solid Ambient Elements instead of Gradients */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D7B4]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-[#81D7B4]/20 transition-colors duration-700" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#5fb392]/5 blur-[60px] rounded-full -translate-x-1/3 translate-y-1/3 pointer-events-none" />
                    </>
                  )}
                  {isPrimary && (
                    <>
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
                    </>
                  )}

                  <div className={`flex flex-col h-full relative z-10 ${isLarge ? 'lg:flex-row lg:items-center gap-8 lg:gap-12' : 'gap-8'}`}>
                    {/* Icon Box */}
                    <div className={`inline-flex items-center justify-center rounded-3xl shrink-0 transition-all duration-500 shadow-sm group-hover:scale-110 ${isPrimary
                        ? 'w-20 h-20 bg-white/20 backdrop-blur-md text-white shadow-[0_8px_32px_rgba(255,255,255,0.15)] border border-white/20'
                        : 'w-16 h-16 bg-white border border-gray-100 text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_8px_24px_rgba(129,215,180,0.3)]'
                      }`}>
                      <div className="[&>svg]:w-8 [&>svg]:h-8 [&>svg]:stroke-[1.5]">
                        {sol.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`flex flex-col ${isLarge ? 'flex-grow justify-center' : ''}`}>
                      <h3 className={`font-display text-2xl lg:text-3xl font-extrabold mb-4 transition-colors tracking-tight ${isPrimary ? 'text-white' : 'text-gray-900 group-hover:text-[#2D5A4A]'
                        }`}>
                        {sol.title}
                      </h3>

                      <p className={`text-[15px] leading-relaxed ${isPrimary ? 'text-white/90 font-medium' : 'text-gray-500 font-medium'
                        }`}>
                        {sol.desc}
                      </p>
                    </div>

                    {/* Decorative Elements for Large Cards */}
                    {isLarge && !isPrimary && (
                      <div className="hidden lg:block absolute -right-12 -bottom-12 w-64 h-64 bg-[#81D7B4]/5 rounded-full border-[1px] border-[#81D7B4]/10 group-hover:scale-150 transition-transform duration-1000 ease-out pointer-events-none" />
                    )}
                    {isLarge && isPrimary && (
                      <div className="hidden lg:flex absolute right-4 bottom-4 w-32 h-32 opacity-10 pointer-events-none items-center justify-center">
                        {sol.icon}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: MARKET OPPORTUNITY - Premium Light Panel */}
        <div className="relative mt-16 md:mt-24">
          <div className="absolute inset-0 bg-gray-50/50 rounded-[2.5rem] -z-10 border border-gray-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Grid dot-pattern overlay */}
            <div className="absolute inset-0 dot-pattern opacity-10 pointer-events-none" />
            {/* Ambient glows (very subtle light green) */}
            <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-[#81D7B4]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-[#5fb392]/4 blur-[100px] rounded-full pointer-events-none" />
          </div>

          <div className="py-20 px-6 sm:px-12 md:px-16" ref={statsRef}>
            <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 mb-4 bg-[#81D7B4]/10 border border-[#81D7B4]/20 px-4 py-1.5 rounded-full">
                <GlobeIcon className="w-4 h-4 text-[#5fb392]" />
                <span className="text-xs font-bold text-[#2D5A4A] tracking-widest uppercase font-display">The Opportunity</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                The <span className="text-gradient">SaveFi Potential</span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
                Addressing the critical savings gap in the decentralized economy with high-impact, user-centric protocol designs.
              </p>
            </div>

            {/* Asymmetric Stats Layout */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mt-16 relative z-10">

              {/* Primary Stat (Left) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="group relative p-10 lg:p-14 rounded-[3rem] bg-[#81D7B4]/5 border border-[#81D7B4]/20 hover:border-[#81D7B4]/40 flex flex-col justify-center overflow-hidden transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]"
              >
                {/* Background decorative */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#81D7B4]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-[#81D7B4]/20 transition-colors duration-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />

                <div className="mb-8 w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#5fb392] group-hover:scale-110 group-hover:bg-[#81D7B4] group-hover:text-white transition-all duration-300 relative z-10">
                  {marketStats[0].icon}
                </div>

                <div className="font-display text-8xl lg:text-[8rem] font-black tracking-tighter leading-none mb-6 text-[#2D5A4A] relative z-10">
                  {/* Note: We aren't using useCountUp here as it's complex to re-init dynamically without breaking layout, hardcoding the value string from marketStats for aesthetic stability */}
                  <span className="tabular-nums">70</span><span className="text-[#81D7B4] text-6xl lg:text-[6rem] ml-1">{marketStats[0].suffix}</span>
                </div>

                <div className="font-display text-2xl lg:text-3xl font-extrabold text-gray-900 mb-4 relative z-10">
                  {marketStats[0].label}
                </div>

                <p className="text-gray-600 text-lg leading-relaxed font-medium max-w-sm relative z-10">
                  {marketStats[0].desc}
                </p>
              </motion.div>

              {/* Secondary Stats (Right) */}
              <div className="flex flex-col gap-6 lg:gap-8">
                {[marketStats[1], marketStats[2]].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (idx * 0.2), duration: 0.6 }}
                    className="group relative p-8 lg:p-10 rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white hover:bg-white hover:shadow-2xl hover:shadow-[#81D7B4]/15 transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center gap-8 overflow-hidden h-full flex-1"
                  >
                    <div className="absolute inset-0 bg-[#81D7B4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="flex-grow relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#5fb392] group-hover:scale-110 group-hover:bg-[#81D7B4]/10 transition-all duration-300">
                          {stat.icon}
                        </div>
                        <div className="font-display text-xl font-bold text-gray-900 group-hover:text-[#2D5A4A] transition-colors">
                          {stat.label}
                        </div>
                      </div>
                      <p className="text-gray-500 leading-relaxed text-[15px] font-medium max-w-[280px]">
                        {stat.desc}
                      </p>
                    </div>

                    <div className="font-display text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#5fb392] shrink-0 relative z-10">
                      <span className="tabular-nums">{stat.value}</span><span className="text-[#81D7B4] text-4xl">{stat.suffix}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}