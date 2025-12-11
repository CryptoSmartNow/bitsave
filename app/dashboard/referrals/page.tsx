'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import { useReferrals } from '@/lib/useReferrals';
import { useAccount } from 'wagmi';
import { useSavingsData } from '../../../hooks/useSavingsData';
import Link from 'next/link';
import {
  HiOutlineLockClosed,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiOutlineCursorArrowRays,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineCurrencyDollar,
  HiOutlineShare
} from 'react-icons/hi2';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
});

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const { referralData, loading: referralsLoading, error, generateReferralCode, refreshReferralData } = useReferrals();
  const { savingsData, isLoading: savingsLoading } = useSavingsData();

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateCode = async () => {
    await generateReferralCode();
    await refreshReferralData();
  };

  // Logic: Check if user has at least $5 in savings
  const totalSavings = parseFloat(savingsData?.totalLocked || '0');
  const isLocked = totalSavings < 5;
  // If we have referral data, we are loaded regardless of referralsLoading flag
  // This prevents the spinner from showing when we already have data but a refresh might be happening
  // Or if we know the user is locked, we can show the UI immediately
  const isLoading = !mounted || (referralsLoading && !referralData && !error) || savingsLoading;

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#F7FCFA] ${exo.className} flex items-center justify-center`}>
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`min-h-screen bg-[#F7FCFA] ${exo.className} p-8`}>
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Referral Dashboard</h1>
        </div>
        <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access the referral program.</p>
        </div>
      </div>
    );
  }

  // LOCKED STATE: Less than $5 savings
  if (isLocked) {
    return (
      <div className={`min-h-screen bg-[#F7FCFA] ${exo.className} p-4 sm:p-8`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
            <p className="text-gray-500">Invite friends and earn rewards</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineLockClosed className="w-10 h-10 text-gray-400" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Unlock Your Referral Dashboard</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To maintain the quality of our community and ensure genuine participation, you need at least <span className="font-bold text-gray-900">$5.00</span> in active savings to refer friends and earn rewards.
            </p>

            <div className="bg-orange-50 rounded-xl p-4 mb-8 border border-orange-100">
              <p className="text-sm font-medium text-orange-800">
                Current Savings: <span className="font-bold">${totalSavings.toFixed(2)}</span>
              </p>
            </div>

            <Link
              href="/dashboard/create-savings"
              className="block w-full py-4 bg-[#81D7B4] text-white font-semibold rounded-xl hover:bg-[#6BC5A0] transition-colors shadow-lg shadow-[#81D7B4]/20"
            >
              Start Saving Now
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE: Dashboard
  return (
    <div className={`min-h-screen bg-[#F7FCFA] ${exo.className} p-4 sm:p-8`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
          <p className="text-gray-500">Manage your referrals and track your rewards</p>
        </div>

        {/* Generate Code / Link Section */}
        {!referralData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm"
          >
            <div className="w-16 h-16 bg-[#81D7B4]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HiOutlineShare className="w-8 h-8 text-[#81D7B4]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Generate Your Referral Link</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your unique link to start earning <span className="font-semibold text-[#81D7B4]">5 points</span> whenever a friend creates their first savings plan.
            </p>
            <button
              onClick={handleGenerateCode}
              className="px-8 py-3 bg-[#81D7B4] text-white font-semibold rounded-xl hover:bg-[#6BC5A0] transition-colors shadow-lg shadow-[#81D7B4]/20"
            >
              Generate Link
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Link Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Your Referral Link</h2>
                  <p className="text-sm text-gray-500">Share this link to earn rewards</p>
                </div>
                <div className="flex-1 w-full md:max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-mono text-sm truncate">
                      {referralData.referralLink}
                    </div>
                    <button
                      onClick={() => copyToClipboard(referralData.referralLink)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all ${copied
                          ? 'bg-green-50 border-green-200 text-green-600'
                          : 'bg-white border-[#81D7B4] text-[#81D7B4] hover:bg-[#81D7B4]/5'
                        }`}
                    >
                      {copied ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlineClipboardDocument className="w-5 h-5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                    <HiOutlineCursorArrowRays className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Clicks</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalVisits}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-500">
                    <HiOutlineUserGroup className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Plans Created</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalConversions}</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-500">
                    <HiOutlineChartBar className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Conversion Rate</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{referralData.stats.conversionRate}%</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#81D7B4]/10 rounded-lg text-[#81D7B4]">
                    <HiOutlineCurrencyDollar className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Total Rewards</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{referralData.stats.totalRewards} <span className="text-sm font-normal text-gray-400">PTS</span></p>
              </div>
            </div>

            {/* Activity Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              </div>

              {referralData.recentVisits && referralData.recentVisits.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {referralData.recentVisits.map((visit: any, index: number) => (
                    <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visit.converted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {visit.converted ? <HiOutlineCheck className="w-5 h-5" /> : <HiOutlineCursorArrowRays className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {visit.converted ? 'New Savings Plan Created' : 'Link Clicked'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {visit.visitorWalletAddress
                              ? `${visit.visitorWalletAddress.slice(0, 6)}...${visit.visitorWalletAddress.slice(-4)}`
                              : 'Anonymous User'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(visit.timestamp).toLocaleDateString()}</p>
                        {visit.converted && (
                          <span className="inline-block mt-1 text-xs font-semibold text-[#81D7B4] bg-[#81D7B4]/10 px-2 py-0.5 rounded-full">
                            +5 Points
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-500">
                  <p>No activity yet. Share your link to get started!</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}