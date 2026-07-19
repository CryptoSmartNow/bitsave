'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { GithubIcon, Linkedin01Icon, TwitterIcon, Mail01Icon } from "hugeicons-react";
import { motion } from 'framer-motion';
import Image from 'next/image';

// Custom Farcaster Icon
const FarcasterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333S337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
    <path d="M128.889 253.333L157.778 253.333V746.667H128.889V253.333Z" />
    <path d="M842.222 253.333H871.111V746.667H842.222V253.333Z" />
  </svg>
);

const teamMembers = [
  {
    name: "KarlaGod",
    role: "Founder",
    avatar: "/images/karlagod.jpg",
    bio: "Visionary behind Bitsave, obsessed with bringing accessible finance to everyone.",
    socials: {
      farcaster: "https://farcaster.xyz/karlagod",
      github: "https://github.com/karlagod",
      twitter: "https://twitter.com/_karlagod",
    }
  },
  {
    name: "Primidac",
    role: "Product Engineer",
    avatar: "/images/primidac.png",
    bio: "Building robust, scalable infrastructure that powers the bitsave ecosystem.",
    socials: {
      twitter: "https://twitter.com/primidac",
      github: "https://github.com/primidac",
    }
  },
  {
    name: "Abidemi Ademola",
    role: "CFO",
    avatar: "/images/abidemi.jpeg",
    bio: "Ensuring Bitsave's financial sustainability, compliance, and capital efficiency.",
    socials: {
      linkedin: "https://www.linkedin.com/in/abidemiademok21/",
    }
  },
  {
    name: "Xpan",
    role: "Blockchain Developer",
    avatar: "/images/xpan.jpg",
    bio: "Expert in smart contracts, protocols, and secure on-chain solutions.",
    socials: {
      twitter: "https://twitter.com/xpanvictor",
      github: "https://github.com/xpanvictor",
    }
  },
  {
    name: "Glory Wejinya",
    role: "Head of Operations",
    avatar: "/images/glory.jpg",
    bio: "Keeps the internal wheels turning, driving processes and day-to-day execution.",
    socials: {
      twitter: "https://x.com/gloorry_?t=nlvALCd1L77vnMy8_S2FmQ&s=09",
    }
  },
  {
    name: "Nissi Favour",
    role: "Community Manager",
    avatar: "/images/nissi.jpg",
    bio: "The voice of the community, fostering relationships and growing the Bitsave family.",
    socials: {
      twitter: "https://x.com/Fabulous_Nizzy?t=aLvp6VQJsr0YN3h0NCOzbA&s=09",
    }
  },
  {
    name: "Richard Essangabasi",
    role: "Marketing Lead",
    avatar: "/images/contentchief.jpg",
    bio: "Crafting narratives and campaigns that elevate the Bitsave brand globally.",
    socials: {
      twitter: "https://x.com/kingmessang_?t=4KV03kL52IQA8D6v-4sQQQ&s=09",
    }
  },
  {
    name: "Emmanuel Nwafor",
    role: "Software Engineer",
    avatar: "/images/emma.jpeg",
    bio: "Developing flawless user experiences with a keen eye for detail and performance.",
    socials: {
      twitter: "https://x.com/emmo0x00",
      farcaster: "https://farcaster.xyz/emmo00",
      github: "https://gitHub.com/emmo00",
    }
  },
  {
    name: "Godday",
    role: "Graphic Designer",
    avatar: "/images/og.png",
    bio: "Bringing creative vision to life with pixel-perfect design and modern aesthetics.",
    socials: {}
  }
];

export default function TeamsPage() {
  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 selection:bg-[#81D7B4] selection:text-white relative">
      <Header />
      
      {/* Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.4 }}></div>
      <div className="fixed top-0 inset-x-0 h-48 bg-gradient-to-b from-white to-transparent opacity-80 pointer-events-none z-0" />
      
      <main className="pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24 md:mb-32 text-center">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-[-20%] right-[20%] w-[400px] h-[400px] bg-[#81D7B4]/20 rounded-full blur-[120px] -z-10 pointer-events-none mix-blend-multiply" />
          <div className="absolute bottom-[-10%] left-[10%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply" />

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="max-w-4xl mx-auto flex flex-col items-center relative"
          >
            {/* Large Shadow Text */}
            <motion.div variants={fadeUp} className="absolute -top-10 md:-top-16 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0">
              <span className="text-7xl sm:text-8xl md:text-[9rem] font-black text-slate-900/[0.03] tracking-widest uppercase font-instrument whitespace-nowrap">
                OUR TEAM
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp} 
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-slate-900 mb-8 font-instrument relative z-10 mt-8 md:mt-12"
            >
              The minds behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4]">
                Bitsave
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl lg:text-2xl text-slate-500 leading-relaxed max-w-3xl font-medium"
            >
              We are a collective of dreamers, builders, and innovators dedicated to redefining on-chain finance. Passionate experts from across the globe united by a singular mission.
            </motion.p>
          </motion.div>
        </section>

        {/* TEAM GRID */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[85rem] mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-10 sm:pb-0 sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none no-scrollbar"
          >
            {teamMembers.map((member, idx) => (
              <motion.div 
                key={member.name}
                variants={fadeUp}
                className="group relative snap-center shrink-0 w-[280px] sm:w-auto sm:shrink sm:snap-align-none"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[1.5rem] p-5 flex flex-col hover:bg-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 h-full relative overflow-hidden">
                  
                  {/* Wavy line texture background */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6c10 0 10-6 20-6s10 6 20 6v6H0z' fill='%2394a3b8' fill-rule='evenodd'/%3E%3C/svg%3E\")", backgroundSize: '40px 12px' }}></div>

                  {/* Image Container */}
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-6 bg-slate-100 z-10">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      priority={idx < 4}
                      className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Social Links on Hover */}
                    {Object.keys(member.socials).length > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                        <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {member.socials.twitter && (
                            <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors shadow-sm">
                              <TwitterIcon className="w-5 h-5" />
                            </a>
                          )}
                          {member.socials.farcaster && (
                            <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors shadow-sm">
                              <FarcasterIcon className="w-5 h-5" />
                            </a>
                          )}
                          {member.socials.github && (
                            <a href={member.socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors shadow-sm">
                              <GithubIcon className="w-5 h-5" />
                            </a>
                          )}
                          {member.socials.linkedin && (
                            <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors shadow-sm">
                              <Linkedin01Icon className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="px-2 text-center flex-1 flex flex-col z-10 relative">
                    <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 font-instrument mb-1 group-hover:text-[#5fb392] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-[11px] lg:text-xs font-bold uppercase tracking-widest text-[#5fb392] mt-1 mb-4">
                      {member.role}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium mt-auto">
                      {member.bio}
                    </p>
                  </div>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
        {/* JOIN US SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-32 md:mt-40 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#81D7B4]/10 rounded-[100%] blur-[100px] -z-10 pointer-events-none mix-blend-multiply" />
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-white/60 backdrop-blur-2xl border border-slate-200/80 rounded-[2rem] p-12 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.03)]"
          >
            <motion.div variants={fadeUp} className="w-16 h-16 mx-auto bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#81D7B4] mb-8 shadow-inner">
              <Mail01Icon className="w-8 h-8" strokeWidth={1.5} />
            </motion.div>

            <motion.h2 
              variants={fadeUp} 
              className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6 font-instrument"
            >
              Want to join the mission?
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl mx-auto font-medium leading-relaxed"
            >
              We're always looking for brilliant minds to help build the future of decentralised savings. Let's create something amazing together.
            </motion.p>
            <motion.div variants={fadeUp}>
              <a 
                href="mailto:support@bitsave.io" 
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-bold text-base rounded-xl hover:from-[#6BC5A0] hover:to-[#5fb392] transition-all hover:-translate-y-1 shadow-lg hover:shadow-[0_15px_30px_rgba(129,215,180,0.3)] gap-2 group"
              >
                Reach Out to Us
              </a>
            </motion.div>
          </motion.div>
        </section>

      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
