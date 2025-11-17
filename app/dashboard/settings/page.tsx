'use client';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Exo } from 'next/font/google';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineCheck,
  HiOutlineGlobeAlt,
  HiOutlineUserCircle,
  HiOutlineTag,
  HiOutlineWallet,
  HiOutlineClipboard,
  HiOutlineEnvelope,
  HiOutlineLink,
  HiOutlineUsers,
  HiOutlineSun,
  HiOutlineBellAlert,
} from 'react-icons/hi2'
import toast from 'react-hot-toast';
import NetworkDetection from '@/components/NetworkDetection';
import ENSLinking from '@/components/ENSLinking';
import { useENSData } from '@/hooks/useENSData';
import LanguageSelector from '@/components/LanguageSelector';

// Initialize Space Grotesk font
const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export default function Settings() {
  const { address } = useAccount();
  const { ensName, getDisplayName, hasENS } = useENSData();
  const [mounted, setMounted] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Profile'|'Language'|'Appearance'|'Notifications'>('Profile');
  const tabs = ['Profile','Language','Appearance','Notifications'] as const;

  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [email, setEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEmailConnected, setIsEmailConnected] = useState(false);
  
  // X/Twitter authentication state
  const [isXConnected, setIsXConnected] = useState(false);
  const [xUsername, setXUsername] = useState('');
  const [isConnectingX, setIsConnectingX] = useState(false);

  // Component mount effect
  useEffect(() => {
    setMounted(true);
  }, [address]);

  // Add a function to copy wallet address with feedback
  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setShowCopyNotification(true);
        setTimeout(() => setShowCopyNotification(false), 5000);
      } catch (err) {
        console.error('Failed to copy address: ', err);
      }
    }
  };

  const handleConnectEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch('/api/email/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          action: 'send_otp',
          walletAddress: address
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Verification code sent to your email!');
        setShowOtpModal(true);
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error('Email connection error:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/email/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          action: 'verify_otp',
          otp: otpString,
          walletAddress: address
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsEmailConnected(true);
        setShowOtpModal(false);
        setOtp(['', '', '', '', '', '']);
        localStorage.setItem('emailConnected', 'true');
        localStorage.setItem('connectedEmail', email.trim());
        toast.success('Email connected successfully!');
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch('/api/email/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          action: 'send_otp',
          walletAddress: address
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('New verification code sent to your email!');
        // Clear existing OTP inputs
        setOtp(['', '', '', '', '', '']);
      } else {
        toast.error(data.error || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      toast.error('Failed to resend verification code. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // X/Twitter authentication function
  const handleConnectX = async () => {
    setIsConnectingX(true);
    
    try {
      // Generate PKCE code verifier and challenge for security
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      localStorage.setItem('twitter_code_verifier', codeVerifier);
      localStorage.setItem('twitter_state', generateRandomString(32));
      
      // Twitter OAuth 2.0 authorization URL
      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '');
      authUrl.searchParams.append('redirect_uri', `${window.location.origin}/auth/twitter/callback`);
      authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.append('state', localStorage.getItem('twitter_state') || '');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl.toString(),
        'twitter-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      // Listen for the OAuth callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnectingX(false);
        }
      }, 1000);
      
      // Listen for messages from the popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();
          
          // Handle successful authentication
          setXUsername(event.data.username);
          setIsXConnected(true);
          
          // Store in localStorage for persistence
          localStorage.setItem('xUsername', event.data.username);
          localStorage.setItem('isXConnected', 'true');
          localStorage.setItem('xAccessToken', event.data.accessToken);
          
          setIsConnectingX(false);
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          console.error('Twitter authentication failed:', event.data.error);
          toast.error(`X Connection Failed: ${event.data.error}`);
          setIsConnectingX(false);
          window.removeEventListener('message', messageListener);
        }
      };
      
      window.addEventListener('message', messageListener);
      
    } catch (error) {
      console.error('X/Twitter authentication failed:', error);
      setIsConnectingX(false);
    }
  };

  // Load X/Twitter connection status from localStorage
  useEffect(() => {
    const savedXUsername = localStorage.getItem('xUsername');
    const savedXConnected = localStorage.getItem('isXConnected');
    
    if (savedXUsername && savedXConnected === 'true') {
      setXUsername(savedXUsername);
      setIsXConnected(true);
    }

    // Load email connection status
    const savedEmailConnected = localStorage.getItem('emailConnected');
    const savedEmail = localStorage.getItem('connectedEmail');
    
    if (savedEmailConnected === 'true' && savedEmail) {
      setIsEmailConnected(true);
      setEmail(savedEmail);
    }
  }, []);

  // Function to disconnect X/Twitter
  const handleDisconnectX = () => {
    setIsXConnected(false);
    setXUsername('');
    localStorage.removeItem('xUsername');
    localStorage.removeItem('isXConnected');
    localStorage.removeItem('xAccessToken');
  };
  
  // Helper functions for PKCE
  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
  
  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
  
  const generateRandomString = (length: number) => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .substring(0, length);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#81D7B4] rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`${exo.variable} font-sans relative min-h-screen bg-gradient-to-br from-gray-50 via-[#81D7B4]/5 to-white overflow-hidden`}>
      {/* Network Detection Component */}
      <NetworkDetection />
      
      {/* Enhanced Background Elements */}
      {/* Noise background removed per redesign spec */}
      
      {/* Decorative background elements removed per request */}
      
      {/* Main Content Container */}
      <div className="relative z-10 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">
      
      {/* Copy notification banner */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#81D7B4]/30 flex items-center"
          >
            <div className="bg-[#81D7B4]/10 p-1.5 rounded-full mr-3">
              <HiOutlineCheck className="w-4 h-4 text-[#81D7B4]" />
            </div>
            <span className="text-sm font-medium text-gray-700">Address copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Removed Account Settings header per request; pills moved to top */}
      
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        {/* Pill Tabs Navigation (bubble style) */}
        <div className="mb-6 sm:mb-8 flex justify-start">
          <div className="bg-gray-100 rounded-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all ${selectedTab === tab ? 'bg-white text-[#81D7B4] shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {/* Modern Layout */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Language Settings Card - Full Width */}
          <div className={selectedTab === 'Language' ? 'block' : 'hidden'}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
          >
            {/* Decorative background circles removed */}
            
            <div className="relative z-10">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl mr-4 sm:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiOutlineGlobeAlt className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Language Settings</h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Choose your preferred language for the interface</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-4 sm:p-6 rounded-xl border border-[#81D7B4]/20 mb-6">
                <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base">
                  Select your preferred language to customize the interface. Changes will be applied immediately across the entire application.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gray-50/80 rounded-lg sm:rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors duration-200 gap-3 sm:gap-0">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Interface Language</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Choose your preferred language for the interface</p>
                </div>
                <div className="w-full sm:w-64">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          </motion.div>
          </div>

          {/* Profile Settings Card - Full Width (background wrapper removed) */}
          <div className={`${selectedTab === 'Profile' ? 'block' : 'hidden'}`}>
          {/* Noise texture removed per redesign spec */}
          {/* Decorative background removed */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 lg:mb-10"
          >
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl mr-4 sm:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <HiOutlineUserCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Profile Settings</h2>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Manage your identity and social connections</p>
              </div>
            </div>
          </motion.div>
          
          {/* Display Name from Social Connections */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                <HiOutlineTag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Display Name</h3>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-[#81D7B4]/20">
              
              <div className="relative">
                <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                  Your display name is automatically pulled from your connected social accounts. 
                  <span className="font-semibold text-[#81D7B4]">Connect your social accounts below</span> to set your display name.
                </p>
                
                {/* Social Account Integration Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* X (Twitter) Status */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-lg hover:shadow-xl transition-all duration-300 gap-3 sm:gap-0"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-800 to-black rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                        <span className="text-white font-bold text-base sm:text-lg">𝕏</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 text-base sm:text-lg">X (Twitter)</span>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {isXConnected && xUsername ? `@${xUsername}` : 'Social platform'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      {isXConnected && xUsername ? (
                        <>
                          <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium border border-green-200">Connected</span>
                          <button 
                            onClick={handleDisconnectX}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium border border-red-200">Not Connected</span>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Farcaster Status */}
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-lg hover:shadow-xl transition-all duration-300 gap-3 sm:gap-0"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                        <span className="text-white font-bold text-xs sm:text-sm">FC</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800 text-base sm:text-lg">Farcaster</span>
                        <p className="text-gray-500 text-xs sm:text-sm">Decentralized social</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end">
                      <span className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium border border-red-200">Not Connected</span>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-[#81D7B4]/20"
                >
                  <div className="flex items-start">
                    <div className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">💡 Pro Tip</h4>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                        Connect your social accounts to automatically set your display name and enhance your profile with verified social presence.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* ENS Domain */}
          <div className={selectedTab === 'Profile' ? 'block' : 'hidden'}>
            <ENSLinking />
          </div>
          
          {/* Spacing between sections */}
          <div className="h-6 sm:h-8 lg:h-10"></div>
          
          {/* Wallet Address (moved under Profile tab) */}
          <div className={selectedTab === 'Profile' ? 'block' : 'hidden'}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
          >
          {/* Noise background removed per redesign spec */}
            {/* Decorative background removed */}
            
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] p-2 sm:p-3 rounded-lg sm:rounded-xl mr-3 sm:mr-4 shadow-lg">
                <HiOutlineWallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">Wallet Address</h3>
            </div>
            
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-3 sm:gap-0">
                  <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl mr-0 sm:mr-4 lg:mr-6 shadow-lg w-fit">
                    <HiOutlineWallet className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="badge-container">
                        <p className="ens-name">
                          {hasENS && ensName ? ensName : getDisplayName()}
                        </p>
                        <div className="status-badge status-badge-connected">
                          <div className="status-dot"></div>
                          <span className="status-text">Connected</span>
                        </div>
                        {hasENS && (
                          <div className="status-badge status-badge-ens">
                            <span className="status-icon">⟠</span>
                            <span className="status-text">ENS Connected</span>
                          </div>
                        )}
                        {isXConnected && xUsername && (
                          <div className="status-badge status-badge-x">
                            <span className="status-icon">𝕏</span>
                            <span className="status-text">X Connected</span>
                          </div>
                        )}
                      </div>
                      <p className="text-black text-sm sm:text-base lg:text-lg font-semibold">
                        {hasENS ? 'Your ENS domain name' : (isXConnected && xUsername ? 'Your X/Twitter display name' : 'Your primary wallet address')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#81D7B4] text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] text-sm sm:text-base"
                >
                  <HiOutlineClipboard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Copy Address</span>
                  <span className="sm:hidden">Copy</span>
                </motion.button>
                </div>
          </motion.div>
          </div>
        </div>
        
        {/* Secondary Grid Layout for Additional Settings */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 mt-12 sm:mt-16 lg:mt-20">
          {/* Email Connect Card */}
        <div className={selectedTab === 'Notifications' ? 'block' : 'hidden'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
        >
          {/* Noise texture removed per redesign spec */}
          {/* Decorative background removed */}
          
          <div className="relative z-10">
            <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <HiOutlineEnvelope className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Email Connect</h2>
                <p className="text-gray-600 text-sm sm:text-base">Secure notifications & updates</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-[#81D7B4]/20 mb-6 sm:mb-8">
              <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base">
                Connect your email to receive updates, rewards, and important notifications about your savings and SaveFi activities.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 sm:gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isEmailConnected}
                  className="w-full bg-white/80 border-2 border-[#81D7B4]/30 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 rounded-lg sm:rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-gray-900 shadow-lg transition-all placeholder:text-gray-400 font-medium text-sm sm:text-base outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              {isEmailConnected ? (
                <div className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base">
                  <HiOutlineCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  Email Connected
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnectEmail}
                  disabled={!email.trim() || isConnecting}
                  className="w-full bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#81D7B4] disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <HiOutlineLink className="w-4 h-4 sm:w-5 sm:h-5" />
                      Connect Email
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
        </div>

          {/* Social Connect Card */}
          <div className={selectedTab === 'Profile' ? 'block' : 'hidden'}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
          >
            {/* Noise texture removed per redesign spec */}
            {/* Decorative background removed */}
            
            <div className="relative z-10">
              <div className="flex items-center mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-3 sm:p-4 rounded-xl sm:rounded-2xl mr-3 sm:mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiOutlineUsers className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Social Connect</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Link your social accounts</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-[#81D7B4]/20 mb-6 sm:mb-8">
                <p className="text-gray-700 font-medium leading-relaxed text-sm sm:text-base">
                  Connect your social accounts to enhance your profile and unlock exclusive features.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-[#81D7B4] to-[#6BC5A0] hover:from-[#6BC5A0] hover:to-[#81D7B4] text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-[#81D7B4] font-bold text-xs sm:text-sm">FC</span>
                  </div>
                  Connect Farcaster
                </motion.button>
                
                {isXConnected && xUsername ? (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDisconnectX}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm sm:text-lg">𝕏</span>
                    </div>
                    Disconnect @{xUsername}
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConnectX}
                    disabled={isConnectingX}
                    className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base disabled:cursor-not-allowed"
                  >
                    {isConnectingX ? (
                      <>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-lg flex items-center justify-center">
                          <span className="text-black font-bold text-sm sm:text-lg">𝕏</span>
                        </div>
                        Connect X/Twitter
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        
          {/* Appearance Settings */}
          <div className={selectedTab === 'Appearance' ? 'block' : 'hidden'}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-visible group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
          >
          {/* Noise background removed per redesign spec */}
            {/* Decorative background removed */}
            
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-4 rounded-2xl mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiOutlineSun className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Appearance</h2>
                <p className="text-gray-600 text-sm sm:text-base">Customize your visual experience</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-6 rounded-xl border border-[#81D7B4]/20 mb-8">
                <p className="text-gray-700 font-medium leading-relaxed">
                  Choose your preferred theme and customize the look of your dashboard.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gray-50/80 rounded-lg sm:rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors duration-200 gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Dark Mode</h3>
                      <span className="px-2 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full border border-orange-200">Coming Soon</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Switch to dark theme for better viewing in low light</p>
                  </div>
                  <div className="relative opacity-50 cursor-not-allowed">
                    <input type="checkbox" className="sr-only" disabled />
                    <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-300 rounded-full shadow-inner">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-0.5 translate-y-0.5"></div>
                    </div>
                  </div>
                </div>
                

              
              </div>
            </div>
          </motion.div>
          </div>
          
          {/* Notifications Settings */}
          <div className={selectedTab === 'Notifications' ? 'block' : 'hidden'}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-[#81D7B4]/20 shadow-[0_20px_40px_-15px_rgba(129,215,180,0.2)] relative overflow-hidden group hover:shadow-[0_30px_60px_-12px_rgba(129,215,180,0.3)] transition-all duration-500"
          >
          {/* Noise background removed per redesign spec */}
            {/* Decorative background removed */}
            
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="bg-gradient-to-br from-[#81D7B4] to-[#6BC5A0] p-4 rounded-2xl mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiOutlineBellAlert className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1">Notifications</h2>
                <p className="text-gray-600 text-sm sm:text-base">Manage your alert preferences</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#81D7B4]/8 to-[#6BC5A0]/8 p-6 rounded-xl border border-[#81D7B4]/20 mb-8">
                <p className="text-gray-700 font-medium leading-relaxed">
                  Stay updated with important account activities and transaction alerts.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gray-50/80 rounded-lg sm:rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors duration-200 gap-3 sm:gap-0">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Email Notifications</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="w-10 h-5 sm:w-12 sm:h-6 bg-[#81D7B4] rounded-full shadow-inner cursor-pointer transition-colors duration-300">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-5 sm:translate-x-6 translate-y-0.5"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 bg-gray-50/80 rounded-lg sm:rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors duration-200 gap-3 sm:gap-0">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Push Notifications</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Browser notifications</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-10 h-5 sm:w-12 sm:h-6 bg-gray-300 rounded-full shadow-inner cursor-pointer transition-colors duration-300 hover:bg-gray-400">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-0.5 translate-y-0.5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#81D7B4]/30 shadow-[0_20px_50px_-15px_rgba(129,215,180,0.3)] max-w-md w-full relative overflow-hidden"
          >
          {/* Decorative background circles removed */}
            
            <div className="relative z-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-[#81D7B4]/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-[#81D7B4]">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h3>
                <p className="text-gray-600 text-xs sm:text-sm">We&apos;ve sent a 6-digit verification code to</p>
                <p className="text-[#81D7B4] font-semibold text-xs sm:text-sm">{email}</p>
              </div>

              <div className="mb-6 sm:mb-8">
                <div className="flex justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold bg-white/80 border-2 border-[#81D7B4]/30 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 rounded-lg sm:rounded-xl shadow-[inset_2px_2px_8px_rgba(129,215,180,0.08)] transition-all outline-none"
                      maxLength={1}
                    />
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.some(digit => !digit) || isVerifying}
                    className="flex-1 bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] text-white py-3 rounded-lg sm:rounded-xl font-semibold shadow-[0_4px_15px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgba(129,215,180,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
                <button 
                  onClick={handleResendCode}
                  disabled={isConnecting}
                  className="text-[#81D7B4] text-xs sm:text-sm font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-3 h-3 border border-[#81D7B4]/30 border-t-[#81D7B4] rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}