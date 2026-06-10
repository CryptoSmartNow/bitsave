import { useState, useEffect, useCallback } from 'react';

interface BizSwapReferralData {
  bizswapReferralCode: string;
  bizswapPendingUsdcEarnings: number;
  bizswapTotalUsdcEarned: number;
}

interface UseBizSwapReferralsReturn {
  referralData: BizSwapReferralData | null;
  loading: boolean;
  error: string | null;
  generateReferralCode: () => Promise<void>;
  submitWithdrawal: (amount: number) => Promise<void>;
  refreshReferralData: () => Promise<void>;
}

export function useBizSwapReferrals(walletAddress?: string): UseBizSwapReferralsReturn {
  const [referralData, setReferralData] = useState<BizSwapReferralData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshReferralData = useCallback(async () => {
    if (!walletAddress) {
      setReferralData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Re-using the generate endpoint as a "fetch or create" or just checking
      // Wait, we can use a fetch endpoint. Actually, generating automatically on fetch might be too aggressive.
      // Let's create a dedicated fetch endpoint if it doesn't exist, or just use the generate endpoint which creates it if it doesn't exist.
      // Actually, let's just make generate handle both checking and creating.
      const response = await fetch('/api/bizswap/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch BizSwap referral data');
      }

      const data = await response.json();
      setReferralData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const generateReferralCode = useCallback(async () => {
    await refreshReferralData();
  }, [refreshReferralData]);

  const submitWithdrawal = useCallback(async (amount: number) => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bizswap/referrals/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit withdrawal');
      }

      await refreshReferralData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [walletAddress, refreshReferralData]);

  useEffect(() => {
    if (walletAddress) {
      refreshReferralData();
    } else {
      setReferralData(null);
      setError(null);
    }
  }, [walletAddress, refreshReferralData]);

  return {
    referralData,
    loading,
    error,
    generateReferralCode,
    submitWithdrawal,
    refreshReferralData,
  };
}
