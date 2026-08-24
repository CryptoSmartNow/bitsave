import React from "react";
import { ArrowRight01Icon, CheckmarkBadge01Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';

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
  const availableTokens = NETWORKS.find((n) => n.id === chain)?.tokens || [];

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Plan Name Section */}
      <div>
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          Plan Name
        </label>
        
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What are you saving for?"
          className="w-full bg-transparent text-3xl md:text-4xl lg:text-[40px] font-normal font-instrument text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 border-b-2 border-gray-200 dark:border-white/10 focus:border-[#81D7B4] dark:focus:border-[#81D7B4] pb-3 transition-colors outline-none tracking-tight"
        />
        {errors.name && (
          <p className="mt-2 text-xs text-red-500 font-bold">{errors.name}</p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {planNamePresets.map((preset) => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={preset}
              type="button"
              onClick={() => setName(preset)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                name === preset
                  ? "bg-[#81D7B4] text-gray-900 shadow-sm"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {preset}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-6"></div>

      {/* Network & Asset Selection Flow */}
      <div className="space-y-4">
        <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
          Select Network & Asset
        </label>

        {chains.filter(c => !c.isComingSoon && c.id !== 'solana').map((c) => {
           const isSelected = chain === c.id;
           
           return (
             <div 
               key={c.id} 
               className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${isSelected ? 'border-[#81D7B4] bg-[#81D7B4]/5 shadow-sm' : 'border-gray-200/80 dark:border-white/5 bg-white dark:bg-[#0c121e] hover:border-gray-300 dark:hover:border-white/20'}`}
             >
               <button
                 type="button"
                 onClick={() => {
                   setChain(c.id);
                   switchToNetwork(c.id);
                   const tokens = NETWORKS.find((n) => n.id === c.id)?.tokens;
                   if (tokens && tokens.length > 0) setCurrency(tokens[0].symbol);
                 }}
                 className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between cursor-pointer"
               >
                 <div className="flex items-center gap-3.5">
                   <div className="w-11 h-11 rounded-full bg-white dark:bg-[#182436] flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 shrink-0">
                     <Image src={ensureImageUrl(c.logo)} alt={c.name} width={24} height={24} className="rounded-full object-contain shrink-0" />
                   </div>
                   <div className="text-left">
                     <h4 className={`text-base sm:text-lg font-bold ${isSelected ? 'text-[#81D7B4]' : 'text-gray-900 dark:text-white'}`}>{c.name}</h4>
                     <p className="text-xs text-gray-500 font-medium">
                        {isSelected ? 'Active Network' : 'Click to select'}
                     </p>
                   </div>
                 </div>
                 
                 <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-[#81D7B4] text-gray-900 shadow-sm' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                    <CheckmarkBadge01Icon className="w-4 h-4" />
                 </div>
               </button>

               {/* Asset Selection (Clean Wrap Grid - No Horizontal Cutoff) */}
               <AnimatePresence>
                 {isSelected && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="px-4 sm:px-6 pb-6 pt-0 border-t border-[#81D7B4]/20 mx-4 sm:mx-6 mt-1"
                   >
                     <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 mt-4">
                       Choose Asset to Lock
                     </p>
                     
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                       {availableTokens.map((curr) => {
                         const isTokenSelected = currency === curr.symbol;
                         return (
                           <button
                             key={curr.symbol}
                             type="button"
                             onClick={(e) => {
                               e.stopPropagation();
                               setCurrency(curr.symbol);
                             }}
                             className={`relative px-3.5 py-3 rounded-2xl border transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
                               isTokenSelected
                                 ? 'border-[#81D7B4] bg-[#81D7B4]/15 shadow-sm ring-1 ring-[#81D7B4] text-gray-900 dark:text-white'
                                 : 'border-gray-200/60 dark:border-white/5 bg-white dark:bg-[#141d2d] shadow-sm hover:border-gray-300 dark:hover:border-white/20 text-gray-700 dark:text-gray-300'
                             }`}
                           >
                             <div className="w-6 h-6 rounded-full relative flex items-center justify-center bg-white shadow-sm shrink-0 overflow-hidden">
                               <Image 
                                 src={getCurrencyImage(curr.symbol)} 
                                 alt={curr.symbol} 
                                 width={24} 
                                 height={24} 
                                 className="object-cover rounded-full" 
                               />
                             </div>
                             <span className={`text-xs sm:text-sm font-bold truncate ${isTokenSelected ? 'text-[#1c4b38] dark:text-[#81D7B4]' : ''}`}>
                               {curr.symbol}
                             </span>
                             {isTokenSelected && (
                               <div className="ml-auto text-[#81D7B4] shrink-0">
                                 <CheckmarkBadge01Icon className="w-4 h-4" />
                               </div>
                             )}
                           </button>
                         );
                       })}
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           );
        })}
      </div>
    </motion.div>
  );
}
