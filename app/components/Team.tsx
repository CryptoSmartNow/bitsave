'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

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
    role: "Full Stack Developer",
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
    name: "Richard Essangabasi",
    role: "Marketing Lead",
    avatar: "/images/emma.jpeg",
    socials: {
      twitter: "https://x.com/emmo0x00",
      farcaster: "https://farcaster.xyz/emmo00",
      github: "https://gitHub.com/emmo00",
    }
  }

];

export default function Team() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }
    }
  }

  return (
    <section id="team" className="py-32 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white"></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-[#81D7B4]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#6bc4a1]/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, -40, 0],
            y: [0, 25, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#81D7B4]/10 to-[#6bc4a1]/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        ></motion.div>
        
        {/* Dynamic Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-${i % 2 === 0 ? '2' : '1'} h-${i % 2 === 0 ? '2' : '1'} bg-[#81D7B4]/${30 + i * 5} rounded-full`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i * 15) % 60}%`
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
          />
        ))}
        
        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-8 h-8 border-2 border-[#81D7B4]/30 rotate-45"
          animate={{
            rotate: [45, 405],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/5 w-6 h-6 bg-[#6bc4a1]/20 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      {/* Subtle Ambient Light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#81D7B4]/3 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Section Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4]"></div>
            <span className="text-sm font-medium text-gray-600 tracking-wide">Meet Our Team</span>
          </div>
          
          {/* Main Heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 tracking-tight leading-[1.1] font-system">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              The Minds Behind
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1]">
              BitSave
            </span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            A passionate team of DeFi experts and builders dedicated to revolutionizing crypto savings.
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={itemVariants}
              whileHover={{ 
                y: -12,
                scale: 1.03,
                rotateY: 5,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.97 }}
              className="group relative perspective-1000"
            >
              {/* Liquid Glass Card */}
              <div className="relative p-8 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-700 hover:shadow-[0_16px_64px_rgba(0,0,0,0.12)] hover:bg-white/60 hover:border-white/80 overflow-hidden">
                
                {/* Liquid Glass Effects */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  {/* Primary Glass Layer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-white/10"></div>
                  
                  {/* Subtle Brand Accent */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-[#6bc4a1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Noise Texture for Depth */}
                  <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.015] mix-blend-overlay"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Avatar */}
                  <div className="relative w-24 h-24 mx-auto mb-6 group/avatar">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white/20 backdrop-blur-sm border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-500 group-hover/avatar:shadow-[0_8px_32px_rgba(129,215,180,0.15)] group-hover/avatar:border-[#81D7B4]/30">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-105"
                      />
                      
                      {/* Subtle Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="text-center space-y-4">
                    {/* Name */}
                    <h3 className="text-xl font-semibold text-gray-900 tracking-tight leading-tight mb-2">
                      {member.name}
                    </h3>

                    {/* Role */}
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 backdrop-blur-sm">
                      <span className="text-sm font-medium text-[#81D7B4] tracking-wide">{member.role}</span>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center items-center gap-3 pt-2">
                      {Object.entries(member.socials).map(([platform, url]) => (
                        <motion.a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative group/social"
                          whileHover={{ 
                            scale: 1.15,
                            rotate: 5,
                            transition: { duration: 0.2, ease: "easeOut" }
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-9 h-9 rounded-xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center justify-center transition-all duration-300 hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(129,215,180,0.15)] hover:border-[#81D7B4]/30">
                            <div className="text-gray-600 group-hover/social:text-[#81D7B4] transition-colors duration-300">
                              {platform === 'twitter' && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                              )}
                              {platform === 'github' && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z"/>
                                </svg>
                              )}
                              {platform === 'farcaster' && (
                                <svg className="w-4 h-4" viewBox="0 0 1000 1000" fill="currentColor">
                                  <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333S337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
                                  <path d="M128.889 253.333L157.778 253.333V746.667H128.889V253.333Z"/>
                                  <path d="M842.222 253.333H871.111V746.667H842.222V253.333Z"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Hover Effects */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-[#6bc4a1]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                
                {/* Dynamic Glow Effect */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#81D7B4]/20 via-[#6bc4a1]/20 to-[#81D7B4]/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none"></div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl border border-[#81D7B4]/0 group-hover:border-[#81D7B4]/30 transition-all duration-500 pointer-events-none"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </section>
  );
}