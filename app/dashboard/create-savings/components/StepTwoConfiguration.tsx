import React from "react";
import { motion, Variants } from "framer-motion";
import Image from 'next/image';
import { format } from "date-fns";
import CustomDatePicker from "@/components/CustomDatePicker";
import { LockKeyIcon, Shield01Icon, Shield02Icon, Alert01Icon, Wallet01Icon, Calendar01Icon } from "hugeicons-react";

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
  tokenBalance?: string;
  nativeBalance?: string;
  nativeSymbol?: string;
  isCheckingBalance?: boolean;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
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
  tokenBalance = "0",
  nativeBalance = "0",
  nativeSymbol = "ETH",
  isCheckingBalance = false,
}: StepTwoConfigurationProps) {
  const tokenBalNum = parseFloat(tokenBalance || "0");
  const amountNum = parseFloat(amount || "0");
  const isInsufficient = amountNum > 0 && tokenBalNum < amountNum;

  const penaltyPercentNum = parseFloat(penalty.replace('%', '')) || 10;
  const penaltyCalculatedCost = amountNum > 0 ? ((amountNum * penaltyPercentNum) / 100).toFixed(2) : '0.00';
  const returnAfterPenalty = amountNum > 0 ? (amountNum - (amountNum * penaltyPercentNum) / 100).toFixed(2) : '0.00';

  const penaltyOptions = [
    { label: "Lenient", rate: "10%", desc: "Standard discipline", icon: Shield01Icon },
    { label: "Strict", rate: "20%", desc: "High conviction", icon: Shield02Icon },
    { label: "Diamond", rate: "30%", desc: "Unbreakable lock", icon: LockKeyIcon },
  ];

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* ─── 1. AMOUNT SECTION ─── */}
      <motion.div variants={itemVariants} className="text-center bg-white/70 dark:bg-[#0c121e]/70 backdrop-blur-md rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-xs">
        <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
          1. Deposit Amount
        </label>

        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center group my-1">
            <span className={`text-4xl sm:text-5xl font-normal font-instrument absolute left-0 -ml-7 sm:-ml-10 ${amount ? 'text-gray-900 dark:text-white' : 'text-gray-300 dark:text-gray-700'} transition-colors`}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`bg-transparent text-5xl sm:text-7xl font-normal font-instrument text-gray-900 dark:text-white placeholder:text-gray-200 dark:placeholder:text-white/10 text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.amount || isInsufficient ? "text-red-500 dark:text-red-400" : ""}`}
              style={{ width: amount ? `${Math.max(4, amount.length)}ch` : '4ch' }}
            />
          </div>
          
          <div className="mt-1 bg-gray-100 dark:bg-white/5 rounded-full px-3.5 py-1 flex items-center gap-1.5 border border-gray-200/70 dark:border-white/10">
             <span className="text-[11px] font-bold text-gray-500">Locking in</span>
             <span className="text-xs font-black text-gray-900 dark:text-white">{currency}</span>
          </div>

          {/* Wallet Balance Indicator */}
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200/70 dark:border-white/10 text-xs font-medium">
            <Wallet01Icon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 text-[11px]">
              Wallet: <strong className="text-gray-900 dark:text-white font-bold font-instrument text-xs">{tokenBalNum.toLocaleString(undefined, { maximumFractionDigits: 4 })} {currency}</strong>
            </span>
            {tokenBalNum > 0 && (
              <button
                type="button"
                onClick={() => setAmount(tokenBalance)}
                className="ml-1 px-2 py-0.5 rounded-md bg-[#81D7B4]/20 hover:bg-[#81D7B4]/30 text-[#1c4b38] dark:text-[#81D7B4] font-black text-[10px] tracking-wider transition-colors cursor-pointer"
              >
                USE MAX
              </button>
            )}
          </div>
        </div>

        {/* Quick Amount Shortcuts */}
        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {["25", "50", "100", "250", "500"].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                amount === val
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              +${val}
            </button>
          ))}
        </div>
        
        {errors.amount && (
          <p className="mt-3 text-xs text-red-500 font-bold">{errors.amount}</p>
        )}

        {isInsufficient && !errors.amount && (
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400">
            <Alert01Icon className="w-3.5 h-3.5 shrink-0" />
            <span>Amount exceeds wallet balance ({tokenBalNum.toFixed(2)} {currency}).</span>
          </div>
        )}

        {/* GoodDollar Equivalent */}
        {currency === "Gooddollar" && amount && goodDollarEquivalent > 0 && (
          <div className="mt-3 p-3 bg-[#81D7B4]/10 rounded-xl border border-[#81D7B4]/30 inline-flex items-center gap-3 shadow-xs mx-auto">
            <span className="text-xs text-[#1c4b38] dark:text-[#81D7B4] flex items-center gap-1.5 font-bold">
              <Image src="/$g.png" alt="$G" width={16} height={16} className="rounded-full" />
              Equivalent
            </span>
            <span className="text-sm font-black text-[#1c4b38] dark:text-[#81D7B4]">
              {goodDollarEquivalent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $G
            </span>
          </div>
        )}
      </motion.div>

      {/* ─── 2. STRICTNESS LEVEL (PENALTY) — PROMINENTLY PLACED BEFORE CALENDAR ─── */}
      <motion.div variants={itemVariants} className="bg-white/70 dark:bg-[#0c121e]/70 backdrop-blur-md rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              2. Strictness Level (Early Withdrawal Penalty)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enforces disciplined saving. Penalty is only applied if you break the vault before maturity.
            </p>
          </div>
          <span className="shrink-0 whitespace-nowrap px-3 py-1 bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25 rounded-xl text-xs font-bold font-sans">
            {penalty} Selected
          </span>
        </div>

        {/* 3 Horizontal Penalty Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {penaltyOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = penalty === opt.rate;
            return (
              <button
                key={opt.rate}
                type="button"
                onClick={() => setPenalty(opt.rate)}
                className={`p-4 rounded-2xl border text-left flex sm:flex-col justify-between items-start gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#81D7B4] bg-[#81D7B4]/10 shadow-xs ring-2 ring-[#81D7B4]/20"
                    : "border-gray-200/70 dark:border-white/10 hover:border-[#81D7B4]/50 bg-gray-50/50 dark:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#81D7B4] text-white shadow-xs' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xl font-black font-instrument ${
                    isSelected ? 'text-[#81D7B4]' : 'text-gray-900 dark:text-white'
                  }`}>
                    {opt.rate}
                  </span>
                </div>

                <div>
                  <p className={`text-xs font-bold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Real-time Penalty Impact Pill */}
        {amountNum > 0 && (
          <div className="p-3 bg-red-500/[0.06] dark:bg-red-500/[0.1] rounded-2xl border border-red-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
              <Alert01Icon className="w-4 h-4 shrink-0" />
              <span>If broken early: <strong className="font-bold">-${penaltyCalculatedCost} penalty</strong></span>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              Return on early exit: <strong className="font-bold text-gray-900 dark:text-white font-instrument">${returnAfterPenalty}</strong>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── 3. LOCK DURATION & CALENDAR ─── */}
      <motion.div variants={itemVariants} className="bg-white/70 dark:bg-[#0c121e]/70 backdrop-blur-md rounded-3xl p-6 border border-gray-200/70 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <label className="block text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              3. Target Maturity Date
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select when your savings mature and unlock penalty-free.
            </p>
          </div>
          {endDate && (
            <span className="shrink-0 whitespace-nowrap px-3 py-1 bg-[#81D7B4]/15 text-[#81D7B4] border border-[#81D7B4]/25 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5">
              <Calendar01Icon className="w-3.5 h-3.5" />
              {format(endDate, "MMM d, yyyy")}
            </span>
          )}
        </div>
        
        {/* Quick Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {startDate &&
            [
              { label: "1 Month", days: 30 },
              { label: "3 Months", days: 90 },
              { label: "6 Months", days: 180 },
              { label: "1 Year", days: 365 },
            ].map((preset) => {
              const presetDate = new Date(startDate);
              presetDate.setDate(presetDate.getDate() + preset.days);
              const isSelected = endDate && format(presetDate, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd");
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setEndDate(presetDate);
                    setCalendarNavigateDate(presetDate);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#81D7B4]/15 border-[#81D7B4] text-[#81D7B4] shadow-xs"
                      : "bg-gray-50 dark:bg-white/5 border-gray-200/70 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#81D7B4]/50"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
        </div>

        {/* Date Picker */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl p-2 border border-gray-200/70 dark:border-white/10">
          <CustomDatePicker
            selectedDate={endDate}
            onSelectDate={(date) => setEndDate(date)}
            navigateToDate={calendarNavigateDate}
          />
        </div>
        
        {errors.endDate && (
          <p className="text-xs text-red-500 font-bold">{errors.endDate}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
