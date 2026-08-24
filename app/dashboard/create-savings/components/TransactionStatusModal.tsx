import React from "react";
import Link from "next/link";
import { 
  Cancel01Icon, 
  CheckmarkCircle01Icon, 
  Alert02Icon, 
  ArrowUpRight01Icon, 
  InformationCircleIcon, 
  MessageQuestionIcon,
} from "hugeicons-react";
import { getTweetButtonProps } from "@/utils/tweetUtils";

interface TransactionStatusModalProps {
  success: boolean;
  error: string | null;
  txHash: string | null;
  chain: string;
  currency: string;
  amount: string;
  referralData: any;
  savingsData: { deposits: number };
  handleClose: () => void;
  tokenBalance?: string;
  nativeBalance?: string;
  nativeSymbol?: string;
}

export default function TransactionStatusModal({
  success,
  error,
  txHash,
  chain,
  currency,
  amount,
  referralData,
  savingsData,
  handleClose,
  tokenBalance,
  nativeBalance,
  nativeSymbol = "ETH",
}: TransactionStatusModalProps) {
  const isUserRejected =
    error &&
    typeof error === "string" &&
    (error.toLowerCase().includes("user rejected") || 
     error.toLowerCase().includes("user denied") ||
     error.toLowerCase().includes("cancelled"));

  const isBalanceError =
    error &&
    typeof error === "string" &&
    (error.toLowerCase().includes("insufficient") || 
     error.toLowerCase().includes("balance") ||
     error.toLowerCase().includes("exceeds"));

  const getExplorerUrl = () => {
    if (!txHash) return "";
    switch (chain) {
      case "celo": return `https://celoscan.io/tx/${txHash}`;
      case "lisk": return `https://blockscout.lisk.com/tx/${txHash}`;
      case "avalanche": return `https://snowtrace.io/tx/${txHash}`;
      case "bsc": return `https://bscscan.com/tx/${txHash}`;
      default: return `https://basescan.org/tx/${txHash}`;
    }
  };

  const getExplorerName = () => {
    switch (chain) {
      case "celo": return "CeloScan";
      case "lisk": return "Lisk Explorer";
      case "avalanche": return "SnowTrace";
      case "bsc": return "BscScan";
      default: return "BaseScan";
    }
  };

  const getModalTitle = () => {
    if (success) return "Savings Plan Created!";
    if (isUserRejected) return "Transaction Cancelled";
    if (isBalanceError) return "Insufficient Funds";
    return "Transaction Failed";
  };

  const getErrorMessage = () => {
    if (isUserRejected) {
      return "The transaction was rejected or cancelled in your connected wallet. No funds were debited.";
    }
    if (isBalanceError) {
      return (
        error ||
        `Your wallet does not have enough ${currency} to lock $${amount}. Please top up your wallet balance and try again.`
      );
    }
    return (
      error ||
      "The blockchain transaction could not be completed. Please ensure your wallet has sufficient stablecoins and native gas tokens."
    );
  };

  const rawErrorMessage = typeof error === 'string' ? error : (error as any)?.message || 'Transaction could not be completed';

  return (
    <div
      className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-[#0c121e] border border-gray-200/80 dark:border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-lg mx-auto overflow-hidden relative p-6 sm:p-9 text-center">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <Cancel01Icon className="w-5 h-5" />
        </button>

        {/* Status Icon */}
        <div className="flex justify-center mb-5">
          {success ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#81D7B4]/15 flex items-center justify-center ring-8 ring-[#81D7B4]/10">
              <CheckmarkCircle01Icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#81D7B4]" />
            </div>
          ) : isUserRejected ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/15 flex items-center justify-center ring-8 ring-amber-500/10">
              <Alert02Icon className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-500/15 flex items-center justify-center ring-8 ring-red-500/10">
              <Cancel01Icon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight font-instrument">
          {getModalTitle()}
        </h3>

        {/* Main description */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
          {success
            ? `Your ${amount} ${currency} is now safely locked on ${chain.toUpperCase()} into your verified BitSave vault.`
            : getErrorMessage()}
        </p>

        {/* ── ERROR DIAGNOSTIC CHECKLIST ── */}
        {!success && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/10 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              <InformationCircleIcon className="w-4 h-4 text-[#81D7B4]" />
              <span>Criteria Checklist</span>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-[#81D7B4] font-bold">✓</span>
                <span>
                  <strong>Token Balance:</strong> Ensure your wallet has at least <strong>${amount} {currency}</strong>.
                  {tokenBalance && (
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Current: {parseFloat(tokenBalance).toFixed(4)} {currency}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#81D7B4] font-bold">✓</span>
                <span>
                  <strong>Gas Fee ({nativeSymbol}):</strong> Ensure you have native tokens to pay for network gas.
                  {nativeBalance && (
                    <span className="block text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      Current: {parseFloat(nativeBalance).toFixed(4)} {nativeSymbol}
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#81D7B4] font-bold">✓</span>
                <span>
                  <strong>Network:</strong> Connected to <strong>{chain.toUpperCase()}</strong> network.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Block Explorer Link (on success) */}
        {txHash && (
          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#81D7B4] hover:underline mb-6 bg-[#81D7B4]/10 px-4 py-2 rounded-full border border-[#81D7B4]/20"
          >
            <span>View on {getExplorerName()}</span>
            <ArrowUpRight01Icon className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Tweet Button (success only) */}
        {success &&
          (() => {
            const referralLink = referralData?.referralLink || "https://bitsave.io";
            const isFirstTime = (savingsData?.deposits || 0) === 0;
            const transactionType = isFirstTime ? "first-time-saving" : "subsequent-saving";
            const tweetProps = getTweetButtonProps(transactionType, {
              currency,
              amount,
              referralLink,
              userTransactionCount: savingsData?.deposits || 0,
            });

            return (
              <a
                href={tweetProps.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mb-3 flex items-center justify-center gap-2.5 py-3.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 rounded-2xl text-sm font-bold text-white dark:text-gray-900 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Share on X</span>
              </a>
            );
          })()}

        {/* Report Error & Feedback CTA (errors only) */}
        {!success && !isUserRejected && (
          <div className="space-y-2 mb-3">
            <Link
              href={`/feedback?app=savefi&context=create-savings&error=${encodeURIComponent(rawErrorMessage)}`}
              onClick={handleClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold bg-[#81D7B4]/15 hover:bg-[#81D7B4]/25 text-[#81D7B4] border border-[#81D7B4]/30 transition-colors cursor-pointer"
            >
              <MessageQuestionIcon className="w-4 h-4" />
              <span>Report Error / Log Inquiry to Dev Team</span>
            </Link>

            <a
              href="https://t.me/bitsaveprotocol/2"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span>Need instant chat? Join Telegram Community</span>
              <ArrowUpRight01Icon className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all bg-[#81D7B4] hover:opacity-90 text-white shadow-md shadow-[#81D7B4]/20 cursor-pointer"
        >
          {success ? "Go to Dashboard" : "Got it / Try Again"}
        </button>
      </div>
    </div>
  );
}
