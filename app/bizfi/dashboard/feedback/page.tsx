'use client';

import HelpAndFeedback from '@/components/HelpAndFeedback';
import { Instrument_Serif } from 'next/font/google';
import { Shield01Icon } from 'hugeicons-react';
import Link from 'next/link';
import "../../bizfi-colors.css";

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

export default function BizFiFeedbackPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#7B8B9A]/15">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#81D7B4]/10 border border-[#81D7B4]/25 text-[#81D7B4] text-[11px] font-semibold">
            <Shield01Icon className="w-3.5 h-3.5" />
            <span>Developer & Support Escalation Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F9F9FB] tracking-tight">
            BizFi Help & <span className={`${instrumentSerif.className} italic font-normal text-[#81D7B4]`}>Feedback</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7B8B9A]">
            Submit a bug report, request assistance, or share feature suggestions directly with our engineering team.
          </p>
        </div>

        <Link
          href="/bizfi/dashboard/support"
          className="text-xs text-[#81D7B4] hover:underline font-semibold self-start sm:self-auto"
        >
          &larr; View Knowledge Base & FAQs
        </Link>
      </div>

      <div className="bg-[#1A2538]/30 backdrop-blur-xl border border-[#7B8B9A]/15 rounded-3xl p-4 sm:p-7 shadow-2xl">
        <HelpAndFeedback appContext="BizFi Dashboard" embedded={true} />
      </div>
    </div>
  );
}
