'use client'

import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Space_Grotesk } from 'next/font/google';
import { ethers } from 'ethers';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { trackTransaction, trackError } from '@/lib/interactionTracker';

// Contract addresses and ABIs
const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const ETH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"
const USDC_BASE_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const USDGLO_CELO_ADDRESS = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3"

import CONTRACT_ABI from '@/app/abi/contractABI.js';
import CHILD_CONTRACT_ABI from '@/app/abi/childContractABI.js';
import erc20ABI from '@/app/abi/erc20ABI.json';
import { handleContractError } from '@/lib/contractErrorHandler';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
})

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
  planName: string
  planId: string
  isEth?: boolean
  tokenName?: string
}

const TopUpModal = memo(function TopUpModal({ isOpen, onClose, planName, isEth = false, tokenName }: TopUpModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [isBaseNetwork, setIsBaseNetwork] = useState(true)
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
        setIsBaseNetwork(network.chainId === BASE_CHAIN_ID);
      }
    };
    
    if (isOpen) {
      detectNetwork();
    }
  }, [isOpen]);

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data.ethereum.usd; 
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return null;
    }
  };

  // Wallet balance checking utilities
  const getTokenAddress = (tokenName: string, isBaseNetwork: boolean) => {
    if (isBaseNetwork) {
      return USDC_BASE_ADDRESS; // USDC on Base
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

  const checkWalletBalances = async () => {
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
        const tokenAddress = getTokenAddress(tokenName, isBaseNetwork);
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
  };

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
  }, [amount, address, isOpen, isEth, tokenName, isBaseNetwork]);

  // Initial balance check when modal opens
  useEffect(() => {
    if (address && isConnected && isOpen) {
      checkWalletBalances();
    }
  }, [address, isConnected, isOpen]);

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
      const isBase = network.chainId === BASE_CHAIN_ID;
      
      const contractAddress = isBase ? BASE_CONTRACT_ADDRESS : CELO_CONTRACT_ADDRESS;
      let tokenAddress = isBase ? USDC_BASE_ADDRESS : USDGLO_CELO_ADDRESS;
      let decimals = 6;
      let tokenNameToUse = isBase ? "USDC" : "USDGLO";
      
      if (isBase && tokenName) {
        if (tokenName === 'USDGLO') {
          tokenAddress = "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3";
          decimals = 18;
          tokenNameToUse = 'USDGLO';
        } else if (tokenName === 'USDC') {
          tokenAddress = USDC_BASE_ADDRESS;
          decimals = 6;
          tokenNameToUse = 'USDC';
        }
      } else if (!isBase && tokenName) {
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
          decimals = 6;
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
      
      const tx = await contract.incrementSaving(
        savingsPlanName, 
        tokenAddress, 
        tokenAmount,
        {
          gasLimit: 2717330,
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
            chain: isBase ? "base" : "celo",
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
          chain: isBase ? 'base' : 'celo',
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
      const isBase = network.chainId === BASE_CHAIN_ID;
      
      const contractAddress = isBase ? BASE_CONTRACT_ADDRESS : CELO_CONTRACT_ADDRESS;
      
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

      const ethPriceInUSD = await fetchEthPrice();
      if (!ethPriceInUSD || ethPriceInUSD <= 0) {
        throw new Error("Failed to fetch ETH price.");
      }

      const usdAmount = parseFloat(amount);
      if (isNaN(usdAmount) || usdAmount <= 0) {
        throw new Error("Invalid amount entered.");
      }

      const ethAmount = (usdAmount / ethPriceInUSD).toFixed(18); 
      const ethAmountInWei = ethers.parseUnits(ethAmount, 18);

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
      
      const tx = await contract.incrementSaving(
        savingsPlanName,
        ETH_TOKEN_ADDRESS, 
        ethAmountInWei,
        {
          value: ethAmountInWei, 
          gasLimit: 2717330, 
        }
      );

      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      
      try {
        await axios.post(
          "https://bitsaveapi.vercel.app/transactions/",
          {
            amount: usdAmount,
            txnhash: receipt.hash,
            chain: isBase ? "base" : "celo",
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
    return isBaseNetwork ? "USDC" : "USDGLO";
  }
  
  const getNetworkName = () => {
    return isBaseNetwork ? "Base" : "Celo";
  }
  
  const getExplorerUrl = () => {
    return isBaseNetwork ? "https://basescan.org/tx/" : "https://explorer.celo.org/mainnet/tx/";
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0 overflow-y-auto">
      {showTransactionModal ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0 overflow-y-auto">
          <div className={`${spaceGrotesk.className} bg-white rounded-3xl shadow-xl w-full max-w-md mx-auto overflow-hidden my-4 sm:my-0 max-h-[90vh] sm:max-h-none overflow-y-auto`}>
            <div className="p-5 sm:p-8 flex flex-col items-center">
              {/* Success or Error Icon */}
              <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 sm:mb-6 ${success ? 'bg-green-100' : 'bg-red-100'}`}>
                {success ? (
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2">
                {success ? 'Top-Up Successful! 🎉' : 'Top-Up Failed'}
              </h2>
              
              {/* Message */}
              <p className="text-sm sm:text-base text-gray-500 text-center mb-5 sm:mb-8 max-w-xs sm:max-w-none mx-auto">
                {success 
                  ? `Great! Your savings plan "${planName}" has been topped up successfully. Keep building towards your goal! 💪`
                  : 'Your top-up transaction failed. Please try again or contact our support team for assistance.'}
                {!success && error && (
                  <span className="block mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-2">Error Details:</div>
                    <div className="text-xs text-red-600 mb-3">
                      {(() => {
                        // Enhanced error extraction and user-friendly messages
                        const lowerError = error.toLowerCase();
                        if (error.includes("missing revert data") || lowerError.includes("call_exception")) {
                          return "💸 Transaction failed - This usually means insufficient funds for gas fees or the contract couldn't process your request. Please check your wallet balance and ensure you have enough ETH/native tokens for gas fees, then try again.";
                        } else if (error.includes("INVALID_ARGUMENT") || lowerError.includes("invalid argument")) {
                          return "❌ Invalid transaction parameters. Please check your top-up amount and try again.";
                        } else if (lowerError.includes("insufficient funds") || lowerError.includes("insufficient balance")) {
                          return "💰 Insufficient funds. Please check your wallet balance and ensure you have enough for both the top-up amount and gas fees.";
                        } else if (lowerError.includes("user rejected") || lowerError.includes("user denied")) {
                          return "🚫 Transaction was cancelled by user. No funds were transferred.";
                        } else if (lowerError.includes("network") || lowerError.includes("connection")) {
                          return "🌐 Network connection issue. Please check your internet connection and try again.";
                        } else if (lowerError.includes("gas")) {
                          return "⛽ Gas estimation failed. Try increasing gas limit or check network congestion.";
                        } else if (lowerError.includes("nonce")) {
                          return "🔄 Transaction nonce error. Please reset your wallet or try again.";
                        } else if (lowerError.includes("allowance") || lowerError.includes("approval")) {
                          return "🔐 Token allowance issue. Please approve the token spending and try again.";
                        } else if (error.includes("code=")) {
                          const codeMatch = error.match(/code=([A-Z_]+)/);
                          return codeMatch ? `⚠️ Error Code: ${codeMatch[1]}` : error;
                        } else if (error.includes(":")) {
                          return `⚠️ ${error.split(":").pop()?.trim()}`;
                        } else {
                          return `⚠️ ${error}`;
                        }
                      })()}
                    </div>
                    <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded border">
                      <strong>Original Error:</strong> {error}
                    </div>
                    <div className="mt-3 pt-2 border-t border-red-200">
                      <button 
                          onClick={() => window.open('https://t.me/+YimKRR7wAkVmZGRk', '_blank')}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.617-1.407 3.08-2.896 1.596l-2.123-1.596-1.018.96c-.11.11-.202.202-.418.202-.286 0-.237-.107-.335-.38L9.9 13.74l-3.566-1.199c-.778-.244-.79-.778.173-1.16L18.947 6.84c.636-.295 1.295.173.621 1.32z"/>
                        </svg>
                        Get Help on Telegram
                      </button>
                    </div>
                  </span>
                )}
              </p>
              
              {/* Transaction ID Button */}
              <button 
                className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-full text-gray-700 text-sm sm:text-base font-medium mb-3 sm:mb-4 hover:bg-gray-50 transition-colors"
                onClick={() => txHash && window.open(`${getExplorerUrl()}${txHash}`, '_blank')}
                disabled={!txHash}
              >
                View Transaction ID
              </button>
              
              {/* Action Buttons */}
              <div className="flex w-full gap-3 sm:gap-4 flex-col sm:flex-row">
                <button 
                  className="w-full py-2.5 sm:py-3 bg-gray-100 rounded-full text-gray-700 text-sm sm:text-base font-medium flex items-center justify-center hover:bg-gray-200 transition-colors"
                  onClick={() => txHash && window.open(`${getExplorerUrl()}${txHash}`, '_blank')}
                  disabled={!txHash}
                >
                  Go To Explorer
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </button>
                <button 
                  className="w-full py-2.5 sm:py-3 bg-gray-700 rounded-full text-white text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors"
                  onClick={handleCloseTransactionModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          ref={modalRef}
          onClick={handleModalClick}
          className={`${spaceGrotesk.className} bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.1)] w-full max-w-md mx-auto overflow-hidden relative my-4 sm:my-0 max-h-[90vh] sm:max-h-none overflow-y-auto scrollbar-hide`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          {/* Enhanced glassmorphism effects */}
          <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#81D7B4]/10 rounded-full blur-3xl group-hover:bg-[#81D7B4]/20 transition-all duration-500"></div>
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-[#81D7B4]/10 rounded-full blur-3xl group-hover:bg-[#81D7B4]/20 transition-all duration-500"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/80"></div>
          
          <div className="p-6 relative z-10 flex flex-col max-h-full">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Top Up Savings</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors bg-white/80 rounded-full p-1.5 backdrop-blur-sm border border-gray-100/50 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/60 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-2px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.7)] hover:shadow-[0_15px_20px_-5px_rgba(129,215,180,0.1),0_8px_10px_-4px_rgba(129,215,180,0.05),inset_0_2px_4px_rgba(255,255,255,0.7)] transition-all duration-300">
                <div className="mr-3 bg-gradient-to-br from-[#81D7B4]/20 to-[#81D7B4]/10 p-2.5 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),0_3px_6px_rgba(129,215,180,0.12)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81D7B4]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1.5 truncate max-w-[250px]">{planName}</h3>
                  <div className="inline-flex items-center px-3.5 py-1.5 bg-gradient-to-r from-[#81D7B4]/10 to-[#81D7B4]/5 backdrop-blur-sm rounded-full border border-[#81D7B4]/20 shadow-sm">
                    {isEth ? (
                      <>
                        <Image src="/eth.png" alt="ETH" width={16} height={16} className="mr-2" />
                        <span className="text-xs font-medium text-gray-700">ETH on {getNetworkName()}</span>
                      </>
                    ) : (
                      <>
                        <Image src={isBaseNetwork ? "/base.svg" : "/celo.png"} alt={getNetworkName()} width={16} height={16} className="mr-2" />
                        <span className="text-xs font-medium text-gray-700">{getTokenNameDisplay()} on {getNetworkName()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-2 w-1.5 h-12 bg-gradient-to-b from-[#81D7B4] to-[#81D7B4]/50 rounded-full shadow-[0_2px_4px_rgba(129,215,180,0.3)]"></div>
              </div>
            </div>
            
            {/* Inspirational quote */}
            <div className="mb-6 bg-[#81D7B4]/5 backdrop-blur-sm rounded-xl p-4 border border-[#81D7B4]/20">
              <p className="text-sm text-gray-600 italic">
                &ldquo;The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought.&rdquo;
              </p>
              <p className="text-xs text-gray-500 mt-1 text-right">— T.T. Munger</p>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="mb-5">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Top Up Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm font-medium">$</span>
                    </div>
                    <input
                      type="text"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value.trim())}
                      className="focus:ring-[#81D7B4] focus:border-[#81D7B4] block w-full pl-8 pr-12 py-3 sm:text-sm border-gray-300 rounded-xl shadow-md bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-lg"
                      placeholder="0.00"
                      aria-describedby="amount-currency"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm font-medium" id="amount-currency">
                        USD
                      </span>
                    </div>
                  </div>
                </div>
              
              {/* Balance Warning */}
              {balanceWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-200/20 rounded-full blur-2xl"></div>
                  <div className="flex items-start space-x-3 relative z-10">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-amber-800 mb-1">Wallet Balance Warning</h4>
                      <p className="text-xs text-amber-700 leading-relaxed">{balanceWarning}</p>
                      {isCheckingBalance && (
                        <div className="flex items-center mt-1 text-xs text-amber-600">
                          <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Checking balances...
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setBalanceWarning(null)}
                      className="flex-shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Wallet Balance Info */}
              {address && !balanceWarning && amount && parseFloat(amount) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 relative overflow-hidden"
                >
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-200/20 rounded-full blur-2xl"></div>
                  <div className="flex items-center space-x-3 relative z-10">
                    <div className="flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-green-800 mb-1">Wallet Ready</h4>
                      <div className="text-xs text-green-700 space-y-0.5">
                        <div className="flex justify-between">
                           <span>{getTokenNameDisplay()} Balance:</span>
                           <span className="font-medium">{parseFloat(isEth ? walletBalance : tokenBalance).toFixed(4)} {getTokenNameDisplay()}</span>
                         </div>
                        <div className="flex justify-between">
                          <span>ETH Balance:</span>
                          <span className="font-medium">{parseFloat(walletBalance).toFixed(6)} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Est. Gas Fee:</span>
                          <span className="font-medium">~{parseFloat(estimatedGasFee).toFixed(6)} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Amounts
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetAmounts.map((presetAmount) => (
                      <button
                        key={presetAmount}
                        type="button"
                        onClick={() => setAmount(presetAmount)}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-300 ${
                          amount === presetAmount
                            ? 'bg-[#81D7B4]/10 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_2px_10px_rgba(129,215,180,0.2)]'
                            : 'bg-white/80 backdrop-blur-sm border-gray-200/60 text-gray-700 hover:bg-gray-50/80'
                        }`}
                      >
                        ${presetAmount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sticky button area */}
              <div className="flex justify-end pt-4 border-t border-gray-100/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-3 px-4 py-2 border border-gray-300/80 rounded-lg text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81D7B4]/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                  className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#81D7B4]/50 transition-all duration-300 ${
                    loading || !amount || parseFloat(amount) <= 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] hover:shadow-[0_4px_12px_rgba(129,215,180,0.4)]'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    'Top Up'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  )
})

export default TopUpModal