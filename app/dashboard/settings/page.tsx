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
  const [selectedTab, setSelectedTab] = useState<'Profile' | 'Language' | 'Appearance' | 'Notifications'>('Profile');
  const tabs = ['Profile', 'Language', 'Appearance', 'Notifications'] as const;

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

  // Savvy Name state
  const [savvyNameInput, setSavvyNameInput] = useState('');
  const [currentSavvyName, setCurrentSavvyName] = useState('');
  const [isSavingSavvyName, setIsSavingSavvyName] = useState(false);

  // Component mount effect
  useEffect(() => {
    setMounted(true);
  }, [address]);

  // Fetch Savvy Name
  useEffect(() => {
    const fetchSavvyName = async () => {
      if (address) {
        try {
          const res = await fetch(`/api/users/savvy?walletAddress=${address}`);
          const data = await res.json();
          if (data.savvyName) {
            setCurrentSavvyName(data.savvyName);
            setSavvyNameInput(data.savvyName.replace(/\.savvy$/, ''));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchSavvyName();
  }, [address]);

  // Handlers for Savvy Name
  const handleSaveSavvyName = async () => {
    if (!savvyNameInput.trim()) return toast.error('Savvy Name cannot be empty');
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(savvyNameInput)) {
      return toast.error('Savvy name must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    const finalSavvyName = `${savvyNameInput.trim()}.savvy`;

    setIsSavingSavvyName(true);
    try {
      const response = await fetch('/api/users/savvy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, savvyName: finalSavvyName })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Savvy Name updated successfully!');
        setCurrentSavvyName(data.savvyName);
      } else {
        toast.error(data.error || 'Failed to update Savvy Name');
      }
    } catch (e) {
      toast.error('An error occurred while saving your Savvy Name');
    } finally {
      setIsSavingSavvyName(false);
    }
  };

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
    <div className={`${exo.variable} font-sans relative min-h-screen bg-[#f8faf9] overflow-hidden`}>
      <NetworkDetection />
            
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight mb-2">Settings</h1>
            <p className="text-[#64748b] font-medium text-[15px]">Manage your account preferences and configurations.</p>
        </div>

        {/* Minimal Pill Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-8 p-1.5 bg-white border border-gray-100 rounded-[1.2rem] w-fit shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap tracking-wide ${selectedTab === tab ? 'bg-[#81D7B4] text-white shadow-md' : 'text-[#64748b] hover:text-[#0f172a] hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden">
          
          {/* PROFILE TAB */}
          {selectedTab === 'Profile' && (
            <div className="divide-y divide-gray-100">
               {/* Wallet & ENS Section */}
               <div className="p-6 sm:p-10">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-6 tracking-tight">Wallet & Identity</h2>
                  
                  {/* Address */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-5 rounded-[1.5rem] border border-gray-100 bg-[#f8faf9] hover:border-gray-200 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                           <HiOutlineWallet className="w-6 h-6 text-[#81D7B4]" />
                        </div>
                        <div className="overflow-hidden">
                           <p className="font-bold text-[#0f172a] text-[15px]">Wallet Address</p>
                           <p className="text-[13px] text-[#64748b] font-medium mt-0.5 font-mono truncate">{address || 'Not connected'}</p>
                        </div>
                     </div>
                     <button onClick={copyToClipboard} className="text-[13px] font-bold text-[#0f172a] bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm shrink-0">
                       Copy
                     </button>
                  </div>

                  {/* ENS */}
                  <div className="-mx-10 px-10">
                     <ENSLinking />
                  </div>
               </div>

               {/* Socials & Display Name */}
               <div className="p-6 sm:p-10">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2 tracking-tight">Social Connections</h2>
                  <p className="text-[#64748b] text-[14px] mb-8 font-medium">Link your social accounts to use as your display name or enable extra features.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Twitter */}
                     <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-gray-100 bg-white hover:border-gray-200 transition-colors shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl">𝕏</div>
                           <div>
                              <p className="font-bold text-[#0f172a] text-[15px]">X (Twitter)</p>
                              <p className="text-[13px] text-[#64748b] font-medium mt-0.5">{isXConnected && xUsername ? `@${xUsername}` : 'Not connected'}</p>
                           </div>
                        </div>
                        {isXConnected && xUsername ? (
                           <button onClick={handleDisconnectX} className="text-[13px] font-bold text-[#ea580c] hover:bg-orange-50 bg-white border border-gray-100 px-4 py-2 rounded-xl transition-colors">Disconnect</button>
                        ) : (
                           <button onClick={handleConnectX} disabled={isConnectingX} className="text-[13px] font-bold text-[#81D7B4] bg-[#81D7B4]/20 hover:bg-[#81D7B4]/30 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                             {isConnectingX ? 'Connecting...' : 'Connect'}
                           </button>
                        )}
                     </div>

                     {/* Farcaster */}
                     <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-gray-100 bg-white shadow-sm opacity-60 grayscale cursor-not-allowed">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-[#8a63d2] text-white rounded-xl flex items-center justify-center font-bold text-sm">FC</div>
                           <div>
                              <p className="font-bold text-[#0f172a] text-[15px]">Farcaster</p>
                              <p className="text-[13px] text-[#64748b] font-medium mt-0.5">Coming soon</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Bitsave Savvy Name */}
               <div className="p-6 sm:p-10">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2 tracking-tight">Bitsave Savvy Name</h2>
                  <p className="text-[#64748b] text-[14px] mb-8 font-medium max-w-2xl">Claim your unique username within the Bitsave ecosystem for peer-to-peer sharing and easier transfers.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                     <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                        <input
                          type="text"
                          value={savvyNameInput}
                          onChange={(e) => setSavvyNameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          className="w-full pl-10 pr-20 py-3.5 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] shadow-sm transition-all bg-white"
                          placeholder="your_username"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[15px] pointer-events-none select-none">.savvy</span>
                     </div>
                     <button
                        onClick={handleSaveSavvyName}
                        disabled={isSavingSavvyName || `${savvyNameInput}.savvy` === currentSavvyName}
                        className="px-8 py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] text-white font-black rounded-xl shadow-md transition-all disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 min-w-[140px]"
                     >
                        {isSavingSavvyName ? 'Saving...' : (currentSavvyName && `${savvyNameInput}.savvy` === currentSavvyName ? 'Saved' : 'Update Name')}
                     </button>
                  </div>
                  {currentSavvyName && (
                     <p className="mt-4 text-[13px] text-[#81D7B4] font-black uppercase tracking-widest flex items-center gap-1.5">
                       <HiOutlineCheck className="w-4 h-4" /> Active Savvy Name
                     </p>
                  )}
               </div>
            </div>
          )}

          {/* LANGUAGE TAB */}
          {selectedTab === 'Language' && (
            <div className="p-6 sm:p-10">
               <h2 className="text-xl font-bold text-[#0f172a] mb-2 tracking-tight">Language</h2>
               <p className="text-[#64748b] text-[14px] mb-8 font-medium">Select your preferred interface language. This will update the entire application.</p>
               
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[1.5rem] border border-gray-100 bg-[#f8faf9]">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <HiOutlineGlobeAlt className="w-6 h-6 text-[#81D7B4]" />
                     </div>
                     <div>
                        <p className="font-bold text-[#0f172a] text-[15px]">Interface Language</p>
                        <p className="text-[13px] text-[#64748b] font-medium mt-0.5">Currently available in select languages</p>
                     </div>
                  </div>
                  <div className="w-full sm:w-64">
                     <LanguageSelector />
                  </div>
               </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {selectedTab === 'Appearance' && (
            <div className="p-6 sm:p-10">
               <h2 className="text-xl font-bold text-[#0f172a] mb-2 tracking-tight">Appearance</h2>
               <p className="text-[#64748b] text-[14px] mb-8 font-medium">Customize the look and feel of your layout.</p>
               
               <div className="flex items-center justify-between p-5 rounded-[1.5rem] border border-gray-100 bg-[#f8faf9]">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <HiOutlineSun className="w-6 h-6 text-[#81D7B4]" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-[#0f172a] text-[15px]">Dark Theme</p>
                           <span className="text-[10px] bg-slate-200 text-slate-600 font-black uppercase tracking-widest px-2 py-0.5 rounded-md">Coming Soon</span>
                        </div>
                        <p className="text-[13px] text-[#64748b] font-medium mt-0.5">A more soothing visual experience for low light.</p>
                     </div>
                  </div>
                  <div className="relative opacity-50 cursor-not-allowed hidden sm:block">
                     <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner">
                        <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 translate-x-0.5 translate-y-0.5"></div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {selectedTab === 'Notifications' && (
            <div className="divide-y divide-gray-100">
               <div className="p-6 sm:p-10">
                  <h2 className="text-xl font-bold text-[#0f172a] mb-2 tracking-tight">Email Notifications</h2>
                  <p className="text-[#64748b] text-[14px] mb-8 font-medium">Connect your email to receive important account alerts and transaction updates.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                     <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                           <HiOutlineEnvelope className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isEmailConnected}
                          placeholder="name@example.com"
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 outline-none text-[15px] font-bold text-[#0f172a] shadow-sm transition-all bg-white disabled:bg-gray-50 disabled:text-gray-500"
                        />
                     </div>
                     {isEmailConnected ? (
                        <div className="px-8 py-3.5 bg-[#81D7B4]/10 border border-[#81D7B4]/30 text-[#81D7B4] font-black rounded-xl flex items-center justify-center gap-2 min-w-[160px]">
                           <HiOutlineCheck className="w-5 h-5 stroke-[3]" /> Verified
                        </div>
                     ) : (
                        <button
                           onClick={handleConnectEmail}
                           disabled={!email.trim() || isConnecting}
                           className="px-8 py-3.5 bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] text-white font-black rounded-xl shadow-md transition-all min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                           {isConnecting ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                               Sending...
                             </>
                           ) : 'Connect Email'}
                        </button>
                     )}
                  </div>
               </div>

               <div className="p-6 sm:p-10 bg-[#f8faf9]">
                  <div className="space-y-6 max-w-2xl">
                     <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm">
                        <div>
                           <p className="font-bold text-[#0f172a] text-[15px]">Marketing Announcements</p>
                           <p className="text-[13px] text-[#64748b] font-medium mt-0.5">Receive news and promotional offers</p>
                        </div>
                        <div className="relative cursor-pointer">
                           <div className="w-12 h-6 bg-[#81D7B4] rounded-full shadow-inner transition-colors">
                              <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-6 translate-y-0.5 transition-transform"></div>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm opacity-60">
                        <div>
                           <p className="font-bold text-[#0f172a] text-[15px]">Push Notifications</p>
                           <p className="text-[13px] text-[#64748b] font-medium mt-0.5">Receive alerts in your browser</p>
                        </div>
                        <div className="relative cursor-not-allowed">
                           <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner transition-colors">
                              <div className="w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0.5 translate-y-0.5 transition-transform"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
        
        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-[400px] w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100"
              >
                <div className="bg-[#81D7B4]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiOutlineEnvelope className="w-8 h-8 text-[#81D7B4]" />
                </div>
                <h3 className="text-[24px] font-black text-center text-[#0f172a] mb-2 tracking-tight">Verify Email</h3>
                <p className="text-center text-[#64748b] text-[14px] font-medium mb-8 leading-relaxed">Enter the 6-digit code sent to<br/><span className="text-[#0f172a] font-bold">{email}</span></p>

                <div className="flex justify-between gap-2 sm:gap-3 mb-8">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-black text-[#0f172a] bg-gray-50 border border-gray-200 focus:border-[#81D7B4] focus:ring-2 focus:ring-[#81D7B4]/20 rounded-xl outline-none transition-all shadow-inner"
                      maxLength={1}
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleVerifyOtp}
                    disabled={otp.some(digit => !digit) || isVerifying}
                    className="w-full bg-[#81D7B4] hover:bg-[#6ec2a0] text-[#0f172a] text-white py-3.5 rounded-xl font-black tracking-wide transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 shadow-md"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="w-full bg-white border border-gray-200 text-[#0f172a] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={isConnecting}
                    className="text-[13px] font-bold text-[#64748b] hover:text-[#0f172a] transition-colors"
                  >
                    {isConnecting ? 'Sending...' : 'Resend Code'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Copy Notification Toast */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-full font-bold text-[14px] shadow-xl flex items-center gap-2"
          >
            <HiOutlineCheck className="w-5 h-5 text-[#81D7B4]" /> Address copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
