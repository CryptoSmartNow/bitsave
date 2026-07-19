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
        "High minimum deposits",
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
      icon: <ArrowDown01Icon className="w-6 h-6 text-[#81D7B4]" />
    },
    {
      label: "Dipping into Savings",
      value: 60,
      suffix: "%+",
      desc: "of Web3 earners use savings for essentials like rent/bills.",
      icon: <Wallet01Icon className="w-6 h-6 text-[#81D7B4]" />
    },
    {
      label: "Web3 Earners",
      value: 190,
      suffix: "k+",
      desc: "people earning in Web3 with no dedicated savings protocol.",
      icon: <UserMultipleIcon className="w-6 h-6 text-[#81D7B4]" />
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
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <>
      <section id="security" className="py-24 md:py-32 lg:py-40 px-4 md:px-8 relative overflow-hidden bg-[#050B14]">
        
        {/* Background ambient glowing orbs */}
        <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#81D7B4]/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-10 left-1/3 w-[700px] h-[700px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="container mx-auto max-w-7xl relative z-10">

          {/* SECTION 1: THE PROBLEM */}
          <div className="mb-40">
            <div className="text-center mb-20 relative flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-5 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md"
              >
                The Gap
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent"
              >
                Today's <span className="text-rose-400 drop-shadow-lg opacity-90">Savings Reality</span>
              </motion.h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 40 }}
                  className="flex-1 group"
                >
                  <div className="h-full relative p-10 md:p-14 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[3rem] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_40px_rgba(244,63,94,0.1)] overflow-hidden">
                    
                    {/* Faint massive number watermark */}
                    <div className="absolute -top-6 -right-6 text-[10rem] font-instrument font-bold text-white/[0.02] pointer-events-none select-none z-0 transition-transform duration-500 group-hover:scale-110">
                      0{problem.id}
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-inner text-rose-400 transition-transform duration-500 group-hover:scale-110">
                          <UserIcon className="w-8 h-8 stroke-[1.5]" />
                        </div>
                        <div>
                          <h3 className="font-instrument text-4xl text-white leading-none mb-2">{problem.person}</h3>
                          <span className="text-rose-400/80 text-xs font-bold uppercase tracking-[0.2em]">
                            {problem.role}
                          </span>
                        </div>
                      </div>

                      <div className="mb-10">
                        <p className="text-xl lg:text-2xl font-light text-slate-300 leading-relaxed">
                          "{problem.story}"
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {problem.painPoints.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white/[0.05] border border-white/10 px-4 py-2 rounded-full shadow-sm backdrop-blur-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                            <span className="text-slate-300 font-medium text-sm">{point}</span>
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
          <div>
            <div className="text-center mb-20 relative flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-5 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#81D7B4] text-xs font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-md"
              >
                The Solution
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent"
              >
                Why <span className="text-[#81D7B4] drop-shadow-lg opacity-90">Bitsave</span> Works
              </motion.h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {solutions.map((sol, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1, duration: 0.6, type: "spring", stiffness: 40 }}
                    className="group relative p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-[#81D7B4]/30 hover:shadow-[0_10px_40px_rgba(129,215,180,0.1)] transition-all duration-500 flex flex-col overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-8 bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-[#050B14] group-hover:shadow-[0_0_20px_rgba(129,215,180,0.4)] transition-all duration-500 shadow-inner">
                        <div className="[&>svg]:w-8 [&>svg]:h-8 [&>svg]:stroke-[1.5]">
                          {sol.icon}
                        </div>
                      </div>

                      <h3 className="font-instrument text-3xl font-bold mb-4 text-white drop-shadow-md">
                        {sol.title}
                      </h3>

                      <p className="text-base leading-relaxed text-slate-400 font-light mt-auto">
                        {sol.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MARKET OPPORTUNITY */}
      <section className="py-24 md:py-32 bg-[#f8fafc] relative overflow-hidden" ref={statsRef}>
        
        {/* Wavy Line Background Texture */}
        <div 
          className="absolute inset-0 opacity-[0.06] mix-blend-multiply" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 20, 50 10 T 100 10' fill='none' stroke='%23334155' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 20px',
            backgroundPosition: 'center'
          }} 
        />

        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16 relative flex flex-col items-center">
            <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
              <GlobeIcon className="w-4 h-4 text-[#5fb392]" />
              <span className="text-xs font-bold text-slate-600 tracking-[0.25em] uppercase">The Opportunity</span>
            </div>
            <h2 className="font-instrument text-5xl md:text-7xl lg:text-8xl tracking-tight text-slate-900">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4] drop-shadow-sm">SaveFi Potential</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 relative z-10">
            {/* Stat 1 & 2: Side by Side */}
            {marketStats.slice(0, 2).map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6, type: "spring", stiffness: 40 }}
                className="group bg-white/80 backdrop-blur-xl p-10 lg:p-12 rounded-[2.5rem] border border-slate-200/80 hover:bg-white hover:border-[#81D7B4]/50 hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#81D7B4]/10 group-hover:border-[#81D7B4]/20 transition-all duration-500">
                  {stat.icon}
                </div>
                <div className="font-instrument text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-6 group-hover:text-[#5fb392] transition-colors duration-500">
                  <span className="tabular-nums">{stat.value}</span><span className="text-slate-300 text-4xl lg:text-5xl ml-2 font-light">{stat.suffix}</span>
                </div>
                <h3 className="font-instrument text-3xl text-slate-800 mb-4">{stat.label}</h3>
                <p className="text-slate-500 text-base lg:text-lg font-medium">{stat.desc}</p>
              </motion.div>
            ))}

            {/* Stat 3: Spans full width, highlighted styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 40 }}
              className="group lg:col-span-2 bg-gradient-to-br from-[#81D7B4] to-[#5fb392] p-10 lg:p-14 rounded-[2.5rem] border border-[#5fb392]/20 hover:shadow-[0_15px_50px_rgba(129,215,180,0.3)] transition-all duration-500 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-10 overflow-hidden relative"
            >
              {/* Decorative background number */}
              <div className="absolute -right-10 -bottom-20 text-[16rem] font-instrument font-bold text-white/[0.15] pointer-events-none select-none z-0 group-hover:scale-105 transition-transform duration-700">
                {marketStats[2].value}
              </div>

              <div className="flex-1 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center mb-8 mx-auto md:mx-0 group-hover:bg-white group-hover:text-[#5fb392] text-white transition-all duration-500 backdrop-blur-sm">
                  {marketStats[2].icon}
                </div>
                <h3 className="font-instrument text-4xl lg:text-5xl text-white mb-4 drop-shadow-sm">{marketStats[2].label}</h3>
                <p className="text-white/90 text-lg lg:text-xl font-medium max-w-lg">{marketStats[2].desc}</p>
              </div>
              <div className="font-instrument text-7xl md:text-[8rem] lg:text-[10rem] font-bold tracking-tight text-white shrink-0 relative z-10">
                <span className="tabular-nums drop-shadow-md">{marketStats[2].value}</span><span className="text-white/60 text-5xl md:text-[6rem] lg:text-[7rem] ml-2 font-light">{marketStats[2].suffix}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}