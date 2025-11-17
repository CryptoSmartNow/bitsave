'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Exo } from 'next/font/google';
import { useReferrals } from '@/lib/useReferrals';
import { useAccount } from 'wagmi';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
})

export default function ReferralsPage() {
  const { address } = useAccount()
  const { referralData, loading, error, generateReferralCode, refreshReferralData } = useReferrals()
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setShowModal(true)
      setTimeout(() => {
        setCopied(false)
        setShowModal(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleGenerateCode = async () => {
    await generateReferralCode()
    await refreshReferralData()
  }

  if (!address) {
    return (
      <div className={`min-h-screen bg-gray-50 ${exo.className}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Referral Dashboard</h1>
            <p className="text-gray-600 mb-8">Please connect your wallet to view your referral information.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${exo.className}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#81D7B4] rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">Referral Dashboard</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Share BitSave with friends and earn rewards together! Build your network and grow your savings.</p>
          </motion.div>

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col justify-center items-center py-20"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#81D7B4] border-t-transparent absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg">Loading your referral data...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </motion.div>
          )}

          {!loading && !referralData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-white rounded-3xl shadow-lg border border-gray-200 p-12 text-center"
            >
              <div className="relative z-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-[#81D7B4] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                >
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Your Referral Link</h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">Create your unique referral link to start earning <span className="font-semibold text-[#81D7B4]">5 points</span> when friends create their first savings plan.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateCode}
                  className="px-8 py-4 bg-[#81D7B4] text-white font-semibold rounded-2xl hover:bg-[#6BC5A0] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>Generate Referral Link</span>
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {referralData && (
            <div className="space-y-6">
              {/* Referral Link Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Referral Link</h2>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 font-mono text-sm text-gray-700 break-all">
                      {referralData.referralLink}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(referralData.referralLink)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-[#81D7B4] text-white hover:bg-[#6BC5A0]'
                      }`}
                    >
                      {copied ? (
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
                  <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200/50">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      Share this link with friends to earn <span className="font-semibold">5 points</span> when they create their first savings plan. The more friends you refer, the more you earn!
                    </p>
                  </div>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Clicks</p>
                      <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalVisits}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Savings Plans Created</p>
                      <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalConversions}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Click to Savings Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{referralData.stats.conversionRate}%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-200 p-6 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Rewards</p>
                      <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalRewards}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Earnings Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#81D7B4] rounded-3xl p-8 text-white shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold">Your Earnings</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-sm opacity-90 mb-2">Total Earned</p>
                    <p className="text-4xl font-bold mb-1">{referralData.stats.totalRewards || 0}</p>
                    <p className="text-lg opacity-90">Points</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-sm opacity-90 mb-2">This Month</p>
                    <p className="text-3xl font-bold mb-1">{Math.floor((referralData.stats.totalRewards || 0) * 0.3)}</p>
                    <p className="text-lg opacity-90">Points</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-sm opacity-90 mb-2">Next Milestone</p>
                    <p className="text-2xl font-bold mb-3">{Math.max(0, 100 - (referralData.stats.totalRewards || 0))} Points</p>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((referralData.stats.totalRewards || 0) / 100) * 100)}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="bg-white h-3 rounded-full shadow-lg"
                      ></motion.div>
                    </div>
                    <p className="text-xs opacity-75 mt-2">{Math.min(100, ((referralData.stats.totalRewards || 0) / 100) * 100).toFixed(0)}% to next level</p>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Referral Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Referral Activity</h2>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-200">
                      All Time
                    </button>
                    <button className="px-4 py-2 text-sm bg-[#81D7B4] text-white rounded-xl shadow-lg">
                      This Month
                    </button>
                  </div>
                </div>
                  
                {referralData?.recentVisits && referralData.recentVisits.length > 0 ? (
                  <div className="space-y-4">
                    {referralData.recentVisits.map((visit, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="group flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`relative w-4 h-4 rounded-full ${
                            visit.converted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-cyan-500'
                          } shadow-lg`}>
                            <div className={`absolute inset-0 rounded-full ${
                              visit.converted ? 'bg-green-400' : 'bg-blue-400'
                            } animate-ping opacity-20`}></div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                            visit.converted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                              {visit.converted ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {visit.converted ? 'Created Savings Plan' : 'Link Click'}
                              </p>
                              <p className="text-sm text-gray-600 font-mono">
                                {visit.visitorWalletAddress 
                                  ? `${visit.visitorWalletAddress.slice(0, 6)}...${visit.visitorWalletAddress.slice(-4)}`
                                  : 'Anonymous visitor'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(visit.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(visit.timestamp).toLocaleTimeString()}
                          </p>
                          {visit.converted && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                +5 Points
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No referral activity yet</h3>
                    <p className="text-lg text-gray-600 mb-6">Start sharing your referral link to see activity here</p>
                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                      <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-700 font-medium">Earn 5 points for each successful referral</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Share Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-[#81D7B4] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Share Your Link</h2>
                </div>
                <p className="text-lg text-gray-600 mb-8">Spread the word and earn rewards when friends create their first savings plan!</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20BitSave%20for%20secure%20crypto%20savings!%20%23SaveFi%20%23Web3&url=${encodeURIComponent(referralData?.referralLink || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center space-x-3 p-6 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 shadow-lg"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.209c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="font-semibold">Share on X</span>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`https://warpcast.com/~/compose?text=Join%20me%20on%20BitSave%20for%20secure%20crypto%20savings!%20&embeds[]=${encodeURIComponent(referralData?.referralLink || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center space-x-3 p-6 bg-gray-50 text-gray-700 rounded-2xl hover:bg-gray-100 transition-all duration-300 border border-gray-200 shadow-lg"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-semibold">Share on Farcaster</span>
                  </motion.a>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(referralData?.referralLink || '')}
                    className="group flex items-center justify-center space-x-3 p-6 bg-[#81D7B4] text-white rounded-2xl hover:bg-[#6BC5A0] transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Copy Link</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-[#81D7B4] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Link Copied!</h3>
              <p className="text-gray-600 mb-8 text-lg">Your referral link has been copied to clipboard</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="w-full px-6 py-4 bg-[#81D7B4] text-white rounded-2xl hover:bg-[#6bc4a0] transition-all duration-300 font-semibold text-lg shadow-lg"
              >
                Got it
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}