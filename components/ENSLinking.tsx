'use client'

import { useState, useEffect, Fragment } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { ProfileCard } from 'ethereum-identity-kit'
import { useENSData } from '@/hooks/useENSData'
import toast from 'react-hot-toast'
import Image from 'next/image'
import ENSErrorModal from './ENSErrorModal'
import { HiOutlineGlobeAlt, HiOutlineCheck, HiOutlineAtSymbol } from 'react-icons/hi2'

interface ENSLinkingProps {
  onENSLinked?: (ensName: string) => void
}

export default function ENSLinking({ onENSLinked }: ENSLinkingProps) {
  const { address } = useAccount()
  const { ensName, avatar, isLoading, error, refreshENSData, hasENS } = useENSData()
  const [isLinking, setIsLinking] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)
  const [inputENS, setInputENS] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    ensName?: string
  }>({ isOpen: false, title: '', message: '' })

  // Reset input when ENS data changes
  useEffect(() => {
    if (ensName) {
      setInputENS(ensName)
    }
  }, [ensName])

  const handleLinkENS = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!inputENS.trim()) {
      toast.error('Please enter an ENS name')
      return
    }

    if (!inputENS.endsWith('.eth')) {
      toast.error('Please enter a valid .eth domain')
      return
    }

    setIsVerifying(true)
    
    try {
      // Use our own ENS resolution instead of external API
      const { resolveENSData } = await import('@/hooks/useENSData')
      const resolvedData = await resolveENSData(inputENS)
      
      if (!resolvedData.address) {
        setErrorModal({
          isOpen: true,
          title: 'ENS Name Not Found',
          message: 'The ENS name you entered could not be resolved. Please check the spelling and make sure it exists.',
          ensName: inputENS
        })
        return
      }
      
      const resolvedAddress = resolvedData.address.toLowerCase()
      
      if (resolvedAddress !== address.toLowerCase()) {
        setErrorModal({
          isOpen: true,
          title: 'ENS Ownership Mismatch',
          message: 'This ENS name does not resolve to your connected wallet address. You can only link ENS names that you own.',
          ensName: inputENS
        })
        return
      }
      
      // Store the verified ENS name
      if (typeof window !== 'undefined') {
        localStorage.setItem(`verified_ens_${address}`, inputENS)
      }
      
      // Refresh ENS data to update the display
      refreshENSData()
      
      toast.success(`Successfully linked ${inputENS}!`)
      
      if (onENSLinked) {
        onENSLinked(inputENS)
      }
      
      setIsLinking(false)
    } catch (error) {
      console.error('Error linking ENS:', error)
      setErrorModal({
        isOpen: true,
        title: 'Connection Error',
        message: 'Unable to verify the ENS name due to a network error. Please check your internet connection and try again.',
        ensName: inputENS
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleUnlinkENS = () => {
    if (address && typeof window !== 'undefined') {
      localStorage.removeItem(`verified_ens_${address}`)
      localStorage.removeItem(`ens_data_${address}`)
      refreshENSData()
      toast.success('ENS name unlinked successfully')
      setInputENS('')
      setIsLinking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading ENS data...</span>
        </div>
      </div>
    )
  }

  return (
    <Fragment>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
    >
      <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-bl from-[#81D7B4]/10 to-[#6BC5A0]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-[#81D7B4]/8 to-[#6BC5A0]/8 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
            <HiOutlineGlobeAlt className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">ENS Domain</h2>
            <p className="text-gray-600 text-sm sm:text-base">Link your Ethereum Name Service domain</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-[#81D7B4]/20 mb-6 sm:mb-8">
          <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base">
            Connect your ENS domain to display a memorable name instead of your wallet address across the platform.
          </p>
        </div>

        {hasENS && !isLinking ? (
          // Display linked ENS
          <div className="space-y-4">
            <div className="ens-profile-container">
              <div className="ens-profile-header">
                <div className="ens-profile-success-icon">
                  <HiOutlineCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="ens-profile-title">ENS Domain Linked</h3>
                  <p className="ens-profile-subtitle">Your domain is successfully connected</p>
                </div>
              </div>
              
              <div className="ens-profile-content">
                {avatar && (
                  <Image 
                    src={avatar} 
                    alt="ENS Avatar" 
                    width={64}
                    height={64}
                    className="ens-avatar"
                  />
                )}
                <div className="ens-profile-info">
                  <p className="ens-profile-name">{ensName}</p>
                  <p className="ens-profile-description">Resolves to your wallet address</p>
                </div>
                <button
                  onClick={() => setShowProfileCard(!showProfileCard)}
                  className="ens-button-primary"
                >
                  {showProfileCard ? 'Hide Profile' : 'Show Profile'}
                </button>
              </div>
              
              {showProfileCard && ensName && (
                 <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                   <ProfileCard 
                     addressOrName={ensName}
                     darkMode={false}
                   />
                 </div>
               )}
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setIsLinking(true)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
              >
                Change ENS
              </button>
              <button
                onClick={handleUnlinkENS}
                className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-red-200 transition-all duration-300 text-sm sm:text-base"
              >
                Unlink ENS
              </button>
            </div>
          </div>
        ) : (
          // ENS linking form
          <div className="space-y-4">
            {!isLinking && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineAtSymbol className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No ENS Domain Linked</h3>
                <p className="text-gray-600 text-sm mb-6">Connect your .eth domain to personalize your identity</p>
                <button
                  onClick={() => setIsLinking(true)}
                  className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Link ENS Domain
                </button>
              </div>
            )}
            
            {isLinking && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ENS Domain
                  </label>
                  <input
                    type="text"
                    value={inputENS}
                    onChange={(e) => setInputENS(e.target.value)}
                    placeholder="yourname.eth"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#81D7B4] focus:border-transparent outline-none transition-all duration-300"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setIsLinking(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLinkENS}
                    disabled={isVerifying || !inputENS.trim()}
                    className="flex-1 bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] text-white py-3 rounded-lg sm:rounded-xl font-semibold shadow-[0_4px_15px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Link ENS Domain'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </motion.div>
    
    {/* ENS Error Modal - Moved outside container for full screen display */}
    <ENSErrorModal
      isOpen={errorModal.isOpen}
      onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
      title={errorModal.title}
      message={errorModal.message}
      ensName={errorModal.ensName}
    />
   </Fragment>
  )
}

export { ENSLinking }