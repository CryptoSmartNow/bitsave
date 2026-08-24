'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cancel01Icon, 
  Search01Icon, 
  PlusSignIcon, 
  Wallet02Icon, 
  ArrowRight01Icon,
  PiggyBankIcon,
  LockIcon
} from 'hugeicons-react';
import Image from 'next/image';
import Link from 'next/link';

interface SelectTopUpPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: any[];
  onSelectPlan: (plan: any) => void;
  networkLogos?: Record<string, any>;
  getTokenLogo?: (tokenName: string, tokenLogo?: string) => string;
}

const defaultGetTokenLogo = (tokenName: string, tokenLogo?: string) => {
  if (tokenLogo) return tokenLogo;
  if (tokenName === 'cUSD') return '/cusd.png';
  if (tokenName === 'cNGN') return '/cngn.png';
  if (tokenName === 'USDGLO') return '/usdglo.png';
  if (tokenName === '$G' || tokenName === 'Gooddollar') return '/$g.png';
  if (tokenName === 'USDC') return '/usdclogo.png';
  return `/${tokenName?.toLowerCase() || 'usdc'}.png`;
};

export default function SelectTopUpPlanModal({
  isOpen,
  onClose,
  plans = [],
  onSelectPlan,
  networkLogos = {},
  getTokenLogo = defaultGetTokenLogo,
}: SelectTopUpPlanModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return plans;
    const query = searchQuery.toLowerCase();
    return plans.filter((plan: any) => 
      plan.name?.toLowerCase().includes(query) ||
      plan.tokenName?.toLowerCase().includes(query) ||
      plan.network?.toLowerCase().includes(query)
    );
  }, [plans, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-gray-200/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Ambient Header Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-[#81D7B4]/20 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center text-[#81D7B4]">
                <PiggyBankIcon className="w-5 h-5 text-emerald-600 dark:text-[#81D7B4]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Select Plan to Top Up
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Choose an active savings vault to deposit more funds
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <Cancel01Icon className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input (if user has multiple plans) */}
          {plans.length > 2 && (
            <div className="px-6 pt-4 pb-2 relative z-10">
              <div className="relative">
                <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your savings plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#81D7B4] transition-all"
                />
              </div>
            </div>
          )}

          {/* Plans List */}
          <div className="p-6 max-h-[380px] overflow-y-auto space-y-3 relative z-10">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan: any) => {
                const tokenName = plan.tokenName || (plan.isEth ? 'ETH' : 'USDC');
                const tokenLogo = plan.isEth ? '/eth.png' : getTokenLogo(tokenName, plan.tokenLogo);
                const currentAmount = parseFloat(plan.currentAmount || '0');
                const rawChain = (plan.network || plan.chain || 'Base').toLowerCase();
                const networkLogo = networkLogos[rawChain]?.logoUrl;

                return (
                  <button
                    key={plan.id || plan.name}
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className="w-full group p-4 rounded-2xl bg-gray-50/70 hover:bg-emerald-50/50 dark:bg-white/[0.03] dark:hover:bg-[#81D7B4]/10 border border-gray-200/70 hover:border-[#81D7B4]/40 dark:border-white/5 dark:hover:border-[#81D7B4]/30 transition-all duration-200 flex items-center justify-between text-left cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-white/10 flex items-center justify-center p-2 shadow-sm">
                          <Image
                            src={tokenLogo}
                            alt={tokenName}
                            width={28}
                            height={28}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        {networkLogo && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-0.5 shadow-sm">
                            <Image
                              src={networkLogo}
                              alt="network"
                              width={12}
                              height={12}
                              className="w-3 h-3 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-[#81D7B4] transition-colors">
                            {plan.name}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-[#81D7B4] border border-emerald-500/20 shrink-0">
                            {plan.network || 'Base'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <span>Token: {tokenName}</span>
                          {plan.maturityTime && (
                            <>
                              <span>•</span>
                              <span>Matures {new Date(Number(plan.maturityTime) * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                          {currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {tokenName}
                        </p>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 group-hover:bg-[#81D7B4] group-hover:text-gray-950 text-gray-400 border border-gray-200/80 dark:border-white/10 group-hover:border-[#81D7B4] flex items-center justify-center transition-all duration-200 shadow-sm">
                        <ArrowRight01Icon className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })
            ) : plans.length > 0 ? (
              <div className="text-center py-8">
                <Search01Icon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">No plans matching "{searchQuery}"</p>
              </div>
            ) : (
              /* Empty State when no active plans exist */
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 rounded-3xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mx-auto mb-4 text-[#81D7B4]">
                  <Wallet02Icon className="w-8 h-8 text-emerald-600 dark:text-[#81D7B4]" />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                  No Active Savings Plans
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 leading-relaxed">
                  You don't have any active savings vaults yet. Create your first locked savings plan to start saving securely.
                </p>
                <Link
                  href="/dashboard/create-savings"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#81D7B4] hover:bg-[#6BC5A0] text-white font-bold text-xs shadow-lg shadow-[#81D7B4]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <PlusSignIcon className="w-4 h-4 text-white" />
                  <span>Create Savings Plan</span>
                </Link>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          {plans.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/80 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <LockIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-[#81D7B4]" />
                <span>Onchain Vaults Protected</span>
              </span>
              <Link
                href="/dashboard/create-savings"
                onClick={onClose}
                className="font-semibold text-emerald-700 dark:text-[#81D7B4] hover:underline flex items-center gap-1"
              >
                <span>+ New Vault</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
