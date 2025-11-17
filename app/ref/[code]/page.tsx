'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useReferrals } from '@/lib/useReferrals';
import { motion } from 'framer-motion';
import { Exo } from 'next/font/google';
import Link from 'next/link';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
})

export default function ReferralPage() {
  const params = useParams()

  const { address } = useAccount()
  const { trackReferralVisit, markReferralConversion } = useReferrals()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [isTracked, setIsTracked] = useState(false)

  useEffect(() => {
    if (params.code && typeof params.code === 'string') {
      setReferralCode(params.code)
    }
  }, [params.code])

  useEffect(() => {
    if (referralCode && !isTracked) {
      trackReferralVisit(referralCode)
      setIsTracked(true)
      
      // Store referral code for later conversion tracking
      localStorage.setItem('pendingReferralCode', referralCode)
    }
  }, [referralCode, isTracked, trackReferralVisit])

  useEffect(() => {
    if (address && referralCode) {
      // User is already connected, mark as conversion
      markReferralConversion(referralCode)
      localStorage.removeItem('pendingReferralCode')
    }
  }, [address, referralCode, markReferralConversion])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-white ${exo.className}`}>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80">
                Welcome to BitSave
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              You&apos;ve been invited to join the future of crypto savings!
            </p>
            <p className="text-lg text-gray-500">
              Start your SaveFi savings journey with BitSave&apos;s innovative stablecoin protocol.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-[#81D7B4]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-[#81D7B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Savings</h3>
              <p className="text-gray-600">Your funds are protected by smart contracts and decentralized protocols.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-[#81D7B4]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-[#81D7B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Earn Interest</h3>
              <p className="text-gray-600">Grow your savings with competitive interest rates on stablecoins.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="w-12 h-12 bg-[#81D7B4]/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-[#81D7B4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Goal-Based</h3>
              <p className="text-gray-600">Set savings goals and track your progress with our intuitive dashboard.</p>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#81D7B4] text-white font-semibold rounded-full hover:bg-[#81D7B4]/90 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/#features"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-200 hover:border-[#81D7B4] hover:text-[#81D7B4] transition-colors duration-300"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Referral Info */}
          {referralCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 p-6 bg-[#81D7B4]/5 rounded-2xl border border-[#81D7B4]/20"
            >
              <p className="text-sm text-gray-600">
                🎉 You&apos;re joining through a referral! Both you and your friend will earn rewards when you create your first savings plan.
              </p>
            </motion.div>
          )}

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 p-8 bg-gradient-to-br from-white/90 via-white/80 to-[#81D7B4]/10 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_0_rgba(129,215,180,0.2)] border border-white/30 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 50%, rgba(129,215,180,0.1) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
            
            {/* Neomorphism inner shadow */}
            <div className="absolute inset-2 rounded-2xl shadow-[inset_0_2px_4px_rgba(129,215,180,0.1),inset_0_-2px_4px_rgba(0,0,0,0.05)]"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-[#81D7B4] bg-clip-text text-transparent mb-8 text-center">Join Our Community</h3>
              <div className="flex justify-center space-x-10">
              {/* Telegram Link */}
                <a
                  href="https://t.me/+YimKRR7wAkVmZGRk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full transition-all duration-500 shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.4)] transform hover:-translate-y-2 hover:scale-110 backdrop-blur-sm border border-white/20 relative overflow-hidden group"
                  aria-label="Join our Telegram"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
                    boxShadow: '0 8px 25px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  {/* Glassmorphism shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-9 h-9 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>

              {/* X (Twitter) Link */}
              <a
                href="https://x.com/bitsaveprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-700 to-black text-white rounded-full transition-all duration-500 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)] transform hover:-translate-y-2 hover:scale-110 backdrop-blur-sm border border-white/20 relative overflow-hidden group"
                aria-label="Follow us on X"
                style={{
                  background: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #000000 100%)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Glassmorphism shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              </div>
              <p className="text-base text-gray-600 mt-8 text-center font-medium bg-gradient-to-r from-gray-600 to-[#81D7B4] bg-clip-text text-transparent">
                Stay updated with the latest news and connect with our community!
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}