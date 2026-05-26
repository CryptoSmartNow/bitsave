'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { User, Activity, Globe, TrendingUp, Lock, ShieldCheck, MousePointerClick, Wallet, Users, TrendingDown } from 'lucide-react';

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
      icon: <TrendingDown className="w-5 h-5 text-[#81D7B4]" />
    },
    { 
      label: "Dipping into Savings", 
      value: 60, 
      suffix: "%+", 
      desc: "of Web3 earners use savings for essentials like rent/bills.",
      icon: <Wallet className="w-5 h-5 text-[#81D7B4]" />
    },
    { 
      label: "Web3 Earners", 
      value: 190, 
      suffix: "k+", 
      desc: "people earning in Web3 with no dedicated savings protocol.",
      icon: <Users className="w-5 h-5 text-[#81D7B4]" />
    }
  ];

  const solutions = [
    {
      title: "Simple UX Design",
      desc: "Intuitive interface designed for both Web3 natives and newcomers.",
      icon: <MousePointerClick />
    },
    {
      title: "Goal-Based Locked Savings",
      desc: "Set savings goals and lock your funds until you reach them.",
      icon: <Lock />
    },
    {
      title: "Earn $BTS Tokens",
      desc: "Get rewarded with $BTS tokens for consistent saving habits.",
      icon: <TrendingUp />
    },
    {
      title: "Child-Parent Security",
      desc: "Enhanced security through our innovative contract structure.",
      icon: <ShieldCheck />
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

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group relative p-8 sm:p-10 rounded-[2.5rem] bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-[#81D7B4]/30 hover:shadow-2xl hover:shadow-[#81D7B4]/10 transition-all duration-500"
              >
                {/* Persona Header */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-500">
                    <User className="w-8 h-8 text-gray-400 group-hover:text-[#81D7B4] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-gray-900 leading-none mb-2">{problem.person}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#81D7B4]/10 text-[#5fb392] text-xs font-bold uppercase tracking-wider">
                      {problem.role}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <div className="mb-10 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-[#81D7B4]/10 font-serif leading-none">"</span>
                  <p className="text-xl font-medium text-gray-700 leading-relaxed relative z-10 pl-4">
                    {problem.story}
                  </p>
                </div>

                {/* Pain Points */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-display">Key Challenges</p>
                  {problem.painPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-4 group/item">
                      <div className="mt-1.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 group-hover/item:border-red-300 group-hover/item:bg-red-100 transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      </div>
                      <span className="text-gray-600 font-medium">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Accent border on left */}
                <div className="absolute left-0 top-8 bottom-8 w-[3px] rounded-full bg-gradient-to-b from-red-200/50 via-red-300/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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

          {/* Solutions Grid / Carousel on Mobile */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
            {solutions.map((sol, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-[#81D7B4]/30 hover:shadow-xl hover:shadow-[#81D7B4]/8 transition-all duration-300 hover:-translate-y-1 snap-center shrink-0 min-w-[260px] max-w-[300px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none"
              >
                <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#81D7B4]/5 group-hover:bg-gradient-to-br group-hover:from-[#81D7B4] group-hover:to-[#5fb392] group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#81D7B4]/25 transition-all duration-300">
                  <div className="text-[#81D7B4] group-hover:text-white transition-colors duration-300 [&>svg]:w-8 [&>svg]:h-8">
                    {sol.icon}
                  </div>
                </div>
                
                <h3 className="font-display text-xl font-bold text-gray-900 mb-4 group-hover:text-[#5fb392] transition-colors">
                  {sol.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed text-sm font-medium">
                  {sol.desc}
                </p>
              </motion.div>
            ))}
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
                <Globe className="w-4 h-4 text-[#5fb392]" />
                <span className="text-xs font-bold text-[#2D5A4A] tracking-widest uppercase font-display">The Opportunity</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                The <span className="text-gradient">SaveFi Potential</span>
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
                Addressing the critical savings gap in the decentralized economy with high-impact, user-centric protocol designs.
              </p>
            </div>

            {/* Stats Grid / Carousel on Mobile */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 text-center md:pb-0 md:mx-0 md:px-0 md:overflow-visible md:snap-none">
              {marketStats.map((stat, index) => {
                const animatedValue = useCountUp(stat.value, 2000, statsInView);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15, duration: 0.5 }}
                    className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-[#81D7B4]/30 hover:shadow-[0_12px_45px_rgba(129,215,180,0.12)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col items-center snap-center shrink-0 min-w-[260px] max-w-[300px] md:min-w-0 md:max-w-none md:shrink md:snap-align-none"
                  >
                    {/* Icon container */}
                    <div className="mb-6 w-12 h-12 rounded-2xl bg-[#81D7B4]/10 border border-[#81D7B4]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#81D7B4]/20 transition-all duration-300 shadow-[0_4px_12px_rgba(129,215,180,0.15)]">
                      {stat.icon}
                    </div>

                    <div className="font-display text-5xl md:text-6xl font-extrabold mb-3 text-[#5fb392] tracking-tight">
                      {animatedValue}{stat.suffix}
                    </div>
                    
                    <div className="font-display text-base font-bold mb-2 text-gray-900 group-hover:text-[#5fb392] transition-colors duration-300">
                      {stat.label}
                    </div>
                    
                    <p className="text-gray-500 leading-relaxed text-sm max-w-xs font-medium">
                      {stat.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}