import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import {
  HiCurrencyDollar,
  HiCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineReceiptRefund,
} from "react-icons/hi2";

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
}: StepThreeReviewProps) {
  const [penaltiesExpanded, setPenaltiesExpanded] = useState(false);

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Plan Summary Card */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#81D7B4]/10 to-transparent opacity-100 transition-opacity duration-500"></div>

        {/* Header */}
        <div className="p-8 relative z-10 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">
              {name || "My Savings Plan"}
            </h3>
            {chains.map(
              (c) =>
                c.id === chain && (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2.5 bg-white border border-[#81D7B4]/30 rounded-full px-4 py-2 text-xs font-bold text-[#0f172a] shadow-sm shrink-0"
                  >
                    <Image
                      src={ensureImageUrl(c.logo)}
                      alt={c.name}
                      width={18}
                      height={18}
                      className="rounded-full"
                    />
                    {c.name} Network
                  </span>
                ),
            )}
          </div>

          <div className="flex items-end gap-3 bg-white p-5 rounded-[20px] shadow-sm border border-gray-100">
            <span className="text-5xl font-extrabold text-[#81D7B4] tracking-tighter">
              ${amount || "0.00"}
            </span>
            <span className="text-lg font-bold text-[#64748b] uppercase tracking-widest pb-1.5">
              {currency}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-4 sm:p-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col bg-[#f8faf9] px-6 py-5 rounded-[20px] border border-gray-100">
            <span className="text-xs font-black text-[#81D7B4] uppercase tracking-widest mb-1">
              Start Date
            </span>
            <span className="text-lg font-bold text-[#0f172a]">
              {startDate ? format(startDate, "MMMM d, yyyy") : "Today"}
            </span>
          </div>
          <div className="flex flex-col bg-[#f8faf9] px-6 py-5 rounded-[20px] border border-gray-100">
            <span className="text-xs font-black text-[#81D7B4] uppercase tracking-widest mb-1">
              End Date
            </span>
            <span className="text-lg font-bold text-[#0f172a]">
              {endDate ? format(endDate, "MMMM d, yyyy") : "--"}
            </span>
          </div>
          <div className="flex flex-col bg-[#f8faf9] px-6 py-5 rounded-[20px] border border-gray-100">
            <span className="text-xs font-black text-[#81D7B4] uppercase tracking-widest mb-1">
              Duration
            </span>
            <span className="text-lg font-bold text-[#0f172a]">
              {startDate && endDate
                ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                : "--"}
            </span>
          </div>
          <div className="flex flex-col bg-[#fff8eb] px-6 py-5 rounded-[20px] border border-amber-100">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">
              Penalty Rule
            </span>
            <span className="text-lg font-bold text-amber-700">
              {penalty} Strictness
            </span>
          </div>
        </div>

        {/* Penalty Warning Footer */}
        <div className="mx-4 mb-4 sm:mx-8 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 bg-gradient-to-r from-red-50 to-[#fffafa] rounded-[20px] border border-red-100 relative z-10 gap-4">
          <span className="text-sm font-bold text-[#0f172a] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 shadow-sm shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            If withdrawn early
          </span>
          <span className="text-sm text-gray-700 font-bold flex items-center bg-white px-4 py-2 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.04)] border border-gray-100">
            <span className="text-red-500">
              -$
              {((Number(amount || "0") * parseFloat(penalty)) / 100).toFixed(2)}
            </span>
            <span className="mx-2 text-gray-300">→</span>
            <span className="text-[#81D7B4] font-black">
              $
              {(
                (Number(amount || "0") * (100 - parseFloat(penalty))) /
                100
              ).toFixed(2)}
            </span>
          </span>
        </div>
      </div>

      {/* Fee notice */}
      <div className="flex items-center gap-4 px-6 py-5 bg-white rounded-[24px] border border-[#81D7B4]/30 shadow-[0_4px_24px_rgb(0,0,0,0.03)] bg-gradient-to-r from-[#F4FBF8] to-white">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-[#81D7B4] border border-[#81D7B4]/20">
          <HiOutlineReceiptRefund className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-[#81D7B4] uppercase tracking-widest mb-0.5">
            Platform Costs
          </span>
          <span className="text-sm text-[#0f172a] font-medium">
            <strong className="text-[#0f172a] font-black">$1</strong> creation
            fee
            {savingsData.deposits === 0 && (
              <>
                {" "}
                + <strong className="text-[#0f172a] font-black">$1</strong>{" "}
                profile setup
              </>
            )}
          </span>
        </div>
      </div>

      {/* Penalties collapsible */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.03)] overflow-hidden">
        <button
          onClick={() => setPenaltiesExpanded(!penaltiesExpanded)}
          className="w-full flex items-center justify-between px-6 sm:px-8 py-5 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <HiOutlineShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[#0f172a] font-bold text-base">
              How Penalties Protect You
            </span>
          </div>
          <motion.div
            animate={{ rotate: penaltiesExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#64748b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>
        <AnimatePresence>
          {penaltiesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-6 sm:px-8 pb-8 pt-2 space-y-4">
                <div className="bg-[#f8faf9] rounded-[20px] p-5 border border-gray-100 shadow-inner">
                  <p className="font-extrabold text-[#0f172a] text-sm mb-2">
                    Enforced Commitment
                  </p>
                  <p className="text-sm text-[#64748b] leading-relaxed font-medium">
                    A strictly enforced {penalty} penalty is deducted from your
                    principal only if you break your savings goal before{" "}
                    {endDate ? format(endDate, "MMMM d, yyyy") : "maturity"}.
                    Once maturity is reached, you can withdraw your full amount
                    instantly with zero penalty.
                  </p>
                </div>
                <div className="bg-[#f8faf9] rounded-[20px] p-5 border border-gray-100 shadow-inner">
                  <p className="font-extrabold text-[#0f172a] text-sm mb-2">
                    Reward Redistribution
                  </p>
                  <p className="text-sm text-[#64748b] leading-relaxed font-medium">
                    Penalty fees do not go to Bitsave. They are automatically
                    redistributed to other dedicated savers as yield rewards,
                    incentivizing everyone to hold strong.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terms Agreement */}
      <div className="pt-2">
        <label
          htmlFor="terms"
          className={`flex flex-row items-center cursor-pointer p-6 rounded-[24px] border shadow-[0_4px_24px_rgb(0,0,0,0.03)] transition-all duration-300 ${termsAgreed ? "bg-gradient-to-r from-[#F4FBF8] to-white border-[#81D7B4] ring-1 ring-[#81D7B4]/50" : "bg-white border-gray-100 hover:border-gray-300"}`}
        >
          <div className="flex flex-row items-start mr-4">
            <input
              type="checkbox"
              id="terms"
              className="mt-0.5 h-5 w-5 text-[#81D7B4] focus:ring-[#81D7B4]/50 border-gray-200 rounded transition-colors"
              required
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
          </div>
          <span className="flex-1 text-sm text-[#0f172a] leading-relaxed font-medium">
            I authorize locking my funds until the selected maturity date, and I
            accept the{" "}
            <strong className="text-[#81D7B4] font-black">
              {penalty} block penalty
            </strong>{" "}
            for early withdrawal.
          </span>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-6 gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="text-[#64748b] bg-white border border-gray-200 hover:border-gray-300 hover:text-[#0f172a] hover:bg-gray-50 px-8 py-4 rounded-2xl text-base font-bold transition-all duration-200 inline-flex items-center justify-center gap-3 w-full sm:w-auto shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || isLoading || !termsAgreed}
          className={`bg-[#81D7B4] hover:bg-[#6BC7A0] text-white px-8 py-4 rounded-2xl text-base font-extrabold transition-all duration-300 inline-flex items-center justify-center gap-3 shadow-[0_4px_14px_rgb(129,215,180,0.4)] hover:shadow-[0_6px_20px_rgb(129,215,180,0.5)] w-full sm:w-auto ${submitting || isLoading || !termsAgreed ? "opacity-50 cursor-not-allowed shadow-none hover:shadow-none" : ""}`}
        >
          {submitting || isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Confirming...
            </>
          ) : (
            <>
              Initialize Plan
              <HiCheckCircle className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
