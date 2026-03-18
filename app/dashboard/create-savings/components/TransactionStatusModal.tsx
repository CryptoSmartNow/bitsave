import React from "react";
import { HiXMark } from "react-icons/hi2";
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
}: TransactionStatusModalProps) {
  const isUserRejected =
    error &&
    typeof error === "string" &&
    error.toLowerCase().includes("user rejected");

  const getExplorerUrl = () => {
    if (!txHash) return "";
    switch (chain) {
      case "celo":
        return `https://explorer.celo.org/tx/${txHash}`;
      case "lisk":
        return `https://blockscout.lisk.com/tx/${txHash}`;
      case "avalanche":
        return `https://snowtrace.io/tx/${txHash}`;
      case "bsc":
        return `https://bscscan.com/tx/${txHash}`;
      default:
        return `https://basescan.org/tx/${txHash}`;
    }
  };

  const getErrorMessage = () => {
    if (isUserRejected) return "You cancelled the transaction in your wallet.";
    return (
      error ||
      "Something went wrong. Please try again or reach out to our support team."
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md mx-auto overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 p-2 rounded-full text-gray-400 hover:text-[#0f172a] hover:bg-gray-100 transition-colors"
        >
          <HiXMark className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {success ? (
              <div className="w-20 h-20 rounded-full bg-[#81D7B4]/10 flex items-center justify-center ring-4 ring-[#81D7B4]/20">
                <svg
                  className="w-10 h-10 text-[#81D7B4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : isUserRejected ? (
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center ring-4 ring-amber-100">
                <svg
                  className="w-10 h-10 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center ring-4 ring-red-100">
                <svg
                  className="w-10 h-10 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2
              id="modal-title"
              className={`text-2xl font-black tracking-tight mb-2 ${
                success
                  ? "text-[#0f172a]"
                  : isUserRejected
                    ? "text-[#0f172a]"
                    : "text-[#0f172a]"
              }`}
            >
              {success
                ? "Plan Created!"
                : isUserRejected
                  ? "Transaction Cancelled"
                  : "Something Went Wrong"}
            </h2>
            <p className="text-sm text-[#64748b] font-medium leading-relaxed max-w-xs mx-auto">
              {success
                ? "Your savings plan is now live. Start building your financial future."
                : isUserRejected
                  ? "No changes were made. You can try again anytime."
                  : getErrorMessage()}
            </p>
          </div>

          {/* Error Details (only for real errors, not user rejection) */}
          {error && !isUserRejected && (
            <div className="mb-6 bg-[#f8faf9] rounded-[20px] p-5 border border-gray-100">
              <p className="text-xs font-black text-[#64748b] uppercase tracking-widest mb-3">
                What to try
              </p>
              <div className="space-y-3">
                {[
                  "Refresh the page and try again",
                  "Check your wallet connection",
                  "Verify you have sufficient balance",
                  "Make sure you're on the correct network",
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#81D7B4] shrink-0"></div>
                    <span className="text-sm text-[#0f172a] font-medium">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {txHash && (success || (error && !isUserRejected)) && (
            <button
              onClick={() => window.open(getExplorerUrl(), "_blank")}
              className="w-full mb-4 flex items-center justify-center gap-2.5 py-3.5 bg-[#f8faf9] hover:bg-gray-100 border border-gray-200 rounded-2xl text-sm font-bold text-[#0f172a] transition-colors"
            >
              <svg
                className="w-4 h-4 text-[#64748b]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View on Explorer
            </button>
          )}

          {/* Tweet Button (success only) */}
          {success &&
            (() => {
              const referralLink =
                referralData?.referralLink || "https://bitsave.io";
              const isFirstTime = savingsData.deposits === 0;
              const transactionType = isFirstTime
                ? "first-time-saving"
                : "subsequent-saving";
              const tweetProps = getTweetButtonProps(transactionType, {
                currency,
                amount,
                referralLink,
                userTransactionCount: savingsData.deposits,
              });

              return (
                <a
                  href={tweetProps.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    setTimeout(() => {
                      window.location.href = "/dashboard";
                    }, 2000)
                  }
                  className="w-full mb-4 flex items-center justify-center gap-2.5 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] rounded-2xl text-sm font-bold text-white transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.209c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Share on X
                </a>
              );
            })()}

          {/* Telegram Support (errors only) */}
          {error && !isUserRejected && (
            <button
              onClick={() =>
                window.open("https://t.me/bitsaveprotocol/2", "_blank")
              }
              className="w-full mb-4 flex items-center justify-center gap-2.5 py-3.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-[#0f172a] transition-colors"
            >
              <svg
                className="w-4 h-4 text-[#0088cc]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.617-1.407 3.08-2.896 1.596l-2.123-1.596-1.018.96c-.11.11-.202.202-.418.202-.286 0-.237-.107-.335-.38L9.9 13.74l-3.566-1.199c-.778-.244-.79-.778.173-1.16L18.947 6.84c.636-.295 1.295.173.621 1.32z" />
              </svg>
              Get Help on Telegram
            </button>
          )}

          {/* Primary Action */}
          <button
            onClick={handleClose}
            className={`w-full py-4 rounded-2xl text-base font-extrabold transition-all duration-200 ${
              success
                ? "bg-[#81D7B4] hover:bg-[#6BC7A0] text-white shadow-[0_4px_14px_rgb(129,215,180,0.4)]"
                : isUserRejected
                  ? "bg-[#0f172a] hover:bg-[#1e293b] text-white"
                  : "bg-[#0f172a] hover:bg-[#1e293b] text-white"
            }`}
          >
            {success
              ? "Go to Dashboard"
              : isUserRejected
                ? "Try Again"
                : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
