'use client';

import { ArrowRight, Building2, BadgeCheck, Users, Rocket } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BizFiSection() {
  const bizFiFeatures = [
    { 
      title: "On-chain Registration", 
      desc: "Secure your business identity on Base with official on-chain registration.", 
      icon: <Building2 className="w-6 h-6" /> 
    },
    { 
      title: "Verifiable Attestations", 
      desc: "Build trust with EAS-powered attestations that prove your legitimacy.", 
      icon: <BadgeCheck className="w-6 h-6" /> 
    },
    { 
      title: "Global Capital Access", 
      desc: "Connect with investors and raise capital directly on the blockchain.", 
      icon: <Users className="w-6 h-6" /> 
    }
  ];

  return (
    <section id="bizfi" className="relative py-16 lg:py-24 px-4 md:px-8 bg-slate-50 border-y border-gray-100 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#81D7B4]/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 space-y-8"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#81D7B4]/20 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#81D7B4]" />
              <span className="text-sm font-bold text-gray-900 tracking-wide uppercase">BizFi Protocol</span>
            </div>

            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
            >
              Bring Your Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0]">Onchain</span>
            </h2>

            <p
              className="text-xl text-gray-500 leading-relaxed"
            >
              Transform your company into a global asset. Secure your identity on Base, prove your legitimacy with attestations, and raise capital directly from the community.
            </p>

            <div>
              <Link href="/bizfi" className="inline-flex items-center gap-2 px-8 py-4 bg-[#81D7B4] text-white font-bold rounded-full hover:bg-[#6BC5A0] transition-colors shadow-lg shadow-[#81D7B4]/20 hover:scale-105 transform duration-200">
                Tokenize Your Business
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          <div className="lg:w-1/2 grid grid-cols-1 gap-6">
            {bizFiFeatures.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-6 p-6 sm:p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#81D7B4]/10 hover:border-[#81D7B4]/30 transition-all duration-300 group"
              >
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:bg-[#81D7B4] group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#81D7B4] transition-colors">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
