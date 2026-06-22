'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { GithubIcon, Linkedin01Icon, TwitterIcon } from "hugeicons-react";
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
    <div className="min-h-screen bg-white text-gray-900 selection:bg-[#81D7B4] selection:text-white">
      <Header />
      
      <main className="pt-24 md:pt-32 pb-20 md:pb-32 overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-24 md:mb-32">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] bg-[#81D7B4]/8 rounded-full blur-[120px] -z-10 pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[0%] w-[300px] h-[300px] bg-[#5fb392]/8 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-8">
              <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
              <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">The Team</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp} 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight leading-[1.05] text-gray-900 mb-6 md:mb-8 font-display"
            >
              The minds behind <br />
              <span className="text-gradient-animated">
                Bitsave
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl lg:text-2xl text-gray-500 leading-relaxed max-w-2xl font-medium"
            >
              We are a collective of dreamers, builders, and innovators dedicated to redefining on-chain finance. Passionate experts from across the globe united by a singular mission.
            </motion.p>
          </motion.div>
        </section>

        {/* TEAM GRID */}
        <section className="px-0 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-8 sm:gap-y-16 sm:pb-0 sm:overflow-visible sm:snap-none no-scrollbar"
          >
            {teamMembers.map((member, idx) => (
              <motion.div 
                key={member.name}
                variants={fadeUp}
                className="group relative snap-center shrink-0 w-[280px] sm:w-auto sm:shrink sm:snap-align-none"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-gray-100 group-hover:shadow-xl group-hover:shadow-[#81D7B4]/10 transition-all duration-500">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    priority={idx < 4}
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Social Links on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    {member.socials.twitter && (
                      <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#0F1825] transition-colors">
                        <TwitterIcon className="w-5 h-5" />
                      </a>
                    )}
                    {member.socials.farcaster && (
                      <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#855DCD] transition-colors">
                        <FarcasterIcon className="w-5 h-5" />
                      </a>
                    )}
                    {member.socials.github && (
                      <a href={member.socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                        <GithubIcon className="w-5 h-5" />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-[#0A66C2] transition-colors">
                        <Linkedin01Icon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-display mb-1 group-hover:text-[#5fb392] transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1 mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
        
        {/* JOIN US SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-24 md:mt-32 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-[#81D7B4]/8 rounded-[100%] blur-[80px] -z-10 pointer-events-none" />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              variants={fadeUp} 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 md:mb-6 font-display"
            >
              Want to join the mission?
            </motion.h2>
            <motion.p 
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-500 mb-8 md:mb-10 max-w-2xl mx-auto"
            >
              We're always looking for brilliant minds to help build the future of decentralised savings.
            </motion.p>
            <motion.div variants={fadeUp}>
              <a 
                href="mailto:support@bitsave.io" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-bold text-lg rounded-full hover:from-[#6BC5A0] hover:to-[#5fb392] transition-all hover:-translate-y-1 shimmer-btn glow-pulse shadow-lg shadow-[#81D7B4]/20"
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
