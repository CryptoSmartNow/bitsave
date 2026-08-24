'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket01Icon, 
  Blockchain01Icon, 
  Wallet02Icon, 
  Moon02Icon, 
  MessageMultiple01Icon, 
  UserCircleIcon, 
  CustomerSupportIcon, 
  ZapIcon, 
  Tick01Icon,
  Cancel01Icon,
  ArrowRight01Icon
} from 'hugeicons-react';

interface V3WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function V3WelcomeModal({ isOpen, onClose, onStartTour }: V3WelcomeModalProps) {
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const handleClose = () => {
    if (doNotShowAgain) {
      localStorage.setItem('bitsave_hide_v3_modal', 'true');
    }
    onClose();
  };

  const handleStartTour = () => {
    if (doNotShowAgain) {
      localStorage.setItem('bitsave_hide_v3_modal', 'true');
    }
    onStartTour();
  };

  const features = [
    {
      icon: <Blockchain01Icon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Multi-Chain',
      title: 'Multi-Chain Savings',
      desc: 'Seamlessly save across Base, Celo, Lisk, BSC, and Avalanche with unified balances.'
    },
    {
      icon: <Moon02Icon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Experience',
      title: 'Dark Mode is Here',
      desc: 'A gorgeous, sleek dark theme crafted for visual comfort and high readability.'
    },
    {
      icon: <ZapIcon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Performance',
      title: 'Lightning Speed & Processing',
      desc: 'Re-engineered data pipelines for instantaneous sync, real-time rate updates, and faster transactions.'
    },
    {
      icon: <MessageMultiple01Icon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Community',
      title: 'SaveFi Forum & Socials',
      desc: 'Connect with other savers, share strategies, join discussions, and unlock group goals.'
    },
    {
      icon: <UserCircleIcon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Account',
      title: 'Brand New Profile Page',
      desc: 'Effortlessly manage your identity, custom avatars, ENS records, and personal preferences.'
    },
    {
      icon: <Wallet02Icon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Fiat & Crypto',
      title: 'Fiat Onramps & BizSwap',
      desc: 'Instant NGN & global fiat deposits with live official currency rate conversion.'
    },
    {
      icon: <CustomerSupportIcon className="w-5 h-5 text-[#14532d]" />,
      tag: 'Assistance',
      title: 'Dedicated Help & Feedback',
      desc: 'Direct channels to request features, submit instant feedback, and get 24/7 assistance.'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-3xl bg-white text-gray-900 rounded-[28px] sm:rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh] z-10"
          >
            {/* Soft Ambient Brand Glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#81D7B4]/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-[#81D7B4]/15 blur-3xl" />

            {/* Header */}
            <div className="relative px-6 py-6 sm:px-8 sm:py-7 border-b border-gray-100 bg-gradient-to-br from-[#F1FDF8]/90 via-white to-white shrink-0">
              <button 
                onClick={handleClose}
                className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 sm:p-2.5 rounded-full bg-gray-100/80 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-all cursor-pointer"
                aria-label="Close"
              >
                <Cancel01Icon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="px-3 py-1 rounded-full bg-[#81D7B4]/20 border border-[#81D7B4]/40 text-[#14532d] text-[11px] font-bold tracking-wider uppercase">
                  SaveFi v3.0
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                Welcome to SaveFi V3
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl leading-relaxed font-normal">
                Discover next-generation decentralized savings, turbocharged performance, a community forum, and native dark mode built for the ultimate financial freedom.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="px-6 py-5 sm:px-8 sm:py-6 overflow-y-auto custom-scrollbar flex-1 bg-[#FAFCFB]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {features.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 + idx * 0.03 }}
                    className="group relative p-4 rounded-2xl bg-white hover:bg-[#F1FDF8] border border-gray-200/70 hover:border-[#81D7B4]/60 transition-all duration-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                          {feature.icon}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#81D7B4]/15 text-[#14532d] border-[#81D7B4]/30">
                          {feature.tag}
                        </span>
                      </div>
                      <h4 className="text-[13.5px] font-bold text-gray-900 group-hover:text-[#14532d] transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-[11.5px] text-gray-500 mt-1 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 sm:px-8 sm:py-4.5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-xs">
              {/* Do not show again checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                  doNotShowAgain 
                    ? 'bg-[#81D7B4] border-[#81D7B4] shadow-sm' 
                    : 'bg-gray-50 border-gray-300 group-hover:border-[#81D7B4]'
                }`}>
                  {doNotShowAgain && <Tick01Icon className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={doNotShowAgain} 
                  onChange={(e) => setDoNotShowAgain(e.target.checked)} 
                />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Don't show this again
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleClose}
                  className="flex-1 sm:flex-none px-5 py-2.5 sm:py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200/60 transition-all text-xs sm:text-sm cursor-pointer"
                >
                  Skip
                </button>
                <button 
                  onClick={handleStartTour}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl font-bold text-white bg-[#81D7B4] hover:bg-[#6BBF9E] transition-all duration-200 shadow-[0_4px_16px_rgba(129,215,180,0.35)] hover:shadow-[0_6px_22px_rgba(129,215,180,0.45)] text-xs sm:text-sm cursor-pointer active:scale-95"
                >
                  <span className="text-white">Take the Tour</span>
                  <ArrowRight01Icon className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
