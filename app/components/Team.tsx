'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, Linkedin, Globe, MessageSquare } from 'lucide-react'

// Custom Farcaster Icon since it's not in Lucide
const FarcasterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 1000 1000" fill="currentColor">
    <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333S337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
    <path d="M128.889 253.333L157.778 253.333V746.667H128.889V253.333Z" />
    <path d="M842.222 253.333H871.111V746.667H842.222V253.333Z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    <section id="team" className="py-24 px-4 md:px-8 lg:px-16 relative bg-white">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#81D7B4]"></div>
            <span className="text-sm font-semibold text-gray-600 tracking-wide uppercase">The Builders</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
          >
            Meet the <span className="text-[#81D7B4]">Team</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Passionate builders and DeFi experts dedicated to making onchain savings accessible to everyone.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#81D7B4]/30 transition-all duration-300 flex flex-col items-center text-center">

                {/* Avatar */}
                <div className="w-24 h-24 mb-6 relative">
                  <div className="absolute inset-0 bg-[#81D7B4]/20 rounded-full blur-xl group-hover:bg-[#81D7B4]/40 transition-colors opacity-0 group-hover:opacity-100" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-[#81D7B4] font-medium text-sm mb-4">{member.role}</p>

                {/* Socials */}
                <div className="flex gap-3 justify-center mt-auto pt-4 border-t border-gray-50 w-full">
                  {member.socials.twitter && (
                    <a href={member.socials.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-black hover:bg-black/5 transition-colors" title="X (Formerly Twitter)">
                      <XIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.farcaster && (
                    <a href={member.socials.farcaster} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-[#8465CB] hover:bg-[#8465CB]/10 transition-colors" title="Farcaster">
                      <FarcasterIcon className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors" title="GitHub">
                      <Github className="w-4 h-4" />
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