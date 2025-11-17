'use client'
import { useRef, useEffect } from 'react';
import { FiMail } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';

// Combine all cards into one array
const allCards = [
  {
    id: '01',
    question: "What fees do I pay to use BitSave?",
    answer: "You pay a $1 fee per savings plan, split evenly between the CryptoSmart wallet (for operational costs) and the Buy Back Wallet (for $BTS buybacks).",
    color: 'bg-[#81D7B4]/10',
    pinColor: 'bg-[#81D7B4]',
    hoverColor: 'hover:bg-[#81D7B4]/20'
  },
  {
    id: '02',
    question: "Can I create multiple savings plans?",
    answer: "Yes, users can create multiple savings plans, each with its own principal, lock period, and penalty settings (10%–30%).",
    color: 'bg-[#81D7B4]/5',
    pinColor: 'bg-[#81D7B4]',
    hoverColor: 'hover:bg-[#81D7B4]/15'
  },
  {
    id: '03',
    question: "What is the penalty for breaking a savings plan?",
    answer: "You set the penalty (10%–30% of your savings) when creating the plan. If you break it early, this penalty is deducted and sent to the CryptoSmart wallet.",
    color: 'bg-[#81D7B4]/8',
    pinColor: 'bg-[#81D7B4]',
    hoverColor: 'hover:bg-[#81D7B4]/18'
  },
  {
    id: '04',
    question: "Still have questions?",
    answer: "Our team is available 24/7 to help you with any questions about BitSave. We're here to support your crypto savings journey.",
    color: 'bg-[#81D7B4]/5',
    pinColor: 'bg-[#81D7B4]',
    hoverColor: 'hover:bg-[#81D7B4]/15',
    isContact: true
  }
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Handle mouse movement for interactive background elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      
      
      const glowElements = sectionRef.current.querySelectorAll('.glow-element');
      const { left, top, width, height } = sectionRef.current.getBoundingClientRect();
      
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      glowElements.forEach((glow, index) => {
        const glowElement = glow as HTMLElement;
        const offsetX = (x - 0.5) * (20 + index * 5);
        const offsetY = (y - 0.5) * (20 + index * 5);
        glowElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="py-24 px-4 md:px-8 lg:px-16 relative overflow-hidden bg-[#f8fafa]">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[url('/grain-texture.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 -z-10 bg-[url('/circuit-pattern.svg')] opacity-[0.02] pointer-events-none"></div>
      
      {/* Floating Elements */}
      <div className="absolute -z-10 w-[600px] h-[600px] bg-[#81D7B4]/5 rounded-full blur-[100px] top-1/4 right-0 transform translate-x-1/3 animate-pulse-slow"></div>
      <div className="absolute -z-10 w-[500px] h-[500px] bg-[#81D7B4]/5 rounded-full blur-[100px] bottom-0 left-0 transform -translate-x-1/3 animate-pulse-slow-delayed"></div>

      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/30 mb-6 backdrop-blur-sm shadow-[0_0_15px_rgba(129,215,180,0.2)] mx-auto relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/20 to-[#81D7B4]/0 animate-shimmer"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 animate-shimmer-slow"></div>
              
            <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse relative z-10"></div>
            <span className="text-sm font-medium text-[#81D7B4] uppercase tracking-wider relative z-10">Common Questions</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
              Frequently Asked Questions
            </span>
          </h2>
          
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about savings with BitSave&#39;s innovative crypto platform
          </p>
        </div>
        
        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {allCards.map((card) => (
            <div 
              key={card.id}
              className="group relative"
            >
              <div className={`relative p-8 rounded-2xl ${card.color} shadow-lg backdrop-blur-xl border border-[#81D7B4]/20 transition-all duration-500 ${card.hoverColor} group-hover:shadow-xl h-full`}>
                {/* Background Effects */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent opacity-50"></div>
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
            </div>
            
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Question Number & Pin */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#81D7B4] to-[#81D7B4]/80">
                        {card.id}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${card.pinColor} animate-pulse`}></div>
              </div>
                  </div>

                  {/* Question */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors duration-300">
                    {card.question}
                  </h3>

                  {/* Answer */}
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {card.answer}
                  </p>

                  {/* Contact Actions */}
                  {card.isContact && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                      <button 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#81D7B4] text-white rounded-xl hover:bg-[#81D7B4]/90 transition-colors duration-300 group/button relative overflow-hidden flex-1 cursor-not-allowed opacity-70"
                        disabled
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></div>
                        <FiMail className="w-5 h-5" />
                        <span>Email Support</span>
                      </button>
                      
                      <a 
                        href="https://t.me/+YimKRR7wAkVmZGRk" 
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white/80 text-gray-800 rounded-xl border border-[#81D7B4]/20 hover:bg-white hover:border-[#81D7B4]/40 transition-all duration-300 group/button relative overflow-hidden flex-1"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#81D7B4]/0 via-[#81D7B4]/10 to-[#81D7B4]/0 -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000"></div>
                        <FaTelegramPlane className="w-5 h-5 text-[#81D7B4]" />
                        <span>Join Telegram</span>
                      </a>
                  </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-12 h-12 opacity-[0.07]">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-45">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#81D7B4] animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                    </svg>
                </div>
              </div>
            </div>
          ))}
          </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-10 right-10 w-24 h-24 border border-primary/20 rounded-lg rotate-12 opacity-30 hidden lg:block"></div>
      <div className="absolute top-10 left-10 w-16 h-16 border border-secondary/20 rounded-lg -rotate-12 opacity-30 hidden lg:block"></div>
      
      {/* styles for the security-card class */}
      <style jsx global>{`
        .security-card {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(129, 215, 180, 0.1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .security-card:hover {
          border-color: rgba(129, 215, 180, 0.3);
          box-shadow: 0 8px 32px rgba(129, 215, 180, 0.1);
        }
        
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(10px, 10px);
          }
          50% {
            transform: translate(-5px, 20px);
          }
          75% {
            transform: translate(-10px, 5px);
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
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        
        .animate-shimmer-slow {
          animation: shimmer-slow 5s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slow-delayed {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s;
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -15px) scale(1.1);
          }
          50% {
            transform: translate(-10px, 20px) scale(0.9);
          }
          75% {
            transform: translate(-15px, -10px) scale(1.05);
          }
        }
        
        .animate-blob {
          animation: blob 15s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}