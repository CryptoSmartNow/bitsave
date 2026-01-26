'use client'

import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { useAccount, useChainId } from 'wagmi';
// import { useWallets } from '@privy-io/react-auth';
import { useEthersSigner } from '@/app/bizfi/hooks/useEthersSigner';
import Image from 'next/image';
import childContractABI from '../app/abi/childContractABI.js';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import { trackTransaction, trackError } from '@/lib/interactionTracker';
import { handleContractError } from '@/lib/contractErrorHandler';
import { getTweetButtonProps } from '@/utils/tweetUtils';

const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";

// Helper function to ensure image URLs are properly formatted for Next.js Image
const ensureImageUrl = (url: string | undefined): string => {
  if (!url) return '/default-network.png'
  // If it's a relative path starting with /, it's fine
  if (url.startsWith('/')) return url
  // If it starts with // (protocol-relative), convert to https
  if (url.startsWith('//')) return `https:${url}`
  // If it doesn't start with http/https and doesn't start with /, add /
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `/${url}`
  }
  return url
}

interface NetworkLogoData {
  [key: string]: {
    id: string;
    name: string;
    logoUrl: string;
    fallbackUrl?: string;
    small?: string;
    large?: string;
    thumb?: string;
  }
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  isEth: boolean;
  penaltyPercentage?: number;
  tokenName?: string;
  isCompleted?: boolean;
  networkLogos?: NetworkLogoData;
}

const WithdrawModal = memo(function WithdrawModal({
  isOpen,
  onClose,
  planName,
  isEth,
  penaltyPercentage,
  tokenName,
  isCompleted = false,
  networkLogos
}: WithdrawModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<'base' | 'celo' | 'lisk' | 'bsc'>('base');
  const [currentTokenName, setCurrentTokenName] = useState(isEth ? 'ETH' : 'USDC');

  const { address } = useAccount();
  const signer = useEthersSigner();
  const chainId = useChainId();

  useEffect(() => {
    const detectNetwork = async () => {
      // Use Wagmi chainId or signer
      if (signer) {
        if (chainId === 8453) {
          setCurrentNetwork('base');
        } else if (chainId === 42220) {
          setCurrentNetwork('celo');
        } else if (chainId === 1135) {
          setCurrentNetwork('lisk');
        } else if (chainId === 56) {
          setCurrentNetwork('bsc');
        } else {
          setCurrentNetwork('base'); // default fallback
        }

        if (isEth) {
          // Set native token name based on chain
          if (chainId === 56) {
            setCurrentTokenName('BNB');
          } else if (chainId === 42220) {
            setCurrentTokenName('CELO');
          } else {
            setCurrentTokenName('ETH');
          }
        } else if (tokenName) {
          // Handle GoodDollar display name
          if (tokenName === 'Gooddollar' || tokenName === '$G') {
            setCurrentTokenName('$G');
          } else {
            setCurrentTokenName(tokenName);
          }
        } else {
          // Set default token based on network
          if (currentNetwork === 'base') {
            setCurrentTokenName('USDC');
          } else if (currentNetwork === 'lisk') {
            setCurrentTokenName('USDC');
          } else if (currentNetwork === 'bsc') {
            setCurrentTokenName('USDC');
          } else {
            setCurrentTokenName('USDGLO'); // Celo default
          }
        }
      }
    };

    if (isOpen) {
      detectNetwork();
    }
  }, [isOpen, isEth, tokenName, currentNetwork, chainId, signer]);

  const getContractAddress = () => {
    if (currentNetwork === 'base') {
      return BASE_CONTRACT_ADDRESS;
    } else if (currentNetwork === 'lisk') {
      return LISK_CONTRACT_ADDRESS;
    } else if (currentNetwork === 'bsc') {
      return BSC_CONTRACT_ADDRESS;
    } else {
      return CELO_CONTRACT_ADDRESS;
    }
  };

  const getExplorerUrl = () => {
    if (currentNetwork === 'base') {
      return 'https://basescan.org/tx/';
    } else if (currentNetwork === 'lisk') {
      return 'https://blockscout.lisk.com/tx/';
    } else if (currentNetwork === 'bsc') {
      return 'https://bscscan.com/tx/';
    } else {
      return 'https://explorer.celo.org/mainnet/tx/';
    }
  };

  const handleWithdraw = async () => {
    try {
      const sanitizedPlanName = planName;

      // Added timeout to prevent hanging
      const withdrawalPromise = isEth
        ? handleEthWithdraw(sanitizedPlanName)
        : handleTokenWithdraw(sanitizedPlanName);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Withdrawal timed out. Please check your wallet for pending transactions and try again.'));
        }, 300000); // 5 minutes timeout
      });

      await Promise.race([withdrawalPromise, timeoutPromise]);
    } catch (err) {
      console.error("Error in handleWithdraw:", err);
      setError(`Withdrawal failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      setShowTransactionModal(true);
    }
  };

  const handleEthWithdraw = async (nameOfSavings: string) => {
    setIsLoading(true);
    setError('');

    try {
      if (!signer) {
        throw new Error("No wallet connected.");
      }

      const contractAddress = getContractAddress();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const userChildContractAddress = await contract.getUserChildContractAddress();

      const childContract = new ethers.Contract(userChildContractAddress, childContractABI, signer);
      const savingData = await childContract.getSaving(nameOfSavings);
      const amount = ethers.formatUnits(savingData.amount, 18);

      const gasEstimate = await contract.withdrawSaving.estimateGas(nameOfSavings);

      const tx = await contract.withdrawSaving(nameOfSavings, {
        gasLimit: gasEstimate + (gasEstimate * BigInt(20) / BigInt(100)),
      });

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        if (process.env.NEXT_PUBLIC_API_KEY) {
          headers["X-API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
        }

        await fetch("https://bitsaveapi.vercel.app/transactions/", {
          method: "POST",
          headers,
          body: JSON.stringify({
            amount: parseFloat(amount),
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: nameOfSavings,
            useraddress: userAddress,
            transaction_type: "withdrawal",
            currency: currentTokenName
          })
        });

      } catch (apiError) {
        console.error("Error sending transaction data to API:", apiError);
      }

      // Track successful ETH withdrawal
      if (address) {
        trackTransaction(address, {
          type: 'withdrawal',
          amount: amount,
          currency: currentTokenName,
          chain: currentNetwork,
          planName: nameOfSavings,
          txHash: receipt.hash
        });
      }

      // Track successful token withdrawal - kept for compatibility with existing tracking? 
      // Actually tracking logic was duplicated in original, I'll keep ETH one.

      setSuccess(true);
      setShowTransactionModal(true);
    } catch (error: unknown) {
      console.error("Error during ETH withdrawal:", error);

      // Track ETH withdrawal error
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'withdrawal_eth',
        context: {
          planName: nameOfSavings,
          currency: currentTokenName
        }
      });

      // Use the contract error handler to provide user-friendly error messages
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
      if (!signer) {
        throw new Error("No wallet connected.");
      }

      const userAddress = await signer.getAddress();
      const contractAddress = getContractAddress();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const userChildContractAddress = await contract.getUserChildContractAddress();

      const childContract = new ethers.Contract(userChildContractAddress, childContractABI, signer);
      const savingData = await childContract.getSaving(nameOfSavings);
      
      // Determine decimals based on token name
      let decimals = 6; // Default to 6 (USDC, cNGN)
      if (currentTokenName === 'USDGLO' || currentTokenName === 'cUSD' || currentTokenName === 'Gooddollar' || currentTokenName === '$G') {
        decimals = 18;
      }
      
      const amount = ethers.formatUnits(savingData.amount, decimals);

      const gasEstimate = await contract.withdrawSaving.estimateGas(nameOfSavings);

      const tx = await contract.withdrawSaving(nameOfSavings, {
        gasLimit: gasEstimate + (gasEstimate * BigInt(20) / BigInt(100)),
      });

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        if (process.env.NEXT_PUBLIC_API_KEY) {
          headers["X-API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
        }

        await fetch("https://bitsaveapi.vercel.app/transactions/", {
          method: "POST",
          headers,
          body: JSON.stringify({
            amount: parseFloat(amount),
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: nameOfSavings,
            useraddress: userAddress,
            transaction_type: "withdrawal",
            currency: currentTokenName
          })
        });

      } catch (apiError) {
        console.error("Error sending transaction data to API:", apiError);
      }

      setSuccess(true);
      setShowTransactionModal(true);
    } catch (error: unknown) {
      console.error(`Error during ${currentTokenName} withdrawal:`, error);

      // Track token withdrawal error
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'withdrawal_token',
        context: {
          planName: nameOfSavings,
          currency: currentTokenName
        }
      });

      // Use the contract error handler to provide user-friendly error messages
      const errorMessage = handleContractError(error, 'main');
      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    if (success) {
      onClose();
      window.location.reload();
    } else {
      onClose();
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          {showTransactionModal ? (
            <motion.div
              className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="p-8 flex flex-col items-center">
                {/* ... Simplified transaction modal UI ... */}

                <h2 className="text-2xl font-bold mb-4">{success ? "Success!" : "Failed"}</h2>
                <p className="mb-4 text-center">{error || (success ? "Withdrawal successful." : "")}</p>
                <button className="w-full py-3 bg-[#81D7B4] text-white rounded-xl" onClick={handleCloseTransactionModal}>Close</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Top accent bar with animation */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1.5 bg-[#81D7B4]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              ></motion.div>

              <div className="p-8 relative z-10 flex flex-col max-h-full">
                {/* Header with close button */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <motion.h2
                      className="text-2xl font-bold text-gray-900 mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Withdraw Funds
                    </motion.h2>
                    <motion.p
                      className="text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Withdraw from your savings plan
                    </motion.p>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="group p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200"
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Info Card */}
                <motion.div
                  className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/60"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{planName}</h3>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  {/* Warning/Success Messages */}
                  {!isCompleted && (
                    <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 mb-6">
                      <h4 className="font-bold text-amber-800">Early Withdrawal Warning</h4>
                      <p className="text-sm text-amber-700">You will lose {penaltyPercentage}% of your savings.</p>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-green-50 rounded-2xl p-5 border-2 border-green-200 mb-6">
                      <h4 className="font-bold text-green-800">Plan Completed!</h4>
                      <p className="text-sm text-green-700">You can withdraw without penalty.</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <motion.div
                    className="flex flex-col space-y-3 pt-2"
                  >
                    <motion.button
                      onClick={handleWithdraw}
                      disabled={isLoading}
                      className="w-full py-3 text-center text-base font-bold text-white bg-[#81D7B4] rounded-xl shadow-lg transition-all disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
                    </motion.button>

                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="w-full py-3 text-center text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-xl"
                    >
                      Cancel
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
})

export default WithdrawModal;