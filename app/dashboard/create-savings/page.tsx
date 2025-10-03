'use client'

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
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
import { useSavingsData } from '@/hooks/useSavingsData';
import NetworkDetection from '@/components/NetworkDetection';
import { getTweetButtonProps } from '@/utils/tweetUtils';
import { getSavingFeeFromContract, estimateGasForTransaction } from '@/utils/contractUtils';

const CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const BASE_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"

const LISK_CONTRACT_ADDRESS = "0x05D032ac25d322df992303dCa074EE7392C117b9"


const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
})

export default function CreateSavingsPage() {
  const router = useRouter()
  const { address } = useAccount()
  const { referralData, generateReferralCode, markReferralConversion } = useReferrals()
  const { savingsData } = useSavingsData()
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
  const [penaltiesExpanded, setPenaltiesExpanded] = useState(false)
  


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





  // Define available currencies for each network
  const networkCurrencies: Record<string, string[]> = useMemo(() => ({
    base: ['USDC', 'USDGLO'],
    celo: ['cUSD', 'USDGLO', 'USDC', 'Gooddollar'],
    lisk: ['USDC'],
  }), []);

  // Update currency options when chain changes
  useEffect(() => {
    const available = networkCurrencies[chain] || [];
    if (!available.includes(currency)) {
      setCurrency(available[0]);
    }
  }, [chain, currency, networkCurrencies]);

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
        } else if (networkName === 'lisk') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x46F' }], // Lisk chainId in hex (1135)
            });
          } catch (switchError: unknown) {
        if ((switchError as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x46F',
                  chainName: 'Lisk',
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://rpc.api.lisk.com'],
                  blockExplorerUrls: ['https://blockscout.lisk.com'],
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
    { id: 'celo', name: 'Celo', logo: '/celo.png', color: 'bg-green-100', textColor: 'text-green-600', active: true },
    { id: 'lisk', name: 'Lisk', logo: '/lisk-logo.png', color: 'bg-purple-100', textColor: 'text-purple-600', active: true }
  ]
  const penalties = ['10%', '20%', '30%']

  const validateStep = () => {
    let valid = true
    const newErrors = { name: '', amount: '', endDate: '' }

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = 'Please enter a name for your savings plan'
        valid = false
      } else if (name !== name.trim()) {
        newErrors.name = 'Plan name cannot have leading or trailing spaces'
        valid = false
      } else {
        // Check for duplicate plan names
        const existingPlanNames = [
          ...savingsData.currentPlans.map(plan => plan.name.toLowerCase()),
          ...savingsData.completedPlans.map(plan => plan.name.toLowerCase())
        ]
        if (existingPlanNames.includes(name.trim().toLowerCase())) {
          newErrors.name = 'Plan name already exists. Please choose a different name.'
          valid = false
        }
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
        // Get saving fee from contract
        const feeInWei = await fetchSavingFee(provider, CONTRACT_ADDRESS);
        if (!feeInWei) throw new Error('Could not fetch saving fee from contract.');
        
        const joinTx = await contract.joinBitsave({
          value: feeInWei, 
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

      // Get saving fee from contract
      const feeInWei = await fetchSavingFee(provider, CONTRACT_ADDRESS);
      if (!feeInWei) throw new Error('Could not fetch saving fee from contract.');

      // Estimate gas for createSaving transaction
      const estimatedGas = await estimateGasForTransaction(
        contract,
        'createSaving',
        [name, maturityTime, selectedPenalty, safeMode, tokenToSave, usdcEquivalentAmount],
        { value: feeInWei }
      );

      const txOptions = {
        gasLimit: estimatedGas,
        value: feeInWei, 
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

  // Handle USDGLO savings on Base network
  const handleUSDGLOBaseSavings = async () => {
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

      const userEnteredAmount = parseFloat(amount)
      if (isNaN(userEnteredAmount) || userEnteredAmount <= 0) {
        throw new Error("Invalid amount. Please enter an amount greater than zero.")
      }

      const usdgloAmount = ethers.parseUnits(userEnteredAmount.toFixed(18), 18)

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
        // Get saving fee from contract
        const feeInWei = await fetchSavingFee(provider, CONTRACT_ADDRESS);
        if (!feeInWei) throw new Error('Could not fetch saving fee from contract.');
        
        const joinTx = await contract.joinBitsave({
          value: feeInWei, 
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
      const tokenToSave = BASE_TOKENS.USDGLO.address

      await approveERC20(tokenToSave, usdgloAmount, signer)

      // Get saving fee from contract
      const feeInWei = await fetchSavingFee(provider, CONTRACT_ADDRESS);
      if (!feeInWei) throw new Error('Could not fetch saving fee from contract.');

      // Estimate gas for createSaving transaction
      const estimatedGas = await estimateGasForTransaction(
        contract,
        'createSaving',
        [name, maturityTime, selectedPenalty, safeMode, tokenToSave, usdgloAmount],
        { value: feeInWei }
      );

      const txOptions = {
        gasLimit: estimatedGas,
        value: feeInWei, 
      }

      const tx = await contract.createSaving(
        name,
        maturityTime,
        selectedPenalty,
        safeMode,
        tokenToSave,
        usdgloAmount,
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
      console.error("Error creating USDGLO savings plan:", error)
      setSuccess(false)

      const errorMessage = handleContractError(error, 'main');
      setError(errorMessage);
      throw error 
    } finally {
      setLoading(false)
    }
  }

  // Token addresses and decimals for Base
  const BASE_TOKENS = {
    USDC: { address: BASE_CONTRACT_ADDRESS, decimals: 6 },
    USDGLO: { address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
  };

  // Token addresses and decimals for Celo
  const CELO_TOKENS = {
    USDGLO: { address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
    cUSD: { address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 18 },
    USDC: { address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', decimals: 6 },
    Gooddollar: { address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', decimals: 18 },
  };

  // Token addresses and decimals for Lisk
  const LISK_TOKENS = {
    USDC: { address: LISK_CONTRACT_ADDRESS, decimals: 6 },
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

  // Helper to fetch saving fee from contract
  const fetchSavingFee = async (provider: ethers.Provider, contractAddress: string) => {
    try {
      const feeInWei = await getSavingFeeFromContract(contractAddress, provider);
      return feeInWei;
    } catch (error) {
      console.error('Error fetching saving fee from contract:', error);
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

  const setupLiskProvider = async () => {
    if (!window.ethereum) throw new Error("No Ethereum wallet detected. Please install MetaMask.");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    
    const LISK_CHAIN_ID = 1135;
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== LISK_CHAIN_ID) {
      throw new Error("Please switch your wallet to the Lisk network.");
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
      
      // Track referral conversion if user came from a referral link
      const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
      if (referralCode) {
        markReferralConversion(referralCode);
        localStorage.removeItem('referralCode'); // Remove after conversion
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
      
      // Track successful savings creation
      if (address) {
        trackSavingsCreated(address, {
          planName: name,
          amount: amount,
          currency: currency,
          chain: chain,
          penalty: penalty,
          endDate: endDate?.toISOString(),
          txHash: receipt.hash
        });
      }
      
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

  // USDC specific savings function
  const handleUSDCSavings = async () => {
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
      
      // USDC specific logic
      const token = CELO_TOKENS.USDC;
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
      
      // Track savings creation
      if (address) {
        trackSavingsCreated(address, {
          planName: name,
          amount: parsedAmount.toString(),
          currency: 'USDC',
          chain: 'celo',
          maturityDate: selectedDayRange.to ? new Date(
            selectedDayRange.to.year ?? 0,
            (selectedDayRange.to.month ?? 1) - 1,
            selectedDayRange.to.day ?? 1
          ).toISOString() : '',
          penalty: selectedPenalty.toString(),
          txHash: receipt.hash
        });
      }
      
      // Send to API
      await sendTransactionToAPI(parsedAmount, receipt.hash, 'USDC');
      
      setSuccess(true);
    } catch (error) {
      console.error("Error creating USDC savings plan:", error);
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

  const handleLiskUSDCSavings = async () => {
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
      const { signer } = await setupLiskProvider();
      const contract = new ethers.Contract(LISK_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const maturityTime = calculateMaturityTime();
      
      // USDC specific logic for Lisk
      const token = LISK_TOKENS.USDC;
      const tokenAmount = ethers.parseUnits(parsedAmount.toString(), token.decimals);
      
      // Approve and create saving
      await approveERC20(token.address, tokenAmount, signer);
      
      // Use ETH for fee on Lisk (simplified fee structure)
      const feeInEth = "0.001"; // $1 equivalent in ETH (approximate)
      
      const txOptions = { 
        gasLimit: 2717330,
        value: ethers.parseEther(feeInEth)
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
      
      // Track savings creation
      if (address) {
        trackSavingsCreated(address, {
          planName: name,
          amount: parsedAmount.toString(),
          currency: 'USDC',
          chain: 'lisk',
          maturityDate: selectedDayRange.to ? new Date(
            selectedDayRange.to.year ?? 0,
            (selectedDayRange.to.month ?? 1) - 1,
            selectedDayRange.to.day ?? 1
          ).toISOString() : '',
          penalty: selectedPenalty.toString(),
          txHash: receipt.hash
        });
      }
      
      // Send to API
      await sendTransactionToAPI(parsedAmount, receipt.hash, 'USDC');
      
      setSuccess(true);
    } catch (error) {
      console.error("Error creating USDC savings plan on Lisk:", error);
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
        } else if (currency === 'USDC') {
          await handleUSDCSavings();
        } else if (currency === 'Gooddollar') {
          await handleGooddollarSavings();
        } else {
          throw new Error('Unsupported currency for Celo network.');
        }
      } else if (chain === 'lisk') {
        if (currency === 'USDC') {
          await handleLiskUSDCSavings();
        } else {
          throw new Error('Unsupported currency for Lisk network.');
        }
      } else {
        if (currency === 'USDGLO') {
          await handleUSDGLOBaseSavings();
        } else {
          await handleBaseSavingsCreate();
        }
      }
      
      // Track referral conversion if user came from a referral link
      const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
      if (referralCode) {
        markReferralConversion(referralCode);
        localStorage.removeItem('referralCode'); // Remove after conversion
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
      {/* Network Detection Component */}
      <NetworkDetection />
      
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
                // Determine if this is first-time savings based on current deposits count
                // Since we just created a new savings, the count would be the previous count
                const isFirstTime = savingsData.deposits === 0;
                const transactionType = isFirstTime ? 'first-time-saving' : 'subsequent-saving';
                
                const tweetProps = getTweetButtonProps(transactionType, {
                  currency: currency,
                  amount: amount,
                  referralLink: referralLink,
                  userTransactionCount: savingsData.deposits
                });
                
                return (
                  <a
                    href={tweetProps.href}
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
          <Link href="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-2">Create a Savings Plan</h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base">Set up a new savings plan to help you reach your financial goals with automated savings and rewards.</p>
        </div>

        {/* Modern Step Navigation */}
        <div className="mb-8 sm:mb-10 px-2 sm:px-0">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200 z-0">
              <div 
                className="h-full bg-[#81D7B4] transition-all duration-500 ease-out"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
            
            {/* Step Items */}
            <div className="relative flex items-start justify-between">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center flex-1 relative z-10">
                  {/* Step Circle */}
                  <div className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    step === i
                      ? 'bg-[#81D7B4] border-[#81D7B4] text-white shadow-lg'
                      : step > i
                        ? 'bg-[#81D7B4] border-[#81D7B4] text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step > i ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="font-semibold text-sm">{i}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div className={`text-sm font-medium transition-colors duration-300 ${
                      step === i ? 'text-[#81D7B4]' : step > i ? 'text-[#81D7B4]' : 'text-gray-500'
                    }`}>
                      {i === 1 ? 'Plan Details' : i === 2 ? 'Duration & Penalties' : 'Review & Create'}
                    </div>
                    <div className={`text-xs mt-1 transition-colors duration-300 ${
                      step === i ? 'text-gray-600' : step > i ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {i === 1 ? 'Basic information' : i === 2 ? 'Set timeline' : 'Confirm details'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile step indicator */}
          <div className="flex justify-between text-xs sm:hidden mt-3">
            <span className={step >= 1 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Details</span>
            <span className={step >= 2 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Duration</span>
            <span className={step >= 3 ? 'text-[#81D7B4] font-medium' : 'text-gray-500'}>Review</span>
          </div>
        </div>

        {/* Card container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative">

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
                      {/* Plan name */}
                      <motion.div variants={itemVariants}>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700 mb-2">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          id="planName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Vacation Fund, Emergency Savings"
                          className={`w-full px-4 py-3 bg-white rounded-xl border text-gray-900 ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#81D7B4] focus:border-[#81D7B4]'} shadow-sm focus:outline-none focus:ring-2 transition-all`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                      </motion.div>

                      {/* Amount */}
                      <motion.div variants={itemVariants}>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                          Amount to Save
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={`w-full pl-12 pr-4 py-3 bg-white rounded-xl border text-gray-900 ${errors.amount ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#81D7B4] focus:border-[#81D7B4]'} shadow-sm focus:outline-none focus:ring-2 transition-all`}
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
                                <Image src="/$g.png" alt="GoodDollar" width={20} height={20} className="w-5 h-5 mr-2" />
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

                      {/* Currency */}
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
                              className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 flex-1 min-w-0 text-base sm:text-sm ${currency === curr
                                ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4] shadow-sm'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'} font-medium`}
                              style={{ minWidth: 0 }}
                            >
                              <Image
                                src={
                                  curr === 'Gooddollar' ? '/$g.png'
                                  : curr === 'cUSD' ? '/cusd.png'
                                  : curr === 'USDGLO' ? '/usdglo.png'
                                  : curr === 'USDC' ? '/usdc.png'
                                  : `/${curr.toLowerCase().replace('$', '')}.png`
                                }
                                alt={curr}
                                width={20}
                                height={20}
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
                            className={`flex items-center justify-center px-5 py-3 rounded-xl border transition-all duration-200 flex-1 text-base sm:text-sm ${chain === 'base'
                              ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4] shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'} font-medium`}
                          >
                            <Image src="/base.svg" alt="Base" width={20} height={20} className="w-5 h-5 mr-2" />
                            Base
                          </button>
                          {/* Dropdown for other networks - show selected network if not base */}
                          <div className="relative flex-1">
                            <button
                              type="button"
                              className={`flex items-center justify-center px-5 py-3 rounded-xl border transition-all duration-200 w-full text-base sm:text-sm font-medium group shadow-sm ${chain !== 'base'
                                ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4]'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                              onClick={() => {
                                const el = document.getElementById('network-dropdown');
                                if (el) el.classList.toggle('hidden');
                              }}
                            >
                              {chain !== 'base' ? (
                                <>
                                  <Image src={chains.find(c => c.id === chain)?.logo || ''} alt={chains.find(c => c.id === chain)?.name || ''} width={20} height={20} className="w-5 h-5 mr-2" />
                                  {chains.find(c => c.id === chain)?.name || 'Other Networks'}
                                </>
                              ) : (
                                <>Other Networks<svg className="w-4 h-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                              )}
                            </button>
                            <div id="network-dropdown" className="hidden absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-300 z-10">
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
                                  <Image src={c.logo} alt={c.name} width={20} height={20} className="w-5 h-5 mr-2" />
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
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
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
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Early Withdrawal Penalty
                          </label>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-4 sm:p-5">
                          <p className="text-sm text-gray-600 mb-4">
                            Setting a penalty helps you stay committed to your savings goal. If you withdraw funds before the end date, this percentage will be deducted.
                          </p>

                          <div className="flex gap-2">
                            {penalties.map((p, index) => (
                              <motion.button
                                key={p}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                type="button"
                                onClick={() => setPenalty(p)}
                                className={`flex-1 py-3 rounded-xl border ${penalty === p
                                  ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#81D7B4] shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                  } transition-all font-medium text-center`}
                              >
                                {p}
                              </motion.button>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
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
                      className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center px-5 sm:px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#81D7B4]/90 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
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
                              <Image
                                src={
                                  currency === 'Gooddollar' ? '/$g.png'
                                  : currency === 'cUSD' ? '/cusd.png'
                                  : currency === 'USDGLO' ? '/usdglo.png'
                                  : currency === 'USDC' ? '/usdc.png'
                                  : `/${currency.toLowerCase().replace('$', '')}.png`
                                }
                                alt={currency}
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{currency}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            {chains.map(c => c.id === chain && (
                              <div key={c.id} className="flex items-center">
                                <div className="bg-white rounded-full p-1 mr-1.5 shadow-sm">
                                  <Image src={c.logo} alt={c.name} width={16} height={16} className="w-4 h-4" />
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

                      {/* Comprehensive Penalties Information Section - Collapsible */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="bg-gradient-to-br from-[#81D7B4]/10 to-[#6bc4a1]/10 rounded-xl border border-[#81D7B4]/30 relative overflow-hidden"
                      >
                        {/* Background decorative elements */}
                        <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#81D7B4]/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-[#6bc4a1]/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10">
                          {/* Collapsible Header */}
                          <button
                            onClick={() => setPenaltiesExpanded(!penaltiesExpanded)}
                            className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-[#81D7B4]/5 transition-colors duration-200 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#81D7B4] to-[#6bc4a1] rounded-lg flex items-center justify-center shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-bold text-[#2D5A4A]">Early Withdrawal Penalties</h3>
                                <p className="text-sm text-[#4A7C59]">Understanding the costs of breaking your savings commitment</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center bg-[#81D7B4]/20 text-[#2D5A4A] rounded-full px-3 py-1 text-sm font-bold border border-[#81D7B4]/30">
                                {penalty}
                              </span>
                              <motion.div
                                animate={{ rotate: penaltiesExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="w-6 h-6 text-[#4A7C59]"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </motion.div>
                            </div>
                          </button>

                          {/* Collapsible Content */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: penaltiesExpanded ? "auto" : 0,
                              opacity: penaltiesExpanded ? 1 : 0
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                              {/* Current Plan Penalty Highlight */}
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-[#81D7B4]/30 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-[#4A7C59]">Your Selected Penalty Rate</span>
                                  <span className="inline-flex items-center bg-[#81D7B4]/20 text-[#2D5A4A] rounded-full px-3 py-1 text-sm font-bold">
                                    {penalty}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Penalty Amount:</span>
                                    <span className="font-semibold text-[#6bc4a1]">
                                      ${(Number(amount || '0') * parseFloat(penalty) / 100).toFixed(2)} {currency}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">You&apos;ll Receive:</span>
                                    <span className="font-semibold text-green-700">
                                      ${(Number(amount || '0') * (100 - parseFloat(penalty)) / 100).toFixed(2)} {currency}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* How Penalties Work */}
                              <div className="space-y-4">
                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#81D7B4]/20">
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#81D7B4]/20 rounded-full flex items-center justify-center mt-0.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4A7C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-gray-800 mb-1">How Penalties Work</h4>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Penalties are deducted from your principal amount when you withdraw before the maturity date. 
                                        This encourages commitment to your savings goals and helps maintain the protocol&apos;s stability.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#81D7B4]/20">
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-gray-800 mb-1">No Penalty After Maturity</h4>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Once your savings plan reaches its maturity date ({endDate ? format(endDate, 'MMMM d, yyyy') : 'your selected end date'}), 
                                        you can withdraw your full amount plus any earned rewards without any penalties.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-[#81D7B4]/20">
                                  <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#6bc4a1]/20 rounded-full flex items-center justify-center mt-0.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4A7C59]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Penalty Distribution</h4>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        Penalty fees are distributed to other savers in the protocol as rewards, creating a 
                                        community-driven incentive system that benefits committed savers.
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Example Scenarios */}
                                <div className="bg-gradient-to-r from-[#81D7B4]/10 to-[#6bc4a1]/10 rounded-lg p-4 border border-[#81D7B4]/20">
                                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4A7C59] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Example Scenarios
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <div className="bg-white rounded-md p-3 border border-[#81D7B4]/20">
                                      <div className="font-medium text-red-700 mb-1">❌ Early Withdrawal</div>
                                      <div className="space-y-1 text-gray-600">
                                        <div>Withdraw before: {endDate ? format(endDate, 'MMM d, yyyy') : 'maturity'}</div>
                                        <div>Penalty: <span className="font-semibold text-red-600">${(Number(amount || '0') * parseFloat(penalty) / 100).toFixed(2)}</span></div>
                                        <div>You receive: <span className="font-semibold">${(Number(amount || '0') * (100 - parseFloat(penalty)) / 100).toFixed(2)}</span></div>
                                      </div>
                                    </div>
                                    <div className="bg-white rounded-md p-3 border border-[#81D7B4]/20">
                                      <div className="font-medium text-green-700 mb-1">✅ Maturity Withdrawal</div>
                                      <div className="space-y-1 text-gray-600">
                                        <div>Withdraw after: {endDate ? format(endDate, 'MMM d, yyyy') : 'maturity'}</div>
                                        <div>Penalty: <span className="font-semibold text-green-600">$0.00</span></div>
                                        <div>You receive: <span className="font-semibold">${amount || '0.00'} + rewards</span></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Important Notice */}
                                <div className="bg-gradient-to-r from-[#81D7B4]/15 to-[#6bc4a1]/15 rounded-lg p-3 border border-[#81D7B4]/30">
                                  <div className="flex items-start space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4A7C59] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-xs text-[#2D5A4A]">
                                      <span className="font-semibold">Important:</span> Penalties are automatically calculated and deducted by the smart contract. 
                                      This process is transparent and cannot be reversed once a withdrawal is initiated.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>

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
                      className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between space-y-6 sm:space-y-0"
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