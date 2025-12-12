'use client';

import { motion } from 'framer-motion';
import { User, Activity, Globe, TrendingUp, Lock, ShieldCheck, MousePointerClick } from 'lucide-react';

export default function Security() {
  const problems = [
    {
      id: 1,
      person: "Ifeanyi",
      role: "Web3 User",
      avatarColor: "bg-[#81D7B4]/10 text-[#81D7B4]",
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
      avatarColor: "bg-[#81D7B4]/10 text-[#81D7B4]",
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
      icon: <MousePointerClick className="w-6 h-6" />
    },
    {
      title: "Goal-Based Locked Savings",
      desc: "Set savings goals and lock your funds until you reach them.",
      icon: <Lock className="w-6 h-6" />
    },
    {
      title: "Earn $BTS Tokens",
      desc: "Get rewarded with $BTS tokens for consistent saving habits.",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: "Child-Parent Security",
      desc: "Enhanced security through our innovative contract structure.",
      icon: <ShieldCheck className="w-6 h-6" />
    }
  ];

  return (
    <section id="security" className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-white">
      <div className="container mx-auto max-w-7xl relative z-10">

        {/* SECTION 1: TODAY'S PROBLEMS (Gap) */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
              <span className="text-sm font-semibold text-[#81D7B4] tracking-wide uppercase">The Problem</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Today's <span className="text-[#81D7B4]">Savings Gap</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Why saving is hard for both Web3 natives and traditional banking users.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {problems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 hover:border-[#81D7B4]/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(129,215,180,0.15)] group"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${problem.avatarColor} group-hover:bg-[#81D7B4] group-hover:text-white transition-colors duration-300`}>
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{problem.person}</h3>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 text-xs font-bold text-[#81D7B4] uppercase tracking-wide shadow-sm mt-1">{problem.role}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-lg mb-8 leading-relaxed font-medium">"{problem.story}"</p>

                <div className="space-y-3">
                  {problem.painPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-500">
                      <div className="w-5 h-5 rounded-full bg-[#81D7B4]/20 text-[#81D7B4] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold">x</span>
                      </div>
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: BITSAVE SOLUTION (Why Bitsave Works) */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 shadow-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
              <span className="text-sm font-semibold text-[#81D7B4] tracking-wide uppercase">The Solution</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Why <span className="text-[#81D7B4]">Bitsave</span> Works</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((sol, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-[#81D7B4]/40 hover:shadow-xl hover:shadow-[#81D7B4]/5 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#81D7B4]/10 text-[#81D7B4] flex items-center justify-center mb-6 group-hover:bg-[#81D7B4] group-hover:text-white transition-colors duration-300">
                  {sol.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{sol.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {sol.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 3: MARKET OPPORTUNITY (Reverted to clean light design) */}
        <div>
          <div className="bg-[#f8fafa] rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="relative z-10 text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 mb-6 shadow-sm">
                <Globe className="w-4 h-4 text-[#81D7B4]" />
                <span className="text-sm font-bold text-gray-600 tracking-wide uppercase">Market Opportunity</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">The SaveFi Opportunity</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Stablecoin adoption is growing, but savings infrastructure is missing. Bitsave fills this gap.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              {marketStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#81D7B4]/30 transition-all text-center group">
                  <div className="text-5xl font-bold mb-4 text-[#81D7B4] group-hover:scale-110 transition-transform duration-300 inline-block">{stat.value}</div>
                  <div className="text-xl font-bold mb-2 text-gray-800">{stat.label}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}