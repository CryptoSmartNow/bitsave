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
    <section ref={heroRef} className="min-h-[100svh] flex items-center justify-center px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-16 pt-16 xs:pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 relative overflow-hidden">
      {/* Modern Minimalist Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#81D7B4]/3 via-transparent to-blue-500/3"></div>
      </div>
      
      {/* Subtle Ambient Glow */}
      <div className="hero-glow absolute w-[600px] h-[600px] opacity-10 top-1/4 right-1/4 bg-gradient-to-br from-[#81D7B4]/20 to-blue-500/15 blur-3xl rounded-full"></div>
      <div className="hero-glow absolute w-[500px] h-[500px] opacity-8 bottom-1/4 left-1/4 bg-gradient-to-tr from-blue-500/15 to-[#81D7B4]/20 blur-3xl rounded-full"></div>
      
      {/* Modern Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(129, 215, 180, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 215, 180, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'subtleFloat 20s ease-in-out infinite'
        }}></div>
      </div>
      
      {/* Mesh Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(129, 215, 180, 0.3) 2px, transparent 2px)
          `,
          backgroundSize: '100px 100px, 100px 100px',
          animation: 'meshFloat 25s ease-in-out infinite'
        }}></div>
      </div>
      
      {/* Minimalist Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle floating orbs */}
        <div className="absolute top-1/4 left-1/5 w-3 h-3 bg-[#81D7B4]/20 rounded-full" style={{animation: 'gentleFloat 8s ease-in-out infinite'}}></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-500/15 rounded-full" style={{animation: 'gentleFloat 10s ease-in-out infinite 2s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-[#81D7B4]/10 rounded-full" style={{animation: 'gentleFloat 12s ease-in-out infinite 4s'}}></div>
        
        {/* Minimal geometric accents */}
        <div className="absolute top-1/2 right-1/6 w-1 h-8 bg-gradient-to-b from-[#81D7B4]/15 to-transparent rounded-full" style={{animation: 'subtlePulse 6s ease-in-out infinite'}}></div>
        <div className="absolute bottom-1/4 left-1/6 w-8 h-1 bg-gradient-to-r from-blue-500/15 to-transparent rounded-full" style={{animation: 'subtlePulse 7s ease-in-out infinite 3s'}}></div>
      </div>

      <div className="max-w-8xl mx-auto relative z-10 w-full">
        <div className="text-center space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-14 lg:space-y-16">
          {/* Enhanced Hero Heading with Better Typography */}
          <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-7 lg:space-y-8">
             
            
            {/* Main Heading with Improved Hierarchy */}
            <div className="relative px-2 xs:px-3 sm:px-4 mt-8 xs:mt-10 sm:mt-6 md:mt-4">
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black leading-tight xs:leading-[0.95] sm:leading-[0.9] tracking-tight text-center px-1 xs:px-2 sm:px-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                <span className="block text-gray-900 mb-0.5 xs:mb-1 sm:mb-2 md:mb-3 lg:mb-4 animate-fade-in-up" style={{animationDelay: '0.2s', wordWrap: 'break-word'}}>
                  Save Smarter
                </span>
                <span className="block relative" style={{wordWrap: 'break-word'}}>
                  <span className="bg-gradient-to-r from-[#81D7B4] via-[#6bc49f] to-[#81D7B4] bg-clip-text text-transparent animate-fade-in-up" style={{animationDelay: '0.4s', wordWrap: 'break-word'}}>
                    with BitSave
                  </span>
                  {/* Enhanced glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/20 via-[#6bc49f]/20 to-[#81D7B4]/20 blur-3xl -z-10 scale-110 animate-pulse"></div>
                </span>
              </h1>
              
              {/* Decorative Elements */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent"></div>
            </div>
            
            {/* Global SaveFi Protocol Map - Positioned after main heading */}
            <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 lg:mt-14 relative max-w-6xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              {/* Protocol Description */}
              <div className="text-center mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-14 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto font-light px-1 xs:px-2 sm:px-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                  Your <span className="text-[#81D7B4] font-semibold">Onchain Savings Nest</span>. The <span className="text-[#81D7B4] font-semibold">SaveFi Protocol</span> helping <span className="text-[#81D7B4] font-semibold">income earners</span> save onchain
                </p>
              </div>
              
              {/* Floating Country Names with Flags - Desktop */}
              <div className="absolute inset-0 pointer-events-none hidden lg:block">
                {/* North America */}
                <div className="absolute top-[35%] left-[15%] animate-float" style={{animationDelay: '0s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇺🇸 United States</span>
                  </div>
                </div>
                
                {/* Europe */}
                <div className="absolute top-[30%] left-[45%] animate-float" style={{animationDelay: '1s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇩🇪 Germany</span>
                  </div>
                </div>
                
                {/* Asia */}
                <div className="absolute top-[40%] right-[20%] animate-float" style={{animationDelay: '2s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇯🇵 Japan</span>
                  </div>
                </div>
                
                {/* Africa */}
                <div className="absolute top-[60%] left-[48%] animate-float" style={{animationDelay: '3s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇳🇬 Nigeria</span>
                  </div>
                </div>
                
                {/* South America */}
                <div className="absolute bottom-[15%] left-[25%] animate-float" style={{animationDelay: '4s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇧🇷 Brazil</span>
                  </div>
                </div>
                
                {/* Australia */}
                <div className="absolute bottom-[10%] right-[15%] animate-float" style={{animationDelay: '5s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇦🇺 Australia</span>
                  </div>
                </div>
                
                {/* India */}
                <div className="absolute top-[50%] right-[30%] animate-float" style={{animationDelay: '6s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇮🇳 India</span>
                  </div>
                </div>
                
                {/* Canada */}
                <div className="absolute top-[25%] left-[20%] animate-float" style={{animationDelay: '7s'}}>
                  <div className="bg-white/90 backdrop-blur-sm px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 rounded-lg shadow-lg border border-gray-200/50">
                    <span className="text-xs lg:text-sm xl:text-base font-semibold text-gray-800">🇨🇦 Canada</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Country Carousel - Conveyor Belt Animation */}
              <div className="lg:hidden mt-4 xs:mt-5 sm:mt-6 md:mt-8 overflow-hidden relative">
                <div className="absolute left-0 top-0 w-6 xs:w-8 sm:w-10 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-6 xs:w-8 sm:w-10 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                <div className="relative">
                  <div className="flex animate-carousel-smooth gap-2 xs:gap-3 sm:gap-4 md:gap-5 will-change-transform">
                    {/* First set of countries */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇺🇸 United States</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇩🇪 Germany</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇯🇵 Japan</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇳🇬 Nigeria</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇧🇷 Brazil</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇦🇺 Australia</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇮🇳 India</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 rounded-lg xs:rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs xs:text-sm font-semibold text-gray-800 whitespace-nowrap">🇨🇦 Canada</span>
                    </div>
                    {/* Duplicate set for seamless loop */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇺🇸 United States</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇩🇪 Germany</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇯🇵 Japan</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇳🇬 Nigeria</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇧🇷 Brazil</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇦🇺 Australia</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇮🇳 India</span>
                    </div>
                    <div className="flex-shrink-0 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-[#81D7B4]/20">
                      <span className="text-xs font-semibold text-gray-800">🇨🇦 Canada</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Standalone Map SVG */}
              <div className="flex items-center justify-center mt-4 xs:mt-6 sm:mt-8">
                <Image 
                  src="/mapbase.svg" 
                  alt="Global SaveFi Protocol Map" 
                  width={900} 
                  height={500}
                  className="w-full h-auto max-w-5xl opacity-95 hover:opacity-100 transition-opacity duration-700 max-h-40 xs:max-h-48 sm:max-h-56 md:max-h-72 lg:max-h-80 xl:max-h-none object-contain px-1 xs:px-2 sm:px-4"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Glassmorphism CTA Section */}
          <div className="flex flex-row gap-2 xs:gap-3 sm:gap-4 md:gap-6 lg:gap-8 justify-center items-center animate-fade-in-up px-3 xs:px-4 sm:px-6 md:px-8 mt-6 xs:mt-8 sm:mt-10 md:mt-12" style={{animationDelay: '0.8s'}}>
            <Link 
              href="/dashboard"
              prefetch={true}
              className="group relative px-6 xs:px-7 sm:px-8 md:px-10 lg:px-12 py-3.5 xs:py-4 sm:py-4.5 md:py-5 lg:py-6 bg-gradient-to-r from-[#81D7B4] to-[#6bc49f] text-white font-bold text-sm xs:text-base sm:text-lg md:text-xl rounded-xl xs:rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden inline-flex items-center justify-center min-w-[140px] xs:min-w-[160px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px] w-full sm:w-auto max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[400px] backdrop-blur-md border border-white/20 animate-pulse-subtle touch-manipulation min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#6bc49f] to-[#81D7B4] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-lg"></div>
              <span className="relative z-10 flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 whitespace-nowrap">
                Launch App
                <svg className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <button 
              onClick={() => window.open('https://youtube.com/shorts/CWRQ7rgtHzU?si=xd8ia_IQyonxOXFM', '_blank')}
              className="group px-6 xs:px-7 sm:px-8 md:px-10 lg:px-12 py-3.5 xs:py-4 sm:py-4.5 md:py-5 lg:py-6 bg-white/10 border border-white/30 text-gray-700 font-bold text-sm xs:text-base sm:text-lg md:text-xl rounded-xl xs:rounded-2xl hover:bg-white/20 hover:border-white/50 hover:text-gray-800 transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-md shadow-lg min-w-[140px] xs:min-w-[160px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px] w-full sm:w-auto max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[400px] touch-manipulation min-h-[44px] xs:min-h-[48px] sm:min-h-[52px] md:min-h-[56px]"
            >
              <span className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 whitespace-nowrap">
                <svg className="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Enhanced Stats with Better Visual Design */}
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-sm xs:max-w-md sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto animate-fade-in-up px-3 xs:px-4 sm:px-6 md:px-8 mt-8 xs:mt-10 sm:mt-12 md:mt-16 lg:mt-20" style={{animationDelay: '1s'}}>
            <div className="group text-center p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 bg-white/60 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200/50 hover:border-[#81D7B4]/30 hover:shadow-lg transition-all duration-300 min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] flex flex-col justify-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 mx-auto mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-br from-[#81D7B4]/20 to-green-400/20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0s'}}>
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#81D7B4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 xs:mb-1.5 sm:mb-2">24/7</div>
              <div className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 font-medium">Always Available</div>
            </div>
            
            <div className="group text-center p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 bg-white/60 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200/50 hover:border-[#81D7B4]/30 hover:shadow-lg transition-all duration-300 min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] flex flex-col justify-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 mx-auto mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-br from-green-400/20 to-[#81D7B4]/20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '0.5s'}}>
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#81D7B4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                </svg>
              </div>
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 xs:mb-1.5 sm:mb-2">Secure</div>
              <div className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 font-medium">Bank-Grade Security</div>
            </div>
            
            <div className="group text-center p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 bg-white/60 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl border border-gray-200/50 hover:border-[#81D7B4]/30 hover:shadow-lg transition-all duration-300 min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] flex flex-col justify-center">
              <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 mx-auto mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-br from-green-400/20 to-[#81D7B4]/20 rounded-lg xs:rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-float" style={{animationDelay: '1s'}}>
                <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[#81D7B4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"/>
                </svg>
              </div>
              <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 xs:mb-1.5 sm:mb-2">Low Fees</div>
              <div className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 font-medium">Minimal Costs</div>
            </div>
          </div>
        </div>



        {/* Enhanced Supported Chains Section */}
        <div className="mt-20 xs:mt-24 sm:mt-28 md:mt-32">
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 px-3 xs:px-4">
            <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 md:px-4 py-1.5 xs:py-2 bg-[#81D7B4]/10 border border-[#81D7B4]/20 rounded-full text-[#6bc49f] font-medium text-xs backdrop-blur-sm mb-3 xs:mb-4 md:mb-6">
              <div className="w-1.5 xs:w-2 h-1.5 xs:h-2 bg-[#81D7B4] rounded-full animate-pulse"></div>
              <span className="whitespace-nowrap">Multi-Chain Infrastructure</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 xs:mb-4 md:mb-6 px-2 xs:px-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>Powered by Leading Blockchain Networks</h2>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2 xs:px-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto' }}>
              Experience seamless savings across multiple blockchain ecosystems with enterprise-grade security
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-10 max-w-sm xs:max-w-md sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 mb-12 xs:mb-16 sm:mb-20 md:mb-24 lg:mb-28 xl:mb-32">
            {/* Enhanced Celo Card */}
            <div className="group relative h-full transform hover:scale-[1.02] transition-all duration-500">
              {/* Enhanced Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/30 via-green-400/30 to-teal-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 rounded-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              
              {/* Main Card with Enhanced Depth */}
              <div className="relative bg-white/98 backdrop-blur-xl rounded-lg xs:rounded-xl sm:rounded-2xl border border-emerald-100/50 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 overflow-hidden h-full min-h-[320px] xs:min-h-[360px] sm:min-h-[400px] md:min-h-[420px] lg:min-h-[440px] xl:min-h-[460px] flex flex-col" style={{boxShadow: '0 8px 32px rgba(16, 185, 129, 0.12), 0 4px 16px rgba(16, 185, 129, 0.08)'}}>
                {/* Subtle Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent"></div>
                
                {/* Header Section */}
                <div className="relative p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 pb-1 xs:pb-2 sm:pb-3 md:pb-4 flex-shrink-0">
                  {/* Network Logo with Enhanced Depth */}
                  <div className="relative mb-2 xs:mb-3 sm:mb-4">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 xl:w-20 xl:h-20 mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-md xs:rounded-lg sm:rounded-xl flex items-center justify-center shadow-md hover:shadow-lg group-hover:shadow-emerald-200/60 transition-all duration-300 border border-emerald-100/40">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl"></div>
                      <Image 
                        src="/celo.png" 
                        alt="Celo Network" 
                        width={32} 
                        height={32}
                        className="relative z-10 group-hover:scale-110 transition-transform duration-300 w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10"
                      />
                    </div>
                  </div>
                  
                  {/* Network Info with Enhanced Typography */}
                  <div className="text-center mb-1 xs:mb-2 sm:mb-3">
                    <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-0.5 xs:mb-1 sm:mb-1.5 tracking-tight group-hover:text-emerald-800 transition-colors duration-300">Celo</h3>
                    <p className="text-gray-600 text-xs xs:text-xs sm:text-sm md:text-base leading-relaxed font-medium px-1 xs:px-2">
                      Mobile-first blockchain for global financial inclusion
                    </p>
                  </div>
                </div>
                
                {/* BitSave Integration Section with Enhanced Design */}
                <div className="px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 pb-2 xs:pb-3 sm:pb-4 md:pb-5 flex-grow">
                  <div className="bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/80 rounded-md xs:rounded-lg sm:rounded-xl p-2 xs:p-3 sm:p-4 border border-emerald-200/40 shadow-inner">
                    <div className="flex items-center justify-center gap-1.5 xs:gap-2 mb-2 xs:mb-3">
                      <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-emerald-700 font-semibold text-xs xs:text-xs sm:text-sm">BitSave Compatible</span>
                    </div>
                    
                    {/* Supported Tokens with Stunning Modern Design */}
                    <div className="space-y-2 xs:space-y-3">
                      <div className="text-center">
                        <p className="text-xs xs:text-xs sm:text-sm font-bold text-emerald-700 mb-1 xs:mb-1.5 uppercase tracking-wider">Supported Assets</p>
                        <div className="w-6 xs:w-8 sm:w-10 h-0.5 bg-gradient-to-r from-emerald-400 to-green-400 mx-auto rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 xs:gap-2 sm:gap-2.5">
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-gradient-to-br from-white via-emerald-50/30 to-white px-1.5 xs:px-2 sm:px-2.5 py-1.5 xs:py-2 sm:py-2.5 rounded-md xs:rounded-lg border border-emerald-200/60 shadow-sm hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 transform hover:scale-[1.02] min-h-[32px] xs:min-h-[36px] sm:min-h-[40px]">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/$g.png" alt="GoodDollar" width={16} height={16} className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs xs:text-xs sm:text-sm font-bold text-gray-800 group-hover/token:text-emerald-800 transition-colors duration-300 truncate">$G</span>
                          </div>
                        </div>
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-gradient-to-br from-white via-emerald-50/30 to-white px-1.5 xs:px-2 sm:px-2.5 py-1.5 xs:py-2 sm:py-2.5 rounded-md xs:rounded-lg border border-emerald-200/60 shadow-sm hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 transform hover:scale-[1.02] min-h-[32px] xs:min-h-[36px] sm:min-h-[40px]">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/usdglo.png" alt="USDGLO" width={16} height={16} className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs xs:text-xs sm:text-sm font-bold text-gray-800 group-hover/token:text-emerald-800 transition-colors duration-300 truncate">USDGLO</span>
                          </div>
                        </div>
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-gradient-to-br from-white via-emerald-50/30 to-white px-1.5 xs:px-2 sm:px-2.5 py-1.5 xs:py-2 sm:py-2.5 rounded-md xs:rounded-lg border border-emerald-200/60 shadow-sm hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 transform hover:scale-[1.02] min-h-[32px] xs:min-h-[36px] sm:min-h-[40px]">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/usdc.png" alt="USDC" width={16} height={16} className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs xs:text-xs sm:text-sm font-bold text-gray-800 group-hover/token:text-emerald-800 transition-colors duration-300 truncate">USDC</span>
                          </div>
                        </div>
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-1 xs:gap-1.5 sm:gap-2 bg-gradient-to-br from-white via-emerald-50/30 to-white px-1.5 xs:px-2 sm:px-2.5 py-1.5 xs:py-2 sm:py-2.5 rounded-md xs:rounded-lg border border-emerald-200/60 shadow-sm hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 transform hover:scale-[1.02] min-h-[32px] xs:min-h-[36px] sm:min-h-[40px]">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/cusd.png" alt="cUSD" width={16} height={16} className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs xs:text-xs sm:text-sm font-bold text-gray-800 group-hover/token:text-emerald-800 transition-colors duration-300 truncate">cUSD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Status Footer */}
                <div className="px-5 sm:px-6 pb-4 sm:pb-5 flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg px-3 py-2 border border-emerald-100/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-green-700 font-semibold text-xs">Live</span>
                    </div>
                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Carbon Negative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Base Card */}
            <div className="group relative h-full transform hover:scale-[1.02] transition-all duration-500">
              {/* Enhanced Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-sky-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 via-cyan-200 to-sky-200 rounded-2xl opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
              
              {/* Main Card with Enhanced Depth */}
              <div className="relative bg-white/98 backdrop-blur-xl rounded-2xl border border-blue-100/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-500 overflow-hidden h-full min-h-[420px] flex flex-col" style={{boxShadow: '0 8px 32px rgba(59, 130, 246, 0.12), 0 4px 16px rgba(59, 130, 246, 0.08)'}}>
                {/* Subtle Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent"></div>
                
                {/* Header Section */}
                <div className="relative p-5 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
                  {/* Network Logo with Enhanced Depth */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 mx-auto bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg group-hover:shadow-blue-200/60 transition-all duration-300 border border-blue-100/40">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-xl"></div>
                      <Image 
                        src="/base.svg" 
                        alt="Base Network" 
                        width={32} 
                        height={32}
                        className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Network Info with Enhanced Typography */}
                  <div className="text-center mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 tracking-tight group-hover:text-blue-800 transition-colors duration-300">Base</h3>
                    <p className="text-gray-600 text-xs leading-relaxed font-medium">
                      Coinbase&apos;s secure Ethereum L2 for mainstream adoption
                    </p>
                  </div>
                </div>
                
                {/* BitSave Integration Section with Enhanced Design */}
                <div className="px-5 sm:px-6 pb-3 sm:pb-4 flex-grow">
                  <div className="bg-gradient-to-br from-blue-50/80 via-cyan-50/60 to-sky-50/80 rounded-lg p-3 border border-blue-200/40 shadow-inner">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-blue-700 font-semibold text-xs">BitSave Compatible</span>
                    </div>
                    
                    {/* Supported Tokens with Stunning Modern Design */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wider">Supported Assets</p>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-2 bg-gradient-to-br from-white via-blue-50/30 to-white px-2.5 py-2 rounded-lg border border-blue-200/60 shadow-sm hover:shadow-lg hover:border-blue-300/80 transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/usdc.png" alt="USDC" width={16} height={16} className="w-4 h-4 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 group-hover/token:text-blue-800 transition-colors duration-300">USDC</span>
                          </div>
                        </div>
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center gap-2 bg-gradient-to-br from-white via-blue-50/30 to-white px-2.5 py-2 rounded-lg border border-blue-200/60 shadow-sm hover:shadow-lg hover:border-blue-300/80 transition-all duration-300 transform hover:scale-[1.02]">
                            <div className="relative">
                              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300"></div>
                              <Image src="/usdglo.png" alt="USDGLO" width={16} height={16} className="w-4 h-4 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-xs font-bold text-gray-800 group-hover/token:text-blue-800 transition-colors duration-300">USDGLO</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Status Footer */}
                <div className="px-5 sm:px-6 pb-4 sm:pb-5 flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg px-3 py-2 border border-blue-100/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm"></div>
                      <span className="text-blue-700 font-semibold text-xs">Live</span>
                    </div>
                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Lightning Fast</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Lisk Card */}
            <div className="group relative h-full lg:col-span-1 transform hover:scale-[1.02] transition-all duration-500">
              {/* Enhanced Glow Effect with Lisk Brand Colors */}
              <div className="absolute -inset-2 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" style={{background: 'linear-gradient(to right, rgba(12, 21, 46, 0.3), rgba(12, 21, 46, 0.4), rgba(12, 21, 46, 0.3))'}}></div>
              <div className="absolute -inset-1 rounded-2xl opacity-20 group-hover:opacity-40 transition-all duration-500" style={{background: 'linear-gradient(to right, rgba(12, 21, 46, 0.2), rgba(12, 21, 46, 0.3), rgba(12, 21, 46, 0.2))'}}></div>
              
              {/* Main Card with Enhanced Depth */}
              <div className="relative bg-white/98 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden h-full min-h-[420px] flex flex-col border" style={{borderColor: 'rgba(12, 21, 46, 0.1)', boxShadow: '0 8px 32px rgba(12, 21, 46, 0.12), 0 4px 16px rgba(12, 21, 46, 0.08)'}}>
                {/* Subtle Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{background: 'linear-gradient(to right, transparent, rgba(12, 21, 46, 0.5), transparent)'}}></div>
                
                {/* Header Section */}
                <div className="relative p-5 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
                  {/* Network Logo with Enhanced Depth */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 border" style={{background: 'linear-gradient(to bottom right, rgba(12, 21, 46, 0.05), rgba(12, 21, 46, 0.1))', borderColor: 'rgba(12, 21, 46, 0.15)', boxShadow: '0 4px 6px -1px rgba(12, 21, 46, 0.1), 0 2px 4px -1px rgba(12, 21, 46, 0.06)'}}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-xl"></div>
                      <Image 
                        src="/lisk-logo.png" 
                        alt="Lisk Network" 
                        width={32} 
                        height={32}
                        className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  
                  {/* Network Info with Enhanced Typography */}
                  <div className="text-center mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 tracking-tight transition-colors duration-300" style={{color: '#0C152E'}}>Lisk</h3>
                    <p className="text-gray-600 text-xs leading-relaxed font-medium">
                      Modular blockchain for scalable applications
                    </p>
                  </div>
                </div>
                
                {/* BitSave Integration Section with Enhanced Design */}
                <div className="px-5 sm:px-6 pb-3 sm:pb-4 flex-grow">
                  <div className="rounded-lg p-3 shadow-inner border" style={{background: 'linear-gradient(to bottom right, rgba(12, 21, 46, 0.03), rgba(12, 21, 46, 0.06), rgba(12, 21, 46, 0.04))', borderColor: 'rgba(12, 21, 46, 0.15)'}}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse shadow-sm" style={{backgroundColor: '#0C152E'}}></div>
                      <span className="font-semibold text-xs" style={{color: '#0C152E'}}>BitSave Compatible</span>
                    </div>
                    
                    {/* Supported Tokens with Stunning Modern Design */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{color: '#0C152E'}}>Supported Assets</p>
                        <div className="w-8 h-0.5 mx-auto rounded-full" style={{background: 'linear-gradient(to right, rgba(12, 21, 46, 0.6), rgba(12, 21, 46, 0.8))'}}></div>
                      </div>
                      <div className="flex justify-center">
                        <div className="group/token relative overflow-hidden">
                          <div className="absolute inset-0 rounded-lg opacity-0 group-hover/token:opacity-100 transition-all duration-300" style={{background: 'linear-gradient(to right, rgba(12, 21, 46, 0.1), rgba(12, 21, 46, 0.15))'}}></div>
                          <div className="relative flex items-center gap-2 px-3 py-2.5 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border" style={{background: 'linear-gradient(to bottom right, white, rgba(12, 21, 46, 0.02), white)', borderColor: 'rgba(12, 21, 46, 0.2)'}}>
                            <div className="relative">
                              <div className="absolute inset-0 rounded-full blur-sm opacity-0 group-hover/token:opacity-100 transition-all duration-300" style={{background: 'rgba(12, 21, 46, 0.15)'}}></div>
                              <Image src="/usdc.png" alt="USDC" width={18} height={18} className="w-4.5 h-4.5 relative z-10 group-hover/token:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="text-sm font-bold text-gray-800 transition-colors duration-300" style={{color: '#0C152E'}}>USDC</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Status Footer */}
                <div className="px-5 sm:px-6 pb-4 sm:pb-5 flex-shrink-0 mt-auto">
                  <div className="flex items-center justify-between rounded-lg px-3 py-2 border" style={{background: 'linear-gradient(to right, rgba(12, 21, 46, 0.03), rgba(12, 21, 46, 0.05))', borderColor: 'rgba(12, 21, 46, 0.1)'}}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full animate-pulse shadow-sm" style={{backgroundColor: '#0C152E'}}></div>
                      <span className="font-semibold text-xs" style={{color: '#0C152E'}}>Live</span>
                    </div>
                    <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Modular</span>
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
        @keyframes shimmer {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .rounded-4xl {
          border-radius: 2rem;
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </section>
  );
});

export default Hero;