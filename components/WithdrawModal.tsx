'use client';

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useEthersSigner } from '@/app/bizfi/hooks/useEthersSigner';
import Image from 'next/image';
import childContractABI from '../app/abi/childContractABI.js';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import Link from 'next/link';
import { MessageQuestionIcon } from 'hugeicons-react';
import { trackTransaction, trackError } from '@/lib/interactionTracker';
import { handleContractError } from '@/lib/contractErrorHandler';
import { submitTransaction } from '@/utils/transactionSync';
import { getTweetButtonProps } from '@/utils/tweetUtils';

// Contract addresses
const BASE_CONTRACT_ADDRESS_OLD = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const BASE_CONTRACT_ADDRESS_NEW = "0x67FFa7a1eb0D05BEaF9dB039c1bD604063040be9";
const BASE_CONTRACT_MIGRATION_DATE = new Date('2026-02-05T00:00:00Z').getTime() / 1000;

const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";

const NETWORK_CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  lisk: 1135,
  bsc: 56,
  avalanche: 43114,
};

const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  8453: 'base',
  42220: 'celo',
  1135: 'lisk',
  56: 'bsc',
  43114: 'avalanche',
};

interface NetworkLogoData {
  [key: string]: {
    id: string;
    name: string;
    logoUrl: string;
    fallbackUrl?: string;
    small?: string;
    large?: string;
    thumb?: string;
  };
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  isEth: boolean;
  amount?: string;
  penaltyPercentage?: number;
  tokenName?: string;
  isCompleted?: boolean;
  maturityTime?: number;
  networkLogos?: NetworkLogoData;
  contractAddress?: string;
  startTime?: number;
  network?: string;
}

const getBaseContractAddress = (contractAddress?: string, startTime?: number): string => {
  if (contractAddress) return contractAddress;
  if (!startTime || startTime < BASE_CONTRACT_MIGRATION_DATE) {
    return BASE_CONTRACT_ADDRESS_OLD;
  }
  return BASE_CONTRACT_ADDRESS_NEW;
};

const WithdrawModal = memo(function WithdrawModal({
  isOpen,
  onClose,
  planName,
  isEth,
  amount: planAmount = '0',
  penaltyPercentage = 0,
  tokenName,
  isCompleted = false,
  maturityTime: planMaturityTime,
  networkLogos,
  contractAddress: planContractAddress,
  startTime: planStartTime,
  network: planNetwork = 'celo'
}: WithdrawModalProps) {
  const { getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const isMature = Boolean(isCompleted || (planMaturityTime ? (Date.now() / 1000 >= planMaturityTime) : false));

  const targetNetworkName = (planNetwork || 'celo').toLowerCase();
  const targetChainId = NETWORK_CHAIN_IDS[targetNetworkName] || 42220;

  const { address, isConnected } = useAccount();
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const getActiveSigner = async () => {
    if (signer) return signer;
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        return await provider.getSigner();
      } catch (e) {
        console.warn("Fallback provider signer resolution failed:", e);
      }
    }
    return null;
  };

  const currentTokenName = isEth 
    ? (targetNetworkName === 'bsc' ? 'BNB' : (targetNetworkName === 'celo' ? 'CELO' : 'ETH'))
    : (tokenName || 'USDC');

  const getContractAddress = () => {
    if (planContractAddress) return planContractAddress;
    if (targetNetworkName === 'base') {
      return getBaseContractAddress(planContractAddress, planStartTime);
    } else if (targetNetworkName === 'lisk') {
      return LISK_CONTRACT_ADDRESS;
    } else if (targetNetworkName === 'bsc') {
      return BSC_CONTRACT_ADDRESS;
    } else if (targetNetworkName === 'avalanche') {
      return AVALANCHE_CONTRACT_ADDRESS;
    }
    return CELO_CONTRACT_ADDRESS;
  };

  const getExplorerUrl = () => {
    if (targetNetworkName === 'base') return 'https://basescan.org/tx/';
    if (targetNetworkName === 'lisk') return 'https://blockscout.lisk.com/tx/';
    if (targetNetworkName === 'bsc') return 'https://bscscan.com/tx/';
    if (targetNetworkName === 'avalanche') return 'https://snowtrace.io/tx/';
    return 'https://celoscan.io/tx/';
  };

  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (!chainId || chainId === targetChainId) return true;
    try {
      if (switchChainAsync) {
        await switchChainAsync({ chainId: targetChainId });
        await new Promise(resolve => setTimeout(resolve, 350));
        return true;
      }
    } catch (switchErr: any) {
      console.warn("Network switch error:", switchErr);
      setError(`Please switch your wallet network to ${planNetwork.toUpperCase()} (Chain ID: ${targetChainId}) to withdraw.`);
      setShowTransactionModal(true);
      return false;
    }
    return true;
  };

  const handleWithdraw = async () => {
    try {
      setError('');
      setSuccess(false);

      const networkReady = await ensureCorrectNetwork();
      if (!networkReady) return;

      if (isEth) {
        await handleEthWithdraw(planName);
      } else {
        await handleTokenWithdraw(planName);
      }
    } catch (err: any) {
      console.error("Error in handleWithdraw:", err);
      const errorMessage = handleContractError(err, 'main');
      setError(errorMessage || String(err?.message || err));
      setShowTransactionModal(true);
      setIsLoading(false);
    }
  };

  const handleEthWithdraw = async (nameOfSavings: string) => {
    setIsLoading(true);
    setError('');

    try {
      const activeSigner = await getActiveSigner();
      if (!activeSigner) {
        throw new Error("No wallet connected. Please connect your wallet.");
      }

      const contractAddress = getContractAddress();
      const userAddress = await activeSigner.getAddress();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, activeSigner);

      let withdrawAmount = planAmount || "0";
      try {
        const userChildContractAddress = await contract.getUserChildContractAddress();
        if (userChildContractAddress && userChildContractAddress !== ethers.ZeroAddress) {
          const childContract = new ethers.Contract(userChildContractAddress, childContractABI, activeSigner);
          const savingData = await childContract.getSaving(nameOfSavings);
          if (savingData?.amount) {
            withdrawAmount = ethers.formatUnits(savingData.amount, 18);
          }
        }
      } catch (readErr) {
        console.warn("Pre-flight getSaving read skipped, proceeding directly with withdrawal:", readErr);
      }

      let tx;
      try {
        const gasEstimate = await contract.withdrawSaving.estimateGas(nameOfSavings);
        tx = await contract.withdrawSaving(nameOfSavings, {
          gasLimit: gasEstimate + (gasEstimate * BigInt(20) / BigInt(100)),
        });
      } catch (estimateErr) {
        console.warn("Gas estimation fallback:", estimateErr);
        tx = await contract.withdrawSaving(nameOfSavings, {
          gasLimit: BigInt(600000),
        });
      }

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        await submitTransaction({
          amount: parseFloat(withdrawAmount).toString(),
          txnhash: receipt.hash,
          chain: targetNetworkName,
          savingsname: nameOfSavings,
          useraddress: userAddress,
          transaction_type: "withdrawal",
          currency: currentTokenName
        }, getAccessToken);
      } catch (e) {
        console.warn("Transaction recording non-blocking warning:", e);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bitsave_tx_updated'));
      }

      if (address) {
        trackTransaction(address, {
          type: 'withdrawal',
          amount: withdrawAmount,
          currency: currentTokenName,
          chain: targetNetworkName,
          planName: nameOfSavings,
          txHash: receipt.hash
        });
      }

      setSuccess(true);
      setShowTransactionModal(true);
    } catch (error: unknown) {
      console.error("Error during ETH withdrawal:", error);
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'withdrawal_eth',
        context: { planName: nameOfSavings, currency: currentTokenName }
      });
      const errorMessage = handleContractError(error, 'main');
      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenWithdraw = async (nameOfSavings: string) => {
    setIsLoading(true);
    setError('');

    try {
      const activeSigner = await getActiveSigner();
      if (!activeSigner) {
        throw new Error("No wallet connected. Please connect your wallet.");
      }

      const userAddress = await activeSigner.getAddress();
      const contractAddress = getContractAddress();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, activeSigner);

      let decimals = 6;
      if (targetNetworkName === 'bsc') {
        decimals = 18;
      } else if (targetNetworkName === 'celo') {
        if (currentTokenName === 'cUSD' || currentTokenName === 'USDGLO' || currentTokenName === 'Gooddollar' || currentTokenName === '$G' || currentTokenName === 'cNGN') {
          decimals = 18;
        }
      } else if (targetNetworkName === 'base') {
        if (currentTokenName === 'USDGLO') {
          decimals = 18;
        }
      }

      let withdrawAmount = planAmount || "0";
      try {
        const userChildContractAddress = await contract.getUserChildContractAddress();
        if (userChildContractAddress && userChildContractAddress !== ethers.ZeroAddress) {
          const childContract = new ethers.Contract(userChildContractAddress, childContractABI, signer);
          const savingData = await childContract.getSaving(nameOfSavings);
          if (savingData?.amount) {
            withdrawAmount = ethers.formatUnits(savingData.amount, decimals);
          }
        }
      } catch (readErr) {
        console.warn("Pre-flight getSaving read skipped, proceeding directly with withdrawal:", readErr);
      }

      let tx;
      try {
        const gasEstimate = await contract.withdrawSaving.estimateGas(nameOfSavings);
        tx = await contract.withdrawSaving(nameOfSavings, {
          gasLimit: gasEstimate + (gasEstimate * BigInt(20) / BigInt(100)),
        });
      } catch (estimateErr) {
        console.warn("Gas estimation fallback:", estimateErr);
        tx = await contract.withdrawSaving(nameOfSavings, {
          gasLimit: BigInt(600000),
        });
      }

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        await submitTransaction({
          amount: parseFloat(withdrawAmount).toString(),
          txnhash: receipt.hash,
          chain: targetNetworkName,
          savingsname: nameOfSavings,
          useraddress: userAddress,
          transaction_type: "withdrawal",
          currency: currentTokenName
        }, getAccessToken);
      } catch (e) {
        console.warn("Transaction recording non-blocking warning:", e);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bitsave_tx_updated'));
      }

      setSuccess(true);
      setShowTransactionModal(true);
    } catch (error: unknown) {
      console.error(`Error during ${currentTokenName} withdrawal:`, error);
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'withdrawal_token',
        context: { planName: nameOfSavings, currency: currentTokenName }
      });
      const errorMessage = handleContractError(error, 'main');
      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {showTransactionModal ? (
            <motion.div
              className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 p-8 text-center"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {success ? (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-[#81D7B4]/15 border border-[#81D7B4]/30 flex items-center justify-center mx-auto mb-4 text-[#81D7B4]">
                    <svg className="w-8 h-8 text-emerald-600 dark:text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Withdrawal Successful!</h2>
                  <p className="mb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your savings have been claimed and transferred directly to your wallet.
                  </p>
                  {txHash && (
                    <a
                      href={`${getExplorerUrl()}${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-emerald-600 dark:text-[#81D7B4] hover:underline mb-6 font-mono"
                    >
                      View on Explorer ↗
                    </a>
                  )}

                  {(() => {
                    const tweetProps = getTweetButtonProps('withdrawal', {
                      currency: currentTokenName,
                      planName,
                      amount: planAmount,
                      isCompleted: isMature,
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

                  <button 
                    className="w-full py-3.5 rounded-2xl bg-[#81D7B4] hover:bg-[#6BC5A0] text-white font-bold text-sm transition-all shadow-[0_4px_14px_rgba(129,215,180,0.35)]" 
                    onClick={handleCloseTransactionModal}
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-500">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Withdrawal Notice</h2>
                  <div className="mb-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 leading-relaxed font-sans text-left">
                    {error || "An unexpected error occurred during withdrawal."}
                  </div>

                  <Link
                    href={`/feedback?app=savefi&context=withdrawal&error=${encodeURIComponent(error || 'Withdrawal failed')}`}
                    onClick={handleCloseTransactionModal}
                    className="w-full mb-3 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold bg-[#81D7B4]/15 hover:bg-[#81D7B4]/25 text-[#81D7B4] border border-[#81D7B4]/30 transition-colors cursor-pointer"
                  >
                    <MessageQuestionIcon className="w-4 h-4" />
                    <span>Report Error / Log Inquiry to Dev Team</span>
                  </Link>

                  <div className="flex gap-3">
                    {chainId !== targetChainId && (
                      <button 
                        className="flex-1 py-3.5 rounded-2xl bg-[#81D7B4] hover:opacity-90 text-white font-bold text-sm transition-all shadow-[0_4px_14px_rgba(129,215,180,0.35)] cursor-pointer" 
                        onClick={async () => {
                          setShowTransactionModal(false);
                          await switchChainAsync({ chainId: targetChainId });
                        }}
                      >
                        Switch to {planNetwork.toUpperCase()}
                      </button>
                    )}
                    <button 
                      className="flex-1 py-3.5 rounded-2xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 text-gray-800 dark:text-white font-bold text-sm transition-all cursor-pointer" 
                      onClick={handleCloseTransactionModal}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-[#81D7B4]/20 blur-3xl pointer-events-none" />

              <div className="p-6 sm:p-8 flex flex-col relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Claim savings to your wallet</p>
                  </div>
                  <button 
                    onClick={onClose} 
                    className="p-2 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer"
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Vault Info Card */}
                <div className="mb-6 bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-5 border border-gray-200/80 dark:border-white/10 relative overflow-hidden">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#121212] flex items-center justify-center border border-gray-200/80 dark:border-white/10 p-2 shrink-0 shadow-sm">
                      <Image 
                        src={isEth ? '/eth.png' : (currentTokenName === 'USDC' ? '/usdclogo.png' : `/${currentTokenName.toLowerCase().replace('$', '')}.png`)} 
                        alt={currentTokenName} 
                        width={28} 
                        height={28} 
                        className="object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-token.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-emerald-600 dark:text-[#81D7B4] font-bold uppercase tracking-widest">Vault Name</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{planName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {planNetwork}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#81D7B4]/15 text-emerald-700 dark:text-[#81D7B4] uppercase tracking-wide">
                          {currentTokenName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning/Success Notice */}
                {!isMature && penaltyPercentage > 0 ? (
                  <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 mb-6">
                    <h4 className="font-bold text-amber-600 dark:text-amber-400 text-xs">Early Withdrawal Notice</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                      This vault has not completed its term. An early exit penalty of {penaltyPercentage}% will apply.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/30 mb-6">
                    <h4 className="font-bold text-emerald-600 dark:text-[#81D7B4] text-xs">Vault Matured!</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-0.5 leading-relaxed">
                      You can withdraw 100% of your funds with 0% penalty.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#81D7B4] to-[#6BC7A0] hover:from-[#6BC7A0] hover:to-[#58B28D] text-white font-bold text-sm shadow-[0_4px_16px_rgba(129,215,180,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Withdrawal...</span>
                      </>
                    ) : (
                      <span>Confirm Withdrawal</span>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
});

export default WithdrawModal;