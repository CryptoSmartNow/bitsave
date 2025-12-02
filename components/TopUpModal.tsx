'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Exo } from 'next/font/google';
import { ethers } from 'ethers';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { trackTransaction, trackError } from '@/lib/interactionTracker';

// Contract addresses and ABIs
const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13"
const ETH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"
const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const USDC_LISK_ADDRESS = "0xf242275d3a6527d877f2c927a82d9b057609cc71"
const USDGLO_CELO_ADDRESS = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3"

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
}

const getTokenLogo = (name: string, logoUrl: string) => {
  if (logoUrl) return ensureImageUrl(logoUrl);
  if (name === 'ETH') return '/eth.png';
  if (name === 'USDC') return '/usdclogo.png';
  if (name === 'cUSD') return '/cusd.png';
  if (name === 'Gooddollar' || name === '$G') return '/gooddollar.png';
  return '/default-token.png';
}

const TopUpModal = memo(function TopUpModal({ isOpen, onClose, planName, isEth = false, tokenName, networkLogos }: TopUpModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<'base' | 'celo' | 'lisk'>('base')
  const modalRef = useRef<HTMLDivElement>(null)
  const { address, isConnected } = useAccount()

  // Wallet balance checking states
  const [walletBalance, setWalletBalance] = useState<string>('0')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [estimatedGasFee, setEstimatedGasFee] = useState<string>('0')
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

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
      }
    };

    if (isOpen) {
      detectNetwork();
    }
  }, [isOpen]);

  const fetchSavingFee = async (contractAddress: string, provider: ethers.BrowserProvider) => {
    try {
      return await getSavingFeeFromContract(contractAddress, provider);
    } catch (error) {
      console.error("Error fetching saving fee from contract:", error);
      return null;
    }
  };

  // Wallet balance checking utilities
  const getTokenAddress = (tokenName: string, network: 'base' | 'celo' | 'lisk') => {
    if (network === 'base') {
      return USDC_BASE_ADDRESS; // USDC on Base
    } else if (network === 'lisk') {
      // Lisk network - only USDC supported
      return USDC_LISK_ADDRESS; // USDC on Lisk
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
    if (!address || !window.ethereum) return;

    setIsCheckingBalance(true);
    setBalanceWarning(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

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
      const gasPrice = await provider.getFeeData();
      const estimatedGasLimit = ethers.getBigInt(2717330); // Estimated gas limit for top-up (0.000027 ETH)
      const estimatedGasCost = gasPrice.gasPrice ? gasPrice.gasPrice * estimatedGasLimit : ethers.getBigInt(0);
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
  }, [address, amount, isEth, tokenName, currentNetwork, tokenBalance]);

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
  const diagnoseChildContractIssues = async (childContractAddress: string, savingsPlanName: string, provider: ethers.BrowserProvider, signer: ethers.Signer) => {
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
    if (!isConnected) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {

      const sanitizedAmount = amount.trim();
      const userEnteredAmount = parseFloat(sanitizedAmount);

      if (!sanitizedAmount || isNaN(userEnteredAmount) || userEnteredAmount <= 0) {
        throw new Error("Invalid amount entered.");
      }

      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      const BASE_CHAIN_ID = BigInt(8453);
      const CELO_CHAIN_ID = BigInt(42220);
      const LISK_CHAIN_ID = BigInt(1135);

      let networkType = 'celo'; // default
      if (network.chainId === BASE_CHAIN_ID) {
        networkType = 'base';
      } else if (network.chainId === LISK_CHAIN_ID) {
        networkType = 'lisk';
      } else if (network.chainId === CELO_CHAIN_ID) {
        networkType = 'celo';
      } else if (network.chainId === CELO_CHAIN_ID) {
        networkType = 'celo';
      }

      let contractAddress;
      let tokenAddress;
      let decimals = 6;
      let tokenNameToUse;

      if (networkType === 'base') {
        contractAddress = BASE_CONTRACT_ADDRESS;
        tokenAddress = USDC_BASE_ADDRESS;
        tokenNameToUse = "USDC";
      } else if (networkType === 'lisk') {
        contractAddress = LISK_CONTRACT_ADDRESS;
        tokenAddress = USDC_LISK_ADDRESS;
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
          decimals = 6;
          tokenNameToUse = 'USDC';
        }
      } else if (networkType === 'lisk' && tokenName) {
        if (tokenName === 'USDC') {
          tokenAddress = USDC_LISK_ADDRESS;
          decimals = 6;
          tokenNameToUse = 'USDC';
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
      console.log(`User ${tokenNameToUse} balance: ${ethers.formatUnits(userBalance, decimals)}`);

      if (userBalance < tokenAmount) {
        throw new Error(`Insufficient ${tokenNameToUse} balance. You have ${ethers.formatUnits(userBalance, decimals)} ${tokenNameToUse}, but need ${userEnteredAmount} ${tokenNameToUse} for this transaction.`);
      }

      // Check current allowance
      const currentAllowance = await erc20Contract.allowance(userAddress, contractAddress);
      console.log(`Current ${tokenNameToUse} allowance: ${ethers.formatUnits(currentAllowance, decimals)}`);

      // Verify token address matches what the child contract expects
      if (diagnosticInfo.tokenId.toLowerCase() !== tokenAddress.toLowerCase()) {
        throw new Error(`Token mismatch: The savings plan expects ${diagnosticInfo.tokenId} but you're trying to deposit ${tokenAddress}. Please use the correct token for this savings plan.`);
      }

      const approveERC20 = async (tokenAddress: string, amount: ethers.BigNumberish, signer: ethers.Signer) => {
        const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI.abi, signer);
        const tx = await erc20Contract.approve(contractAddress, amount);
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
          "https://bitsaveapi.vercel.app/transactions/",
          {
            amount: userEnteredAmount,
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: savingsPlanName,
            useraddress: address,
            transaction_type: "deposit",
            currency: tokenNameToUse
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_API_KEY
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
      if (address) {
        trackError(address, {
          action: 'top_up',
          error: error instanceof Error ? error.message : String(error),
          context: {
            planName: savingsPlanName,
            amount: amount,
            tokenName: tokenName || 'unknown'
          }
        });
      }

      // Enhanced error handling with child contract diagnostics
      let errorMessage: string;
      const errorString = error instanceof Error ? error.message : String(error);

      // Check if this is a diagnostic error (more specific)
      if (errorString.includes('InvalidSaving:') ||
        errorString.includes('CallNotFromBitsave:') ||
        errorString.includes('Token mismatch:') ||
        errorString.includes('Insufficient') && errorString.includes('balance')) {
        // Use the specific diagnostic error message
        errorMessage = errorString;
      } else {
        // Use the contract error handler for other errors, but try child contract first
        errorMessage = handleContractError(error, 'child');
      }

      setError(errorMessage);
      setShowTransactionModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEthTopUp = async (amount: string, savingsPlanName: string) => {
    if (!isConnected) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      const BASE_CHAIN_ID = BigInt(8453);
      const CELO_CHAIN_ID = BigInt(42220);
      const LISK_CHAIN_ID = BigInt(1135);

      let networkType = 'celo'; // default
      if (network.chainId === BASE_CHAIN_ID) {
        networkType = 'base';
      } else if (network.chainId === LISK_CHAIN_ID) {
        networkType = 'lisk';
      } else if (network.chainId === CELO_CHAIN_ID) {
        networkType = 'celo';
      }

      let contractAddress;
      if (networkType === 'base') {
        contractAddress = BASE_CONTRACT_ADDRESS;
      } else if (networkType === 'lisk') {
        contractAddress = LISK_CONTRACT_ADDRESS;
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

      // Get saving fee from contract (this is the fee required for the transaction)
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
      console.log(`User ETH balance: ${ethers.formatEther(userBalance)} ETH`);

      // Account for gas fees (estimate ~0.01 ETH for gas)
      const gasEstimate = ethers.parseEther("0.01");
      const totalRequired = ethAmountInWei + gasEstimate;

      if (userBalance < totalRequired) {
        throw new Error(`Insufficient ETH balance. You have ${ethers.formatEther(userBalance)} ETH, but need approximately ${ethers.formatEther(totalRequired)} ETH (including gas fees) for this transaction.`);
      }

      // Verify token address matches what the child contract expects (ETH should be zero address)
      if (diagnosticInfo.tokenId.toLowerCase() !== ETH_TOKEN_ADDRESS.toLowerCase()) {
        throw new Error(`Token mismatch: The savings plan expects ${diagnosticInfo.tokenId} but you're trying to deposit ETH (${ETH_TOKEN_ADDRESS}). Please use the correct token for this savings plan.`);
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
          "https://bitsaveapi.vercel.app/transactions/",
          {
            amount: ethAmount,
            txnhash: receipt.hash,
            chain: currentNetwork,
            savingsname: savingsPlanName,
            useraddress: address,
            transaction_type: "deposit",
            currency: "ETH"
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.NEXT_PUBLIC_API_KEY
            }
          }
        );

      } catch (apiError) {
        console.error("Error sending transaction data to API:", apiError);
      }

      setSuccess(true);
      setShowTransactionModal(true);

    } catch (error: unknown) {
      console.error("Error topping up ETH savings plan:", error);

      // Track ETH top-up error
      if (address) {
        trackError(address, {
          action: 'top_up_eth',
          error: error instanceof Error ? error.message : String(error),
          context: {
            planName: savingsPlanName,
            amount: amount,
            currency: 'ETH'
          }
        });
      }

      // Enhanced error handling with child contract diagnostics
      let errorMessage: string;
      const errorString = error instanceof Error ? error.message : String(error);

      // Check if this is a diagnostic error (more specific)
      if (errorString.includes('InvalidSaving:') ||
        errorString.includes('CallNotFromBitsave:') ||
        errorString.includes('Token mismatch:') ||
        errorString.includes('Insufficient') && errorString.includes('balance')) {
        // Use the specific diagnostic error message
        errorMessage = errorString;
      } else {
        // Use the contract error handler for other errors, but try child contract first
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

  const presetAmounts = ['10', '50', '100', '500']



  const getTokenNameDisplay = () => {
    if (isEth) return "ETH";
    if (tokenName) {
      // Handle GoodDollar display name
      if (tokenName === 'Gooddollar' || tokenName === '$G') return '$G';
      return tokenName;
    }
    if (currentNetwork === 'base') return "USDC";
    if (currentNetwork === 'lisk') return "USDC";
    return "USDGLO"; // Celo default
  }

  const getNetworkName = () => {
    if (currentNetwork === 'base') return "Base";
    if (currentNetwork === 'lisk') return "Lisk";
    return "Celo";
  }

  const getExplorerUrl = () => {
    if (currentNetwork === 'base') return "https://basescan.org/tx/";
    if (currentNetwork === 'lisk') return "https://blockscout.lisk.com/tx/";
    return "https://explorer.celo.org/mainnet/tx/";
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0 overflow-y-auto">
      {showTransactionModal ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0 overflow-y-auto">
          <div className={`${exo.className} bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden my-4 sm:my-0`}>
            <div className="p-8 flex flex-col items-center">
              {/* Icon */}
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

              <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
                {success ? 'Top Up Successful' : 'Top Up Failed'}
              </h2>

              <div className="text-gray-500 text-center mb-8">
                <p className="mb-2">
                  {success
                    ? 'Your savings plan has been successfully topped up.'
                    : 'Your top up failed. Please try again.'}
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

                {success && (
                  <button
                    className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                    onClick={() => {
                      const tweetProps = getTweetButtonProps('top-up', {
                        planName: planName,
                        amount: amount,
                        currency: isEth ? 'ETH' : tokenName
                      });
                      window.open(tweetProps.href, '_blank');
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Share on X
                  </button>
                )}

                <button
                  className="w-full py-3 bg-[#81D7B4] text-white rounded-xl font-medium hover:shadow-md transition-all"
                  onClick={handleCloseTransactionModal}
                >
                  Close
                </button>
              </div>
            </div >
          </div >
        </div >
      ) : (
        <motion.div
          ref={modalRef}
          onClick={handleModalClick}
          className={`${exo.className} bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden relative my-4 sm:my-0 max-h-[90vh] sm:max-h-none overflow-y-auto`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Top accent bar */}
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
                  Top Up Savings
                </motion.h2>
                <motion.p
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Add funds to your savings plan
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

            {/* Plan Info Card with micro-interactions */}
            <motion.div
              className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-5 border border-gray-200/60 hover:border-[#81D7B4]/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(129, 215, 180, 0.1)" }}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#81D7B4] to-[#81D7B4] flex items-center justify-center shadow-lg shadow-[#81D7B4]/20"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">{planName}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.div
                      className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                      whileHover={{ scale: 1.05, borderColor: "#81D7B4" }}
                    >
                      <Image
                        src={isEth ? '/eth.png' : getTokenLogo(tokenName || '', '')}
                        alt="Token"
                        width={16}
                        height={16}
                        className="mr-2"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-token.png';
                        }}
                      />
                      <span className="text-xs font-semibold text-gray-700">{isEth ? 'ETH' : tokenName}</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                      whileHover={{ scale: 1.05, borderColor: "#81D7B4" }}
                    >
                      <Image
                        src={
                          currentNetwork === 'base' ? '/base.svg' :
                            currentNetwork === 'celo' ? '/celo.png' :
                              currentNetwork === 'lisk' ? '/lisk.png' :
                                '/default-network.png'
                        }
                        alt="Network"
                        width={16}
                        height={16}
                        className="mr-2"
                      />
                      <span className="text-xs font-semibold text-gray-700">{getNetworkName()}</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Amount Input with enhanced styling */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-3">
                    Top Up Amount
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full px-4 py-3 text-xl sm:text-2xl font-bold text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#81D7B4]/20 focus:border-[#81D7B4] transition-all duration-300 hover:border-gray-300"
                      placeholder="0.00"
                      step="any"
                      min="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                      <span className="text-base sm:text-lg font-bold text-gray-400 group-focus-within:text-[#81D7B4] transition-colors">{getTokenNameDisplay()}</span>
                    </div>
                  </div>

                  {/* Balance Display with better hierarchy */}
                  <div className="flex justify-between items-center mt-3 px-2">
                    <span className="text-xs font-medium text-gray-500">Available Balance</span>
                    <span className="text-sm font-bold text-gray-900">
                      {isEth
                        ? `${parseFloat(walletBalance).toFixed(4)} ETH`
                        : `${parseFloat(tokenBalance).toFixed(2)} ${getTokenNameDisplay()}`
                      }
                    </span>
                  </div>
                </motion.div>

                {/* Quick Amounts with micro-interactions */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetAmounts.map((presetAmount, index) => (
                      <motion.button
                        key={presetAmount}
                        type="button"
                        onClick={() => setAmount(presetAmount)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${amount === presetAmount
                          ? 'bg-[#81D7B4] text-white shadow-lg shadow-[#81D7B4]/30'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-gray-200 hover:border-[#81D7B4]/30'
                          }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                      >
                        ${presetAmount}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Balance Warning with better styling */}
                {balanceWarning && (
                  <motion.div
                    className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-amber-800 mb-1">Insufficient Balance</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">{balanceWarning}</p>
                    </div>
                  </motion.div>
                )}
              </div >

              {/* Action Buttons with enhanced micro-interactions */}
              <motion.div
                className="pt-6 mt-auto border-t-2 border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 whitespace-nowrap"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                    className="flex-[2] px-4 py-2.5 bg-[#81D7B4] text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-[#81D7B4]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group whitespace-nowrap"
                    whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Top Up
                        <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      )}
    </div >
  )
})

export default TopUpModal