import React from "react";
import { motion, Variants } from "framer-motion";
import Image from 'next/image';
import { format } from "date-fns";
import CustomDatePicker from "@/components/CustomDatePicker";

interface StepTwoConfigurationProps {
  amount: string;
  setAmount: (val: string) => void;
  currency: string;
  errors: { amount?: string; endDate?: string };
  goodDollarEquivalent: number;
  startDate: Date | null;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  calendarNavigateDate: Date;
  setCalendarNavigateDate: (date: Date) => void;
  penalties: string[];
  penalty: string;
  setPenalty: (val: string) => void;
  handlePrevious: () => void;
  handleNext: () => void;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function StepTwoConfiguration({
  amount,
  setAmount,
  currency,
  errors,
  goodDollarEquivalent,
  startDate,
  endDate,
  setEndDate,
  calendarNavigateDate,
  setCalendarNavigateDate,
  penalties,
  penalty,
  setPenalty,
  handlePrevious,
  handleNext,
}: StepTwoConfigurationProps) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Amount Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 px-3 py-6 sm:p-8 lg:p-10 relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4FBF8]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center">
          <label className="block text-xs sm:text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-8">
            Savings Amount
          </label>

          <div className="flex flex-col items-center justify-center mb-8 w-full">
            <div className="flex items-center justify-center w-full">
              <span className="text-4xl sm:text-5xl font-light text-gray-300 mr-1 sm:mr-2 select-none">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`w-[140px] sm:w-[200px] bg-transparent text-5xl sm:text-7xl font-black text-gray-900 placeholder:text-gray-200 focus:outline-none focus:ring-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors ${errors.amount ? "text-red-500" : ""}`}
                style={{ width: amount ? `${Math.max(1, amount.length) * 1.1}ch` : '2ch' }}
              />
            </div>
            <div className="inline-flex items-center justify-center px-3 py-1 bg-gray-50 rounded-full border border-gray-100 mt-4">
              <span className="text-xs sm:text-sm font-bold text-gray-500 tracking-wide">
                {currency}
              </span>
            </div>
            <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-6"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
            {["50", "250", "500", "1000"].map((val) => (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all duration-300 ${
                  amount === val
                    ? "bg-[#81D7B4] border-[#81D7B4] text-white shadow-[0_4px_12px_rgb(129,215,180,0.3)]"
                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                +${val}
              </motion.button>
            ))}
          </div>
          {errors.amount && (
            <p className="mt-4 text-sm text-red-500 font-medium text-center">
              {errors.amount}
            </p>
          )}

          {/* GoodDollar Equivalent */}
          {currency === "Gooddollar" && amount && goodDollarEquivalent > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 p-4 bg-gradient-to-r from-[#F4FBF8] to-white rounded-[16px] border border-[#81D7B4]/30 flex items-center justify-between shadow-sm"
            >
              <span className="text-sm text-gray-600 flex items-center gap-2.5 font-medium">
                <Image
                  src="/$g.png"
                  alt="$G"
                  width={20}
                  height={20}
                  className="rounded-full shadow-sm"
                />
                Equivalent
              </span>
              <span className="text-base font-extrabold text-[#81D7B4]">
                {goodDollarEquivalent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                $G
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Duration Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 px-3 py-6 sm:p-8 lg:p-10 relative overflow-hidden group text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-[#F4FBF8]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center">
          <label className="block text-xs sm:text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-2">
            Lock Duration
          </label>
          <p className="text-xs sm:text-sm text-gray-500 mb-8">
            Choose how long to lock your savings securely.
          </p>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full mb-8">
            {startDate &&
              [
                { label: "1 Month", days: 30 },
                { label: "3 Months", days: 90 },
                { label: "6 Months", days: 180 },
                { label: "1 Year", days: 365 },
              ].map((preset) => {
                const presetDate = new Date(startDate);
                presetDate.setDate(presetDate.getDate() + preset.days);
                const isSelected =
                  endDate &&
                  format(presetDate, "yyyy-MM-dd") ===
                    format(endDate, "yyyy-MM-dd");
                return (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setEndDate(presetDate);
                      setCalendarNavigateDate(presetDate);
                    }}
                    className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all duration-300 ${
                      isSelected
                        ? "bg-[#81D7B4] border-[#81D7B4] text-white shadow-[0_4px_12px_rgb(129,215,180,0.3)]"
                        : "bg-white border-gray-100 text-gray-500 hover:border-[#81D7B4]/40 hover:bg-[#81D7B4]/5 hover:text-[#0f172a] hover:shadow-sm"
                    }`}
                  >
                    <span className="whitespace-nowrap">
                      {preset.label}
                    </span>
                  </motion.button>
                );
              })}
          </div>

          <div className="relative group/calendar">
            <div
              className={`absolute -inset-0.5 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4] rounded-[24px] blur opacity-0 group-hover/calendar:opacity-10 transition duration-500`}
            ></div>
            <div className="relative bg-white rounded-[20px] p-1 border border-gray-100 shadow-sm">
              <CustomDatePicker
                selectedDate={endDate}
                onSelectDate={(date) => setEndDate(date)}
                navigateToDate={calendarNavigateDate}
              />
            </div>
          </div>

          {startDate && endDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
            >
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] rounded-[16px] shadow-sm">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-white/60 font-bold uppercase tracking-widest">Maturity Date</span>
                  <span className="text-white font-extrabold text-base truncate">{format(endDate, "MMM d, yyyy")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] rounded-[16px] shadow-sm">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] text-white/60 font-bold uppercase tracking-widest">Total Duration</span>
                  <span className="text-white font-extrabold text-xl">{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} Days</span>
                </div>
              </div>
            </motion.div>
          )}
          {errors.endDate && (
            <p className="mt-3 text-sm text-red-500 font-medium">
              {errors.endDate}
            </p>
          )}
        </div>
      </motion.div>

      {/* Penalty Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 px-3 py-6 sm:p-8 lg:p-10 relative overflow-hidden group text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-[#81D7B4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col items-center">
          <label className="block text-xs sm:text-sm font-bold text-[#81D7B4] uppercase tracking-wider mb-2">
            Strictness Level (Penalty)
          </label>
          <p className="text-xs sm:text-sm text-gray-500 mb-8 max-w-sm mx-auto">
            Choose how severely early withdrawals are penalized. Higher penalty
            = more commitment.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 w-full mb-8">
            {penalties.map((p, idx) => {
              return (
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  key={p}
                  type="button"
                  onClick={() => setPenalty(p)}
                  className={`flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-[1.2rem] border transition-all duration-300 w-full sm:w-[140px] ${
                    penalty === p
                      ? "bg-[#81D7B4] border-[#81D7B4] text-white shadow-[0_4px_12px_rgb(129,215,180,0.3)]"
                      : "bg-white border-gray-100 hover:border-[#81D7B4]/40 hover:bg-[#81D7B4]/5 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`text-2xl font-black ${penalty === p ? "text-white" : "text-gray-900"}`}
                  >
                    {p}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${penalty === p ? "text-white/90" : "text-[#81D7B4]"}`}
                  >
                    {idx === 0
                      ? "Lenient"
                      : idx === 1
                        ? "Strict"
                        : "Diamond Hands"}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-gradient-to-b from-[#f8faf9] to-white w-full rounded-[20px] border border-[#81D7B4]/30 shadow-sm space-y-4 flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex flex-col items-center text-center pb-2 border-b border-gray-100 w-full">
                <span className="text-xs sm:text-sm text-gray-500 font-medium mb-1">If you break the lock early, you pay a penalty of:</span>
                <span className="text-xl sm:text-2xl text-red-500 font-black">
                  ${((Number(amount) * parseFloat(penalty)) / 100).toFixed(2)}
                </span>
              </div>
              <div className="w-full pt-1 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs text-[#81D7B4] font-black uppercase tracking-widest mb-1">You get back</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900">${((Number(amount) * (100 - parseFloat(penalty))) / 100).toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <motion.button
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handlePrevious}
          className="text-gray-600 hover:text-gray-900 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 inline-flex items-center gap-2 hover:bg-gray-100 whitespace-nowrap"
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
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleNext}
          className="bg-[#81D7B4] hover:bg-[#6BC7A0] text-white px-5 py-2.5 sm:px-8 sm:py-3.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 shadow-[0_4px_14px_rgb(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgb(129,215,180,0.4)] inline-flex items-center gap-2 whitespace-nowrap"
        >
          Review & Create
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
