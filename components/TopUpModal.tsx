'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exo } from 'next/font/google';
import { ethers } from 'ethers';
import axios from 'axios';
import { useAccount, useChainId } from 'wagmi';
// import { useWallets } from '@privy-io/react-auth'; 
import { useEthersSigner } from '@/app/bizfi/hooks/useEthersSigner';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { trackTransaction, trackError } from '@/lib/interactionTracker';

// Contract addresses and ABIs
// Base network - dual contract support
const BASE_CONTRACT_ADDRESS_OLD = "0x3593546078eecd0ffd1c19317f53ee565be6ca13" // For existing savings
const BASE_CONTRACT_ADDRESS_NEW = "0x67FFa7a1eb0D05BEaF9dB039c1bD604063040be9" // For new savings
const BASE_CONTRACT_MIGRATION_DATE = new Date('2026-02-05T00:00:00Z').getTime() / 1000 // Unix timestamp

// Other networks
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13"
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932"

// Token addresses
const ETH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"
const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const USDC_LISK_ADDRESS = "0xf242275d3a6527d877f2c927a82d9b057609cc71"
const USDC_BSC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
const USDT_BSC_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"
const USDGLO_CELO_ADDRESS = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3"
const CNGN_BASE_ADDRESS = "0x46C85152bFe9f96829aA94755D9f915F9B10EF5F"
const CNGN_LISK_ADDRESS = "0x999E3A32eF3F9EAbF133186512b5F29fADB8a816"

import CONTRACT_ABI from '@/app/abi/contractABI.js';
import CHILD_CONTRACT_ABI from '@/app/abi/childContractABI.js';
import erc20ABI from '@/app/abi/erc20ABI.json';
import { handleContractError } from '@/lib/contractErrorHandler';
import { getTweetButtonProps } from '@/utils/tweetUtils';
import { getSavingFeeFromContract, estimateGasForTransaction } from '@/utils/contractUtils';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
})

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
    id: string
    name: string
    logoUrl: string
    fallbackUrl?: string
    small?: string
    large?: string
    thumb?: string
  }
}

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planId: string
  isEth?: boolean
  tokenName?: string
  networkLogos?: NetworkLogoData
  contractAddress?: string // Contract address from plan metadata
  startTime?: number // Plan creation timestamp for contract selection
}

// Helper function to determine which Base contract to use
const getBaseContractAddress = (contractAddress?: string, startTime?: number): string => {
  // If contract address is explicitly provided in plan metadata, use it
  if (contractAddress) {
    return contractAddress;
  }
  // Otherwise determine based on creation time
  if (!startTime || startTime < BASE_CONTRACT_MIGRATION_DATE) {
    return BASE_CONTRACT_ADDRESS_OLD;
  }
  return BASE_CONTRACT_ADDRESS_NEW;
}

const getTokenLogo = (name: string, logoUrl: string) => {
  if (logoUrl) return ensureImageUrl(logoUrl);
  if (name === 'ETH') return '/eth.png';
  if (name === 'USDC') return '/usdclogo.png';
  if (name === 'cUSD') return '/cusd.png';
  if (name === 'cNGN') return '/cngn.png';
  if (name === 'Gooddollar' || name === '$G') return '/gooddollar.png';
  return '/default-token.png';
}

const TopUpModal = memo(function TopUpModal({
  isOpen,
  onClose,
  planName,
  isEth = false,
  tokenName,
  networkLogos,
  contractAddress: planContractAddress,
  startTime: planStartTime
}: TopUpModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<'base' | 'celo' | 'lisk' | 'bsc'>('base')
  const modalRef = useRef<HTMLDivElement>(null)

  const { address, isConnected } = useAccount()
  const signer = useEthersSigner()
  const chainId = useChainId()

  // Wallet balance checking states
  const [walletBalance, setWalletBalance] = useState<string>('0')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [estimatedGasFee, setEstimatedGasFee] = useState<string>('0')
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  useEffect(() => {
    const detectNetwork = async () => {
      if (chainId) {
        if (chainId === 8453) setCurrentNetwork('base');
        else if (chainId === 42220) setCurrentNetwork('celo');
        else if (chainId === 1135) setCurrentNetwork('lisk');
        else if (chainId === 56) setCurrentNetwork('bsc');
        else setCurrentNetwork('base'); // Default
      }
    };

    if (isOpen) {
      detectNetwork();
    }
  }, [isOpen, chainId]);

  const fetchSavingFee = async (contractAddress: string, provider: ethers.Provider) => {
    try {
      return await getSavingFeeFromContract(contractAddress, provider);
    } catch (error) {
      console.error("Error fetching saving fee from contract:", error);
      return null;
    }
  };

  // Wallet balance checking utilities
  const getTokenAddress = (tokenName: string, network: 'base' | 'celo' | 'lisk' | 'bsc') => {
    if (network === 'base') {
      if (tokenName === 'cNGN') return CNGN_BASE_ADDRESS;
      return USDC_BASE_ADDRESS; // USDC on Base
    } else if (network === 'lisk') {
      // Lisk network - USDC and cNGN supported
      if (tokenName === 'cNGN') return CNGN_LISK_ADDRESS;
      return USDC_LISK_ADDRESS; // USDC on Lisk
    } else if (network === 'bsc') {
      if (tokenName === 'USDT') return USDT_BSC_ADDRESS;
      return USDC_BSC_ADDRESS; // USDC on BSC
    } else {
      // Celo network
      switch (tokenName?.toLowerCase()) {
        case 'cusd':
          return '0x765DE816845861e75A25fCA122bb6898B8B1282a'; // cUSD on Celo
        case 'usdglo':
          return USDGLO_CELO_ADDRESS; // USDGLO on Celo
        case 'usdc':
          return '0xcebA9300f2b948710d2653dD7B07f33A8B32118C'; // USDC on Celo
        case 'gooddollar':
        case 'g$':
          return '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A'; // G$ on Celo
        default:
          return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
      }
    }
  };

  const checkWalletBalances = useCallback(async () => {
    if (!address || !signer) return;

    setIsCheckingBalance(true);
    setBalanceWarning(null);

    try {
      let currencyName = 'ETH';
      if (currentNetwork === 'bsc') currencyName = 'BNB';
      else if (currentNetwork === 'celo') currencyName = 'CELO';

      const provider = signer.provider;
      if (!provider) return;

      // Get native token balance (ETH)
      const nativeBalance = await provider.getBalance(address);
      const nativeBalanceFormatted = ethers.formatEther(nativeBalance);
      setWalletBalance(nativeBalanceFormatted);

      // Get token balance for selected currency
      if (!isEth && tokenName) {
        const tokenAddress = getTokenAddress(tokenName, currentNetwork);
        const tokenContract = new ethers.Contract(tokenAddress, erc20ABI.abi, provider);
        const tokenBalance = await tokenContract.balanceOf(address);
        const decimals = await tokenContract.decimals();
        const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, decimals);
        setTokenBalance(tokenBalanceFormatted);
      } else {
        setTokenBalance(nativeBalanceFormatted); // For ETH top-ups
      }

      // Estimate gas fee
      const gasPrice = (await provider.getFeeData()).gasPrice;
      const estimatedGasLimit = BigInt(2717330); // Estimated gas limit for top-up (0.000027 ETH)
      const estimatedGasCost = gasPrice ? gasPrice * estimatedGasLimit : BigInt(0);
      const gasFeeFormatted = ethers.formatEther(estimatedGasCost);
      setEstimatedGasFee(gasFeeFormatted);

      // Check for warnings
      const amountNum = parseFloat(amount || '0');
      const tokenBalanceNum = parseFloat(isEth ? nativeBalanceFormatted : tokenBalance);
      const nativeBalanceNum = parseFloat(nativeBalanceFormatted);
      const gasFeeNum = parseFloat(gasFeeFormatted);

      if (amountNum > 0) {
        if (isEth) {
          // For ETH top-ups, check if user has enough ETH for amount + gas
          const totalNeeded = amountNum + (gasFeeNum * 1.5);
          if (nativeBalanceNum < totalNeeded) {
            setBalanceWarning(`Insufficient ETH balance. You have ${nativeBalanceNum.toFixed(6)} ETH but need ${totalNeeded.toFixed(6)} ETH (including gas fees).`);
          }
        } else {
          // For token top-ups
          if (tokenBalanceNum < amountNum) {
            setBalanceWarning(`Insufficient ${tokenName} balance. You have ${tokenBalanceNum.toFixed(4)} ${tokenName} but need ${amountNum} ${tokenName}.`);
          } else if (nativeBalanceNum < gasFeeNum * 1.5) {
            setBalanceWarning(`Low ETH balance for gas fees. You have ${nativeBalanceNum.toFixed(6)} ETH but may need ~${(gasFeeNum * 1.5).toFixed(6)} ETH for transaction fees.`);
          }
        }
      }

    } catch (error) {
      console.error('Error checking wallet balances:', error);
    } finally {
      setIsCheckingBalance(false);
    }
  }, [address, amount, isEth, tokenName, currentNetwork, tokenBalance, signer]);

  // Check balances when amount changes
  useEffect(() => {
    if (address && amount && parseFloat(amount) > 0 && isOpen) {
      const timeoutId = setTimeout(() => {
        checkWalletBalances();
      }, 500); // Debounce to avoid too many calls

      return () => clearTimeout(timeoutId);
    } else {
      setBalanceWarning(null);
    }
  }, [amount, address, isOpen, isEth, tokenName, currentNetwork, checkWalletBalances]);

  // Initial balance check when modal opens
  useEffect(() => {
    if (address && isConnected && isOpen) {
      checkWalletBalances();
    }
  }, [address, isConnected, isOpen, checkWalletBalances]);

  // Diagnostic function to check child contract state before transaction
  const diagnoseChildContractIssues = async (childContractAddress: string, savingsPlanName: string, provider: ethers.Provider, signer: ethers.Signer) => {
    try {
      const childContract = new ethers.Contract(childContractAddress, CHILD_CONTRACT_ABI, signer)

      // Check if the saving exists and is valid
      const savingData = await childContract.getSaving(savingsPlanName)

      if (!savingData.isValid) {
        throw new Error(`InvalidSaving: The savings plan "${savingsPlanName}" does not exist or is invalid. Please check the plan name.`)
      }

      // Check if the owner address matches
      const ownerAddress = await childContract.ownerAddress()
      const signerAddress = await signer.getAddress()

      if (ownerAddress.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error(`CallNotFromBitsave: The connected wallet (${signerAddress}) does not match the savings plan owner (${ownerAddress}).`)
      }

      // Check the stable coin address
      const stableCoinAddress = await childContract.stableCoin()
      console.log(`Child contract stable coin address: ${stableCoinAddress}`)

      // Return diagnostic info for logging
      return {
        isValid: savingData.isValid,
        currentAmount: savingData.amount,
        tokenId: savingData.tokenId,
        ownerAddress,
        stableCoinAddress,
        startTime: savingData.startTime,
        maturityTime: savingData.maturityTime,
        isSafeMode: savingData.isSafeMode
      }
    } catch (error) {
      console.error('Child contract diagnostic error:', error)
      throw error
    }
  }

  const handleStablecoinTopUp = async (amount: string, savingsPlanName: string) => {
    if (!isConnected || !signer) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    let currencyName = 'ETH';

    try {

      const sanitizedAmount = amount.trim();
      const userEnteredAmount = parseFloat(sanitizedAmount);

      if (!sanitizedAmount || isNaN(userEnteredAmount) || userEnteredAmount <= 0) {
        throw new Error("Invalid amount entered.");
      }

      const provider = signer.provider;
      if (!provider) throw new Error("No provider found");

      const network = await provider.getNetwork();
      const BASE_CHAIN_ID = BigInt(8453);
      const CELO_CHAIN_ID = BigInt(42220);
      const LISK_CHAIN_ID = BigInt(1135);
      const BSC_CHAIN_ID = BigInt(56);

      let networkType = 'celo'; // default
      if (network.chainId === BASE_CHAIN_ID) {
        networkType = 'base';
      } else if (network.chainId === LISK_CHAIN_ID) {
        networkType = 'lisk';
      } else if (network.chainId === BSC_CHAIN_ID) {
        networkType = 'bsc';
      } else if (network.chainId === CELO_CHAIN_ID) {
        networkType = 'celo';
      }

      if (networkType === 'celo') {
        // currencyName logic moved below
      } else if (networkType === 'bsc') {
        // currencyName logic moved below
      }

      let contractAddress;
      let tokenAddress;
      let decimals = 6;
      let tokenNameToUse;

      if (networkType === 'base') {
        contractAddress = getBaseContractAddress(planContractAddress, planStartTime);
        tokenAddress = USDC_BASE_ADDRESS;
        tokenNameToUse = "USDC";
      } else if (networkType === 'lisk') {
        contractAddress = LISK_CONTRACT_ADDRESS;
        tokenAddress = USDC_LISK_ADDRESS;
        tokenNameToUse = "USDC";
      } else if (networkType === 'bsc') {
        contractAddress = BSC_CONTRACT_ADDRESS;
        tokenAddress = USDC_BSC_ADDRESS;
        tokenNameToUse = "USDC";
      } else {
        contractAddress = CELO_CONTRACT_ADDRESS;
        tokenAddress = USDGLO_CELO_ADDRESS;
        tokenNameToUse = "USDGLO";
      }



      if (networkType === 'base' && tokenName) {
        if (tokenName === 'USDGLO') {
          tokenAddress = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3";
          decimals = 18;
          tokenNameToUse = 'USDGLO';
        } else if (tokenName === 'USDC') {
          tokenAddress = USDC_BASE_ADDRESS;
          // For Base, older savings used 18 decimals, newer use 6
          if (contractAddress === BASE_CONTRACT_ADDRESS_OLD) {
            decimals = 18;
          } else {
            decimals = 6;
          }
          tokenNameToUse = 'USDC';
        } else if (tokenName === 'cNGN') {
          tokenAddress = "0x46C85152bFe9f96829aA94755D9f915F9B10EF5F";
          decimals = 6;
          tokenNameToUse = 'cNGN';
        }
      } else if (networkType === 'lisk' && tokenName) {
        if (tokenName === 'USDC') {
          tokenAddress = USDC_LISK_ADDRESS;
          decimals = 6;
          tokenNameToUse = 'USDC';
        } else if (tokenName === 'cNGN') {
          tokenAddress = "0x999E3A32eF3F9EAbF133186512b5F29fADB8a816";
          decimals = 6;
          tokenNameToUse = 'cNGN';
        }
      } else if (networkType === 'bsc' && tokenName) {
        if (tokenName === 'USDC') {
          tokenAddress = USDC_BSC_ADDRESS;
          decimals = 18;
          tokenNameToUse = 'USDC';
        } else if (tokenName === 'USDT') {
          tokenAddress = USDT_BSC_ADDRESS;
          decimals = 18;
          tokenNameToUse = 'USDT';
        }
      } else if (networkType === 'celo' && tokenName) {
        if (tokenName === 'cUSD') {
          tokenAddress = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
          decimals = 18;
          tokenNameToUse = 'cUSD';
        } else if (tokenName === 'Gooddollar' || tokenName === '$G') {
          tokenAddress = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A";
          decimals = 18;
          tokenNameToUse = 'Gooddollar';
        } else if (tokenName === 'USDGLO') {
          tokenAddress = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3";
          decimals = 18;
          tokenNameToUse = 'USDGLO';
        } else if (tokenName === 'USDC') {
          tokenAddress = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
          decimals = 6;
          tokenNameToUse = 'USDC';
        }
      }

      if (tokenNameToUse) {
        const networkLabel = networkType.charAt(0).toUpperCase() + networkType.slice(1);
        currencyName = `${networkLabel}(${tokenNameToUse})`;
      }

      const code = await provider.getCode(contractAddress);
      if (code === "0x") {
        throw new Error("Contract not found on this network. Check the contract address and network.");
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress === ethers.ZeroAddress) {
        throw new Error("You must join Bitsave before topping up.");
      }

      // Run diagnostic checks on child contract before proceeding
      console.log('Running pre-transaction diagnostics...');
      const diagnosticInfo = await diagnoseChildContractIssues(userChildContractAddress, savingsPlanName, provider, signer);
      console.log('Child contract diagnostic info:', diagnosticInfo);

      const tokenAmount = ethers.parseUnits(userEnteredAmount.toString(), decimals);

      // Additional diagnostic checks for token balance and allowance
      const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI.abi, signer);
      const userAddress = await signer.getAddress();

      // Check user's token balance
      const userBalance = await erc20Contract.balanceOf(userAddress);

      if (userBalance < tokenAmount) {
        throw new Error(`Insufficient ${tokenNameToUse} balance.`);
      }

      // Check current allowance
      const currentAllowance = await erc20Contract.allowance(userAddress, contractAddress);

      if (diagnosticInfo.tokenId.toLowerCase() !== tokenAddress.toLowerCase()) {
        throw new Error(`Token mismatch: The savings plan expects ${diagnosticInfo.tokenId} but you're trying to deposit ${tokenAddress}.`);
      }

      const approveERC20 = async (tokenAddress: string, amount: ethers.BigNumberish, signer: ethers.Signer) => {
        // Contract to approve is determined by network
        const network = await signer.provider?.getNetwork();
        const chainId = network?.chainId;

        let targetContract = getBaseContractAddress(planContractAddress, planStartTime);
        if (chainId && Number(chainId) === 42220) targetContract = CELO_CONTRACT_ADDRESS;
        if (chainId && Number(chainId) === 1135) targetContract = LISK_CONTRACT_ADDRESS;
        if (chainId && Number(chainId) === 56) targetContract = BSC_CONTRACT_ADDRESS;

        const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI.abi, signer);
        const tx = await erc20Contract.approve(targetContract, amount);
        await tx.wait();
        console.log(`${tokenNameToUse} approval transaction completed`);
      };

      console.log(`Approving ${ethers.formatUnits(tokenAmount, decimals)} ${tokenNameToUse}...`);
      await approveERC20(tokenAddress, tokenAmount, signer);

      // Final check before incrementSaving
      console.log(`Calling incrementSaving with plan: "${savingsPlanName}", token: ${tokenAddress}, amount: ${ethers.formatUnits(tokenAmount, decimals)}`);

      // Estimate gas for incrementSaving transaction
      const estimatedGas = await estimateGasForTransaction(
        contract,
        'incrementSaving',
        [savingsPlanName, tokenAddress, tokenAmount],
        {}
      );

      const tx = await contract.incrementSaving(
        savingsPlanName,
        tokenAddress,
        tokenAmount,
        {
          gasLimit: estimatedGas,
        }
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        await axios.post(
          "/api/transactions",
          {
            amount: userEnteredAmount,
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: savingsPlanName,
            useraddress: address,
            transaction_type: "topup",
            currency: tokenNameToUse
          },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

      } catch (apiError) {
        console.error("Error sending transaction data to API:", apiError);
      }

      // Track successful transaction
      if (address) {
        trackTransaction(address, {
          type: 'top_up',
          amount: userEnteredAmount.toString(),
          currency: tokenNameToUse,
          chain: currentNetwork,
          planName: savingsPlanName,
          txHash: receipt.hash
        });
      }

      setSuccess(true);
      setShowTransactionModal(true);

    } catch (error: unknown) {
      console.error("Error topping up stablecoin savings plan:", error);

      // Track error
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'top_up',
        context: {
          planName: savingsPlanName,
          amount: amount,
          tokenName: tokenName || 'unknown'
        }
      });

      // Enhanced error handling
      let errorMessage: string;
      const errorString = error instanceof Error ? error.message : String(error);

      if (errorString.includes('InvalidSaving:') ||
        errorString.includes('CallNotFromBitsave:') ||
        errorString.includes('Token mismatch:') ||
        errorString.includes('Insufficient') && errorString.includes('balance')) {
        errorMessage = errorString;
      } else {
        errorMessage = handleContractError(error, 'child');
      }

      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEthTopUp = async (amount: string, savingsPlanName: string) => {
    if (!isConnected || !signer) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    let currencyName = 'ETH';

    try {
      const provider = signer.provider;
      if (!provider) throw new Error("No provider found");

      const network = await provider.getNetwork();
      const BASE_CHAIN_ID = BigInt(8453);
      const CELO_CHAIN_ID = BigInt(42220);
      const LISK_CHAIN_ID = BigInt(1135);
      const BSC_CHAIN_ID = BigInt(56);

      let networkType = 'celo'; // default
      if (network.chainId === BASE_CHAIN_ID) {
        networkType = 'base';
      } else if (network.chainId === LISK_CHAIN_ID) {
        networkType = 'lisk';
      } else if (network.chainId === BSC_CHAIN_ID) {
        networkType = 'bsc';
      } else if (network.chainId === CELO_CHAIN_ID) {
        networkType = 'celo';
      }

      currencyName = 'Base(ETH)';
      if (networkType === 'celo') {
        currencyName = 'Celo(CELO)';
      } else if (networkType === 'bsc') {
        currencyName = 'BSC(BNB)';
      } else if (networkType === 'lisk') {
        currencyName = 'Lisk(ETH)';
      }

      let contractAddress;
      if (networkType === 'base') {
        contractAddress = getBaseContractAddress(planContractAddress, planStartTime);
      } else if (networkType === 'lisk') {
        contractAddress = LISK_CONTRACT_ADDRESS;
      } else if (networkType === 'bsc') {
        contractAddress = BSC_CONTRACT_ADDRESS;
      } else {
        contractAddress = CELO_CONTRACT_ADDRESS;
      }

      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      // Check if user has joined Bitsave
      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress === ethers.ZeroAddress) {
        throw new Error("You must join Bitsave before topping up.");
      }

      // Run diagnostic checks on child contract before proceeding
      console.log('Running pre-transaction diagnostics for ETH top-up...');
      const diagnosticInfo = await diagnoseChildContractIssues(userChildContractAddress, savingsPlanName, provider, signer);
      console.log('Child contract diagnostic info:', diagnosticInfo);

      // Get saving fee from contract
      const savingFeeWei = await fetchSavingFee(contractAddress, provider);
      if (!savingFeeWei) {
        throw new Error("Failed to fetch saving fee from contract.");
      }

      const ethAmount = parseFloat(amount);
      if (isNaN(ethAmount) || ethAmount <= 0) {
        throw new Error("Invalid amount entered.");
      }

      const ethAmountInWei = ethers.parseEther(ethAmount.toString());

      // Check user's ETH balance
      const userAddress = await signer.getAddress();
      const userBalance = await provider.getBalance(userAddress);

      const gasEstimate = ethers.parseEther("0.01");
      const totalRequired = ethAmountInWei + gasEstimate;

      if (userBalance < totalRequired) {
        throw new Error(`Insufficient ETH balance.`);
      }

      if (diagnosticInfo.tokenId.toLowerCase() !== ETH_TOKEN_ADDRESS.toLowerCase()) {
        throw new Error(`Token mismatch: The savings plan expects ${diagnosticInfo.tokenId} but you're trying to deposit ETH.`);
      }

      console.log(`Calling incrementSaving with plan: "${savingsPlanName}", ETH amount: ${ethers.formatEther(ethAmountInWei)} ETH`);

      // Estimate gas for incrementSaving transaction
      const estimatedGas = await estimateGasForTransaction(
        contract,
        'incrementSaving',
        [savingsPlanName, ETH_TOKEN_ADDRESS, ethAmountInWei],
        { value: ethAmountInWei }
      );

      const tx = await contract.incrementSaving(
        savingsPlanName,
        ETH_TOKEN_ADDRESS,
        ethAmountInWei,
        {
          value: ethAmountInWei,
          gasLimit: estimatedGas,
        }
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);

      try {
        await axios.post(
          "/api/transactions",
          {
            amount: ethAmount,
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: savingsPlanName,
            useraddress: address,
            transaction_type: "topup",
            currency: currencyName
          },
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );

      } catch (apiError) {
        console.error("Error sending transaction data to API:", apiError);
      }

      // Track successful ETH top-up
      if (address) {
        trackTransaction(address, {
          type: 'top_up',
          amount: amount,
          currency: currencyName,
          chain: currentNetwork,
          planName: savingsPlanName,
          txHash: receipt.hash
        });
      }

      setSuccess(true);
      setShowTransactionModal(true);

    } catch (error: unknown) {
      console.error("Error topping up ETH savings plan:", error);

      // Track ETH top-up error
      trackError(address, error instanceof Error ? error.message : String(error), {
        action: 'top_up_eth',
        context: {
          planName: savingsPlanName,
          amount: amount,
          currency: currencyName
        }
      });

      // Enhanced error handling
      let errorMessage: string;
      const errorString = error instanceof Error ? error.message : String(error);

      if (errorString.includes('InvalidSaving:') ||
        errorString.includes('CallNotFromBitsave:') ||
        errorString.includes('Token mismatch:') ||
        errorString.includes('Insufficient') && errorString.includes('balance')) {
        errorMessage = errorString;
      } else {
        errorMessage = handleContractError(error, 'child');
      }

      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (isEth) {
      await handleEthTopUp(amount, planName);
    } else {
      await handleStablecoinTopUp(amount, planName);
    }
  }

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    if (success) {
      onClose();
      setAmount('');
    }
  }

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


                <h2 className="text-2xl font-bold mb-4">{success ? "Success!" : "Failed"}</h2>
                <p className="mb-4 text-center">{error || (success ? "Transaction successful." : "")}</p>

                {success && (
                  <a
                    href={getTweetButtonProps('top-up', {
                      currency: isEth ? 'ETH' : tokenName || 'USDC',
                      planName: planName,
                      amount: amount
                    }).href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 mb-3 flex items-center justify-center gap-2 text-white bg-black hover:bg-gray-800 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </a>
                )}

                <button className="w-full py-3 bg-[#81D7B4] text-white rounded-xl" onClick={handleCloseTransactionModal}>Close</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={modalRef}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden text-left"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={handleModalClick}
            >
              {/* Top accent bar */}
              <div className="h-2 bg-[#81D7B4] w-full" />

              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Top Up Savings</h2>
                    <p className="text-sm text-gray-500 mt-1">Add funds to {planName}</p>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Add ({isEth ? 'ETH' : tokenName || 'USDC'})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#81D7B4] focus:border-[#81D7B4] transition-colors"
                        placeholder="0.00"
                        step="any"
                        min="0"
                        required
                      />
                      <div className="absolute right-3 top-3">
                      </div>
                    </div>

                    {/* Quick Amount Selection */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                      {[10, 20, 50, 100, 500].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val.toString())}
                          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 hover:border-[#81D7B4] hover:text-[#81D7B4] hover:bg-[#81D7B4]/5 transition-colors whitespace-nowrap"
                        >
                          ${val}
                        </button>
                      ))}
                    </div>

                    {/* Balance display */}
                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                      <span>Balance: {isEth ? walletBalance : tokenBalance}</span>
                    </div>
                    {balanceWarning && (
                      <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        {balanceWarning}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !!balanceWarning}
                    className="w-full py-4 text-white bg-[#81D7B4] hover:bg-[#66C4A3] rounded-xl font-bold shadow-lg shadow-[#81D7B4]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      'Confirm Top Up'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
})

export default TopUpModal