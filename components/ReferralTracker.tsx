'use client'

import { useEffect } from 'react';
import { useReferrals } from '@/lib/useReferrals';

export default function ReferralTracker() {
  const { trackReferralVisit } = useReferrals()

  useEffect(() => {
    // Check for referral code in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const referralCode = urlParams.get('ref')
    
    if (referralCode) {
      // Store referral code in localStorage for later conversion tracking
      localStorage.setItem('referralCode', referralCode)
      
      // Track the referral visit
      trackReferralVisit(referralCode)
      
      // Clean up URL by removing the ref parameter
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('ref')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])

  return null // This component doesn't render anything
}