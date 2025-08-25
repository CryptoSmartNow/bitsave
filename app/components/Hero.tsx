'use client'
import Image from 'next/image';
import { useEffect, useRef, memo } from 'react';
import Link from 'next/link';

const Hero = memo(function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const shimmerElementsRef = useRef<Array<{width: number, top: number, rotation: number, duration: number, delay: number}>>([]);

  // Initialize shimmer elements data with fixed values to avoid hydration mismatch
  useEffect(() => {
    // Only generate random values on the client side
    if (!shimmerElementsRef.current.length) {
      shimmerElementsRef.current = Array(10).fill(0).map(() => ({
        width: Math.random() * 100 + 50,
        top: Math.random() * 100,
        rotation: Math.random() * 180,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2
      }));
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const glowElements = heroRef.current.querySelectorAll('.hero-glow');
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      glowElements.forEach((glow, index: number) => {
        const glowElement = glow as HTMLElement;
        const offsetX = (x - 0.5) * (30 + index * 10);
        const offsetY = (y - 0.5) * (30 + index * 10);
        glowElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="pt-32 pb-20 px-4 md:px-8 lg:px-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f8fafa] to-[#f2f7f7]"></div>
      <div className="hero-glow w-[600px] h-[600px] opacity-30 top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-[#81D7B4]/20 blur-3xl rounded-full"></div>
      <div className="hero-glow w-[500px] h-[500px] opacity-20 bottom-0 left-0 transform -translate-x-1/3 translate-y-1/3 bg-[#81D7B4]/20 blur-3xl rounded-full"></div>
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(129, 215, 180, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 215, 180, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Hero text */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="relative">
                {/* Decorative doodles */}
                <div className="absolute -top-8 -left-4 w-16 h-16 opacity-20">
                   <svg viewBox="0 0 64 64" className="w-full h-full text-[#81D7B4] animate-spin" style={{animationDuration: '20s'}}>
                     <polygon points="32,8 40,24 56,24 44,36 48,52 32,44 16,52 20,36 8,24 24,24" fill="currentColor"/>
                   </svg>
                 </div>
                 <div className="absolute -top-4 -right-8 w-12 h-12 opacity-30">
                   <svg viewBox="0 0 48 48" className="w-full h-full text-blue-400 animate-bounce" style={{animationDelay: '1s'}}>
                     <rect x="12" y="12" width="24" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                     <rect x="18" y="18" width="12" height="12" rx="2" fill="currentColor"/>
                   </svg>
                 </div>
                 <div className="absolute top-16 -left-8 w-8 h-8 opacity-25">
                   <svg viewBox="0 0 32 32" className="w-full h-full text-blue-500 animate-pulse">
                     <path d="M16 4l4 8h8l-6 6 2 8-8-4-8 4 2-8-6-6h8z" fill="currentColor"/>
                   </svg>
                 </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight relative z-10">
                   <span className="relative inline-block bg-gradient-to-r from-[#81D7B4] via-blue-500 to-[#81D7B4] bg-clip-text text-transparent">
                     Save Smarter with
                     {/* Web3 blockchain nodes */}
                     <div className="absolute -top-2 left-1/4 w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                     <div className="absolute -top-1 right-1/4 w-2 h-2 bg-[#81D7B4] rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                   </span>
                   <span className="block text-[#81D7B4] relative">
                     BitSave
                     <div className="absolute -inset-1 bg-[#81D7B4]/10 blur-xl rounded-lg -z-10"></div>
                     {/* Web3 symbols */}
                     <div className="absolute -right-8 top-2 text-2xl opacity-30 animate-bounce" style={{animationDelay: '2s'}}>⛓️</div>
                     <div className="absolute -left-6 -top-2 text-xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}>🔗</div>
                   </span>
                 </h1>
              </div>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
               Bitsave Protocol helps you save and earn in Crypto without losing your savings to Crypto Market volatility.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard"
                prefetch={true}
                className="group relative px-8 py-4 bg-[#81D7B4] text-white font-semibold rounded-xl hover:bg-[#6bc49f] transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden inline-flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4] to-[#6bc49f] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  Open App
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <button 
                onClick={() => window.open('https://youtube.com/shorts/CWRQ7rgtHzU?si=xd8ia_IQyonxOXFM', '_blank')}
                className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all duration-300 transform hover:scale-105"
              >
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">Secure</div>
                <div className="text-sm text-gray-600">& Fast</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">Low</div>
                <div className="text-sm text-gray-600">Fees</div>
              </div>
            </div>
          </div>

          {/* Right side - Bitsave Dashboard */}
           <div className="relative">
             {/* Bitsave Dashboard Container */}
             <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl p-8 shadow-2xl border border-gray-200/50 overflow-hidden">
               {/* Animated background grid */}
               <div className="absolute inset-0 opacity-[0.03]">
                 <div className="w-full h-full" style={{
                   backgroundImage: `
                     linear-gradient(rgba(129, 215, 180, 0.3) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(129, 215, 180, 0.3) 1px, transparent 1px)
                   `,
                   backgroundSize: '20px 20px',
                   animation: 'gridPulse 4s ease-in-out infinite'
                 }}></div>
               </div>

               {/* Floating particles */}
               <div className="absolute inset-0 overflow-hidden">
                 {[...Array(6)].map((_, i) => (
                   <div
                     key={i}
                     className="absolute w-2 h-2 bg-[#81D7B4] rounded-full opacity-20"
                     style={{
                       left: `${20 + i * 15}%`,
                       top: `${10 + i * 12}%`,
                       animation: `float ${3 + i * 0.5}s ease-in-out infinite ${i * 0.5}s`
                     }}
                   />
                 ))}
               </div>

               {/* Dashboard Header */}
               <div className="relative z-10 mb-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-gray-900 font-bold text-xl">Bitsave Dashboard</h3>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-pulse"></div>
                     <span className="text-[#81D7B4] text-sm font-medium">Multi-chain</span>
                   </div>
                 </div>
                 <div className="text-gray-600 text-sm">Smart savings across multiple blockchains</div>
               </div>

               {/* Savings Categories */}
               <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                 {/* Rent Savings */}
                 <div className="bg-gradient-to-br from-[#81D7B4]/10 to-green-100/50 border border-[#81D7B4]/20 rounded-xl p-4 hover:scale-105 transition-all duration-300">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 bg-[#81D7B4] rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                       </svg>
                     </div>
                     <div>
                       <div className="text-gray-900 font-semibold text-sm">Rent Savings</div>
                       <div className="text-[#81D7B4] text-xs">Active</div>
                     </div>
                   </div>
                   <div className="text-gray-900 text-lg font-bold">$1,250</div>
                   <div className="text-gray-600 text-xs">Monthly target: $1,500</div>
                 </div>

                 {/* Car Savings */}
                 <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 border border-blue-200/50 rounded-xl p-4 hover:scale-105 transition-all duration-300">
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                       <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                         <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z"/>
                       </svg>
                     </div>
                     <div>
                       <div className="text-gray-900 font-semibold text-sm">Car Savings</div>
                       <div className="text-blue-500 text-xs">Active</div>
                     </div>
                   </div>
                   <div className="text-gray-900 text-lg font-bold">$2,100</div>
                   <div className="text-gray-600 text-xs">Target: $25,000</div>
                 </div>
               </div>

               {/* Total Savings */}
               <div className="relative z-10 bg-gray-50/50 rounded-xl p-4 mb-4 border border-gray-200/30">
                 <div className="flex items-center justify-between mb-3">
                   <span className="text-gray-900 font-medium text-sm">Total Savings</span>
                   <span className="text-[#81D7B4] font-bold">$3,350</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                   <div className="bg-gradient-to-r from-[#81D7B4] to-blue-500 h-2 rounded-full" style={{width: '75%', animation: 'fillProgress 2s ease-out'}}></div>
                 </div>
                 <div className="text-gray-600 text-xs">Progress towards goals</div>
               </div>

               {/* Recent Activity */}
               <div className="relative z-10 space-y-2">
                 <div className="text-gray-900 font-medium text-sm mb-2">Recent Activity</div>
                 {[
                   { action: 'Top Up', amount: '+$200', time: '2m ago', color: 'text-[#81D7B4]' },
                   { action: 'Save', amount: '+$150', time: '1h ago', color: 'text-blue-500' },
                   { action: 'Withdraw', amount: '-$50', time: '3h ago', color: 'text-orange-500' }
                 ].map((activity, i) => (
                   <div key={i} className="flex items-center justify-between py-2 px-3 bg-white/50 rounded-lg border border-gray-200/30">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-[#81D7B4] rounded-full animate-pulse"></div>
                       <span className="text-gray-700 text-xs">{activity.action}</span>
                     </div>
                     <div className="text-right">
                       <div className={`${activity.color} text-xs font-medium`}>{activity.amount}</div>
                       <div className="text-gray-500 text-xs">{activity.time}</div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

            {/* Floating Savings Elements */}
             <div className="absolute -top-4 -right-4 bg-gradient-to-br from-[#81D7B4] to-green-500 rounded-xl p-3 shadow-lg border border-[#81D7B4]/30 animate-bounce">
               <div className="text-white text-xs font-bold">Smart Save</div>
               <div className="text-white/80 text-xs">Funds Locked</div>
             </div>

             <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-[#81D7B4] to-green-500 rounded-xl p-3 shadow-lg border border-[#81D7B4]/30" style={{animation: 'float 3s ease-in-out infinite 1s'}}>
               <div className="text-white text-xs font-bold">Goal Reached</div>
               <div className="text-white/80 text-xs">Rent Fund</div>
             </div>
          </div>
        </div>

        {/* Supported Chains Section */}
        <div className="mt-20 text-center">
          <div className="relative">
            {/* Enhanced background with geometric patterns */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#81D7B4]/5 to-transparent rounded-3xl"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full" style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(129, 215, 180, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(129, 215, 180, 0.1) 0%, transparent 50%)
                `,
                backgroundSize: '100px 100px'
              }}></div>
            </div>
            
            <div className="relative z-10 py-16 px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Supported Ecosystems
              </h2>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                Seamlessly save and earn across multiple blockchain networks with our unified platform
              </p>
              
              {/* Enhanced ecosystem cards */}
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Celo Card */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  {/* Enhanced background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-200/20 to-green-200/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    {/* Larger logo container */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Image 
                        src="/celo.png" 
                        alt="Celo" 
                        width={40} 
                        height={40}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Celo Network</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Mobile-first blockchain platform focused on financial inclusion and accessibility
                    </p>
                    
                    {/* Modern status indicator */}
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-semibold text-sm">Active</span>
                      </div>
                      <div className="text-gray-500 text-sm">Secure & Fast</div>
                    </div>
                  </div>
                </div>

                {/* Base Card */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  {/* Enhanced background effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    {/* Larger logo container */}
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Image 
                        src="/base.svg" 
                        alt="Base" 
                        width={40} 
                        height={40}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Base Network</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Ethereum L2 solution built by Coinbase for secure, low-cost transactions
                    </p>
                    
                    {/* Modern status indicator */}
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-700 font-semibold text-sm">Live</span>
                      </div>
                      <div className="text-gray-500 text-sm">Low Fees</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 75%; }
        }
      `}</style>
    </section>
  );
})

export default Hero;