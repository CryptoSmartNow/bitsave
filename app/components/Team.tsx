'use client';

import { GithubIcon, Linkedin01Icon, TwitterIcon } from "hugeicons-react";
import { motion } from 'framer-motion'
import Image from 'next/image'

// Custom Farcaster Icon
const FarcasterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333S337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
    <path d="M128.889 253.333L157.778 253.333V746.667H128.889V253.333Z" />
    <path d="M842.222 253.333H871.111V746.667H842.222V253.333Z" />
  </svg>
)

const teamMembers = [
  {
    name: "KarlaGod",
    role: "Founder",
    avatar: "/images/karlagod.jpg",
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
    socials: {
      twitter: "https://twitter.com/primidac",
      github: "https://github.com/primidac",
    }
  },
  {
    name: "Abidemi Ademola",
    role: "CFO",
    avatar: "/images/abidemi.jpeg",
    socials: {
      linkedin: "https://www.linkedin.com/in/abidemiademok21/",
    }
  },
  {
    name: "Xpan",
    role: "Blockchain Developer",
    avatar: "/images/xpan.jpg",
    socials: {
      twitter: "https://twitter.com/xpanvictor",
      github: "https://github.com/xpanvictor",
    }
  },
  {
    name: "Glory Wejinya",
    role: "Head of Operations",
    avatar: "/images/glory.jpg",
    socials: {
      twitter: "https://x.com/gloorry_?t=nlvALCd1L77vnMy8_S2FmQ&s=09",
    }
  },
  {
    name: "Nissi Favour",
    role: "Community Manager",
    avatar: "/images/nissi.jpg",
    socials: {
      twitter: "https://x.com/Fabulous_Nizzy?t=aLvp6VQJsr0YN3h0NCOzbA&s=09",
    }
  },
  {
    name: "Richard Essangabasi",
    role: "Marketing Lead",
    avatar: "/images/contentchief.jpg",
    socials: {
      twitter: "https://x.com/kingmessang_?t=4KV03kL52IQA8D6v-4sQQQ&s=09",
    }
  },
  {
    name: "Emmanuel Nwafor",
    role: "Software Engineer",
    avatar: "/images/emma.jpeg",
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
    socials: {}
  }
];

export default function Team() {
  return (
    <section id="team" className="section-lazy py-24 md:py-32 relative bg-[#f8fafc] overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.5 }}></div>
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent opacity-80" />
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[85rem] relative z-20">

        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 backdrop-blur-md mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#81D7B4] shadow-[0_0_8px_#81D7B4]"></span>
            <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">The Team</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-instrument text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6"
          >
            Meet the minds behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5fb392] to-[#81D7B4]">Bitsave</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium"
          >
            Passionate experts from across the globe, united by a mission to make onchain savings accessible, secure, and rewarding for everyone.
          </motion.p>
        </div>

        {/* Grid / Carousel on Mobile */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-10 sm:pb-0 sm:mx-0 sm:px-0 sm:overflow-visible sm:snap-none no-scrollbar">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group snap-center shrink-0 w-[280px] sm:w-auto sm:shrink sm:snap-align-none"
            >
              <div className="bg-white/70 backdrop-blur-xl border border-slate-200/80 rounded-[2.5rem] p-4 flex flex-col hover:bg-white hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-500 hover:-translate-y-2 h-full">

                {/* Avatar Container */}
                <div className="relative mb-6 overflow-hidden rounded-[2rem] aspect-square bg-slate-100">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Overlay Socials */}
                  {Object.keys(member.socials).length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {member.socials.twitter && (
                          <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors">
                            <TwitterIcon className="w-5 h-5" />
                          </a>
                        )}
                        {member.socials.farcaster && (
                          <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors">
                            <FarcasterIcon className="w-5 h-5" />
                          </a>
                        )}
                        {member.socials.github && (
                          <a href={member.socials.github} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors">
                            <GithubIcon className="w-5 h-5" />
                          </a>
                        )}
                        {member.socials.linkedin && (
                          <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#81D7B4] hover:text-white transition-colors">
                            <Linkedin01Icon className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 pb-4 text-center">
                  <h3 className="font-instrument text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-sm font-bold text-[#5fb392] uppercase tracking-wider">{member.role}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}