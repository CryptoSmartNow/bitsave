'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, Linkedin, Twitter } from 'lucide-react'

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
  }
];

export default function Team() {
  return (
    <section id="team" className="py-16 md:py-24 lg:py-32 px-4 md:px-8 relative bg-white">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-24 md:mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="w-12 h-[1px] bg-[#81D7B4]"></span>
            <span className="text-sm font-bold text-[#81D7B4] tracking-widest uppercase">The Team</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight max-w-4xl mb-6">
            Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#81D7B4] to-[#5fb392]">Builders</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Passionate experts from across the globe, united by a mission to make onchain savings accessible, secure, and rewarding for everyone.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 md:gap-y-24">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex flex-col">

                {/* Avatar Container */}
                <div className="relative mb-8 overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Overlay Socials */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {member.socials.twitter && (
                        <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {member.socials.farcaster && (
                        <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
                          <FarcasterIcon className="w-5 h-5" />
                        </a>
                      )}
                      {member.socials.github && (
                        <a href={member.socials.github} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {member.socials.linkedin && (
                        <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[#81D7B4] transition-colors">{member.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{member.role}</p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}