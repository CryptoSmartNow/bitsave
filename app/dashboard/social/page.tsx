"use client"
import { useState, ReactNode, lazy, Suspense, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Exo } from 'next/font/google';
import { useReferrals } from '@/lib/useReferrals';
import { useSavingsData } from '@/hooks/useSavingsData';
import { HiOutlineTrophy, HiOutlineUserGroup, HiOutlineGlobeAlt } from 'react-icons/hi2';

// Lazy load heavy components
const TwitterFeed = lazy(() => import('./components/TwitterFeed'))
const SavvyFinanceVideos = lazy(() => import('./components/SavvyFinanceVideos'))

// Declare Twitter widgets for TypeScript
declare global {
  interface Window {
    twttr: {
      widgets: {
        load: () => void;
        createTweet: (tweetId: string, container: HTMLElement, options?: object) => Promise<HTMLElement>;
      };
    };
  }
}

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo'
})

// Mock data for demonstration
const MOCK_USER_DATA = {
  hasSavingsPlan: true,
  hasConnectedX: true,
  hasConnectedFarcaster: true,
  hasEmail: true,
  userPoints: 0, // Start with 0 points, will be updated based on actual activity
}

const twitterLinks = [
  'https://x.com/0xK3llyy/status/1975477383592616411?t=ROFvnL-WZedP4ofxq65eSA&s=19',
  'https://x.com/gloorry_/status/1974768248001286249?t=shWHyt4R6Pd6IivrwjFG9A&s=19',
  'https://x.com/FranciscaChiso3/status/1974575891515850862?t=shWHyt4R6Pd6IivrwjFG9A&s=19',
  'https://x.com/0xK3llyy/status/1974928974041035080?t=shWHyt4R6Pd6IivrwjFG9A&s=19',
  'https://x.com/mamin_xyz/status/1974961667646935062?t=shWHyt4R6Pd6IivrwjFG9A&s=19',
  'https://x.com/Elisha__Sunday/status/1974739002113642661?t=V0JknyQ_5P8rVUX3hFEKYg&s=19',
  'https://x.com/theweb3athlete/status/1974799128485113995?t=V0JknyQ_5P8rVUX3hFEKYg&s=19',
  'https://x.com/Celestina_crypt/status/1974571442814468483?t=hiLnCQaYv_UQNcO2Q5nlHg&s=19',
  'https://x.com/Heslinmariolar/status/1974215922039587272?t=hiLnCQaYv_UQNcO2Q5nlHg&s=19',
  'https://x.com/0xmillysmith/status/1974630660296847530?t=hiLnCQaYv_UQNcO2Q5nlHg&s=19',
  'https://x.com/bitsaveprotocol/status/1937769440806076921?s=46',
  'https://x.com/benedictfrank_/status/1923176035505344973?s=46',
  'https://x.com/mamin_xyz/status/1933100118766416048?s=46',
  'https://x.com/thedesign_dr/status/1928114921230803107?s=46',
  'https://x.com/lighter_defi/status/1935946790240489699?s=46',
  'https://x.com/sapphsparkles/status/1934659049544667648?s=46',
  'https://x.com/mamin_xyz/status/1904884465320472905?s=46',
  'https://x.com/alamzy001/status/1922675320861212679?s=46',
]

const savvyFinanceVideos = [
  {
    id: 'PdwOltnBznE',
    title: 'Video Title',
    thumbnail: 'https://img.youtube.com/vi/PdwOltnBznE/maxresdefault.jpg',
    creator: 'Savvy Finance',
    embedUrl: 'https://www.youtube.com/embed/PdwOltnBznE',
    url: 'https://youtu.be/PdwOltnBznE?si=UK15zqZUVEid9qt4',
  },
  {
    id: 'z1zvOmhfA0k',
    title: 'Video Title',
    thumbnail: 'https://img.youtube.com/vi/z1zvOmhfA0k/maxresdefault.jpg',
    creator: 'Savvy Finance',
    embedUrl: 'https://www.youtube.com/embed/z1zvOmhfA0k',
    url: 'https://youtube.com/shorts/z1zvOmhfA0k?feature=share',
  },
  {
    id: 'CWRQ7rgtHzU',
    title: 'Video Title',
    thumbnail: 'https://img.youtube.com/vi/CWRQ7rgtHzU/maxresdefault.jpg',
    creator: 'Savvy Finance',
    embedUrl: 'https://www.youtube.com/embed/CWRQ7rgtHzU',
    url: 'https://youtube.com/shorts/CWRQ7rgtHzU?feature=share',
  },
  {
    id: '2QzgDb-27BQ',
    title: 'Video Title',
    thumbnail: 'https://img.youtube.com/vi/2QzgDb-27BQ/maxresdefault.jpg',
    creator: 'Savvy Finance',
    embedUrl: 'https://www.youtube.com/embed/2QzgDb-27BQ',
    url: 'https://youtube.com/shorts/2QzgDb-27BQ?si=zcTRpALVASP_WcSl',
  },

]

export default function SavvySpacePage() {
  const [userData] = useState(MOCK_USER_DATA)
  const [showModal, setShowModal] = useState(false)
  const { referralData, loading: referralLoading, generateReferralCode } = useReferrals()
  const { savingsData } = useSavingsData()
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowModal(true)
      // Auto-hide modal after 2 seconds
      setTimeout(() => setShowModal(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  // Generate referral code on component mount if user doesn't have one
  useEffect(() => {
    if (!referralData && !referralLoading) {
      generateReferralCode()
    }
  }, [referralData, referralLoading, generateReferralCode])
  
  const referralLink = referralData?.referralLink || 'https://bitsave.io'
  
  const totalSavings = parseFloat(savingsData.totalLocked.replace(/[^0-9.-]+/g, ''))
  const showReferral = totalSavings >= 5

  const SavvySpace = () => (
    <div className="space-y-12 pb-20">
      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Points Card - Compact */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Earned</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{userData.userPoints.toLocaleString()}</span>
              <span className="text-sm font-semibold text-[#81D7B4]">PTS</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#81D7B4]/10 flex items-center justify-center text-[#81D7B4]">
            <HiOutlineTrophy className="w-6 h-6" />
          </div>
        </div>

        {/* Referral Card - Compact */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Referral Link</p>
          {showReferral ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600 truncate font-mono">
                {referralLink}
              </code>
              <button
                onClick={() => copyToClipboard(referralLink)}
                className="bg-[#81D7B4] hover:bg-[#6BC4A0] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Copy
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Unlock your referral link by saving at least <span className="font-bold text-gray-900">$5</span>.
              </p>
              <div className="hidden sm:block">
                 <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                   Locked
                 </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="space-y-16">
        
        {/* Videos Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-8 bg-[#81D7B4] rounded-full"></span>
                Savvy Finance Videos
              </h2>
              <p className="text-gray-500 mt-1 ml-4 text-sm">Master DeFi savings with our educational series</p>
            </div>
            {/* <button className="text-[#81D7B4] font-bold text-sm hover:underline">View All</button> */}
          </div>
          
          <Suspense fallback={<div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />}>
             <SavvyFinanceVideos videos={savvyFinanceVideos} />
           </Suspense>
        </section>

        {/* Social Feed Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-8 bg-[#81D7B4] rounded-full"></span>
                Community Pulse
              </h2>
              <p className="text-gray-500 mt-1 ml-4 text-sm">See what's happening in the Bitsave ecosystem</p>
            </div>
            <a 
              href="https://x.com/bitsaveprotocol" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow Us
            </a>
          </div>
          
          <Suspense fallback={<div className="h-96 bg-gray-50 rounded-2xl animate-pulse" />}>
             <TwitterFeed links={twitterLinks} />
           </Suspense>
        </section>

      </div>
    </div>
  )

  return (
    <div className={`${exo.className} min-h-screen bg-gray-50/50 text-gray-800`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <header className="mb-12 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2"
            >
              Savvy Space
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 max-w-2xl"
            >
              Your hub for community, learning, and rewards.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mt-4 sm:mt-0"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-xs font-bold text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm text-xs font-bold text-gray-600">
              <HiOutlineUserGroup className="w-3 h-3 text-[#81D7B4]" />
              Community
            </div>
          </motion.div>
        </header>

        <SavvySpace />
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center border border-gray-100 transform transition-all scale-100">
            <div className="w-12 h-12 bg-[#81D7B4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#2D5A4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Copied!</h3>
            <p className="text-sm text-gray-500 mb-6">Referral link copied to clipboard.</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-[#81D7B4] hover:bg-[#6BC4A0] text-white py-2.5 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
