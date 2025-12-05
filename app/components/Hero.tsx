'use client';

import Image from 'next/image';
import { useEffect, useRef, memo, useState } from 'react';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';
import Link from 'next/link';
import { FiX } from 'react-icons/fi';

// Helper function to ensure image URLs are properly formatted for Next.js Image
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  if (url.startsWith('/')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

const Hero = memo(() => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchMultipleNetworkLogos(['base', 'celo', 'lisk'])
      .then(setNetworkLogos)
      .catch(() => { });
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();

      const x = (clientX - left) / width;
      const y = (clientY - top) / height;

      setMousePosition({ x, y });

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
      className="relative min-h-screen overflow-hidden mt-32 sm:mt-36 lg:mt-40 border-[1.5px] border-[#81D7B4]/30 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-16"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2381D7B4' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        boxShadow: '0 0 0 1px rgba(129, 215, 180, 0.1), 0 0 20px rgba(129, 215, 180, 0.1)'
      }}
    >
      {/* Enhanced Parallax Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Frosted glass layer */}
        <div className="absolute inset-0 bg-white/40 sm:bg-white/25 backdrop-blur-xl" />

        {/* Parallax animated blobs with depth */}
        <div
          className="absolute -top-16 -left-20 w-[350px] h-[350px] rounded-full bg-gradient-to-br from-[#81D7B4]/60 to-[#6BC5A0]/50 blur-3xl opacity-40 blob"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-[#81D7B4]/55 to-[#6BC5A0]/45 blur-3xl opacity-35 blob"
          style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#81D7B4]/50 to-[#6BC5A0]/40 blur-3xl opacity-30 blob"
          style={{ animationDelay: '4s', transform: `translateY(${scrollY * 0.15}px)` }}
        />

        {/* Enhanced glossy lighting overlays */}
        <div className="absolute inset-0 mix-blend-soft-light">
          <div
            className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 via-white/15 to-transparent opacity-70"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
        </div>

        {/* Diagonal light sweep */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="sheen absolute -top-6 -left-1/4 w-[60%] h-[140%] bg-gradient-to-r from-white/40 via-white/20 to-transparent blur-2xl opacity-70 mix-blend-soft-light" />
        </div>

        {/* Angled beam */}
        <div className="beam absolute -top-10 right-1/5 w-[55%] h-[220px] rotate-6 bg-gradient-to-r from-white/18 to-transparent blur-xl opacity-50 mix-blend-soft-light" />

        {/* Center specular highlight */}
        <div className="specular absolute top-6 left-1/2 -translate-x-1/2 w-[70%] h-[140px] rounded-[999px] bg-white/25 blur-2xl opacity-50 mix-blend-soft-light" />

        <style jsx>{`
          .blob { animation: blobPulse 10s ease-in-out infinite; }
          @keyframes blobPulse {
            0%, 100% { transform: translate3d(0,0,0) scale(1); }
            33% { transform: translate3d(10px,-8px,0) scale(1.1); }
            66% { transform: translate3d(-8px,10px,0) scale(0.95); }
          }
          .sheen { transform: skewX(-14deg) translateX(-30%); animation: sheenSweep 12s ease-in-out infinite; }
          @keyframes sheenSweep {
            0%, 100% { transform: skewX(-14deg) translateX(-30%); }
            50% { transform: skewX(-14deg) translateX(130%); }
          }
          .beam { animation: beamDrift 14s ease-in-out infinite; }
          @keyframes beamDrift {
            0%, 100% { transform: translate3d(0,0,0) rotate(6deg); }
            50% { transform: translate3d(-10px,8px,0) rotate(8deg); }
          }
          .specular { animation: specularBreath 8s ease-in-out infinite; }
          @keyframes specularBreath {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.08); }
          }
          @media (prefers-reduced-motion: reduce) {
            .blob, .sheen, .beam, .specular { animation: none; }
          }
        `}</style>
      </div>

      {/* Dynamic Glow Effects with parallax */}
      <div
        className="web3-interactive hidden sm:block absolute w-[500px] h-[500px] opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#81D7B4]/35 to-[#81D7B4]/25 blur-3xl rounded-full animate-pulse"
        style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.25}px)` }}
      ></div>
      <div
        className="web3-interactive hidden sm:block absolute w-80 h-80 opacity-15 top-1/3 right-1/3 bg-gradient-to-r from-[#81D7B4]/35 to-[#81D7B4]/15 blur-3xl rounded-full animate-pulse"
        style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.18}px)` }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">

        {/* Enhanced Web3 Badge */}
        <div
          className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#81D7B4]/15 to-[#6BC5A0]/15 backdrop-blur-md border border-[#81D7B4]/30 shadow-lg mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4] animate-pulse shadow-lg shadow-[#81D7B4]/50"></div>
          <span className="text-sm font-semibold text-[#81D7B4] tracking-wide">Decentralized Savings Protocol</span>
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] animate-pulse shadow-lg shadow-[#81D7B4]/50" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Main Heading with better hierarchy */}
        <div className="relative mb-10">
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ animationDelay: '0.2s', transform: `translateY(${scrollY * 0.08}px)` }}
          >
            <span className="block text-gray-900">
              Give Tomorrow a <span className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] bg-clip-text text-transparent">Soft Landing</span>
            </span>
            <span className="block text-gray-900 mt-4">
              Save with <span className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] bg-clip-text text-transparent">BitSave</span>
            </span>
          </h1>

          {/* Enhanced Glow Effect Behind Text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/25 via-[#6BC5A0]/25 to-[#81D7B4]/25 blur-3xl -z-10 scale-110 animate-pulse"></div>
        </div>

        {/* Enhanced Value Proposition */}
        <p
          className={`text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.4s', transform: `translateY(${scrollY * 0.06}px)` }}
        >
          Your <span className="text-[#81D7B4] font-bold">Onchain Savings Nest</span>.
          The <span className="text-[#6BC5A0] font-bold">SaveFi Protocol</span> helping
          <span className="text-[#81D7B4] font-bold"> income earners</span> save onchain
        </p>

        {/* Enhanced CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ animationDelay: '0.6s', transform: `translateY(${scrollY * 0.04}px)` }}
        >
          <Link
            href="/dashboard"
            className="group relative px-10 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white font-bold text-lg rounded-xl shadow-xl shadow-[#81D7B4]/30 hover:shadow-2xl hover:shadow-[#81D7B4]/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          >
            <span className="relative z-10">Start Saving Now</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#6BC5A0] to-[#81D7B4] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          </Link>

          <a
            href="https://www.youtube.com/shorts/CWRQ7rgtHzU"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-10 py-4 border-2 border-gray-300 text-gray-800 font-bold text-lg rounded-xl hover:border-[#81D7B4] hover:text-[#81D7B4] hover:bg-[#81D7B4]/5 transition-all duration-300 hover:shadow-xl hover:shadow-[#81D7B4]/20 hover:-translate-y-1"
          >
            Watch Demo
          </a>
        </div>

        {/* Modern Feature Cards - Inspired Design */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20"
          style={{ transform: `translateY(${scrollY * 0.03}px)` }}
        >
          {[
            {
              title: "Locked Savings",
              desc: "Set goals and lock funds until achieved",
              badge: "SECURE",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )
            },
            {
              title: "Earn Rewards",
              desc: "Get $BTS tokens for consistent saving",
              badge: "REWARDS",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              title: "Multi-Chain",
              desc: "Save across Base, Celo, and Lisk",
              badge: "NETWORKS",
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )
            }
          ].map((feature, i) => (
            <div
              key={i}
              className={`group relative p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-[#81D7B4]/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ animationDelay: `${0.8 + i * 0.1}s` }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              {/* Badge */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-[#81D7B4]/10 text-[#81D7B4] border border-[#81D7B4]/20">
                  {feature.badge}
                </span>
              </div>

              {/* Icon - Centered */}
              <div className="relative z-10 mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-[#81D7B4]/20">
                  {feature.icon}
                </div>
              </div>

              {/* Content - Centered */}
              <div className="relative z-10 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#81D7B4] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>

              {/* Decorative corner */}
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#81D7B4]/20 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>

        {/* Enhanced Network Cards Section */}
        <div className={`mt-20 w-full transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ animationDelay: '1s' }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></div>
              <span className="text-sm font-semibold text-[#81D7B4] uppercase tracking-wide">Multi-Chain Support</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Save Seamlessly Across</h3>
            <p className="text-gray-600 text-xl">Leading blockchain networks</p>
          </div>

          {/* Enhanced Network Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 sm:px-0">
            {chains.map((chain, index) => (
              <div
                key={chain.name}
                className="group relative rounded-2xl overflow-hidden border-2 border-gray-200/70 bg-white/90 backdrop-blur-md shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-[#81D7B4]/50"
                style={{
                  transform: `translateY(${scrollY * 0.02}px)`,
                  animationDelay: `${1.2 + index * 0.1}s`
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${chain.accentColor}40, transparent)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite'
                  }}
                ></div>

                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl border-2 bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                        style={{ borderColor: chain.accentColor }}
                      >
                        <Image
                          src={ensureImageUrl(chain.logo)}
                          alt={`${chain.name} logo`}
                          width={32}
                          height={32}
                          className="object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{chain.name}</h3>
                        <p className="text-sm text-gray-600">{chain.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Supported assets */}
                  <div className="flex flex-wrap gap-2">
                    {chain.tokens.slice(0, 4).map((token) => (
                      <span
                        key={`${chain.name}-${token}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 border-2 text-gray-800 text-sm font-semibold shadow-sm hover:bg-white transition-all hover:scale-105"
                        style={{ borderColor: `${chain.accentColor}40` }}
                      >
                        {token}
                      </span>
                    ))}
                    {chain.tokens.length > 4 && (
                      <span className="px-3 py-1.5 rounded-lg bg-gray-50 border-2 text-gray-700 text-sm font-semibold shadow-sm" style={{ borderColor: `${chain.accentColor}40` }}>
                        +{chain.tokens.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional info */}
          <div className="text-center mt-10">
            <p className="text-base text-gray-500">
              More networks coming soon •
              <span className="text-[#81D7B4] font-semibold ml-2">Cross-chain compatible</span>
            </p>
          </div>
        </div>

        {/* Moving Countries Conveyor Belt */}
        <div className={`mt-24 mb-20 overflow-hidden transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ animationDelay: '1.2s' }}>
          <p className="mb-10 text-center">
            <span className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full shadow-md text-gray-700 font-semibold">Trusted by savers worldwide</span>
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
                  className="flex items-center gap-3 px-5 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap flex-shrink-0"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-sm font-semibold text-gray-700">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#81D7B4]/40 rounded-full animate-pulse"
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
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              <FiX className="w-6 h-6" />
            </button>

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