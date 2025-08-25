'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CustomDatePicker from '@/components/CustomDatePicker';
import { format } from 'date-fns';
import { Space_Grotesk } from 'next/font/google';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import axios from 'axios';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import erc20ABI from '@/app/abi/erc20ABI.json';
import { trackSavingsCreated, trackError, trackPageVisit } from '@/lib/interactionTracker';
import { useReferrals } from '@/lib/useReferrals';
import { handleContractError } from '@/lib/contractErrorHandler';

const CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const BASE_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default function CreateSavingsPage() {
  const router = useRouter()
  const { address } = useAccount()
  const { referralData, generateReferralCode, markReferralConversion } = useReferrals()
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDC')
  const [chain, setChain] = useState('base')
  const [startDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [penalty, setPenalty] = useState('10%')

  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  
  // Wallet balance checking states
  const [walletBalance, setWalletBalance] = useState<string>('0')
  const [tokenBalance, setTokenBalance] = useState<string>('0')
  const [estimatedGasFee, setEstimatedGasFee] = useState<string>('0')
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)

  interface DayRange {
    from: {
      year: number | undefined;
      month: number | undefined;
      day: number | undefined;
    } | null;
    to: {
      year: number | undefined;
      month: number | undefined;
      day: number | undefined;
    } | null;
  }

  const [selectedDayRange, setSelectedDayRange] = useState<DayRange>({
    from: null,
    to: null
  })


  // const [savingsName, setSavingsName] = useState('')

  const [selectedPenalty, setSelectedPenalty] = useState(1)
  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    endDate: ''
  })
  useEffect(() => {
    if (endDate) {
      setSelectedDayRange({
        from: {
          year: startDate?.getFullYear(),
          month: startDate ? startDate.getMonth() + 1 : 0,
          day: startDate?.getDate()
        },
        to: {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }
      });

      if (errors.endDate) {
        setErrors(prev => ({ ...prev, endDate: '' }));
      }
    }
  }, [startDate, endDate, errors.endDate]);

  // useEffect(() => {
  //   setSavingsName(name);
  // }, [name]);

  useEffect(() => {
    setSelectedPenalty(parseInt(penalty))
  }, [penalty])

  // Generate referral code when component mounts
  useEffect(() => {
    if (address && !referralData) {
      generateReferralCode()
    }
  }, [address, referralData, generateReferralCode])

  // Check wallet balances when relevant values change
  useEffect(() => {
    if (address && amount && parseFloat(amount) > 0) {
      const timeoutId = setTimeout(() => {
        checkWalletBalances();
      }, 500); // Debounce to avoid too many calls
      
      return () => clearTimeout(timeoutId);
    } else {
      setBalanceWarning(null);
    }
  }, [amount, currency, chain, address]);

  // Initial balance check when wallet connects
  useEffect(() => {
    if (address && isConnected) {
      checkWalletBalances();
    }
  }, [address, isConnected]);

  // Define available currencies for each network
  const networkCurrencies: Record<string, string[]> = {
    base: ['USDC'],
    celo: ['cUSD', 'USDGLO', 'Gooddollar'],
  };

  // Update currency options when chain changes
  useEffect(() => {
    const available = networkCurrencies[chain] || [];
    if (!available.includes(currency)) {
      setCurrency(available[0]);
    }
  }, [chain]);

  const currencies = networkCurrencies[chain];

  // Function to switch network
  const switchToNetwork = async (networkName: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        if (networkName === 'base') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // Base chainId in hex (8453)
            });
          } catch (switchError: unknown) {
        // This error code indicates that the chain has not been added to MetaMask
        if ((switchError as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                }],
              });
            }
          }
        } else if (networkName === 'celo') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xA4EC' }], // Celo chainId in hex (42220)
            });
          } catch (switchError: unknown) {
        if ((switchError as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xA4EC',
                  chainName: 'Celo',
                  nativeCurrency: {
                    name: 'CELO',
                    symbol: 'CELO',
                    decimals: 18,
                  },
                  rpcUrls: ['https://forno.celo.org'],
                  blockExplorerUrls: ['https://explorer.celo.org'],
                }],
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error switching to ${networkName} network:`, error);
    }
  };

  const chains = [
    { id: 'base', name: 'Base', logo: '/base.svg', color: 'bg-blue-900/10', textColor: 'text-blue-800' },
    { id: 'celo', name: 'Celo', logo: '/celo.png', color: 'bg-green-100', textColor: 'text-green-600', active: true }
  ]
  const penalties = ['10%', '20%', '30%']

  const validateStep = () => {
    let valid = true
    const newErrors = { name: '', amount: '', endDate: '' }

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = 'Please enter a name for your savings plan'
        valid = false
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount'
        valid = false
      }
    }

    if (step === 2) {
      if (!endDate) {
        newErrors.endDate = 'Please select an end date'
        valid = false
      } else if (startDate && endDate && endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date'
        valid = false
      }
    }

    setErrors(newErrors)
    return valid
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          setIsConnected(accounts && accounts.length > 0)
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }

    checkConnection()
  }, [])

  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    const getWalletAddress = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Error getting wallet address:', error);
      }
    };

    getWalletAddress();
  }, []);

  const approveERC20 = async (
    tokenAddress: string,
    amount: ethers.BigNumberish,
    signer: ethers.Signer
  ) => {
    try {
      const contractToApprove = chain === 'celo' ? CELO_CONTRACT_ADDRESS : CONTRACT_ADDRESS;

      const erc20Contract = new ethers.Contract(
        tokenAddress,
        erc20ABI.abi,
        signer
      );

      const tx = await erc20Contract.approve(contractToApprove, amount);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error("Error approving ERC20 tokens:", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Wallet balance checking utilities
  const getTokenAddress = (currency: string, chain: string) => {
    if (chain === 'base') {
      return BASE_CONTRACT_ADDRESS; // USDC on Base
    } else if (chain === 'celo') {
      switch (currency) {
        case 'cUSD':
          return '0x765DE816845861e75A25fCA122bb6898B8B1282a'; // cUSD on Celo
        case 'USDGLO':
          return '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3'; // USDGLO on Celo
        case 'Gooddollar':
          return '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A'; // G$ on Celo
        default:
          return '0x765DE816845861e75A25fCA122bb6898B8B1282a';
      }
    }
    return BASE_CONTRACT_ADDRESS;
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
      const tokenAddress = getTokenAddress(currency, chain);
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI.abi, provider);
      const tokenBalance = await tokenContract.balanceOf(address);
      const decimals = await tokenContract.decimals();
      const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, decimals);
      setTokenBalance(tokenBalanceFormatted);
      
      // Estimate gas fee
      const gasPrice = await provider.getFeeData();
      const estimatedGasLimit = ethers.getBigInt(2717330); // Estimated gas limit for savings creation (0.000027 ETH)
      const estimatedGasCost = gasPrice.gasPrice ? gasPrice.gasPrice * estimatedGasLimit : ethers.getBigInt(0);
      const gasFeeFormatted = ethers.formatEther(estimatedGasCost);
      setEstimatedGasFee(gasFeeFormatted);
      
      // Check for warnings
      const amountNum = parseFloat(amount || '0');
      const tokenBalanceNum = parseFloat(tokenBalanceFormatted);
      const nativeBalanceNum = parseFloat(nativeBalanceFormatted);
      const gasFeeNum = parseFloat(gasFeeFormatted);
      
      if (amountNum > 0) {
        if (tokenBalanceNum < amountNum) {
          setBalanceWarning(`Insufficient ${currency} balance. You have ${tokenBalanceNum.toFixed(4)} ${currency} but need ${amountNum} ${currency}.`);
        } else if (nativeBalanceNum < gasFeeNum * 1.5) { // 1.5x buffer for gas
          setBalanceWarning(`Low ETH balance for gas fees. You have ${nativeBalanceNum.toFixed(6)} ETH but may need ~${(gasFeeNum * 1.5).toFixed(6)} ETH for transaction fees.`);
        } else if (tokenBalanceNum < amountNum * 1.1) { // Warning if balance is close
          setBalanceWarning(`Your ${currency} balance (${tokenBalanceNum.toFixed(4)}) is close to the savings amount. Consider keeping some buffer for future transactions.`);
        }
      }
      
    } catch (error) {
      console.error('Error checking wallet balances:', error);
    } finally {
      setIsCheckingBalance(false);
    }
  };




  const handleBaseSavingsCreate = async () => {
    if (!isConnected) {
      setError("Please connect your wallet.")
      return
    }
    setLoading(true)
    setError(null)
    setTxHash(null)
    setSuccess(false)

    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.")
      }




      const userEnteredUsdcAmount = parseFloat(amount)
      if (isNaN(userEnteredUsdcAmount) || userEnteredUsdcAmount <= 0) {
        throw new Error("Invalid amount. Please enter an amount greater than zero.")
      }

      const usdcEquivalentAmount = ethers.parseUnits(userEnteredUsdcAmount.toFixed(6), 6)


      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()

      const BASE_CHAIN_ID = 8453 

      const network = await provider.getNetwork()


      if (Number(network.chainId) !== BASE_CHAIN_ID) {
        throw new Error("Please switch your wallet to the Base network.")
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      let userChildContractAddress = await contract.getUserChildContractAddress()


      if (userChildContractAddress === ethers.ZeroAddress) {
        // Get current ETH price for $1 fee
        const ethPrice = await fetchEthPrice();
        if (!ethPrice) throw new Error('Could not fetch ETH price for fee calculation.');
        const feeInEth = (1 / ethPrice).toFixed(6); // $1 in ETH
        
        const joinTx = await contract.joinBitsave({
          value: ethers.parseEther(feeInEth), 
        })
        await joinTx.wait()

        userChildContractAddress = await contract.getUserChildContractAddress()

      }

      const maturityTime = selectedDayRange.to
        ? Math.floor(
          new Date(
            selectedDayRange.to.year ?? 0,
            (selectedDayRange.to.month ?? 1) - 1,
            selectedDayRange.to.day ?? 1
          ).getTime() / 1000
        )
        : 0

      const safeMode = false
      const tokenToSave = BASE_CONTRACT_ADDRESS

      await approveERC20(tokenToSave, usdcEquivalentAmount, signer)

      // Get current ETH price for $1 fee
      const ethPrice = await fetchEthPrice();
      if (!ethPrice) throw new Error('Could not fetch ETH price for fee calculation.');
      const feeInEth = (1 / ethPrice).toFixed(6); // $1 in ETH

      

      const txOptions = {
        gasLimit: 2717330,
        value: ethers.parseEther(feeInEth), 
      }

      const tx = await contract.createSaving(
        name,
        maturityTime,
        selectedPenalty,
        safeMode,
        tokenToSave,
        usdcEquivalentAmount,
        txOptions
      )

      const receipt = await tx.wait()
      setTxHash(receipt.hash)

      try {
        await axios.post(
          "https://bitsaveapi.vercel.app/transactions/",
          {
            amount: parseFloat(amount),
            txnhash: receipt.hash,
            chain: "base", 
            savingsname: name,
            useraddress: walletAddress,
            transaction_type: "deposit",
            currency: currency
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

      setSuccess(true)

    } catch (error) {
      console.error("Error creating savings plan:", error)
      setSuccess(false)

      // Use the contract error handler to provide user-friendly error messages
      const errorMessage = handleContractError(error, 'main');
      setError(errorMessage);
      throw error 
    } finally {
      setLoading(false)
    }
  }

  // Token addresses and decimals for Celo
  const CELO_TOKENS = {
    USDGLO: { address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
    cUSD: { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 18 },
    Gooddollar: { address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', decimals: 18 },
  };

  // Helper to fetch CELO price in USD
  const fetchCeloPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd');
      const data = await response.json();
      return data.celo.usd;
    } catch (error) {
      console.error('Error fetching CELO price:', error);
      return null;
    }
  };

  // Helper to fetch ETH price in USD
  const fetchEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return null;
    }
  };

  

  // Common helper function for Celo setup
  const setupCeloProvider = async () => {
    if (!window.ethereum) throw new Error("No Ethereum wallet detected. Please install MetaMask.");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    
    const CELO_CHAIN_ID = 42220;
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== CELO_CHAIN_ID) {
      throw new Error("Please switch your wallet to the Celo network.");
    }
    
    return { provider, signer };
  };

  // Common helper function for Bitsave contract setup
  const setupBitsaveContract = async (signer: ethers.Signer) => {
    const celoPrice = await fetchCeloPrice();
    if (!celoPrice) throw new Error('Could not fetch CELO price.');
    const joinFeeCelo = (1 / celoPrice).toFixed(4); // $1 in CELO
    
    const contract = new ethers.Contract(CELO_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    let userChildContractAddress;
    
    try {
      userChildContractAddress = await contract.getUserChildContractAddress();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to interact with the Bitsave contract. Please try again.");
    }
    
    if (userChildContractAddress === ethers.ZeroAddress) {
      try {
        const joinTx = await contract.joinBitsave({ value: ethers.parseEther(joinFeeCelo) });
        await joinTx.wait();
        userChildContractAddress = await contract.getUserChildContractAddress();
      } catch (joinError) {
        console.error(joinError);
        throw new Error("Failed to join Bitsave. Please check your wallet has enough CELO for gas fees.");
      }
    }
    
    return contract;
  };

  // Common helper function for maturity time calculation
  const calculateMaturityTime = () => {
    const maturityTime = selectedDayRange.to
      ? Math.floor(
        new Date(
          selectedDayRange.to.year ?? 0,
          (selectedDayRange.to.month ?? 1) - 1,
          selectedDayRange.to.day ?? 1
        ).getTime() / 1000
      )
      : 0;
    
    if (maturityTime === 0) {
      throw new Error("Please select a valid end date for your savings plan.");
    }
    
    return maturityTime;
  };

  // Common helper function for API call
  const sendTransactionToAPI = async (amount: number, txHash: string, currency: string) => {
    try {
      await axios.post(
        "https://bitsaveapi.vercel.app/transactions/",
        {
          amount,
          txnhash: txHash,
          chain: "celo",
          savingsname: name,
          useraddress: walletAddress,
          transaction_type: "deposit",
          currency
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
  };

  // USDGLO specific savings function
  const handleUSDGLOSavings = async () => {
    if (!isConnected) {
      setError("Please connect your wallet.");
      throw new Error("Please connect your wallet.");
    }
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);
    
    try {
      // Validate amount
      const cleanAmount = amount.replace(/[^0-9.]/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount. Please enter a valid number greater than zero.");
      }
      
  
      
      // Setup provider and contract
      const { signer } = await setupCeloProvider();
      const contract = await setupBitsaveContract(signer);
      const maturityTime = calculateMaturityTime();
      
      // USDGLO specific logic
      const token = CELO_TOKENS.USDGLO;
      const tokenAmount = ethers.parseUnits(parsedAmount.toString(), token.decimals);
      

      
      // Approve and create saving
        await approveERC20(token.address, tokenAmount, signer);
        
        // Get current CELO price for $1 fee
        const celoPrice = await fetchCeloPrice();
        if (!celoPrice) throw new Error('Could not fetch CELO price for fee calculation.');
        const feeInCelo = (1 / celoPrice).toFixed(6); // $1 in CELO
        
  
        
        const txOptions = { 
          gasLimit: 2717330,
          value: ethers.parseEther(feeInCelo)
        };
        const tx = await contract.createSaving(
          name,
          maturityTime,
          selectedPenalty,
          false, // safeMode
          token.address,
          tokenAmount,
          txOptions
        );
      
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      
      // Send to API
      await sendTransactionToAPI(parsedAmount, receipt.hash, 'USDGLO');
      
      // Track successful savings creation
      if (address) {
        trackSavingsCreated(address, {
          planName: name,
          amount: amount,
          currency: currency,
          chain: chain,
          penalty: penalty,
          endDate: endDate?.toISOString(),
          txHash: txHash
        });
        
        // Track referral conversion if user came from a referral link
        const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
        if (referralCode) {
          markReferralConversion(referralCode);
          localStorage.removeItem('referralCode'); // Remove after conversion
        }
      }
      
      setSuccess(true);
    } catch (error) {
      console.error("Error creating USDGLO savings plan:", error);
      setSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('user rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('user cancelled') ||
          errorMessage.includes('ACTION_REJECTED') ||
          errorMessage.includes('ethers-user-denied')) {
        setError('Error creating savings user rejected');
      } else {
        setError(errorMessage);
      }
      throw error; // Re-throw the error so handleSubmit can catch it
    } finally {
      setLoading(false);
    }
  };

  // cUSD specific savings function
  const handleCUSDSavings = async () => {
    if (!isConnected) {
      setError("Please connect your wallet.");
      throw new Error("Please connect your wallet.");
    }
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);
    
    try {
      // Validate amount
      const cleanAmount = amount.replace(/[^0-9.]/g, '');
      const parsedAmount = parseFloat(cleanAmount);
      
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount. Please enter a valid number greater than zero.");
      }
      

      
      // Setup provider and contract
      const { signer } = await setupCeloProvider();
      const contract = await setupBitsaveContract(signer);
      const maturityTime = calculateMaturityTime();
      
      // cUSD specific logic
      const token = CELO_TOKENS.cUSD;
      const tokenAmount = ethers.parseUnits(parsedAmount.toString(), token.decimals);
      

      
      // Approve and create saving
        await approveERC20(token.address, tokenAmount, signer);
        
        // Get current CELO price for $1 fee
        const celoPrice = await fetchCeloPrice();
        if (!celoPrice) throw new Error('Could not fetch CELO price for fee calculation.');
        const feeInCelo = (1 / celoPrice).toFixed(6); // $1 in CELO
        
       
        
        const txOptions = { 
          gasLimit: 2717330,
          value: ethers.parseEther(feeInCelo)
        };
        const tx = await contract.createSaving(
          name,
          maturityTime,
          selectedPenalty,
          false, // safeMode
          token.address,
          tokenAmount,
          txOptions
        );
      
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      
      // Send to API
      await sendTransactionToAPI(parsedAmount, receipt.hash, 'cUSD');
      
      setSuccess(true);
    } catch (error) {
      console.error("Error creating cUSD savings plan:", error);
      setSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('user rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('user cancelled') ||
          errorMessage.includes('ACTION_REJECTED') ||
          errorMessage.includes('ethers-user-denied')) {
        setError('Error creating savings user rejected');
      } else {
        setError(errorMessage);
      }
      throw error; // Re-throw the error so handleSubmit can catch it
    } finally {
      setLoading(false);
    }
  };

  // Gooddollar specific savings function
  const handleGooddollarSavings = async () => {
    if (!isConnected) {
      setError("Please connect your wallet.");
      throw new Error("Please connect your wallet.");
    }
    
    setLoading(true);
    setError(null);
    setTxHash(null);
    setSuccess(false);
    
    try {
      // Validate amount
      const cleanAmountForValidation = amount.replace(/[^0-9.]/g, '');
      const userEnteredAmount = parseFloat(cleanAmountForValidation);
      
      if (isNaN(userEnteredAmount) || userEnteredAmount <= 0) {
        throw new Error("Invalid amount. Please enter an amount greater than zero.");
      }
      

      
      // Setup provider and contract
      const { signer } = await setupCeloProvider();
      const contract = await setupBitsaveContract(signer);
      const maturityTime = calculateMaturityTime();
      
      // Gooddollar specific logic - Convert USD to $G using live price
      const gAmount = userEnteredAmount / goodDollarPrice;
      const token = CELO_TOKENS.Gooddollar;
      const tokenAmount = ethers.parseUnits(gAmount.toFixed(token.decimals), token.decimals);
      

      
      // Approve and create saving
        await approveERC20(token.address, tokenAmount, signer);
        
        // Get current CELO price for $1 fee
        const celoPrice = await fetchCeloPrice();
        if (!celoPrice) throw new Error('Could not fetch CELO price for fee calculation.');
        const feeInCelo = (1 / celoPrice).toFixed(6); // $1 in CELO
        
        
        
        const txOptions = { 
          gasLimit: 2717330,
          value: ethers.parseEther(feeInCelo)
        };
        const tx = await contract.createSaving(
          name,
          maturityTime,
          selectedPenalty,
          false, // safeMode
          token.address,
          tokenAmount,
          txOptions
        );
      
      const receipt = await tx.wait();
      setTxHash(receipt.hash);
      
      // Send to API with G amount
      await sendTransactionToAPI(gAmount, receipt.hash, 'Gooddollar');
      
      setSuccess(true);
    } catch (error) {
      console.error("Error creating Gooddollar savings plan:", error);
      setSuccess(false);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('user rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('user cancelled') ||
          errorMessage.includes('ACTION_REJECTED') ||
          errorMessage.includes('ethers-user-denied')) {
        setError('Error creating savings user rejected');
      } else {
        setError(errorMessage);
      }
      throw error; // Re-throw the error so handleSubmit can catch it
    } finally {
      setLoading(false);
    }
  };

  // Main submit handler
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      if (chain === 'celo') {
        if (currency === 'USDGLO') {
          await handleUSDGLOSavings();
        } else if (currency === 'cUSD') {
          await handleCUSDSavings();
        } else if (currency === 'Gooddollar') {
          await handleGooddollarSavings();
        } else {
          throw new Error('Unsupported currency for Celo network.');
        }
      } else {
        await handleBaseSavingsCreate();
      }
      
      // Track successful savings creation
      if (address) {
        trackSavingsCreated(address, {
          planName: name,
          amount: amount,
          currency: currency,
          chain: chain,
          penalty: penalty,
          endDate: endDate?.toISOString(),
          txHash: txHash
        });
        
        // Track referral conversion if user came from a referral link
        const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
        if (referralCode) {
          markReferralConversion(referralCode);
          localStorage.removeItem('referralCode'); // Remove after conversion
        }
      }
      
      setSuccess(true);
    } catch (err) {
      console.error('Error creating savings plan:', err);
      
      // Track error
      if (address) {
        trackError(address, {
          action: 'create_savings',
          error: err instanceof Error ? err.message : 'Unknown error',
          context: {
            planName: name,
            amount: amount,
            currency: currency,
            chain: chain
          }
        });
      }
      
      // Individual functions handle their own error messages
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false)
    if (success) {
      router.push('/dashboard')
    }
  }

  useEffect(() => {
    if (error || (success && txHash)) {
      setShowTransactionModal(true)
    }
  }, [success, error, txHash])

  useEffect(() => {
    setMounted(true)
    
    // Track page visit
    if (address) {
      trackPageVisit('/dashboard/create-savings', { walletAddress: address });
    }
  }, [address])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  }

  // Add state for GoodDollar price and equivalent amount
  const [goodDollarPrice, setGoodDollarPrice] = useState(0.0001);
  const [goodDollarEquivalent, setGoodDollarEquivalent] = useState(0);

  // Fetch GoodDollar price from Coingecko
  const fetchGoodDollarPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd');
      const data = await response.json();
      return data.gooddollar.usd;
    } catch (error) {
      console.error(error);
      return 0.0001; // fallback
    }
  };

  // Calculate GoodDollar equivalent when amount or price changes
  useEffect(() => {
    if (currency === 'Gooddollar' && amount && goodDollarPrice) {
      const cleanAmount = amount.replace(/[^0-9.]/g, '');
      const usdAmount = parseFloat(cleanAmount);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        const gAmount = usdAmount / goodDollarPrice;
        setGoodDollarEquivalent(gAmount);
      } else {
        setGoodDollarEquivalent(0);
      }
    }
  }, [amount, goodDollarPrice, currency]);

  useEffect(() => {
    fetchGoodDollarPrice().then(setGoodDollarPrice);
  }, []);

  if (!mounted) return null

  return (
    <div className={`${spaceGrotesk.className} min-h-screen bg-gradient-to-b from-white to-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden`}>
      {/* Enhanced decorative elements */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#81D7B4]/10 rounded-full blur-3xl"></div>
      <div className="fixed top-1/4 -left-20 w-60 h-60 bg-[#81D7B4]/5 rounded-full blur-3xl"></div>
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-1/3 right-0 w-72 h-72 bg-[#81D7B4]/8 rounded-full blur-3xl"></div>
      <div className="fixed inset-0 bg-[url('/noise.jpg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

      {/* Transaction Status Notifications */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-0">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden border border-[#81D7B4]/30 relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#81D7B4]/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#229ED9]/10 rounded-full blur-2xl"></div>
            <div className="p-5 sm:p-8 flex flex-col items-center">
              {/* Success, Cancelled, or Error Icon */}
              {success ? (
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : error === 'Error creating savings user rejected' ? (
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-yellow-200 flex items-center justify-center mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-red-500 flex items-center justify-center mb-4 sm:mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Title and Message */}
              {success ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2">Savings Plan Created!</h2>
                  <p className="text-sm sm:text-base text-gray-500 text-center mb-5 sm:mb-8 max-w-xs sm:max-w-none mx-auto">
                    Your Transaction to create your savings plan has been processed and is successful.
                  </p>
                </>
              ) : error === 'Error creating savings user rejected' ? (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2 text-yellow-700">Transaction Cancelled</h2>
                  <p className="text-sm sm:text-base text-gray-500 text-center mb-5 sm:mb-8 max-w-xs sm:max-w-none mx-auto">
                    You cancelled the transaction in your wallet. No changes were made.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-1 sm:mb-2 text-red-700">Savings Plan Creation Failed</h2>
                  <p className="text-sm sm:text-base text-gray-500 text-center mb-5 sm:mb-8 max-w-xs sm:max-w-none mx-auto">
                    Your savings plan creation failed. Please try again or contact our support team for assistance.
                    {error && (
                      <span className="block mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-medium text-red-800 mb-2">Error Details:</div>
                        <div className="text-xs sm:text-sm text-red-600 mb-3 leading-relaxed">
                          {(() => {
                            // Enhanced error extraction and user-friendly messages
                            const lowerError = error.toLowerCase();
                            if (error.includes("missing revert data") || lowerError.includes("call_exception")) {
                              return "💸 Transaction failed - This usually means insufficient funds for gas fees or the contract couldn't process your request. Please check your wallet balance and ensure you have enough ETH/native tokens for gas fees, then try again.";
                            } else if (error.includes("INVALID_ARGUMENT") || lowerError.includes("invalid argument")) {
                              return "❌ Invalid savings plan parameters. Please check your inputs and try again.";
                            } else if (lowerError.includes("insufficient funds") || lowerError.includes("insufficient balance")) {
                              return "💰 Insufficient funds. Please check your wallet balance and ensure you have enough for both the savings amount and gas fees.";
                            } else if (lowerError.includes("user rejected") || lowerError.includes("user denied")) {
                              return "🚫 Transaction was cancelled by user. No savings plan was created.";
                            } else if (lowerError.includes("network") || lowerError.includes("connection")) {
                              return "🌐 Network connection issue. Please check your internet connection and try again.";
                            } else if (lowerError.includes("gas")) {
                              return "⛽ Gas estimation failed. Try increasing gas limit or check network congestion.";
                            } else if (lowerError.includes("nonce")) {
                              return "🔄 Transaction nonce error. Please reset your wallet or try again.";
                            } else if (lowerError.includes("allowance") || lowerError.includes("approval")) {
                              return "🔐 Token allowance issue. Please approve the token spending and try again.";
                            } else if (lowerError.includes("plan name") || lowerError.includes("name already exists")) {
                              return "📝 Plan name already exists. Please choose a different name for your savings plan.";
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
                        <div className="text-xs sm:text-sm text-gray-600 mb-3 p-2 sm:p-3 bg-gray-50 rounded border break-words overflow-wrap-anywhere">
                          <strong>Original Error:</strong> <span className="break-all">{error}</span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-red-200">
                          <button 
                            onClick={() => window.open('https://t.me/+YimKRR7wAkVmZGRk', '_blank')}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-[#0088cc] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#006699] transition-colors shadow-sm w-full sm:w-auto justify-center"
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
                </>
              )}

              {/* Transaction ID Button (only on success or error, not on cancel) */}
              {txHash && (success || (error && error !== 'Error creating savings user rejected')) && (
                <button
                  className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-full text-gray-700 text-sm sm:text-base font-medium mb-3 sm:mb-4 hover:bg-gray-50 transition-colors"
                  onClick={() => window.open(
                    chain === 'celo'
                      ? `https://explorer.celo.org/tx/${txHash}`
                      : `https://basescan.org/tx/${txHash}`,
                    '_blank'
                  )}
                >
                  View Transaction ID
                </button>
              )}

              {/* Tweet Button (only on success) */}
              {success && (() => {
                const referralLink = referralData?.referralLink || 'https://bitsave.io';
                const tweetText = `Just locked up some ${currency} for my future self on @bitsaveprotocol, no degen plays today, web3 savings never looked this good 💰\n\nYou should be doing #SaveFi → ${referralLink}`;
                const encodedTweetText = encodeURIComponent(tweetText);
                return (
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTweetText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Redirect to dashboard after a short delay
                      setTimeout(() => {
                        window.location.href = '/dashboard';
                      }, 2000);
                    }}
                    className="w-full py-2.5 sm:py-3 bg-black text-white rounded-full text-sm sm:text-base font-semibold flex items-center justify-center gap-2 mb-3 sm:mb-4 hover:bg-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.209c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    Post on X
                  </a>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex w-full gap-3 sm:gap-4 flex-col sm:flex-row">
                <button
                  className={`w-full py-2.5 sm:py-3 ${success ? 'bg-[#81D7B4] hover:bg-[#6bc4a1]' : error === 'Error creating savings user rejected' ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-800'} rounded-full text-white text-sm sm:text-base font-medium transition-colors`}
                  onClick={handleCloseTransactionModal}
                >
                  {success ? 'Go to Dashboard' : error === 'Error creating savings user rejected' ? 'Close' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-white/60 hover:bg-white/80">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">Create a Savings Plan</h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">Set up a new savings plan to help you reach your financial goals with automated savings and rewards.</p>
        </div>

        {/* Enhanced Progress bar - Modern, Fluid, Visually Stunning, Brand Color Only */}
        <div className="mb-8 sm:mb-10 px-2 sm:px-0">
          <div className="relative flex items-center justify-between mb-2">
            {/* Connecting line with single-color gradient and glow */}
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 z-0 bg-gradient-to-r from-[#81D7B4]/60 via-[#81D7B4]/30 to-[#81D7B4]/60 rounded-full blur-[2px] shadow-[0_0_24px_#81D7B4aa]" style={{ height: '10px' }}></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative z-10 flex flex-col items-center flex-1">
                {/* Animated step circle - single brand color, glassy/neomorphic */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-4 transition-all duration-500 shadow-[0_4px_24px_rgba(129,215,180,0.18),0_2px_8px_rgba(129,215,180,0.10)] bg-white/80 backdrop-blur-md ${step === i
                  ? 'border-[#81D7B4] scale-110 animate-pulse bg-gradient-to-br from-[#81D7B4]/90 to-[#81D7B4]/60'
                  : step > i
                    ? 'border-[#81D7B4]/60 bg-gradient-to-br from-[#81D7B4]/60 to-[#81D7B4]/30'
                    : 'border-gray-200/60'} `}>
                  {step > i ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81D7B4]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`font-bold text-lg ${step === i ? 'text-white drop-shadow' : 'text-[#81D7B4]'}`}>{i}</span>
                  )}
                </div>
                {/* Step label */}
                <span className={`mt-3 text-xs sm:text-sm font-semibold transition-colors duration-300 ${step === i ? 'text-[#81D7B4]' : step > i ? 'text-[#81D7B4]/80' : 'text-gray-400'} hidden sm:block tracking-wide`}>{i === 1 ? 'Plan Details' : i === 2 ? 'Duration & Penalties' : 'Review & Create'}</span>
              </div>
            ))}
          </div>
          {/* Mobile step labels */}
          <div className="flex justify-between text-xs sm:hidden mt-3">
            <span className={step >= 1 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Details</span>
            <span className={step >= 2 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Duration</span>
            <span className={step >= 3 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        {/* Enhanced Card container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/noise.jpg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Savings Plan Created!</h2>
                <p className="text-gray-600 mb-6">Your savings plan has been successfully created and is now active.</p>
                <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-[#81D7B4] text-white font-medium rounded-xl shadow-lg hover:bg-[#6bc4a1] transition-colors">
                  Go to Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                {/* Step 1: Plan Details */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    <motion.h2
                      className="text-xl font-bold text-gray-800 mb-6 flex items-center"
                      variants={itemVariants}
                    >
                      <span className="bg-[#81D7B4]/10 w-8 h-8 rounded-full flex items-center justify-center text-[#81D7B4] mr-3 text-sm">1</span>
                      Plan Details
                    </motion.h2>

                    <motion.div
                      className="space-y-5 sm:space-y-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Plan name - enhanced */}
                      <motion.div variants={itemVariants}>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-1">
                          Plan Name
                        </label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#81D7B4]/30 to-blue-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <input
                            type="text"
                            id="planName"
                            value={name}
                            onChange={(e) => setName(e.target.value.trim())}
                            placeholder="e.g. Vacation Fund, Emergency Savings"
                            className={`relative w-full px-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border text-gray-900 ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200/50 focus:ring-[#81D7B4]/50 focus:border-[#81D7B4]/50'} shadow-sm focus:outline-none focus:ring-2 transition-all`}
                          />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </motion.div>

                      {/* Amount - enhanced */}
                      <motion.div variants={itemVariants}>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Save
                        </label>
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#81D7B4]/30 to-blue-400/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <input
                            type="text"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.trim())}
                            placeholder="0.00"
                            className={`relative w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm rounded-xl border text-gray-900 ${errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200/50 focus:ring-[#81D7B4]/50 focus:border-[#81D7B4]/50'} shadow-sm focus:outline-none focus:ring-2 transition-all`}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500">$</span>
                          </div>
                        </div>
                        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                        
                        {/* GoodDollar Equivalent Display */}
                        {currency === 'Gooddollar' && amount && goodDollarEquivalent > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 bg-gradient-to-r from-[#81D7B4]/10 to-[#81D7B4]/5 rounded-lg border border-[#81D7B4]/20"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <img src="/$g.png" alt="GoodDollar" className="w-5 h-5 mr-2" />
                                <span className="text-sm font-medium text-gray-700">Equivalent in GoodDollar:</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-lg font-bold text-[#81D7B4]">
                                  {goodDollarEquivalent.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </span>
                                <span className="ml-1 text-sm text-gray-600">$G</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              This amount will be deducted from your wallet
                              <span className="ml-1 text-[#81D7B4] font-medium">
                                (1 $G ≈ ${goodDollarPrice.toFixed(6)})
                              </span>
                            </div>
                          </motion.div>
                        )}

                      </motion.div>

                      {/* Currency - enhanced, responsive, DeFi style */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Currency
                        </label>
                        <div className="flex flex-wrap gap-3 w-full">
                          {currencies.map((curr) => (
                            <button
                              key={curr}
                              type="button"
                              onClick={() => setCurrency(curr)}
                              className={`flex items-center justify-center px-4 py-3 rounded-2xl border transition-all duration-300 flex-1 min-w-0 text-base sm:text-sm ${currency === curr
                                ? 'bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_4px_16px_rgba(129,215,180,0.18)] scale-105'
                                : 'bg-white/80 border-gray-200/50 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgba(129,215,180,0.06)]'} font-medium`}
                              style={{ minWidth: 0 }}
                            >
                              <img
                                src={
                                  curr === 'Gooddollar' ? '/$g.png'
                                  : curr === 'cUSD' ? '/cusd.png'
                                  : curr === 'USDGLO' ? '/usdglo.png'
                                  : curr === 'USDC' ? '/usdc.png'
                                  : `/${curr.toLowerCase().replace('$', '')}.png`
                                }
                                alt={curr}
                                className="w-5 h-5 mr-2"
                              />
                              <span>{curr}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>

                      {/* Chain - improved: Base as main, others in dropdown */}
                      <motion.div variants={itemVariants}>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Select Network
                        </label>
                        <div className="flex gap-3 w-full">
                          {/* Main network (Base) */}
                          <button
                            type="button"
                            onClick={async () => {
                              await switchToNetwork('base');
                              setChain('base');
                            }}
                            className={`flex items-center justify-center px-5 py-3 rounded-2xl border transition-all duration-300 flex-1 text-base sm:text-sm ${chain === 'base'
                              ? 'bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_4px_16px_rgba(129,215,180,0.18)] scale-105'
                              : 'bg-white/80 border-gray-200/50 text-gray-700 hover:bg-gray-50 shadow-[0_2px_8px_rgba(129,215,180,0.06)]'} font-medium`}
                          >
                            <img src="/base.svg" alt="Base" className="w-5 h-5 mr-2" />
                            Base
                          </button>
                          {/* Dropdown for other networks - show selected network if not base */}
                          <div className="relative flex-1">
                            <button
                              type="button"
                              className={`flex items-center justify-center px-5 py-3 rounded-2xl border transition-all duration-300 w-full text-base sm:text-sm font-medium group shadow-[0_2px_8px_rgba(129,215,180,0.06)] ${chain !== 'base'
                                ? 'bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_4px_16px_rgba(129,215,180,0.18)] scale-105'
                                : 'bg-white/80 border-gray-200/50 text-gray-700 hover:bg-gray-50'}`}
                              onClick={() => {
                                const el = document.getElementById('network-dropdown');
                                if (el) el.classList.toggle('hidden');
                              }}
                            >
                              {chain !== 'base' ? (
                                <>
                                  <img src={chains.find(c => c.id === chain)?.logo || ''} alt={chains.find(c => c.id === chain)?.name || ''} className="w-5 h-5 mr-2" />
                                  {chains.find(c => c.id === chain)?.name || 'Other Networks'}
                                </>
                              ) : (
                                <>Other Networks<svg className="w-4 h-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                              )}
                            </button>
                            <div id="network-dropdown" className="hidden absolute left-0 mt-2 w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 z-10">
                              {chains.filter(c => c.id !== 'base').map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={async () => {
                                    await switchToNetwork(c.id);
                                    setChain(c.id);
                                    document.getElementById('network-dropdown')?.classList.add('hidden');
                                  }}
                                  className={`flex items-center w-full px-4 py-2 rounded-xl border-b border-gray-100 last:border-b-0 text-base sm:text-sm ${chain === c.id ? 'bg-[#81D7B4]/10 text-[#81D7B4]' : 'hover:bg-gray-100/80 text-gray-700'} font-medium`}
                                >
                                  <img src={c.logo} alt={c.name} className="w-5 h-5 mr-2" />
                                  {c.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="mt-8 sm:mt-10 flex justify-end"
                      variants={itemVariants}
                    >
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-[0_4px_10px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_15px_rgba(129,215,180,0.4)] transition-all duration-300 transform hover:translate-y-[-2px]"
                      >
                        Next Step
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Duration & Penalties - Enhanced */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    <motion.h2
                      className="text-xl font-bold text-gray-800 mb-6 flex items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="bg-[#81D7B4]/10 w-8 h-8 rounded-full flex items-center justify-center text-[#81D7B4] mr-3 text-sm">2</span>
                      Duration & Penalties
                    </motion.h2>

                    <motion.div
                      className="space-y-5 sm:space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Date selection - enhanced */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Savings Duration
                        </label>

                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4 sm:p-5 relative z-10 overflow-hidden group">
                          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                          <p className="text-sm text-gray-600 mb-4 relative z-10">
                            Your savings will start today and end on your selected date. Choose an end date at least 30 days from now.
                          </p>

                          <div className="relative z-10">
                            <CustomDatePicker
                              selectedDate={endDate}
                              onSelectDate={(date) => setEndDate(date)}
                            />
                          </div>

                          {startDate && endDate && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 bg-[#81D7B4]/10 rounded-xl p-3 sm:p-4 border border-[#81D7B4]/30 relative z-10"
                            >
                              <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#81D7B4] mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                  Duration: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-gray-500 flex items-center">
                                <span className="inline-block bg-white/80 rounded-md px-2 py-1 mr-2 shadow-sm">
                                  {format(startDate, 'MMM d, yyyy')}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <span className="inline-block bg-white/80 rounded-md px-2 py-1 ml-2 shadow-sm">
                                  {format(endDate, 'MMM d, yyyy')}
                                </span>
                              </div>
                            </motion.div>
                          )}
                          {errors.endDate && <p className="mt-2 text-sm text-red-500 relative z-10">{errors.endDate}</p>}
                        </div>
                      </motion.div>

                      {/* Penalties - enhanced */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Early Withdrawal Penalty
                          </label>
                          <div className="bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600">
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Optional
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4 sm:p-5 relative overflow-hidden group">
                          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                          <p className="text-sm text-gray-600 mb-4 relative z-10">
                            Setting a penalty helps you stay committed to your savings goal. If you withdraw funds before the end date, this percentage will be deducted.
                          </p>

                          <div className="flex gap-2 relative z-10">
                            {penalties.map((p, index) => (
                              <motion.button
                                key={p}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                type="button"
                                onClick={() => setPenalty(p)}
                                className={`flex-1 py-3 rounded-xl border ${penalty === p
                                  ? 'bg-gradient-to-r from-[#81D7B4]/20 to-[#81D7B4]/5 border-[#81D7B4]/30 text-[#81D7B4] shadow-[0_4px_10px_rgba(129,215,180,0.15)]'
                                  : 'bg-white border-gray-200/50 text-gray-700 hover:bg-gray-50'
                                  } transition-all font-medium text-center`}
                              >
                                {p}
                              </motion.button>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center text-sm text-gray-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 relative z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>
                              With <span className="font-medium text-amber-700">{penalty}</span> penalty, early withdrawal of <span className="font-medium text-amber-700">${amount || '1000'}</span> would cost you <span className="font-medium text-amber-700">${(Number(amount || '1000') * parseFloat(penalty) / 100).toFixed(2)}</span>.
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="mt-8 sm:mt-10 flex justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 transform hover:translate-y-[-2px]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center px-5 sm:px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-[0_4px_10px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_15px_rgba(129,215,180,0.4)] transition-all duration-300 transform hover:translate-y-[-2px]"
                      >
                        Next Step
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Review & Create - Enhanced */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    <motion.h2
                      className="text-xl font-bold text-gray-800 mb-6 flex items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="bg-[#81D7B4]/10 w-8 h-8 rounded-full flex items-center justify-center text-[#81D7B4] mr-3 text-sm">3</span>
                      Review & Create
                    </motion.h2>

                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Summary card */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-[#81D7B4]/10 to-blue-400/5 rounded-xl border border-[#81D7B4]/20 p-4 sm:p-6 relative overflow-hidden"
                      >
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#81D7B4]/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 relative z-10">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{name || "Untitled Plan"}</h3>
                            <p className="text-sm text-gray-600 mt-1">Review your savings plan details</p>
                          </div>
                          <div className="mt-3 sm:mt-0 flex items-center bg-white/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/60 shadow-sm">
                            <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                              <img
                                src={
                                  currency === 'Gooddollar' ? '/$g.png'
                                  : currency === 'cUSD' ? '/cusd.png'
                                  : currency === 'USDGLO' ? '/usdglo.png'
                                  : currency === 'USDC' ? '/usdc.png'
                                  : `/${currency.toLowerCase().replace('$', '')}.png`
                                }
                                alt={currency}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{currency}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            {chains.map(c => c.id === chain && (
                              <div key={c.id} className="flex items-center">
                                <div className="bg-white rounded-full p-1 mr-1.5 shadow-sm">
                                  <img src={c.logo} alt={c.name} className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="relative z-10">
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/60 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm text-gray-500">Amount</span>
                              <span className="text-xs px-2 py-1 bg-[#81D7B4]/10 text-[#81D7B4] rounded-full font-medium">Principal</span>
                            </div>
                            <div className="flex items-baseline">
                              <span className="text-2xl font-bold text-gray-800">${amount || "0.00"}</span>
                              <span className="ml-1 text-gray-500">{currency}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Details list */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden"
                      >
                        <div className="divide-y divide-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-center py-3 px-4 sm:px-6">
                            <span className="text-sm font-medium text-gray-500 sm:w-1/3">Start Date</span>
                            <span className="text-sm text-gray-800 font-medium mt-1 sm:mt-0">
                              {startDate ? format(startDate, 'MMMM d, yyyy') : 'Today'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center py-3 px-4 sm:px-6">
                            <span className="text-sm font-medium text-gray-500 sm:w-1/3">End Date</span>
                            <span className="text-sm text-gray-800 font-medium mt-1 sm:mt-0">
                              {endDate ? format(endDate, 'MMMM d, yyyy') : 'Not selected'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center py-3 px-4 sm:px-6">
                            <span className="text-sm font-medium text-gray-500 sm:w-1/3">Duration</span>
                            <span className="text-sm text-gray-800 font-medium mt-1 sm:mt-0">
                              {startDate && endDate
                                ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                                : 'Not calculated'}
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center py-3 px-4 sm:px-6">
                            <span className="text-sm font-medium text-gray-500 sm:w-1/3">Early Withdrawal Penalty</span>
                            <span className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                              <span className="inline-flex items-center bg-amber-50 text-amber-700 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap">
                                {penalty}
                              </span>
                              <span className="text-gray-500 text-xs sm:text-sm truncate">
                                (${(Number(amount || '0') * parseFloat(penalty) / 100).toFixed(2)} fee on early withdrawal)
                              </span>
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Balance Warning */}
                      <AnimatePresence>
                        {balanceWarning && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 relative overflow-hidden"
                          >
                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-200/20 rounded-full blur-2xl"></div>
                            <div className="flex items-start space-x-3 relative z-10">
                              <div className="flex-shrink-0 mt-0.5">
                                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-amber-800 mb-1">Wallet Balance Warning</h4>
                                <p className="text-sm text-amber-700 leading-relaxed">{balanceWarning}</p>
                                {isCheckingBalance && (
                                  <div className="flex items-center mt-2 text-xs text-amber-600">
                                    <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Checking balances...
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => setBalanceWarning(null)}
                                className="flex-shrink-0 text-amber-500 hover:text-amber-700 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Wallet Balance Info */}
                      {address && !balanceWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 relative overflow-hidden"
                        >
                          <div className="absolute -top-10 -right-10 w-20 h-20 bg-green-200/20 rounded-full blur-2xl"></div>
                          <div className="flex items-center space-x-3 relative z-10">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-green-800 mb-1">Wallet Ready</h4>
                              <div className="text-xs text-green-700 space-y-1">
                                <div className="flex justify-between">
                                  <span>{currency} Balance:</span>
                                  <span className="font-medium">{parseFloat(tokenBalance).toFixed(4)} {currency}</span>
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

                      {/* Terms and conditions */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            id="terms"
                            className="h-4 w-4 text-[#81D7B4] focus:ring-[#81D7B4]/50 border-gray-300 rounded"
                            required
                            checked={termsAgreed}
                            onChange={(e) => setTermsAgreed(e.target.checked)}
                          />
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I understand that my funds will be locked until the end date, and early withdrawals will incur a {penalty} penalty.
                        </label>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 transform hover:translate-y-[-2px] order-2 sm:order-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || isLoading || !termsAgreed}
                        className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-[0_4px_10px_rgba(129,215,180,0.3)] hover:shadow-[0_6px_15px_rgba(129,215,180,0.4)] transition-all duration-300 transform hover:translate-y-[-2px] disabled:opacity-70 disabled:cursor-not-allowed order-1 sm:order-2"
                      >
                        {(submitting || isLoading) ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Plan...
                          </>
                        ) : (
                          <>
                            Create Savings Plan
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </>
                        )}
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}