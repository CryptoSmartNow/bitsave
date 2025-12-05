'use client'
import { FiShield, FiLayout, FiLock } from 'react-icons/fi'

export default function Features() {
  const featureItems = [
    {
      title: "Designed for Secure Savings",
      description: "Bitsave provides goal-based savings plans with non-custodial smart contracts; you own your funds, withdraw your savings at any time.",
      detail: "Stable & Secure SavingsEnables recurring stablecoin savings, no risks of market volatility on your stable coin savings.",
      icon: <FiShield className="w-8 h-8 text-[#81D7B4]" />,
      color: "primary"
    },
    {
      title: "Designed for Simplicity",
      description: "Experience a clean and intuitive savings experience, on-chain savings easier than saving in a traditional account.",
      detail: "No DeFi Jargon, Just Simple Savings,No complex staking, yield farming, or trading—just secure, goal-based savings with a user-friendly interface",
      icon: <FiLayout className="w-8 h-8 text-[#6BC5A0]" />,
      color: "secondary"
    },
    {
      title: "Designed for Security & Control",
      description: "Peace of mind with a non-custodial savings model, users have full control of their savings.",
      detail: "Parent-child Smart Contracts structure for Security Each savings plan is stored in a user-owned smart contract (child contract), reducing risks of hacks or centralized failures. No pooled funds. Just secure, private savings.",
      icon: <FiLock className="w-8 h-8 text-[#4A9B7A]" />,
      color: "accent"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-gradient-to-b from-white to-[#f8fafa]">
      {/* Enhanced background elements */}
      <div className="absolute -z-10 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] top-1/4 left-0 transform -translate-x-1/2"></div>
      <div className="absolute -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] bottom-0 right-0 transform translate-x-1/3"></div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-24 h-24 border border-primary/20 rounded-lg rotate-12 opacity-30 hidden lg:block"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 border border-secondary/20 rounded-lg -rotate-12 opacity-30 hidden lg:block"></div>

      <div className="container mx-auto">
        <div className="text-center mb-20 animate-fade-in-up">
          {/* Enhanced title with decorative elements - Centered and more stunning */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 backdrop-blur-sm shadow-[0_0_15px_rgba(129,215,180,0.2)] mx-auto relative overflow-hidden group">
              {/* Holographic shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/20 to-[#81D7B4]/0 animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 animate-shimmer-slow"></div>

              <div className="w-3 h-3 rounded-full bg-[#81D7B4] animate-pulse relative z-10"></div>
              <span className="text-sm font-semibold text-[#81D7B4] uppercase tracking-wider relative z-10">Powerful Features</span>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
              Key Features
            </span>
          </h2>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Designed for growth, ease, and peace of mind - everything you need for successful crypto savings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {featureItems.map((feature, index) => (
            <div
              key={index}
              className="group relative p-10 rounded-3xl bg-white border-2 border-gray-100 hover:border-[#81D7B4]/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 group-hover:text-[#81D7B4] transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  {feature.description}
                </p>

                {/* Detail Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#81D7B4]/5 to-transparent border border-[#81D7B4]/10">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-bold text-[#81D7B4] block mb-2">Key Benefit:</span>
                    {feature.detail}
                  </p>
                </div>
              </div>

              {/* Decorative corner */}
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#81D7B4]/20 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      {/* animation keyframes */}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-15px) translateX(10px);
          }
          50% {
            transform: translateY(5px) translateX(-10px);
          }
          75% {
            transform: translateY(10px) translateX(5px);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shimmer-slow {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        @keyframes shimmer-delayed {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes spin-slow-reverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </section>
  );
}