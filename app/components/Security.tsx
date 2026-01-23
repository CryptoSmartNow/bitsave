'use client';

import { motion } from 'framer-motion';
import { User, Activity, Globe, TrendingUp, Lock, ShieldCheck, MousePointerClick } from 'lucide-react';

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
    { label: "Frequent Traders", value: "70%+", desc: "of onchain users have no structured savings behavior." },
    { label: "Dipping into Savings", value: "60%+", desc: "of Web3 earners use savings for essentials like rent/bills." },
    { label: "Web3 Earners", value: "190k+", desc: "people earning in Web3 with no dedicated savings protocol." }
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

  return (
    <section id="security" className="py-16 md:py-24 lg:py-32 px-4 md:px-8 relative overflow-hidden bg-white">
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight max-w-4xl">
              Today's <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#5fb392]">Savings Reality</span>
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
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <User className="w-8 h-8 text-gray-400 group-hover:text-[#81D7B4] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-none mb-2">{problem.person}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#81D7B4]/10 text-[#81D7B4] text-xs font-bold uppercase tracking-wider">
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
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Key Challenges</p>
                  {problem.painPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-4 group/item">
                      <div className="mt-1.5 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 group-hover/item:border-red-200 transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      </div>
                      <span className="text-gray-600 font-medium">{point}</span>
                    </div>
                  ))}
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
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight max-w-4xl">
              Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#5fb392]">Bitsave</span> Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((sol, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-[#81D7B4]/30 hover:shadow-xl hover:shadow-[#81D7B4]/5 transition-all duration-300"
              >
                <div className="mb-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#81D7B4]/5 group-hover:bg-[#81D7B4] group-hover:scale-110 transition-all duration-300">
                  <div className="text-[#81D7B4] group-hover:text-white transition-colors duration-300 [&>svg]:w-8 [&>svg]:h-8">
                    {sol.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#81D7B4] transition-colors">
                  {sol.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed text-sm font-medium">
                  {sol.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 3: MARKET OPPORTUNITY */}
        <div className="relative">
          <div className="absolute inset-0 bg-gray-50 -skew-y-3 -z-10 scale-110" />
          <div className="py-24">
             <div className="mb-16 text-center">
              <div className="inline-flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-[#81D7B4]" />
                <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">The Opportunity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">The SaveFi Potential</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 text-center">
              {marketStats.map((stat, index) => (
                <div key={index} className="group">
                  <div className="text-5xl md:text-6xl font-bold mb-4 text-[#81D7B4]/20 group-hover:text-[#81D7B4] transition-colors duration-500">
                    {stat.value}
                  </div>
                  <div className="text-lg font-bold mb-3 text-gray-900">{stat.label}</div>
                  <p className="text-gray-500 leading-relaxed max-w-xs mx-auto text-sm">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}