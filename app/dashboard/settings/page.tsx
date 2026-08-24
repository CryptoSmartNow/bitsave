'use client';

import { 
  Tick02Icon, Activity01Icon, Link01Icon, UserMultipleIcon, 
  UserCircleIcon, Settings01Icon, SparklesIcon, Wallet01Icon, 
  Notification01Icon, GlobalIcon, Mail01Icon, Moon02Icon, 
  ArrowRight01Icon, BotIcon, Notification02Icon, Copy01Icon,
  Cancel01Icon
} from "hugeicons-react";
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useNetworkSync } from '@/hooks/useNetworkSync';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShimmer } from '@/components/ShimmerLoading';
import ThemeSelector from '@/components/ThemeSelector';
import toast from 'react-hot-toast';
import NetworkDetection from '@/components/NetworkDetection';
import ENSLinking from '@/components/ENSLinking';
import { useENSData } from '@/hooks/useENSData';
import LanguageSelector from '@/components/LanguageSelector';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { getTweetButtonProps } from '@/utils/tweetUtils';

export default function Settings() {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const { currentNetworkName: currentNetwork } = useNetworkSync();
  const address = wagmiAddress || user?.wallet?.address;

  const { ensName, getDisplayName, hasENS } = useENSData(address);
  const [mounted, setMounted] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'savvyName' | 'ens' | 'socials' | 'language' | 'email'>('none');

  const [email, setEmail] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEmailConnected, setIsEmailConnected] = useState(false);

  // Twitter / X connection state
  const [isXConnected, setIsXConnected] = useState(false);
  const [xUsername, setXUsername] = useState('');
  const [isConnectingX, setIsConnectingX] = useState(false);

  // Savvy Name state
  const [savvyNameInput, setSavvyNameInput] = useState('');
  const [currentSavvyName, setCurrentSavvyName] = useState('');
  const [isSavingSavvyName, setIsSavingSavvyName] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Dynamic window size for confetti
  const { width, height } = useWindowSize();

  // Notification Toggles state
  const [isMarketingEnabled, setIsMarketingEnabled] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Helper to convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Initialize push notification state
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsPushEnabled(!!subscription);
        });
      });
    }
  }, []);

  const handlePushToggle = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported in your browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      if (isPushEnabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
        setIsPushEnabled(false);
        toast.success('Push notifications disabled.');
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permission denied for push notifications.');
          return;
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          toast.error('VAPID public key not configured.');
          return;
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subscription,
            walletAddress: address
          }),
        });

        if (res.ok) {
          setIsPushEnabled(true);
          toast.success('Push notifications enabled!');
        } else {
          toast.error('Failed to save push subscription.');
        }
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      toast.error('An error occurred while toggling push notifications.');
    }
  };

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
        setShowConfetti(true);
        setTimeout(() => {
          setShowShareModal(true);
        }, 1200);
        setTimeout(() => {
          setShowConfetti(false);
        }, 6000);
      } else {
        toast.error(data.error || 'Failed to update Savvy Name');
      }
    } catch (e) {
      toast.error('An error occurred while saving your Savvy Name');
    } finally {
      setIsSavingSavvyName(false);
    }
  };

  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white dark:bg-[#161616] shadow-xl rounded-2xl pointer-events-auto flex p-4 border border-gray-200/70 dark:border-white/10`}>
            <div className="flex items-center gap-3 w-full">
               <div className="w-9 h-9 rounded-xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0">
                  <Tick02Icon className="w-5 h-5 text-[#81D7B4]" />
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-900 dark:text-white">Address Copied!</p>
                 <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{address.slice(0, 6)}...{address.slice(-4)} is now in your clipboard</p>
               </div>
            </div>
          </div>
        ), { duration: 3000, position: 'bottom-center' });
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          action: 'send_otp',
          walletAddress: address
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('New verification code sent to your email!');
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

  const handleConnectX = async () => {
    setIsConnectingX(true);

    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      localStorage.setItem('twitter_code_verifier', codeVerifier);
      localStorage.setItem('twitter_state', generateRandomString(32));

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID || '');
      authUrl.searchParams.append('redirect_uri', `${window.location.origin}/auth/twitter/callback`);
      authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.append('state', localStorage.getItem('twitter_state') || '');
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'S256');

      const popup = window.open(
        authUrl.toString(),
        'twitter-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnectingX(false);
        }
      }, 1000);

      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup?.close();

          setXUsername(event.data.username);
          setIsXConnected(true);

          localStorage.setItem('xUsername', event.data.username);
          localStorage.setItem('isXConnected', 'true');
          localStorage.setItem('xAccessToken', event.data.accessToken);

          setIsConnectingX(false);
          window.removeEventListener('message', messageListener);
        } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup?.close();
          toast.error(`Twitter connection failed: ${event.data.error}`);
          setIsConnectingX(false);
          window.removeEventListener('message', messageListener);
        }
      };

      window.addEventListener('message', messageListener);

    } catch (error) {
      console.error('Twitter authentication failed:', error);
      setIsConnectingX(false);
    }
  };

  useEffect(() => {
    const savedXUsername = localStorage.getItem('xUsername');
    const savedXConnected = localStorage.getItem('isXConnected');

    if (savedXUsername && savedXConnected === 'true') {
      setXUsername(savedXUsername);
      setIsXConnected(true);
    }

    const savedEmailConnected = localStorage.getItem('emailConnected');
    const savedEmail = localStorage.getItem('connectedEmail');

    if (savedEmailConnected === 'true' && savedEmail) {
      setIsEmailConnected(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleDisconnectX = () => {
    setIsXConnected(false);
    setXUsername('');
    localStorage.removeItem('xUsername');
    localStorage.removeItem('isXConnected');
    localStorage.removeItem('xAccessToken');
    toast.success('Twitter / X disconnected');
  };

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
    const digest = await crypto.subtle.digest('SHA-256', data as any);
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

  // AI Widget Toggle State
  const [showAiWidget, setShowAiWidget] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem('showAiWidget');
    if (saved === 'false') setShowAiWidget(false);
  }, []);

  const toggleAiWidget = () => {
    const newState = !showAiWidget;
    setShowAiWidget(newState);
    localStorage.setItem('showAiWidget', String(newState));
    window.dispatchEvent(new CustomEvent('toggleAiWidget', { detail: { show: newState } }));
    toast.success(newState ? 'SavvyBot widget enabled' : 'SavvyBot widget hidden');
  };

  if (!mounted) {
    return <PageShimmer />;
  }

  return (
    <div className="font-sans relative w-full h-full pb-20 px-2 sm:px-4 max-w-5xl mx-auto">
      <NetworkDetection />
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#81D7B4]/15 via-transparent to-transparent pointer-events-none blur-3xl opacity-60" />

      {/* Header Subtitle (Duplicate h1 removed) */}
      <div className="mb-8 pt-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your on-chain identity, notification preferences, security verification, and interface settings.
        </p>
      </div>

      <div className="space-y-10 relative z-10">
        
        {/* ACCOUNT OVERVIEW */}
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white font-instrument mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#81D7B4] rounded-full"></span>
            Account Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Wallet Address */}
            <div 
              onClick={copyToClipboard}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Wallet01Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Wallet Address</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5 font-mono">
                    {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-[#81D7B4]/15 group-hover:text-[#81D7B4] text-gray-400 flex items-center justify-center transition-colors">
                  <Copy01Icon className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Savvy Name */}
            <div 
              onClick={() => setActiveModal('savvyName')}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <UserCircleIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">BitSave Savvy Name</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold text-[#81D7B4] truncate">
                      {currentSavvyName ? `@${currentSavvyName}` : 'Claim your username'}
                    </span>
                    {currentSavvyName && <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4] shrink-0" />}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Social Connections */}
            <div 
              onClick={() => setActiveModal('socials')}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <UserMultipleIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Social Connections</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                    {isXConnected && xUsername ? `@${xUsername}` : 'Link social accounts'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* ENS Identity */}
            <div 
              onClick={() => setActiveModal('ens')}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Link01Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">ENS Identity</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                    {ensName || 'Link your Ethereum Name Service'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

          </div>
        </div>

        {/* SECURITY & CONTACT */}
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white font-instrument mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#81D7B4] rounded-full"></span>
            Security & Contact
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Email Verification */}
            <div 
              onClick={() => setActiveModal('email')}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Mail01Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Email Verification</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                      {isEmailConnected ? email : 'Connect your email for alerts'}
                    </span>
                    {isEmailConnected && <Tick02Icon className="w-3.5 h-3.5 text-[#81D7B4] shrink-0" />}
                  </div>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

          </div>
        </div>

        {/* PREFERENCES & DISPLAY */}
        <div>
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white font-instrument mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#81D7B4] rounded-full"></span>
            Preferences & Display
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* Color Theme Selector */}
            <div className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs">
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Moon02Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Color Theme</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Switch between light, dark, and system</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ThemeSelector variant="icon-only" />
              </div>
            </div>

            {/* Language */}
            <div 
              onClick={() => setActiveModal('language')}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <GlobalIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Language</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Select interface language</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <ArrowRight01Icon className="w-5 h-5 text-gray-400 group-hover:text-[#81D7B4] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* SavvyBot Widget Toggle */}
            <div 
              onClick={toggleAiWidget}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <BotIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Savvy Bot Widget</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Show AI assistant button in corner</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${showAiWidget ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-white/10'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${showAiWidget ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Announcements Toggle */}
            <div 
              onClick={() => setIsMarketingEnabled(!isMarketingEnabled)}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Notification01Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Announcements</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Receive protocol news and updates</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${isMarketingEnabled ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-white/10'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${isMarketingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Push Alerts */}
            <div 
              onClick={handlePushToggle}
              className="bg-white dark:bg-[#161616] rounded-3xl border border-gray-200/70 dark:border-white/10 p-5 flex items-center justify-between gap-4 transition-all hover:border-[#81D7B4]/50 shadow-xs cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 truncate">
                <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
                  <Notification02Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">Push Alerts</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">Receive instant browser notifications</p>
                </div>
              </div>
              <div className="shrink-0 flex items-center justify-end">
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${isPushEnabled ? 'bg-[#81D7B4]' : 'bg-gray-200 dark:bg-white/10'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform ${isPushEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
      
      {/* GLOBAL MODALS */}
      <AnimatePresence>
        {activeModal !== 'none' && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" 
            onClick={(e) => { if (e.target === e.currentTarget) setActiveModal('none'); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-200/70 dark:border-white/10 relative overflow-hidden"
            >
              <button 
                onClick={() => setActiveModal('none')} 
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>

              {/* Savvy Name Modal */}
              {activeModal === 'savvyName' && (
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                     BitSave Savvy Name
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                     Claim your unique username within the BitSave ecosystem for peer-to-peer sharing and referrals.
                   </p>
                   
                   <div className="relative mb-4">
                     <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                     <input
                       type="text"
                       value={savvyNameInput}
                       onChange={(e) => setSavvyNameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                       className="w-full pl-8 pr-16 py-3 rounded-2xl border border-gray-200/70 dark:border-white/10 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 dark:text-white transition-all bg-gray-50 dark:bg-white/5"
                       placeholder="your_username"
                     />
                     <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none select-none">.savvy</span>
                   </div>
                   
                   <button
                     onClick={handleSaveSavvyName}
                     disabled={isSavingSavvyName || `${savvyNameInput}.savvy` === currentSavvyName}
                     className="w-full py-3 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl shadow-xs transition-all disabled:opacity-50 text-xs cursor-pointer"
                   >
                     {isSavingSavvyName ? 'Saving...' : (currentSavvyName && `${savvyNameInput}.savvy` === currentSavvyName ? 'Current Active Name' : 'Update Savvy Name')}
                   </button>

                   {currentSavvyName && (
                      <p className="mt-3 text-[11px] text-[#81D7B4] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                        <Tick02Icon className="w-3.5 h-3.5" /> Active: @{currentSavvyName}
                      </p>
                   )}
                </div>
              )}

              {/* ENS Modal */}
              {activeModal === 'ens' && (
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                     ENS Identity
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                     Link your Ethereum Name Service domain to your wallet address.
                   </p>
                   <ENSLinking 
                     walletAddress={address}
                     isSolanaNetwork={false}
                   />
                </div>
              )}

              {/* Socials Modal */}
              {activeModal === 'socials' && (
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                     Social Connections
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                     Connect your social identity for reputation and ecosystem rewards.
                   </p>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-black text-base shrink-0">
                             𝕏
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 dark:text-white text-xs">Twitter / X</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                {isXConnected && xUsername ? `@${xUsername}` : 'Not connected'}
                              </p>
                           </div>
                        </div>
                        {isXConnected && xUsername ? (
                           <button 
                             onClick={handleDisconnectX} 
                             className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/30 transition-colors cursor-pointer"
                           >
                             Disconnect
                           </button>
                        ) : (
                           <button 
                             onClick={handleConnectX} 
                             disabled={isConnectingX} 
                             className="text-xs font-bold text-white bg-[#81D7B4] hover:opacity-90 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                           >
                             {isConnectingX ? 'Connecting...' : 'Connect'}
                           </button>
                        )}
                     </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] opacity-70">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 bg-[#229ED9]/15 text-[#229ED9] rounded-xl flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                              </svg>
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 dark:text-white text-xs">Telegram Community</p>
                              <p className="text-[11px] text-gray-400 font-medium">Coming soon</p>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
              )}

              {/* Language Modal */}
              {activeModal === 'language' && (
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                     Language Preferences
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                     Select your preferred interface language.
                   </p>
                   <LanguageSelector />
                </div>
              )}

              {/* Email Modal */}
              {activeModal === 'email' && (
                <div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                     Email Connection
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                     Connect your email address to receive critical maturity alerts.
                   </p>
                   
                   <div className="relative mb-4">
                     <input
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       disabled={isEmailConnected}
                       placeholder="name@example.com"
                       className="w-full px-4 py-3 rounded-2xl border border-gray-200/70 dark:border-white/10 focus:border-[#81D7B4] outline-none text-sm font-bold text-gray-900 dark:text-white transition-all bg-gray-50 dark:bg-white/5 disabled:opacity-60"
                     />
                   </div>

                   {isEmailConnected ? (
                     <div className="py-3 bg-[#81D7B4]/15 border border-[#81D7B4]/30 text-[#81D7B4] font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5">
                        <Tick02Icon className="w-4 h-4" /> Email Verified & Linked
                     </div>
                   ) : (
                     <button
                        onClick={handleConnectEmail}
                        disabled={!email.trim() || isConnecting}
                        className="w-full py-3 bg-[#81D7B4] hover:opacity-90 text-white font-bold rounded-2xl text-xs shadow-xs transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
                     >
                        {isConnecting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending Code...
                          </span>
                        ) : 'Connect Email'}
                     </button>
                   )}
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-200/70 dark:border-white/10"
            >
              <div className="bg-[#81D7B4]/15 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#81D7B4]">
                <Mail01Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-center text-gray-900 dark:text-white font-instrument mb-1">
                Verify Email
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400 text-xs mb-6">
                Enter the 6-digit verification code sent to <span className="text-gray-900 dark:text-white font-bold">{email}</span>
              </p>

              <div className="flex justify-between gap-1.5 sm:gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-11 sm:h-12 text-center text-base font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 focus:border-[#81D7B4] rounded-xl outline-none transition-all"
                    maxLength={1}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.some(digit => !digit) || isVerifying}
                  className="w-full bg-[#81D7B4] hover:opacity-90 text-white py-3 rounded-2xl font-bold text-xs transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="w-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isConnecting}
                  className="text-xs font-bold text-gray-400 hover:text-[#81D7B4] transition-colors cursor-pointer"
                >
                  {isConnecting ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
        </div>
      )}

      {/* Savvy Name Success Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[70] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-200/70 dark:border-white/10 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#81D7B4]/15 flex items-center justify-center mb-4 text-2xl">
                🎉
              </div>
              
              <h3 className="text-xl font-black text-gray-900 dark:text-white font-instrument mb-1">
                Identity Secured!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-6 leading-relaxed">
                You successfully claimed <span className="font-bold text-[#81D7B4]">@{currentSavvyName}</span>. Share the good news with your network!
              </p>

              <div className="flex flex-col gap-2.5">
                <a
                  href={getTweetButtonProps('savvy-name', { savvyName: currentSavvyName }).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black dark:bg-white dark:text-black text-white py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs hover:opacity-90"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 py-3 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
