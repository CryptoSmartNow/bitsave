"use client"
import { useState, ReactNode, lazy, Suspense, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';
import { useReferrals } from '@/lib/useReferrals';

// Lazy load heavy components
const TwitterFeed = lazy(() => import('./components/TwitterFeed'))
const SavvyFinanceVideos = lazy(() => import('./components/SavvyFinanceVideos'))
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner'))

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

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk'
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

  const TaskIcon = memo(({ icon }: { icon: string }) => {
    const icons: { [key: string]: ReactNode } = {
      twitter: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
      farcaster: <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.5 10.5C21.5 9.67157 20.8284 9 20 9H12C11.1716 9 10.5 9.67157 10.5 10.5V21.5C10.5 22.3284 11.1716 23 12 23H20C20.8284 23 21.5 22.3284 21.5 21.5V10.5Z" fill="currentColor"/><path d="M16 13.5C17.3807 13.5 18.5 14.6193 18.5 16C18.5 17.3807 17.3807 18.5 16 18.5C14.6193 18.5 13.5 17.3807 13.5 16C13.5 14.6193 14.6193 13.5 16 13.5Z" fill="white"/></svg>,
      email: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>,
      tweet: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      cast: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      referral: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.5a9 9 0 0118 0" /></svg>,
      streak: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
      calendar: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      saturn: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" strokeWidth={2}/><ellipse cx="12" cy="12" rx="8" ry="2" strokeWidth={1.5}/><ellipse cx="12" cy="12" rx="10" ry="3" strokeWidth={1} opacity="0.6"/></svg>,
    }
    return icons[icon] || null
  })

  TaskIcon.displayName = 'TaskIcon'

  const SavvySpace = () => (
    <div className="space-y-8">
      {/* Enhanced User Points and Referral Section with Dashboard Styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Background decorative elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#81D7B4]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#81D7B4]/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Main Container with Dashboard Glassmorphism */}
        <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-[0_20px_60px_-15px_rgba(129,215,180,0.3),0_8px_32px_-8px_rgba(22,50,57,0.2),inset_0_1px_0_rgba(255,255,255,0.4)] p-8 md:p-12 overflow-hidden group hover:shadow-[0_25px_80px_-15px_rgba(129,215,180,0.4),0_12px_40px_-8px_rgba(22,50,57,0.3)] transition-all duration-700">
          {/* Noise texture overlay */}
          <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
          
          {/* Container decorative elements */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#81D7B4]/30 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-[#81D7B4]/25 rounded-full blur-3xl group-hover:scale-105 transition-transform duration-1000" style={{animationDelay: '500ms'}}></div>
          
          {/* Content Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Points Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(129,215,180,0.15)] p-6 overflow-hidden group/card"
            >
              {/* Card background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-[#81D7B4]/10 opacity-80"></div>
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#81D7B4]/20 rounded-full blur-2xl group-hover/card:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-[#81D7B4] rounded-full mr-3 animate-pulse"></div>
                  <h3 className="text-sm font-semibold text-gray-600/80 tracking-wide uppercase">Your Points</h3>
                </div>
                <div className="flex items-baseline space-x-2 mb-2">
                  <p className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text tracking-tight">
                    {userData.userPoints.toLocaleString()}
                  </p>
                  <span className="text-sm font-bold text-gray-500">PTS</span>
                </div>
                <p className="text-sm text-[#81D7B4] font-semibold">{userData.userPoints} $BTS</p>
              </div>
            </motion.div>

            {/* Referral Link Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(129,215,180,0.15)] p-6 overflow-hidden group/card"
            >
              {/* Card background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-[#81D7B4]/10 opacity-80"></div>
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#81D7B4]/20 rounded-full blur-2xl group-hover/card:scale-110 transition-transform duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-[#81D7B4] rounded-full mr-3 animate-pulse"></div>
                  <h3 className="text-sm font-semibold text-gray-600/80 tracking-wide uppercase">Your Referral Link</h3>
                </div>
                <div className="flex items-center mt-3 mb-3">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="flex-1 bg-white/60 backdrop-blur-sm rounded-l-xl px-4 py-3 border border-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/50 text-gray-700 font-medium"
                  />
                  <motion.button
                    onClick={() => copyToClipboard(referralLink)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white px-4 py-3 rounded-r-xl shadow-[0_4px_12px_rgba(129,215,180,0.4)] hover:shadow-[0_8px_20px_rgba(129,215,180,0.5)] transition-all duration-300 font-semibold"
                  >
                    Copy
                  </motion.button>
                </div>
                <p className="text-xs text-gray-600/80 font-medium">Share this link to earn 5 points for every sign-up!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Savvy Finance Videos Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        {/* Section Header with Dashboard Styling */}
        <div className="relative mb-8">
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-[#81D7B4] rounded-full shadow-[0_0_20px_rgba(129,215,180,0.6)]"></div>
          <div className="pl-6">
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text tracking-tight mb-2">
              Savvy Finance Videos
            </h2>
            <p className="text-gray-600/80 font-medium">Learn SaveFi fundamentals and advanced strategies</p>
          </div>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
           <SavvyFinanceVideos videos={savvyFinanceVideos} />
         </Suspense>
      </motion.div>

      {/* Enhanced Savvy Talks - Twitter Feed Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative"
      >
        {/* Section Header with Dashboard Styling */}
        <div className="relative mb-8">
          <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-12 bg-[#81D7B4] rounded-full shadow-[0_0_20px_rgba(129,215,180,0.6)]"></div>
          <div className="pl-6">
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text tracking-tight mb-2">
              Savvy Talks
            </h2>
            <p className="text-gray-600/80 font-medium">Community discussions and insights</p>
          </div>
        </div>
        
        <Suspense fallback={<LoadingSpinner />}>
           <TwitterFeed links={twitterLinks} />
         </Suspense>
      </motion.div>
    </div>
  )

  return (
    <div className={`${spaceGrotesk.className} min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800`}>
      {/* Enhanced background layers */}
      <div className="fixed inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
      <div className="fixed top-0 -left-1/4 w-full h-full bg-gradient-to-br from-[#81D7B4]/20 via-transparent to-transparent -z-10 blur-3xl"></div>
      <div className="fixed top-0 -right-1/4 w-full h-full bg-gradient-to-tl from-blue-500/10 via-transparent to-transparent -z-10 blur-3xl"></div>
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-[#81D7B4]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-[#81D7B4]/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-7xl">
        {/* Enhanced header section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center relative"
        >
          {/* Header background with glassmorphism */}
          <div className="relative bg-white/30 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(129,215,180,0.2)] p-12 overflow-hidden">
            {/* Header decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#81D7B4]/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#81D7B4]/15 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Main title with enhanced typography */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-gradient-to-r from-[#81D7B4] via-[#6BC4A0] to-[#81D7B4] bg-clip-text tracking-tight mb-6 leading-tight">
                Savvy Space
              </h1>
              
              {/* Subtitle with better spacing */}
              <p className="text-lg md:text-xl text-gray-600/90 font-medium max-w-3xl mx-auto leading-relaxed mb-8">
                Engage with the community, complete tasks to earn points, and climb the leaderboard while mastering SaveFi fundamentals!
              </p>
              
              {/* Status indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-semibold text-gray-700">Community Active</span>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  <div className="w-2 h-2 bg-[#81D7B4] rounded-full mr-2 animate-pulse"></div>
                  <span className="font-semibold text-gray-700">New Content Daily</span>
                </div>
                <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  <div className="w-2 h-2 bg-[#81D7B4] rounded-full mr-2 animate-pulse"></div>
                  <span className="font-semibold text-gray-700">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <SavvySpace />
      </div>

      {/* Success Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-[0_20px_60px_rgba(129,215,180,0.3)] p-8 max-w-md mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-[#81D7B4] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Link Copied!</h3>
            <p className="text-gray-600/80 font-medium mb-6">Your referral link has been copied to clipboard. Share it to earn points!</p>
            <motion.button
              onClick={() => setShowModal(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-[0_8px_32px_rgba(129,215,180,0.4)] transition-all duration-300"
            >
              Got it!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}