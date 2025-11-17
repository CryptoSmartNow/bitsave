'use client';

import Image from 'next/image';
import { useEffect, useRef, memo, useState } from 'react';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';

// Helper function to ensure image URLs are properly formatted for Next.js Image
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  // If it's a relative path starting with /, it's fine
  if (url.startsWith('/')) return url
  // If it starts with // (protocol-relative), convert to https
  if (url.startsWith('//')) return `https:${url}`
  // If it doesn't start with http/https and doesn't start with /, add /
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

const Hero = memo(() => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk'])
      .then(setNetworkLogos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      setMousePosition({ x, y });
      
      // Update interactive elements
      const interactiveElements = heroRef.current.querySelectorAll('.web3-interactive');
      interactiveElements.forEach((element, index) => {
        const el = element as HTMLElement;
        const offsetX = (x - 0.5) * (20 + index * 5);
        const offsetY = (y - 0.5) * (20 + index * 5);
        el.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 + (x + y) * 0.02})`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Networks data for cards and assets section
  const chains = [
    { 
      name: 'Base', 
      logo: ensureImageUrl(networkLogos['base']?.logoUrl || networkLogos['base']?.fallbackUrl || '/base.svg'), 
      description: 'Coinbase L2',
      tokens: ['USDC', 'USDGLO'],
      accentColor: '#0052FF'
    },
    { 
      name: 'Celo', 
      logo: ensureImageUrl(networkLogos['celo']?.logoUrl || networkLogos['celo']?.fallbackUrl || '/celo.png'), 
      description: 'Mobile-first',
      tokens: ['USDGLO', 'cUSD', 'USDC', 'Gooddollar'],
      accentColor: '#fdff52'
    },
    { 
      name: 'Lisk', 
      logo: ensureImageUrl(networkLogos['lisk']?.logoUrl || networkLogos['lisk']?.fallbackUrl || '/lisk-logo.png'), 
      description: 'Ethereum L2',
      tokens: ['USDC'],
      accentColor: '#000000'
    }
  ];

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[80vh] sm:min-h-screen overflow-hidden mt-32 sm:mt-36 lg:mt-40 border-[1.5px] border-[#81D7B4]/30 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-16"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2381D7B4' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        boxShadow: '0 0 0 1px rgba(129, 215, 180, 0.1), 0 0 20px rgba(129, 215, 180, 0.1)'
      }}
    >
      {/* Frosted background with animated primary blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Frosted glass layer */}
        <div className="absolute inset-0 bg-white/40 sm:bg-white/25 backdrop-blur-xl" />
        {/* Animated blobs (primary color) */}
        <div className="absolute -top-16 -left-20 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-[#81D7B4]/50 to-[#6BC5A0]/40 blur-3xl opacity-40 sm:opacity-35 blob" />
        <div className="absolute top-1/3 -right-24 w-[220px] h-[220px] rounded-full bg-gradient-to-br from-[#81D7B4]/50 to-[#6BC5A0]/40 blur-3xl opacity-35 blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#81D7B4]/45 to-[#6BC5A0]/35 blur-3xl opacity-30 blob" style={{ animationDelay: '4s' }} />

        {/* Vibrant glossy lighting overlays */}
        {/* Subtle top highlight for glossy feel */}
        <div className="absolute inset-0 mix-blend-soft-light">
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-70" />
        </div>
        {/* Diagonal light sweep for vibrancy */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="sheen absolute -top-6 -left-1/4 w-[60%] h-[140%] bg-gradient-to-r from-white/35 via-white/15 to-transparent blur-2xl opacity-70 sm:opacity-60 mix-blend-soft-light" />
        </div>
        {/* Faint angled beam to increase depth */}
        <div className="beam absolute -top-10 right-1/5 w-[55%] h-[220px] rotate-6 bg-gradient-to-r from-white/14 to-transparent blur-xl opacity-50 sm:opacity-40 mix-blend-soft-light" />
        {/* Center specular highlight */}
        <div className="specular absolute top-6 left-1/2 -translate-x-1/2 w-[70%] h-[120px] rounded-[999px] bg-white/20 blur-2xl opacity-50 sm:opacity-40 mix-blend-soft-light" />

        <style jsx>{`
          .blob { animation: blobPulse 10s ease-in-out infinite; }
          @keyframes blobPulse {
            0%, 100% { transform: translate3d(0,0,0) scale(1); }
            33% { transform: translate3d(8px,-6px,0) scale(1.08); }
            66% { transform: translate3d(-6px,8px,0) scale(0.98); }
          }
          .sheen { transform: skewX(-14deg) translateX(-30%); animation: sheenSweep 12s ease-in-out infinite; }
          @keyframes sheenSweep {
            0%, 100% { transform: skewX(-14deg) translateX(-30%); }
            50% { transform: skewX(-14deg) translateX(130%); }
          }
          .beam { animation: beamDrift 14s ease-in-out infinite; }
          @keyframes beamDrift {
            0%, 100% { transform: translate3d(0,0,0) rotate(6deg); }
            50% { transform: translate3d(-8px,6px,0) rotate(8deg); }
          }
          .specular { animation: specularBreath 8s ease-in-out infinite; }
          @keyframes specularBreath {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.06); }
          }
          @media (prefers-reduced-motion: reduce) {
            .blob, .sheen, .beam, .specular { animation: none; }
          }
        `}</style>
      </div>

      {/* Enhanced Web3 Blockchain Network Visualization */}
     

      {/* Dynamic Glow Effects */}
      <div className="web3-interactive hidden sm:block absolute w-96 h-96 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#81D7B4]/30 to-[#81D7B4]/20 blur-3xl rounded-full animate-pulse"></div>
      <div className="web3-interactive hidden sm:block absolute w-64 h-64 opacity-15 top-1/3 right-1/3 bg-gradient-to-r from-[#81D7B4]/30 to-[#81D7B4]/10 blur-3xl rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[calc(100vh-7rem)] max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 text-center pt-4 sm:pt-12">
        
        {/* Web3 Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#81D7B4]/10 to-[#6BC5A0]/10 backdrop-blur-sm border border-[#81D7B4]/20 shadow-lg mb-6 sm:mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-[#81D7B4]">Decentralized Savings Protocol</span>
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Main Heading */}
        <div className="relative mb-8">
          <h1 className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.15] sm:leading-tight tracking-tight transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.2s'}}>
            <span className="block text-black mb-2">
              Give Tomorrow a Soft Landing
            </span>
            <span className="block bg-gradient-to-r from-[#81D7B4] via-[#6BC5A0] to-[#81D7B4] bg-clip-text text-transparent">
              Breathe Easier, Save with BitSave
            </span>
          </h1>
          
          {/* Glow Effect Behind Text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/20 via-[#6BC5A0]/20 to-[#81D7B4]/20 blur-3xl -z-10 scale-110 animate-pulse"></div>
        </div>

        {/* Value Proposition */}
        <p className={`text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto mb-10 sm:mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.4s'}}>
          Your <span className="text-[#81D7B4] font-semibold">Onchain Savings Nest</span>. 
          The <span className="text-[#6BC5A0] font-semibold">SaveFi Protocol</span> helping 
          <span className="text-[#81D7B4] font-semibold"> income earners</span> save onchain
        </p>

        {/* CTA Buttons */}
        <div className={`flex flex-row gap-2 sm:gap-4 justify-center items-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '0.6s'}}>
          <Link 
            href="/dashboard" 
            className="group relative flex-1 sm:w-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-semibold rounded-lg shadow-lg shadow-[#81D7B4]/25 hover:shadow-[#81D7B4]/40 transition-all duration-300 hover:scale-105 text-center min-w-0 whitespace-nowrap"
          >
            <span className="relative z-10">Start Saving</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#6BC5A0] to-[#81D7B4] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </Link>
          
          <a
            href="https://www.youtube.com/shorts/CWRQ7rgtHzU"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-1 sm:w-auto px-5 sm:px-6 py-3 border border-gray-600 text-gray-800 font-semibold rounded-lg hover:border-[#81D7B4] hover:text-[#81D7B4] transition-all duration-300 hover:shadow-lg hover:shadow-[#81D7B4]/10 text-center min-w-0 whitespace-nowrap"
          >
            Watch Demo
          </a>
        </div>

        {/* Stats Section removed per request */}

        {/* Supported Networks */}
        <div className={`mt-12 sm:mt-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '1s'}}>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Multi-Chain Support</h3>
            <p className="text-gray-600 text-lg">Save seamlessly across leading blockchain networks</p>
          </div>
          
          {/* Unified responsive grid with minimalist cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
            {chains.map((chain) => (
              <div
                key={chain.name}
                className="group relative rounded-2xl overflow-hidden border border-gray-200/70 bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[#81D7B4] focus:ring-offset-2"
                tabIndex={0}
                aria-label={`${chain.name} — ${chain.description}`}
              >
                {/* Card stack shuffle removed per request */}
                {/* Accent bar removed per request */}
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105" style={{ borderColor: chain.accentColor }}>
                        <Image
                          src={ensureImageUrl(chain.logo)}
                          alt={`${chain.name} logo`}
                          width={28}
                          height={28}
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">{chain.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{chain.description}</p>
                      </div>
                    </div>
                    {/* Right status dot removed per request */}
                  </div>

                  {/* Supported assets within card */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {chain.tokens.slice(0, 4).map((token) => (
                      <span
                        key={`${chain.name}-${token}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border text-gray-800 text-xs font-medium shadow-sm hover:bg-white transition"
                        style={{ borderColor: chain.accentColor }}
                      >
                        {token}
                      </span>
                    ))}
                    {chain.tokens.length > 4 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border text-gray-700 text-xs font-medium shadow-sm" style={{ borderColor: chain.accentColor }}>
                        +{chain.tokens.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Desktop/Tablet grid replaced by unified minimalist grid above */}
          
          {/* Additional info */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              More networks coming soon • 
              <span className="text-[#81D7B4] font-medium ml-1">Cross-chain compatible</span>
            </p>
          </div>
        </div>

        {/* Moving Countries Conveyor Belt */}
        <div className={`block sm:block mt-12 sm:mt-20 mb-12 sm:mb-20 overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{animationDelay: '1.2s'}}>
          <p className="mb-8 text-center">
            <span className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm text-gray-700">Trusted by savers worldwide</span>
          </p>
          <div className="relative">
            <div className="flex animate-scroll-left space-x-6">
              {[
                { name: 'United States', flag: '🇺🇸' },
                { name: 'United Kingdom', flag: '🇬🇧' },
                { name: 'Germany', flag: '🇩🇪' },
                { name: 'France', flag: '🇫🇷' },
                { name: 'Japan', flag: '🇯🇵' },
                { name: 'Canada', flag: '🇨🇦' },
                { name: 'Australia', flag: '🇦🇺' },
                { name: 'Netherlands', flag: '🇳🇱' },
                { name: 'Switzerland', flag: '🇨🇭' },
                { name: 'Singapore', flag: '🇸🇬' },
                { name: 'South Korea', flag: '🇰🇷' },
                { name: 'Brazil', flag: '🇧🇷' },
                { name: 'India', flag: '🇮🇳' },
                { name: 'Italy', flag: '🇮🇹' },
                { name: 'Spain', flag: '🇪🇸' },
                { name: 'Sweden', flag: '🇸🇪' },
                { name: 'Norway', flag: '🇳🇴' },
                { name: 'Denmark', flag: '🇩🇰' },
                { name: 'Finland', flag: '🇫🇮' },
                { name: 'Belgium', flag: '🇧🇪' },
                { name: 'Austria', flag: '🇦🇹' },
                { name: 'Portugal', flag: '🇵🇹' },
                { name: 'Ireland', flag: '🇮🇪' },
                { name: 'New Zealand', flag: '🇳🇿' },
                { name: 'Mexico', flag: '🇲🇽' },
                { name: 'Argentina', flag: '🇦🇷' },
                { name: 'Chile', flag: '🇨🇱' },
                { name: 'South Africa', flag: '🇿🇦' },
                { name: 'Israel', flag: '🇮🇱' },
                { name: 'UAE', flag: '🇦🇪' },
                // Duplicate for seamless loop
                { name: 'United States', flag: '🇺🇸' },
                { name: 'United Kingdom', flag: '🇬🇧' },
                { name: 'Germany', flag: '🇩🇪' },
                { name: 'France', flag: '🇫🇷' },
                { name: 'Japan', flag: '🇯🇵' },
                { name: 'Canada', flag: '🇨🇦' },
                { name: 'Australia', flag: '🇦🇺' },
                { name: 'Netherlands', flag: '🇳🇱' },
                { name: 'Switzerland', flag: '🇨🇭' },
                { name: 'Singapore', flag: '🇸🇬' },
                { name: 'South Korea', flag: '🇰🇷' },
                { name: 'Brazil', flag: '🇧🇷' },
                { name: 'India', flag: '🇮🇳' },
                { name: 'Italy', flag: '🇮🇹' },
                { name: 'Spain', flag: '🇪🇸' },
                { name: 'Sweden', flag: '🇸🇪' },
                { name: 'Norway', flag: '🇳🇴' },
                { name: 'Denmark', flag: '🇩🇰' },
                { name: 'Finland', flag: '🇫🇮' },
                { name: 'Belgium', flag: '🇧🇪' }
              ].map((country, index) => (
                <div
                  key={`${country.name}-${index}`}
                  className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 whitespace-nowrap flex-shrink-0"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-sm font-medium text-gray-700">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#81D7B4]/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* YouTube Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>
            
            {/* Video Container */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
                title="BitSave Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Hero;