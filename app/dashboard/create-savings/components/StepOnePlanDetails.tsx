import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HiChevronDown, HiXMark } from "react-icons/hi2";

interface StepOnePlanDetailsProps {
  name: string;
  setName: (val: string) => void;
  planNamePresets: string[];
  showCustomName: boolean;
  setShowCustomName: (val: boolean) => void;
  errors: { name?: string; amount?: string; endDate?: string };
  chain: string;
  setChain: (val: string) => void;
  switchToNetwork: (networkId: string) => void;
  chains: Array<{
    id: string;
    name: string;
    logo: string;
    isComingSoon?: boolean;
  }>;
  NETWORKS: Array<{ id: string; tokens: Array<{ symbol: string }> }>;
  currency: string;
  setCurrency: (val: string) => void;
  ensureImageUrl: (url?: string) => string;
  handleNext: () => void;
}

export default function StepOnePlanDetails({
  name,
  setName,
  planNamePresets,
  errors,
  chain,
  setChain,
  switchToNetwork,
  chains,
  NETWORKS,
  currency,
  setCurrency,
  ensureImageUrl,
  handleNext,
}: StepOnePlanDetailsProps) {
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const selectedChainObj = chains.find((c) => c.id === chain);
  const availableTokens = NETWORKS.find((n) => n.id === chain)?.tokens || [];
  const selectedTokenObj = availableTokens.find((t) => t.symbol === currency);

  const getCurrencyImage = (sym: string) => {
    if (sym === "Gooddollar") return "/$g.png";
    if (sym === "cUSD") return "/cusd.png";
    if (sym === "USDGLO") return "/usdglo.png";
    if (sym === "USDC") return "/usdclogo.png";
    if (sym === "cNGN") return "/cngn.png";
    return `/${sym.toLowerCase().replace("$", "")}.png`;
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Plan Name Section */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8 lg:p-10">
        <label className="block text-lg font-bold text-[#0f172a] mb-1">
          Plan Name
        </label>
        <p className="text-sm text-[#64748b] mb-6">
          Give your savings goal a unique name, or pick a preset.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Vacation Fund"
          className={`w-full rounded-[16px] border bg-white px-5 py-4 text-base text-[#0f172a] font-bold placeholder:text-gray-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/30 focus:border-[#81D7B4] transition-all shadow-inner ${errors.name ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
        />

        <div className="mt-4">
          <p className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">
            Quick Presets
          </p>
          <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2 w-full">
            {planNamePresets.map((preset) => (
              <motion.button
                whileTap={{ scale: 0.96 }}
                key={preset}
                type="button"
                onClick={() => setName(preset)}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors duration-200 ${
                  name === preset
                    ? "bg-[#81D7B4] border-[#81D7B4] text-white shadow-sm"
                    : "bg-[#f8faf9] border-gray-100 text-[#64748b] hover:border-[#81D7B4]/30 hover:bg-[#81D7B4]/5 hover:text-[#0f172a]"
                }`}
              >
                {preset}
              </motion.button>
            ))}
          </div>
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-500 font-bold">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full relative z-20">
        {/* Network Selection */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8">
          <label className="block text-lg font-bold text-[#0f172a] mb-1">
            Network
          </label>
          <p className="text-sm text-[#64748b] mb-5">Select your blockchain.</p>

          <button
            type="button"
            onClick={() => setIsNetworkOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-[#81D7B4] px-5 py-4 rounded-[16px] transition-all focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/30 shadow-sm"
          >
            {selectedChainObj ? (
              <div className="flex items-center gap-3">
                <Image
                  src={ensureImageUrl(selectedChainObj.logo)}
                  alt={selectedChainObj.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="font-bold text-[#0f172a] text-base">
                  {selectedChainObj.name}
                </span>
              </div>
            ) : (
              <span className="font-medium text-gray-400">Select Network</span>
            )}
            <HiChevronDown className="w-5 h-5 text-gray-500 transition-transform" />
          </button>
        </div>

        {/* Currency Selection */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-gray-100 p-6 sm:p-8">
          <label className="block text-lg font-bold text-[#0f172a] mb-1">
            Currency
          </label>
          <p className="text-sm text-[#64748b] mb-5">
            Pick the stablecoin to save in.
          </p>

          <button
            type="button"
            onClick={() => setIsCurrencyOpen(true)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-[#81D7B4] px-5 py-4 rounded-[16px] transition-all focus:outline-none focus:ring-2 focus:ring-[#81D7B4]/30 shadow-sm"
          >
            {selectedTokenObj ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full relative overflow-hidden flex items-center justify-center bg-transparent shrink-0">
                  <Image
                    src={getCurrencyImage(selectedTokenObj.symbol)}
                    alt={selectedTokenObj.symbol}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-bold text-[#0f172a] text-base">
                  {selectedTokenObj.symbol}
                </span>
              </div>
            ) : (
              <span className="font-medium text-gray-400">Select Currency</span>
            )}
            <HiChevronDown className="w-5 h-5 text-gray-500 transition-transform" />
          </button>
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleNext}
          disabled={!name.trim()}
          className={`bg-[#81D7B4] hover:bg-[#6BC7A0] text-white px-8 py-3.5 rounded-2xl text-base font-bold transition-all duration-200 shadow-[0_4px_14px_rgb(129,215,180,0.3)] hover:shadow-[0_6px_20px_rgb(129,215,180,0.4)] inline-flex items-center gap-3 ${!name.trim() ? "opacity-50 cursor-not-allowed shadow-none" : ""}`}
        >
          Continue
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
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </motion.button>
      </div>

      {/* Network Modal Popup */}
      <AnimatePresence>
        {isNetworkOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNetworkOpen(false)}
              className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[9998]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[24px] shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#F8FAF9]">
                <h3 className="font-bold text-lg text-[#0f172a]">
                  Select Network
                </h3>
                <button
                  onClick={() => setIsNetworkOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-3">
                {chains
                  .filter((c) => !c.isComingSoon)
                  .map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setChain(c.id);
                        switchToNetwork(c.id);
                        const tokens = NETWORKS.find(
                          (n) => n.id === c.id,
                        )?.tokens;
                        if (tokens && tokens.length > 0)
                          setCurrency(tokens[0].symbol);
                        setIsNetworkOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-[#81D7B4]/10 transition-colors mb-1 ${chain === c.id ? "bg-[#f4fbf8] ring-1 ring-[#81D7B4]" : ""}`}
                    >
                      <Image
                        src={ensureImageUrl(c.logo)}
                        alt={c.name}
                        width={28}
                        height={28}
                        className="rounded-full shadow-sm"
                      />
                      <span
                        className={`font-bold text-base ${chain === c.id ? "text-[#81D7B4]" : "text-[#0f172a]"}`}
                      >
                        {c.name}
                      </span>
                    </button>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Currency Modal Popup */}
      <AnimatePresence>
        {isCurrencyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCurrencyOpen(false)}
              className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-sm z-[9998]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[24px] shadow-2xl z-[9999] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#F8FAF9]">
                <h3 className="font-bold text-lg text-[#0f172a]">
                  Select Currency
                </h3>
                <button
                  onClick={() => setIsCurrencyOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-3">
                {availableTokens.map((curr) => (
                  <button
                    key={curr.symbol}
                    type="button"
                    onClick={() => {
                      setCurrency(curr.symbol);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-[#81D7B4]/10 transition-colors mb-1 ${currency === curr.symbol ? "bg-[#f4fbf8] ring-1 ring-[#81D7B4]" : ""}`}
                  >
                    <div className="w-7 h-7 rounded-full relative overflow-hidden flex items-center justify-center bg-transparent shrink-0 shadow-sm border border-gray-100">
                      <Image
                        src={getCurrencyImage(curr.symbol)}
                        alt={curr.symbol}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span
                      className={`font-bold text-base ${currency === curr.symbol ? "text-[#81D7B4]" : "text-[#0f172a]"}`}
                    >
                      {curr.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
