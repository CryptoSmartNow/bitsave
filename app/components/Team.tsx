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
    <section id="team" className="py-32 px-4 md:px-8 lg:px-16 relative bg-[#FAFAFA]">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <span className="px-5 py-2.5 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-900 shadow-sm uppercase tracking-wider">
              Our Team
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-8"
          >
            Built by <span className="text-[#81D7B4]">Builders</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-xl max-w-3xl mx-auto leading-relaxed font-light"
          >
            Passionate experts from across the globe, united by a mission to make onchain savings accessible, secure, and rewarding for everyone.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex flex-col items-center text-center">

                {/* Avatar Container */}
                <div className="relative mb-6">
                  <div className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:-translate-y-2">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Decorative faint ring */}
                  <div className="absolute inset-0 rounded-full border border-gray-900/5 scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-sm font-semibold text-[#81D7B4] uppercase tracking-widest mb-4">{member.role}</p>

                {/* Socials - Minimal */}
                <div className="flex gap-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  {member.socials.twitter && (
                    <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" title="X (Twitter)">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {member.socials.farcaster && (
                    <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#8465CB] transition-colors" title="Farcaster">
                      <FarcasterIcon className="w-5 h-5" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-black transition-colors" title="GitHub">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#0077b5] transition-colors" title="LinkedIn">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}