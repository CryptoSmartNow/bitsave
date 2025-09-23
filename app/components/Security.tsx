'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import OptimizedSection from './OptimizedSection';

export default function Security() {
  const securityFeatures = [
    {
      title: "Simple UX Design",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-primary">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      description: "Intuitive interface designed for both Web3 natives and newcomers."
    },
    {
      title: "Goal-Based Locked Savings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-secondary">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      description: "Set savings goals and lock your funds until you reach them."
    },
    {
      title: "Earn $BTS Tokens on Savings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-primary">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.171-2.303 0-3.182C10.582 7.72 11.35 7.5 12 7.5c.725 0 1.45.22 2.003.659" />
        </svg>
      ),
      description: "Get rewarded with $BTS tokens for consistent saving habits."
    },
    {
      title: "Secured with Child-Parent Contract",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-secondary">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
      ),
      description: "Enhanced security through our innovative contract structure."
    }
  ];

  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  
  // Clone features for infinite scroll effect on mobile
  const duplicatedFeatures = [...securityFeatures, ...securityFeatures];
  
  // Continuous smooth scroll animation for mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    if (!isMobile || isHovering) return;
    
    let animationFrameId: number;
    let scrollPos = 0;
    const scrollSpeed = 1; // Adjust for faster/slower scroll
    
    const animate = () => {
      if (!carouselRef.current) return;
      
      scrollPos += scrollSpeed;
      const maxScroll = (300 + 24) * securityFeatures.length; // card width + gap
      
      if (scrollPos >= maxScroll) {
        scrollPos = 0;
        carouselRef.current.scrollLeft = 0;
      } else {
        carouselRef.current.scrollLeft = scrollPos;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovering, securityFeatures.length]);

  return (
    <OptimizedSection id="security" className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-gradient-to-b from-white to-[#f8fafa]">
      {/* Enhanced cybersecurity background elements */}
      <div className="absolute inset-0 -z-10 bg-[url('/grain-texture.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 -z-10 bg-[url('/circuit-pattern.svg')] opacity-[0.02] pointer-events-none"></div>
      <div className="absolute -z-10 w-[600px] h-[600px] bg-[#81D7B4]/10 rounded-full blur-[100px] top-1/4 right-0 transform translate-x-1/3 animate-pulse-slow"></div>
      <div className="absolute -z-10 w-[500px] h-[500px] bg-[#81D7B4]/10 rounded-full blur-[100px] bottom-0 left-0 transform -translate-x-1/3 animate-pulse-slow-delayed"></div>
      
      {/* Digital code rain effect - lighter version */}
      <div className="absolute inset-0 -z-5 overflow-hidden opacity-5 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => {
          const height = 100 + (i * 15) % 300;
          const left = (i * 5) % 100;
          const opacity = 0.2 + ((i * 7) % 70) / 100;
          const duration = 5 + ((i * 11) % 15);
          const delay = (i * 0.25) % 5;
          
          return (
            <div 
              key={i}
              className="absolute w-px bg-gradient-to-b from-[#81D7B4]/0 via-[#81D7B4]/40 to-[#81D7B4]/0"
              style={{
                height: `${height}px`,
                left: `${left}%`,
                top: `-100px`,
                opacity,
                animation: `code-rain ${duration}s linear infinite ${delay}s`,
              }}
            ></div>
          );
        })}
      </div>
      
      {/* Floating particles - lighter version */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          const top = (i * 7) % 100;
          const left = (i * 6) % 100;
          const opacity = 0.3 + ((i * 3) % 30) / 100;
          const duration = 8 + ((i * 4) % 12);
          const delay = (i * 0.33) % 5;
          
          return (
            <div 
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#81D7B4]/40" 
              style={{
                top: `${top}%`,
                left: `${left}%`,
                opacity,
                animation: `float-particle ${duration}s ease-in-out infinite ${delay}s`,
              }}
            ></div>
          );
        })}
      </div>
      
      <div className="container mx-auto font-space-grotesk">
        {/* Problems Section */}
        <div 
          className="text-center mb-20 animate-fade-in-up"
        >
          {/* Enhanced badge with glow effect */}
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(129,215,180,0.2)] mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/20 to-[#81D7B4]/0 animate-shimmer"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 animate-shimmer-slow"></div>
            
            <div className="w-3 h-3 rounded-full bg-[#81D7B4] animate-pulse relative z-10"></div>
            <span className="text-sm font-semibold text-[#81D7B4] uppercase tracking-wider relative z-10">Today&#39;s Problems</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
              Today&#39;s Savings Problems
            </span>
          </h2>
        
          {/* Problems Content */}
          <div className="glass-card p-6 sm:p-8 md:p-10 rounded-3xl relative overflow-hidden group animate-scale-in mt-12">
            {/* Enhanced Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent backdrop-blur-xl"></div>
            <div className="absolute inset-0 bg-[#81D7B4]/5 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
            
            {/* Animated Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#81D7B4]/20 to-transparent"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#81D7B4]/20 to-transparent"></div>
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#81D7B4]/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '-2s' }}></div>
              
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto">
              {/* Grid Container */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Ifeanyi */}
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#81D7B4]/20 group/section hover:bg-white/50 transition-all duration-500">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Image 
                        src="/images/savings-problems/ifeanyi-avatar.svg" 
                        alt="Ifeanyi" 
                        width={80}
                        height={80}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl shadow-lg relative transform group-hover:scale-105 transition-all duration-300"
                      />
              </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Ifeanyi is a</h3>
                      <span className="inline-block mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#81D7B4]/10 rounded-full text-[#81D7B4] font-medium text-sm sm:text-base border border-[#81D7B4]/20 shadow-sm transform hover:scale-105 transition-all duration-300">
                        web3 User
                      </span>
                    </div>
                  </div>

                  {/* Problems Grid */}
                  <div className="space-y-4 sm:space-y-6">
                    {[1, 2, 3].map((num) => (
                      <div 
                        key={num}
                        className="group/card relative transform hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${num * 0.1}s` }}
                      >
                        {/* Card Container */}
                        <div className="relative p-6 rounded-xl overflow-hidden">
                          {/* Glassmorphic Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-md"></div>
                          
                          {/* Border Gradient */}
                          <div className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-[#81D7B4]/30 via-[#81D7B4]/10 to-transparent">
                            <div className="h-full w-full rounded-xl bg-white/40"></div>
              </div>
              
                          {/* Content */}
                          <div className="relative">
                            {/* Problem Number */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg transform group-hover/card:scale-150 transition-transform duration-700 opacity-0 group-hover/card:opacity-100"></div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative shadow-sm border border-red-100">
                                  <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">Problem {num}</h4>
                                <div className="h-0.5 w-8 bg-gradient-to-r from-red-500/30 to-transparent rounded-full mt-1 transform origin-left group-hover/card:scale-x-150 transition-transform duration-500"></div>
              </div>
            </div>
            
                            {/* Problem Text */}
                            <p className="text-gray-600 leading-relaxed">
                              {num === 1 && "Ifeanyi earns from his Web3 job and wants to save onchain, but there aren't any savings protocols—only investments protocols (DeFi)."}
                              {num === 2 && "If Ifeanyi saves with a DeFi protocol, he'll have to deal with complex DeFi UX and also lose his savings to market volatility."}
                              {num === 3 && "Ifeanyi also doesn't want to get tempted to touch his rent savings, by risking it in a degen trade to make a quick 2x."}
                            </p>
              </div>
                </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Rukevwe */}
                <div className="relative p-6 sm:p-8 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#81D7B4]/20 group/section hover:bg-white/50 transition-all duration-500">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-10">
                    <div className="relative group shrink-0">
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <Image 
                        src="/images/savings-problems/rukevwe-avatar.svg" 
                        alt="Rukevwe" 
                        width={80}
                        height={80}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl shadow-lg relative transform group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  <div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">Rukevwe</h3>
                      <span className="inline-block mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#81D7B4]/10 rounded-full text-[#81D7B4] font-medium text-sm sm:text-base border border-[#81D7B4]/20 shadow-sm transform hover:scale-105 transition-all duration-300">
                        saves with banks
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {[1, 2, 3].map((num) => (
                      <div 
                        key={num}
                        className="animate-fade-in-up group/card relative transform hover:-translate-y-1 transition-all duration-300"
                        style={{ animationDelay: `${num * 0.1}s` }}
                      >
                        {/* Card Container */}
                        <div className="relative p-6 rounded-xl overflow-hidden">
                          {/* Glassmorphic Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-md"></div>
                          
                          {/* Border Gradient */}
                          <div className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-[#81D7B4]/30 via-[#81D7B4]/10 to-transparent">
                            <div className="h-full w-full rounded-xl bg-white/40"></div>
                          </div>
                          
                          {/* Content */}
                          <div className="relative">
                            {/* Problem Number */}
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-lg transform group-hover/card:scale-150 transition-transform duration-700 opacity-0 group-hover/card:opacity-100"></div>
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative shadow-sm border border-red-100">
                                  <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">Problem {num}</h4>
                                <div className="h-0.5 w-8 bg-gradient-to-r from-red-500/30 to-transparent rounded-full mt-1 transform origin-left group-hover/card:scale-x-150 transition-transform duration-500"></div>
                              </div>
                            </div>
                            
                            {/* Problem Text */}
                            <p className="text-gray-600 leading-relaxed">
                              {num === 1 && "Rukevwe wants to avoid the Inflation on her local currency and the devaluation that affects her savings"}
                              {num === 2 && "She tried to save in dollars through her banks but she needed to have at least $100 to begin, and the fees were expensive."}
                              {num === 3 && "Her friend told her about using DeFi protocols, but she couldn't understand the UX."}
                            </p>
                  </div>
                </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions Section */}
        <div 
          className="text-center mb-20 animate-fade-in-up"
        >
          {/* Enhanced badge with glow effect */}
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(129,215,180,0.2)] mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/20 to-[#81D7B4]/0 animate-shimmer"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 animate-shimmer-slow"></div>
            
            <div className="w-3 h-3 rounded-full bg-[#81D7B4] animate-pulse relative z-10"></div>
            <span className="text-sm font-semibold text-[#81D7B4] uppercase tracking-wider relative z-10">The Solution</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
              The Bitsave Solution
            </span>
          </h2>
        </div>

        {/* Features Strip - Auto-scrolling Carousel */}
        <div className="hidden lg:grid grid-cols-4 gap-6 mb-12">
          {securityFeatures.map((feature, index) => (
            <div
              key={`desktop-${index}`}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Container */}
              <div className="relative h-full p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-[#81D7B4]/20 transition-all duration-500 group-hover:translate-y-[-2px] overflow-hidden">
                {/* Decorative SVG Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.07] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-45">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" />
                  </svg>
                </div>
                
                {/* Corner Patterns */}
                <div className="absolute top-0 left-0 w-16 h-16 opacity-[0.07] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <pattern id={`grid-${index}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="1" fill="currentColor" className="text-[#81D7B4]" />
                    </pattern>
                    <rect width="100" height="100" fill={`url(#grid-${index})`} />
                </svg>
              </div>
              
                {/* Bottom Right Circuit Pattern */}
                <div className="absolute bottom-0 right-0 w-20 h-20 opacity-[0.07] pointer-events-none transform rotate-45">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M10,50 L90,50 M50,10 L50,90 M30,30 L70,70 M70,30 L30,70" 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          className="text-[#81D7B4]" 
                          fill="none"
                          strokeDasharray="5,5" />
                  </svg>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                     style={{
                       background: 'linear-gradient(90deg, transparent, rgba(129,215,180,0.3), transparent)',
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite'
                     }}
                ></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#81D7B4]/20 rounded-xl blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="text-[#81D7B4] transform group-hover:scale-110 transition-transform duration-500">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                 
                  {/* Title */}
                  <div className="relative mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/30 rounded-full transform origin-left group-hover:w-full transition-all duration-700"></div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                {/* Hover Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-2xl pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('/grain-texture.png')] opacity-[0.03] mix-blend-overlay rounded-2xl pointer-events-none"></div>
              </div>
            </div>
          ))}
            </div>
            
        {/* Features - Mobile Continuous Scroll */}
        <div className="lg:hidden relative overflow-hidden">
          <div 
            ref={carouselRef}
            className="flex gap-6 pb-12 overflow-x-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onTouchStart={() => setIsHovering(true)}
            onTouchEnd={() => setIsHovering(false)}
            style={{
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Duplicate features for seamless loop */}
            {duplicatedFeatures.map((feature, index) => (
              <div
                key={`mobile-${index}`}
                className="relative w-[300px] flex-shrink-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Use the same card content as desktop */}
                <div className="relative h-full p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-[#81D7B4]/20 transition-all duration-500 group-hover:translate-y-[-2px]">
                  {/* Decorative SVG Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.07] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-45">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" />
                    </svg>
                  </div>
                  
                  {/* Corner Patterns */}
                  <div className="absolute top-0 left-0 w-16 h-16 opacity-[0.07] pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <pattern id={`grid-${index}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="1" fill="currentColor" className="text-[#81D7B4]" />
                      </pattern>
                      <rect width="100" height="100" fill={`url(#grid-${index})`} />
                    </svg>
                  </div>

                  {/* Bottom Right Circuit Pattern */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-[0.07] pointer-events-none transform rotate-45">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path d="M10,50 L90,50 M50,10 L50,90 M30,30 L70,70 M70,30 L30,70" 
                            stroke="currentColor" 
                            strokeWidth="1" 
                            className="text-[#81D7B4]" 
                            fill="none"
                            strokeDasharray="5,5" />
                    </svg>
                  </div>

                  {/* Animated Border */}
                  <div className="absolute inset-[-1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                       style={{
                         background: 'linear-gradient(90deg, transparent, rgba(129,215,180,0.3), transparent)',
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 2s infinite'
                       }}
                  ></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-[#81D7B4]/20 rounded-xl blur-xl transform group-hover:scale-150 transition-transform duration-700"></div>
                      <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="text-[#81D7B4] transform group-hover:scale-110 transition-transform duration-500">
                          {feature.icon}
                        </div>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div className="relative mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <div className="h-0.5 w-12 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/30 rounded-full transform origin-left group-hover:w-full transition-all duration-700"></div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Opportunity Section */}
        <div 
          className="mt-32 mb-24 animate-fade-in-up"
        >
          {/* Enhanced badge with glow effect */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(129,215,180,0.2)] mx-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/20 to-[#81D7B4]/0 animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 animate-shimmer-slow"></div>
              
              <div className="w-3 h-3 rounded-full bg-[#81D7B4] animate-pulse relative z-10"></div>
              <span className="text-sm font-semibold text-[#81D7B4] uppercase tracking-wider relative z-10">Market Opportunity</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
                The SaveFi Market Opportunity
              </span>
            </h2>
          </div>

          {/* Main Content Container */}
          <div className="mt-12 relative">
            {/* Neomorphic Background with Web3 Elements */}
            <div className="absolute inset-0 bg-[#f8fafa] rounded-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"></div>
            <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-[0.03] mix-blend-overlay"></div>
            
            {/* Floating Elements */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#81D7B4]/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#81D7B4]/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '-2s' }}></div>
            
            {/* Content Grid */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Left Column - Main Text */}
              <div className="space-y-8">
                {/* Intro Text Card */}
                <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-[#81D7B4]/20 shadow-lg relative overflow-hidden group hover:bg-white/70 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <p className="text-lg md:text-xl text-gray-800 leading-relaxed relative z-10">
                    Web3 already has DeFi, Bitsave introduces <span className="font-bold text-[#81D7B4]">SaveFi</span>, a trend that normalizes onchain savings rather than onchain investments.
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Stat Card 1 */}
                  <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#81D7B4]/20 relative group hover:bg-white/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-[#81D7B4] mb-3">70%+</div>
                      <p className="text-gray-600">of onchain users engage in frequent trading, with no structured savings behavior.</p>
                    </div>
                  </div>

                  {/* Stat Card 2 */}
                  <div className="p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-[#81D7B4]/20 relative group hover:bg-white/50 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="text-4xl font-bold text-[#81D7B4] mb-3">60%+</div>
                      <p className="text-gray-600">of Web3 income earners admit to dipping into savings meant for essentials like <span className="font-semibold">rent, tuition, or bills</span>.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Additional Stats */}
              <div className="space-y-8">
                {/* Market Size Card */}
                <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-[#81D7B4]/20 relative group hover:bg-white/70 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Market Size</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      <span className="font-bold text-[#81D7B4]">190,000+</span> people currently earn from web3 jobs, but no onchain Savings protocol exists in web3 to serve them.
                    </p>
                  </div>
                </div>
                
                {/* Adoption Card */}
                <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-xl border border-[#81D7B4]/20 relative group hover:bg-white/70 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Stablecoin Adoption</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Stable coins are getting increased adoption in web2 spaces and African regions like Shopify enabling USDC payments. The next urgent need is not spending tools, but <span className="font-semibold text-[#81D7B4]">savings tools</span>.
                    </p>
                  </div>
                </div>

                {/* Conclusion Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#81D7B4] to-[#81D7B4]/80 relative group">
                  <div className="absolute inset-0 bg-[url('/grain-texture.png')] opacity-[0.1] mix-blend-overlay"></div>
                  <p className="text-white font-semibold text-lg relative z-10">
                    Bitsave fills this gap by offering SaveFi
                  </p>
                </div>
                </div>
              </div>
            </div>
          </div>
      </div>
  </OptimizedSection>
  )
}