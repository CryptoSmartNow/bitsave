'use client';

import React, { Suspense } from 'react';
import HelpAndFeedback from '@/components/HelpAndFeedback';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft01Icon, SparklesIcon } from 'hugeicons-react';
import ThemeSelector from '@/components/ThemeSelector';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const appParam = searchParams.get('app') || searchParams.get('context') || 'savefi';
  const fromParam = searchParams.get('from');

  const getAppContextLabel = () => {
    switch (appParam.toLowerCase()) {
      case 'bizswap':
        return 'BizSwap Platform';
      case 'bizfun':
        return 'BizFun Launchpad';
      case 'bizfi':
        return 'BizFi Institutional';
      case 'savefi':
      case 'dashboard':
        return 'SaveFi Dashboard';
      default:
        return 'BitSave Ecosystem';
    }
  };

  const getBackLink = () => {
    if (fromParam) return fromParam;
    switch (appParam.toLowerCase()) {
      case 'bizswap':
        return '/bizswap';
      case 'bizfun':
        return '/bizfun';
      case 'bizfi':
        return '/bizfi';
      default:
        return '/dashboard';
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors pb-20 font-sans">
      
      {/* Top Universal Ecosystem Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-200/70 dark:border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link 
              href={getBackLink()}
              onClick={handleBack}
              className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-[#81D7B4]/15 hover:text-[#81D7B4] text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft01Icon className="w-4 h-4" />
            </Link>

            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 relative">
                <Image src="/bitsavelogo.png" alt="BitSave" fill className="object-contain" priority />
              </div>
              <span className="font-instrument font-black text-lg text-gray-900 dark:text-white tracking-tight hidden sm:inline">
                BitSave
              </span>
            </Link>

            <div className="h-4 w-[1px] bg-gray-200 dark:bg-white/10 mx-0.5 hidden sm:block" />

            <span className="px-2.5 py-1 rounded-xl bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/30 text-[11px] font-bold tracking-tight shrink-0">
              {getAppContextLabel()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSelector variant="icon-only" />
            
            <Link
              href={getBackLink()}
              onClick={handleBack}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <span>Return to App</span>
            </Link>
          </div>

        </div>
      </header>

      {/* Main Feedback Form Component */}
      <main className="max-w-5xl mx-auto pt-6 px-4 sm:px-6">
        <HelpAndFeedback appContext={getAppContextLabel()} />
      </main>

    </div>
  );
}

export default function StandaloneFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-[#81D7B4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}
