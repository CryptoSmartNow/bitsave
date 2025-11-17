'use client'

import { useState, useEffect } from 'react';
import { detectWalletType, WalletInfo } from '@/utils/walletDetection';

const DONT_SHOW_AGAIN_KEY = 'bitsave_wallet_recommendation_dismissed';

interface UseWalletDetectionReturn {
  walletInfo: WalletInfo | null;
  isRabby: boolean;
  showRecommendation: boolean;
  dismissRecommendation: () => void;
  shouldShowModal: boolean;
}

/**
 * Custom hook for wallet detection and recommendation modal
 */
export function useWalletDetection(): UseWalletDetectionReturn {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Detect wallet type
    const detectedWallet = detectWalletType();
    setWalletInfo(detectedWallet);
  }, []);

  const dismissRecommendation = () => {
    // Hide modal for this session only - will show again on next page visit
    setIsDismissed(true);
  };

  const isRabby = walletInfo?.name === 'Rabby Wallet' || false;
  const showRecommendation = Boolean(hasMounted && !isRabby && walletInfo?.isDetected && !isDismissed);
  const shouldShowModal = showRecommendation;

  return {
    walletInfo,
    isRabby,
    showRecommendation,
    dismissRecommendation,
    shouldShowModal
  };
}