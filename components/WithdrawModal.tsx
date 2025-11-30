'use client'

import { useState, useEffect, memo } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import childContractABI from '../app/abi/childContractABI.js';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import { trackTransaction, trackError } from '@/lib/interactionTracker';
import { handleContractError } from '@/lib/contractErrorHandler';
import { getTweetButtonProps } from '@/utils/tweetUtils';

const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";

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
  const [currentNetwork, setCurrentNetwork] = useState<'base' | 'celo' | 'lisk'>('base');
  const [currentTokenName, setCurrentTokenName] = useState(isEth ? 'ETH' : 'USDC');
  const { address } = useAccount();

  useEffect(() => {
    const detectNetwork = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const BASE_CHAIN_ID = BigInt(8453);
        const CELO_CHAIN_ID = BigInt(42220);
        const LISK_CHAIN_ID = BigInt(1135);

        if (network.chainId === BASE_CHAIN_ID) {
          setCurrentNetwork('base');
        } else if (network.chainId === CELO_CHAIN_ID) {
          setCurrentNetwork('celo');
        } else if (network.chainId === LISK_CHAIN_ID) {
          setCurrentNetwork('lisk');
        } else {
          setCurrentNetwork('base'); // default fallback
        }

        if (isEth) {
          setCurrentTokenName('ETH');
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
          } else {
            setCurrentTokenName('USDGLO'); // Celo default
          }
        }
      }
    };

    if (isOpen) {
      detectNetwork();
    }
  }, [isOpen, isEth, tokenName, currentNetwork]);

  const getContractAddress = () => {
    if (currentNetwork === 'base') {
      return BASE_CONTRACT_ADDRESS;
    } else if (currentNetwork === 'lisk') {
      return LISK_CONTRACT_ADDRESS;
    } else {
      return CELO_CONTRACT_ADDRESS;
    }
  };

  const getExplorerUrl = () => {
    if (currentNetwork === 'base') {
      return 'https://basescan.org/tx/';
    } else if (currentNetwork === 'lisk') {
      return 'https://blockscout.lisk.com/tx/';
    } else {
      return 'https://explorer.celo.org/mainnet/tx/';
    }
  };

  // Get the network name
  const getNetworkName = () => {
    if (currentNetwork === 'base') {
      return 'Base';
    } else if (currentNetwork === 'lisk') {
      return 'Lisk';
    } else {
      return 'Celo';
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
      if (!window.ethereum) {
        throw new Error("Ethereum provider not found. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contractAddress = getContractAddress();
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
            chain: getNetworkName().toLowerCase(),
            savingsname: nameOfSavings,
            useraddress: userAddress,
            transaction_type: "withdrawal",
            currency: "ETH"
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
          currency: 'ETH',
          chain: getNetworkName().toLowerCase(),
          planName: nameOfSavings,
          txHash: receipt.hash
        });
      }

      // Track successful token withdrawal
      if (address) {
        trackTransaction(address, {
          type: 'withdrawal',
          amount: amount,
          currency: currentTokenName,
          chain: getNetworkName().toLowerCase(),
          planName: nameOfSavings,
          txHash: receipt.hash
        });
      }

      setSuccess(true);
      setShowTransactionModal(true);
    } catch (error: unknown) {
      console.error("Error during ETH withdrawal:", error);

      // Track ETH withdrawal error
      if (address) {
        trackError(address, {
          action: 'withdrawal_eth',
          error: error instanceof Error ? error.message : String(error),
          context: {
            planName: nameOfSavings,
            currency: 'ETH'
          }
        });
      }

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
      if (!window.ethereum) {
        throw new Error("Ethereum provider not found. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contractAddress = getContractAddress();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const userChildContractAddress = await contract.getUserChildContractAddress();


      const childContract = new ethers.Contract(userChildContractAddress, childContractABI, signer);
      const savingData = await childContract.getSaving(nameOfSavings);
      const amount = ethers.formatUnits(savingData.amount, 6);

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
            chain: getNetworkName().toLowerCase(),
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
      if (address) {
        trackError(address, {
          action: 'withdrawal_token',
          error: error instanceof Error ? error.message : String(error),
          context: {
            planName: nameOfSavings,
            currency: currentTokenName
          }
        });
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {showTransactionModal ? (
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            {/* Success or Error Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${success ? 'bg-[#81D7B4]/10' : 'bg-red-50'}`}>
              {success ? (
                <div className="w-12 h-12 rounded-full bg-[#81D7B4] flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
              {success ? (isCompleted ? 'Congratulations!' : 'Withdrawal Successful') : 'Withdrawal Failed'}
            </h2>

            {/* Message */}
            <div className="text-gray-500 text-center mb-8">
              <p className="mb-2">
                {success
                  ? (isCompleted
                    ? `You've successfully completed your savings plan "${planName}" and withdrawn your funds. Well done! 🎯`
                    : 'Your withdrawal has been processed successfully.')
                  : 'Your withdrawal failed. Please try again.'}
              </p>
              {!success && error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-left">
                  <p className="text-xs font-bold text-red-800 uppercase mb-1">Error Details</p>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => window.open('https://t.me/bitsaveprotocol/2', '_blank')}
                    className="mt-3 text-xs font-medium text-[#0088cc] hover:underline flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.617-1.407 3.08-2.896 1.596l-2.123-1.596-1.018.96c-.11.11-.202.202-.418.202-.286 0-.237-.107-.335-.38L9.9 13.74l-3.566-1.199c-.778-.244-.79-.778.173-1.16L18.947 6.84c.636-.295 1.295.173.621 1.32z" />
                    </svg>
                    Get Help on Telegram
                  </button>
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              <button
                className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => txHash && window.open(`${getExplorerUrl()}${txHash}`, '_blank')}
                disabled={!txHash}
              >
                View Transaction
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>

              {/* Tweet Button (only for successful withdrawals) */}
              {success && (
                <button
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                  onClick={() => {
                    const tweetProps = getTweetButtonProps('withdrawal', {
                      planName: planName,
                      isCompleted: isCompleted
                    });
                    window.open(tweetProps.href, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  {isCompleted ? 'Share Achievement' : 'Share on X'}
                </button>
              )}

              <button
                className="w-full py-3 bg-[#81D7B4] text-white rounded-xl font-medium hover:shadow-md transition-all"
                onClick={handleCloseTransactionModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Clean background without noise/gradients */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#81D7B4]"></div>

          <div className="p-6 relative z-10 flex flex-col max-h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Withdraw Funds</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#81D7B4]/10 flex items-center justify-center border border-[#81D7B4]/20 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81D7B4]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l-5 5-5-5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{planName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center bg-white px-2 py-0.5 rounded border border-gray-200">
                      <Image
                        src={
                          isEth
                            ? ensureImageUrl(networkLogos?.ethereum?.logoUrl || networkLogos?.['ethereum']?.fallbackUrl || '/eth.png')
                            : ensureImageUrl(
                              networkLogos?.[currentNetwork]?.logoUrl ||
                              networkLogos?.[currentNetwork]?.fallbackUrl ||
                              '/default-network.png'
                            )
                        }
                        alt={isEth ? 'ETH' : getNetworkName()}
                        width={14}
                        height={14}
                        className="mr-1.5"
                      />
                      <span className="text-xs font-medium text-gray-700">{isEth ? 'ETH' : currentTokenName}</span>
                    </div>
                    <div className="flex items-center bg-white px-2 py-0.5 rounded border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">{getNetworkName()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {!isCompleted && (
                <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100 mb-4">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-yellow-800 text-sm">Early Withdrawal Warning</span>
                  </div>
                  <ul className="text-xs text-yellow-700 space-y-2 pl-1">
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span><strong>Penalty Fee:</strong> You will lose {penaltyPercentage}% of your savings as penalty.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span><strong>Lost Rewards:</strong> You will forfeit all potential rewards.</span>
                    </li>
                  </ul>
                </div>
              )}

              {isCompleted && (
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100 mb-4">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-green-800 text-sm">Savings Plan Completed! 🎉</span>
                  </div>
                  <p className="text-xs text-green-700 pl-1">
                    Congratulations on reaching your goal! You can now withdraw your funds without any penalties.
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-3 pt-2">
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="w-full py-3.5 text-center text-base font-medium text-white bg-[#81D7B4] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <span>Confirm Withdrawal</span>
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-3 text-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})

export default WithdrawModal