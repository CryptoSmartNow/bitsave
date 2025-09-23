import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: {
    totalVisits: number;
    totalConversions: number;
    conversionRate: string;
    totalRewards: number;
  };
  recentVisits: Array<{
    timestamp: string;
    visitorWalletAddress: string | null;
    converted: boolean;
  }>;
}

interface UseReferralsReturn {
  referralData: ReferralData | null;
  loading: boolean;
  error: string | null;
  generateReferralCode: () => Promise<void>;
  trackReferralVisit: (referralCode: string) => Promise<void>;
  markReferralConversion: (referralCode: string) => Promise<void>;
  refreshReferralData: () => Promise<void>;
}

export function useReferrals(): UseReferralsReturn {
  const { address } = useAccount();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReferralCode = async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate referral code');
      }

      // After generating, fetch the full referral data
      await refreshReferralData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const trackReferralVisit = useCallback(async (referralCode: string) => {
    try {
      const response = await fetch('/api/referrals/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          visitorWalletAddress: address,
          visitorIP: null, // Could be obtained from a service
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to track referral visit');
      }
    } catch (err) {
      console.warn('Error tracking referral visit:', err);
    }
  }, [address]);

  const markReferralConversion = useCallback(async (referralCode: string) => {
    if (!address) {
      console.warn('Wallet not connected for referral conversion');
      return;
    }

    try {
      const response = await fetch('/api/referrals/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newUserWalletAddress: address,
          referralCode,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to mark referral conversion');
      }
    } catch (err) {
      console.warn('Error marking referral conversion:', err);
    }
  }, [address]);

  const refreshReferralData = useCallback(async () => {
    if (!address) {
      setReferralData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/referrals/track?walletAddress=${address}`);

      if (!response.ok) {
        if (response.status === 404) {
          // User doesn't have a referral code yet
          setReferralData(null);
          return;
        }
        throw new Error('Failed to fetch referral data');
      }

      const data = await response.json();
      setReferralData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Auto-fetch referral data when wallet connects
  useEffect(() => {
    if (address) {
      refreshReferralData();
    } else {
      setReferralData(null);
      setError(null);
    }
  }, [address, refreshReferralData]);

  // Handle referral tracking on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode) {
      trackReferralVisit(referralCode);
      
      // Store referral code in localStorage for later conversion tracking
      localStorage.setItem('pendingReferralCode', referralCode);
      
      // Clean up URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [trackReferralVisit]);

  // Handle referral conversion when wallet connects
  useEffect(() => {
    if (address) {
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      if (pendingReferralCode) {
        markReferralConversion(pendingReferralCode);
        localStorage.removeItem('pendingReferralCode');
      }
    }
  }, [address, markReferralConversion]);

  return {
    referralData,
    loading,
    error,
    generateReferralCode,
    trackReferralVisit,
    markReferralConversion,
    refreshReferralData,
  };
}