import React, { useState } from "react";
import { Wallet02Icon, Shield01Icon, LockKeyIcon } from "hugeicons-react";
import { motion } from "framer-motion";
import Image from 'next/image';
import { format } from "date-fns";

interface StepThreeReviewProps {
  name: string;
  amount: string;
  currency: string;
  chain: string;
  chains: Array<{ id: string; name: string; logo: string }>;
  ensureImageUrl: (url?: string) => string;
  startDate: Date | null;
  endDate: Date | null;
  penalty: string;
  savingsData: { deposits: number };
  termsAgreed: boolean;
  setTermsAgreed: (val: boolean) => void;
  handlePrevious: () => void;
  handleSubmit: () => void;
  submitting: boolean;
  isLoading: boolean;
  txProgress?: string | null;
}

export default function StepThreeReview({
  name,
  amount,
  currency,
  chain,
  chains,
  ensureImageUrl,
  startDate,
  endDate,
  penalty,
  savingsData,
  termsAgreed,
  setTermsAgreed,
  handlePrevious,
  handleSubmit,
  submitting,
  isLoading,
  txProgress,
}: StepThreeReviewProps) {
  const penaltyNum = parseFloat(penalty) || 10;
  const amountNum = parseFloat(amount || "0");
  const penaltyAmount = ((amountNum * penaltyNum) / 100).toFixed(2);
  const returnAmount = ((amountNum * (100 - penaltyNum)) / 100).toFixed(2);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* ── Ultra-Luxury Review Vault Card ── */}
      <motion.div
        layoutId="live-preview-card"
        className="bg-white/90 dark:bg-[#0c121e]/90 backdrop-blur-2xl border border-gray-200/90 dark:border-white/10 rounded-[2.5rem] p-7 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.5)] relative overflow-hidden group"
      >
        {/* Ambient glow decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-[#81D7B4]/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-[#38BDF8]/10 blur-3xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#81D7B4] to-transparent opacity-70" />
        </div>

        {/* Header Badge & Title */}
        <div className="text-center mb-8 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#81D7B4]/10 dark:bg-[#81D7B4]/15 border border-[#81D7B4]/25 text-[#1c4b38] dark:text-[#81D7B4] text-[11px] font-bold uppercase tracking-widest mb-3.5 shadow-sm">
            <LockKeyIcon className="w-3.5 h-3.5" />
            Locked Savings Vault
          </span>

          <h3 className="text-3xl sm:text-4xl md:text-[42px] font-normal font-instrument text-gray-900 dark:text-white tracking-tight leading-tight mb-3">
            {name || "My Savings Plan"}
          </h3>

          <div className="flex items-baseline justify-center gap-2 mt-2">
            <span className="text-6xl sm:text-7xl md:text-8xl font-normal font-instrument text-gray-900 dark:text-white tracking-tight leading-none">
              ${amount || "0"}
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {currency}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-7" />

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-6 mb-7 relative z-10">
          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Target Network
            </p>
            {chains.map((c) => c.id === chain && (
              <div key={c.id} className="flex items-center gap-2">
                <Image src={ensureImageUrl(c.logo)} alt={c.name} width={20} height={20} className="rounded-full object-contain shrink-0" />
                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{c.name}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Lock Duration
            </p>
            <p className="font-normal font-instrument text-lg sm:text-xl text-gray-900 dark:text-white">
              {startDate && endDate ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days` : "--"}
            </p>
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Maturity Date
            </p>
            <p className="font-normal font-instrument text-lg sm:text-xl text-gray-900 dark:text-white">
              {endDate ? format(endDate, "MMMM d, yyyy") : "--"}
            </p>
          </div>

          <div>
            <p className="text-[10.5px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Strictness Rule
            </p>
            <p className="font-normal font-instrument text-lg sm:text-xl text-[#1c4b38] dark:text-[#81D7B4]">
              {penalty} Early Penalty
            </p>
          </div>
        </div>

        {/* ── Warning Banner (Single Line, No Wrap) ── */}
        <div className="bg-red-500/[0.08] dark:bg-red-500/[0.12] rounded-2xl px-4 py-3.5 border border-red-500/20 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <Shield01Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-[13px] font-bold text-red-700 dark:text-red-300 whitespace-nowrap">
              Penalty applied if unlocked early:
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white dark:bg-[#141d2d] px-3 py-1.5 rounded-xl border border-red-500/20 shadow-sm shrink-0 whitespace-nowrap">
            <span className="text-xs sm:text-sm font-bold font-instrument text-red-500 leading-none">
              -${penaltyAmount}
            </span>
            <span className="text-gray-300 dark:text-gray-600 text-xs leading-none">→</span>
            <span className="text-xs sm:text-sm font-normal font-instrument text-gray-900 dark:text-white leading-none">
              ${returnAmount} return
            </span>
          </div>
        </div>
      </motion.div>

      {/* Protocol Notice */}
      <div className="flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-md rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-[#81D7B4]/15 flex items-center justify-center shrink-0 text-[#81D7B4]">
          <Wallet02Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Protocol Cost</span>
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            Standard decentralized creation fee applies upon locking onchain.
          </span>
        </div>
      </div>

      {/* Terms Agreement */}
      <label className={`flex items-start cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${termsAgreed ? "bg-[#81D7B4]/5 border-[#81D7B4]" : "bg-white/80 dark:bg-[#0c121e]/80 border-gray-200/80 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20"}`}>
        <div className="mr-3.5 mt-0.5 shrink-0">
          <input
            type="checkbox"
            className="w-5 h-5 accent-[#81D7B4] rounded border-gray-300 cursor-pointer"
            required
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
        </div>
        <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
          I understand my funds are locked until the chosen maturity date, and agree to the <strong className="text-gray-900 dark:text-white font-bold">{penalty} strictness penalty</strong> if I choose to withdraw early.
        </span>
      </label>

      {/* Confirm & Lock CTA */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={handleSubmit}
        disabled={submitting || isLoading || !termsAgreed}
        className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer ${
          submitting || isLoading || !termsAgreed
            ? "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none"
            : "bg-[#81D7B4] hover:opacity-90 text-white shadow-[#81D7B4]/20"
        }`}
      >
        {submitting || isLoading ? (
          <span className="flex items-center gap-2.5">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{txProgress || "Confirming on blockchain..."}</span>
          </span>
        ) : (
          <span>Lock Funds & Create Plan</span>
        )}
      </motion.button>
    </motion.div>
  );
}
