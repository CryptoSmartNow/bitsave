'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import CustomDatePicker from '@/components/CustomDatePicker';
import { format } from 'date-fns';
import { Exo } from 'next/font/google';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
// import { useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import erc20ABIFile from '@/app/abi/erc20ABI.json';
const erc20ABI = erc20ABIFile.abi;
import { trackSavingsCreated, trackError, trackPageVisit } from '@/lib/interactionTracker';
import { useReferrals } from '@/lib/useReferrals';
import { handleContractError } from '@/lib/contractErrorHandler';
import { useSavingsData } from '@/hooks/useSavingsData';
import { HiHome, HiAcademicCap, HiTruck, HiBriefcase, HiSun, HiCpuChip, HiHeart, HiRocketLaunch, HiOutlineDocumentText, HiWallet, HiCurrencyDollar, HiKey, HiGlobeAlt, HiBolt, HiScale, HiArrowPath, HiLink, HiCheckCircle } from 'react-icons/hi2';
import { FaGamepad } from 'react-icons/fa';
import NetworkDetection from '@/components/NetworkDetection';
import { getTweetButtonProps } from '@/utils/tweetUtils';
import { useWalletDetection } from '@/hooks/useWalletDetection';
import WalletRecommendationModal from '@/components/WalletRecommendationModal';
import { getSavingFeeFromContract, getJoinFeeFromContract, estimateGasForTransaction } from '@/utils/contractUtils';
import { fetchMultipleNetworkLogos, NetworkLogoData } from '@/utils/networkLogos';

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

const CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"
const BASE_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932"

const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"

const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13"

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
})

// === UNIFIED NETWORK CONFIG (plug-and-play) ===

type NetworkToken = {
  symbol: string;
  address: string;
  decimals: number;
};

type NetworkConfig = {
  id: string;         // internal key, e.g. 'base'
  name: string;       // display name
  chainId: number;
  contractAddress: string;
  tokens: NetworkToken[];
  isComingSoon?: boolean;
};

const NETWORKS: NetworkConfig[] = [
  {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    contractAddress: CONTRACT_ADDRESS,
    tokens: [
      { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 }, // Correct Base USDC address
      { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
      { symbol: 'cNGN', address: '0x46C85152bFe9f96829aA94755D9f915F9B10EF5F', decimals: 6 },
    ],
  },
  {
    id: 'celo',
    name: 'Celo',
    chainId: 42220,
    contractAddress: CELO_CONTRACT_ADDRESS,
    tokens: [
      { symbol: 'USDGLO', address: '0x4f604735c1cf31399c6e711d5962b2b3e0225ad3', decimals: 18 },
      { symbol: 'cUSD', address: '0x765DE816845861e75A25fCA122bb6898B8B1282a', decimals: 18 },
      { symbol: 'USDC', address: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C', decimals: 6 },
      { symbol: 'Gooddollar', address: '0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A', decimals: 18 },
    ],
  },
  {
    id: 'bsc',
    name: 'BSC',
    chainId: 56,
    contractAddress: BSC_CONTRACT_ADDRESS,
    tokens: [
      { symbol: 'USDC', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
      { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    ],
  },
  {
    id: 'lisk',
    name: 'Lisk',
    chainId: 1135,
    contractAddress: LISK_CONTRACT_ADDRESS,
    tokens: [
      { symbol: 'USDC', address: '0xf242275d3a6527d877f2c927a82d9b057609cc71', decimals: 6 },
      { symbol: 'cNGN', address: '0x999E3A32eF3F9EAbF133186512b5F29fADB8a816', decimals: 6 },
    ],
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    contractAddress: AVALANCHE_CONTRACT_ADDRESS,
    tokens: [
      // USDC.e on Avalanche C-Chain
      { symbol: 'USDC', address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664', decimals: 6 },
    ],
  },
  {
    id: 'solana',
    name: 'Solana',
    chainId: 0, // Placeholder - Solana uses different chain identification
    contractAddress: '', // Coming soon - no contract yet
    tokens: [
      { symbol: 'SOL', address: '', decimals: 9 },
      { symbol: 'USDC', address: '', decimals: 6 },
      { symbol: 'USDT', address: '', decimals: 6 },
    ],
    isComingSoon: true,
  },
];

// --- Unified createSavingsGeneric implementation ---
const createSavingsGeneric = async ({
  networkId,
  tokenSymbol,
  planName,
  amountRaw,
  maturity,
  penalty,
  safeMode = false,
  providerOverride = undefined,
  signerOverride = undefined,
  address,
  additionalOptions = {}
}: {
  networkId: string;
  tokenSymbol: string;
  planName: string;
  amountRaw: string;
  maturity: number;
  penalty: number;
  safeMode?: boolean;
  providerOverride?: any;
  signerOverride?: any;
  address: string;
  additionalOptions?: any;
}) => {
  const network = NETWORKS.find(n => n.id === networkId);
  if (!network) throw new Error('Invalid network selected.');
  const tokenObj = network.tokens.find(t => t.symbol === tokenSymbol);
  if (!tokenObj || !tokenObj.address) throw new Error('Invalid or missing token address for selected network.');
  let provider, signer;
  if (providerOverride && signerOverride) {
    provider = providerOverride;
    signer = signerOverride;
  } else {
    if (!window.ethereum) throw new Error('No Ethereum wallet detected.');
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
  }
  const chainIdFromChain = (await provider.getNetwork()).chainId;
  if (Number(chainIdFromChain) !== Number(network.chainId)) {
    throw new Error(`Please switch your wallet to the ${network.name} network.`);
  }
  const contract = new ethers.Contract(network.contractAddress, CONTRACT_ABI, signer);
  let userChildContractAddress;
  try {
    userChildContractAddress = await contract.getUserChildContractAddress();
  } catch (e) { userChildContractAddress = undefined; }
  if (userChildContractAddress === ethers.ZeroAddress || !userChildContractAddress) {
    let feeInWei = undefined;
    if (typeof additionalOptions.getFeeFn === 'function') {
      feeInWei = await additionalOptions.getFeeFn(provider, network.contractAddress);
    } else if (typeof fetchSavingFee === 'function') {
      feeInWei = await fetchSavingFee(provider, network.contractAddress);
    }

    // If fee fetching fails, try with a default fee or skip fee requirement
    if (!feeInWei) {
      console.warn('Could not fetch saving fee, trying with default fee or no fee');
      // Try with a small default fee (0.001 ETH) or no fee
      feeInWei = ethers.parseEther('0.001');
    }

    try {
      const joinTx = await contract.joinBitsave({ value: feeInWei });
      await joinTx.wait();
      userChildContractAddress = await contract.getUserChildContractAddress();
    } catch (joinError: any) {
      // If joinBitsave fails with fee, try without fee (some networks/contracts don't require it)
      if (joinError?.message?.includes('revert') || joinError?.code === 'CALL_EXCEPTION') {
        console.warn('joinBitsave with fee failed, trying without fee:', joinError.message);
        try {
          const joinTxNoFee = await contract.joinBitsave({ value: 0 });
          await joinTxNoFee.wait();
          userChildContractAddress = await contract.getUserChildContractAddress();
        } catch (noFeeError) {
          console.error('joinBitsave without fee also failed:', noFeeError);
          throw noFeeError;
        }
      } else {
        throw joinError;
      }
    }
  }
  const cleanAmount = amountRaw.replace(/[^0-9.]/g, '');
  const parsedAmount = parseFloat(cleanAmount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Invalid amount. Please enter an amount greater than zero.');
  }
  const tokenAmount = ethers.parseUnits(parsedAmount.toString(), tokenObj.decimals);
  await approveERC20(tokenObj.address, tokenAmount, signer);
  let txOptions = {};
  if (network.id === 'celo' && typeof fetchCeloPrice === 'function') {
    const celoPrice = await fetchCeloPrice();
    if (!celoPrice) throw new Error('Could not fetch CELO price for fee calculation.');
    const feeInCelo = (1 / celoPrice).toFixed(6);
    txOptions = { gasLimit: 2717330, value: ethers.parseEther(feeInCelo) };
  } else {
    let feeInWei = undefined;
    if (typeof additionalOptions.getFeeFn === 'function') {
      feeInWei = await additionalOptions.getFeeFn(provider, network.contractAddress);
    } else if (typeof fetchSavingFee === 'function') {
      feeInWei = await fetchSavingFee(provider, network.contractAddress);
    }
    // If fee fetching fails, use a default fee or skip
    if (!feeInWei && network.id !== 'celo') {
      console.warn('Could not fetch saving fee for create transaction, using default');
      feeInWei = ethers.parseEther('0.001'); // Default 0.001 ETH
    }
    if (feeInWei) txOptions = { ...txOptions, value: feeInWei };
  }
  const tx = await contract.createSaving(
    planName,
    maturity,
    penalty,
    safeMode,
    tokenObj.address,
    tokenAmount,
    txOptions
  );
  const receipt = await tx.wait();
  return receipt;
};

// Approve ERC20 Helper
const approveERC20 = async (
  tokenAddress: string,
  amount: any,
  signer: any
) => {
  try {
    // Contract to approve is determined by network or can be made generic
    const network = await signer.provider?.getNetwork();
    const chainId = network?.chainId;
    // const contractToApprove = Number(chainId) === 42220 ? CELO_CONTRACT_ADDRESS : CONTRACT_ADDRESS;
    // Dynamic lookup for contract address
    const contractToApprove = NETWORKS.find(n => n.chainId === Number(chainId))?.contractAddress || CONTRACT_ADDRESS;

    const erc20Contract = new ethers.Contract(
      tokenAddress,
      erc20ABI,
      signer
    );
    const tx = await erc20Contract.approve(contractToApprove, amount);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error approving ERC20 tokens:", error);
    throw error;
  }
};

// Fetch Saving Fee Helper
const fetchSavingFee = async (provider: any, contractAddress: string) => {
  try {
    if (!getSavingFeeFromContract) throw new Error('getSavingFeeFromContract not imported');
    const feeInWei = await getSavingFeeFromContract(contractAddress, provider);
    return feeInWei;
  } catch (error) {
    console.error('Error fetching saving fee from contract:', error);
    return null;
  }
};

// Fetch Celo Price Helper
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

export default function CreateSavingsPage() {
  const router = useRouter()
  const { address } = useAccount()
  // const { wallets } = useWallets()
  const { referralData, generateReferralCode, markReferralConversion } = useReferrals()
  const { savingsData } = useSavingsData()
  const { walletInfo, shouldShowModal, dismissRecommendation } = useWalletDetection()
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDC')
  const [chain, setChain] = useState('base')
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const networkDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target as Node)) {
        setIsNetworkDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [startDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [calendarNavigateDate, setCalendarNavigateDate] = useState<Date | null>(null)
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

  // Network logos state
  const [networkLogos, setNetworkLogos] = useState<NetworkLogoData>({});
  const [isLoadingLogos, setIsLoadingLogos] = useState(true);
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
        } else if (networkName === 'avalanche') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xA86A' }], // Avalanche chainId in hex (43114)
            });
          } catch (switchError: unknown) {
            if ((switchError as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xA86A',
                  chainName: 'Avalanche',
                  nativeCurrency: {
                    name: 'AVAX',
                    symbol: 'AVAX',
                    decimals: 18,
                  },
                  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
                  blockExplorerUrls: ['https://snowtrace.io'],
                }],
              });
            }
          }
        } else if (networkName === 'bsc') {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x38' }], // BSC chainId in hex (56)
            });
          } catch (switchError: unknown) {
            if ((switchError as { code: number }).code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x38',
                  chainName: 'Binance Smart Chain',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'BNB',
                    decimals: 18,
                  },
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com'],
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

  const chains = useMemo(() => [
    {
      id: 'base',
      name: 'Base',
      logo: networkLogos['base']?.logoUrl || '/base.png',
      color: 'bg-[#81D7B4]/10',
      textColor: 'text-[#81D7B4]'
    },
    {
      id: 'celo',
      name: 'Celo',
      logo: networkLogos['celo']?.logoUrl || '/celo.png',
      color: 'bg-green-100',
      textColor: 'text-green-600',
      active: true
    },
    {
      id: 'lisk',
      name: 'Lisk',
      logo: networkLogos['lisk']?.logoUrl || '/lisk-logo.png',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      active: true
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      logo: networkLogos['avalanche']?.logoUrl || '/eth.png',
      color: 'bg-red-100',
      textColor: 'text-red-600',
      active: true
    },
    {
      id: 'bsc',
      name: 'Binance Smart Chain',
      logo: networkLogos['bsc']?.logoUrl || '/bsc.png',
      color: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      active: true
    },
    {
      id: 'solana',
      name: 'Solana',
      logo: networkLogos['solana']?.logoUrl || '/solana.png',
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
      isComingSoon: true
    },
  ], [networkLogos]);
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
      // Ensure chain and currency are selected (defaults usually handle this, but good to check)
      if (!chain) valid = false;
      if (!currency) valid = false;
    }

    if (step === 2) {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount'
        valid = false
      }
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

  // Main submit handler (single function for all cases)
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const selectedNetwork = NETWORKS.find(n => n.id === chain);
      const tokenObj = selectedNetwork?.tokens.find(t => t.symbol === currency);
      if (!selectedNetwork || !tokenObj) throw new Error('Selected network or token is not supported.');

      // Use Wagmi provider/signer if available, or fall back to window.ethereum
      // Since we are using OnchainKit/Wagmi, the user should be connected via that.
      // createSavingsGeneric handles the fallback to window.ethereum if no overrides are provided.

      let providerOverride, signerOverride;
      // We can rely on createSavingsGeneric's default behavior which uses window.ethereum
      // Or we can try to get the signer from the Wagmi config if we wanted to be more explicit,
      // but for now, the default behavior of createSavingsGeneric should work for injected wallets.

      // Calculate maturity timestamp and other params from current inputs
      const maturity = calculateMaturityTime();
      const receipt = await createSavingsGeneric({
        networkId: selectedNetwork.id,
        tokenSymbol: tokenObj.symbol,
        planName: name,
        amountRaw: amount,
        maturity,
        penalty: selectedPenalty,
        safeMode: false,
        address: address || '', // enforce string, never undefined
        providerOverride,
        signerOverride,
        additionalOptions: {} // Custom per-network fee logic can go here
      });
      // Referral (preserves old logic)
      const referralCode = localStorage.getItem('referralCode') || new URLSearchParams(window.location.search).get('ref');
      if (referralCode) {
        markReferralConversion(referralCode);
        localStorage.removeItem('referralCode');
      }

      // Record transaction to bitsaveapi.vercel.app
      try {
        const apiKey = "99292ndjnfjfndfn399e933ndnfjnf39993943nfknfdjfnjdn*&&^%$%^&*";
        await axios.post('https://bitsaveapi.vercel.app/transactions/', {
          amount: parseFloat(amount),
          txnhash: receipt.hash,
          chain: chain,
          savingsname: name,
          useraddress: address,
          transaction_type: 'deposit',
          currency: currency
        }, {
          headers: {
            'accept': 'application/json',
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        console.error('Failed to record transaction to external API:', apiError);
        // Don't fail the whole flow if this logging fails
      }

      setTxHash(receipt.hash);
      setSuccess(true);
    } catch (err) {
      console.error('Error creating savings plan:', err);
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
      setSuccess(false);
      // Use contract error handler to extract precise contract error messages
      const errorMessage = handleContractError(err, 'main');
      setError(errorMessage);
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

  // Fetch network logos from CoinGecko
  useEffect(() => {
    const loadNetworkLogos = async () => {
      try {
        setIsLoadingLogos(true);
        const logos = await fetchMultipleNetworkLogos(['base', 'celo', 'lisk', 'avalanche', 'bsc']);
        setNetworkLogos(logos);
      } catch (error) {
        console.error('Error loading network logos:', error);
      } finally {
        setIsLoadingLogos(false);
      }
    };

    loadNetworkLogos();
  }, []);

  // Place below handleSubmit or near top-level helpers:
  const calculateMaturityTime = () => {
    if (selectedDayRange && selectedDayRange.to) {
      return Math.floor(new Date(
        selectedDayRange.to.year ?? 0,
        (selectedDayRange.to.month ?? 1) - 1,
        selectedDayRange.to.day ?? 1
      ).getTime() / 1000);
    }
    return 0;
  };

  if (!mounted) return null

  return (
    <div className={`${exo.className} min-h-screen bg-[#F7FCFA] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative`}>
      {/* Network Detection Component */}
      <NetworkDetection />

      {/* Modern Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#81D7B4]/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#81D7B4]/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="fixed -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#81D7B4]/10 to-transparent blur-3xl pointer-events-none"></div>

      {/* Transaction Status Notifications */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="bg-white/98 backdrop-blur-3xl rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden border border-white/20 relative transform animate-slideUp">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative z-10 p-6 sm:p-8">
              {/* Enhanced Icon Section */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                {success ? (
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 animate-ping opacity-20"></div>
                  </div>
                ) : error === 'Error creating savings user rejected' ? (
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 animate-ping opacity-20"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25 animate-pulse">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-rose-500 animate-ping opacity-20"></div>
                  </div>
                )}
              </div>

              {/* Enhanced Title and Message */}
              <div className="text-center space-y-3 mb-6 sm:mb-8">
                {success ? (
                  <>
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Success!
                    </h2>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Savings Plan Created
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                      Your savings plan has been successfully created and is now active. Start building your financial future today!
                    </p>
                  </>
                ) : error === 'Error creating savings user rejected' ? (
                  <>
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                      Transaction Cancelled
                    </h2>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      No Changes Made
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                      You cancelled the transaction in your wallet. Your savings plan was not created and no funds were transferred.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                      Transaction Failed
                    </h2>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Savings Plan Creation Failed
                    </h3>

                    {/* Enhanced Error Display */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-5 sm:p-6 mt-6 backdrop-blur-sm shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-red-700 uppercase tracking-wider">Error Details</span>
                      </div>
                      <div className="bg-white/70 rounded-xl p-4 border border-red-100">
                        <p className="text-sm text-red-800 font-medium leading-relaxed">
                          {error && (typeof error === 'string' && error.toLowerCase().includes('user rejected')) ?
                            "You cancelled the transaction in your wallet." :
                            error || "Something went wrong with your savings creation. Please try again or contact our team if this keeps happening."
                          }
                        </p>
                      </div>
                    </div>

                    {/* Helpful Error Suggestions */}
                    {error && error !== 'Error creating savings user rejected' && (
                      <div className="bg-gradient-to-br from-[#81D7B4]/10 to-[#6bc4a1]/10 border-l-4 border-[#81D7B4] rounded-2xl p-5 sm:p-6 mt-6 backdrop-blur-sm shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-3 h-3 rounded-full bg-[#81D7B4] animate-pulse"></div>
                          <span className="text-sm font-bold text-[#81D7B4] uppercase tracking-wider">Suggestions</span>
                        </div>
                        <div className="space-y-4">
                          {error.toLowerCase().includes('insufficient') || error.toLowerCase().includes('balance') ? (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-2">
                                <HiWallet className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Check your wallet balance</p>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">Ensure you have enough tokens for the savings amount plus network fees.</p>
                            </div>
                          ) : error.toLowerCase().includes('allowance') || error.toLowerCase().includes('approval') ? (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-2">
                                <HiKey className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Token approval required</p>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">You may need to approve the contract to spend your tokens first.</p>
                            </div>
                          ) : error.toLowerCase().includes('network') || error.toLowerCase().includes('chain') ? (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-2">
                                <HiGlobeAlt className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Network connection issue</p>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">Try switching networks or check if you're connected to the correct blockchain.</p>
                            </div>
                          ) : error.toLowerCase().includes('gas') || error.toLowerCase().includes('fee') ? (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-2">
                                <HiBolt className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Gas fee too low</p>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">The transaction may need higher gas fees. Try increasing the gas limit in your wallet.</p>
                            </div>
                          ) : error.toLowerCase().includes('limit') ? (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-2">
                                <HiScale className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Amount limit exceeded</p>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">The savings amount may be too high or too low. Check the minimum/maximum limits.</p>
                            </div>
                          ) : (
                            <div className="bg-white/70 rounded-xl p-4 border border-[#81D7B4]/20">
                              <div className="flex items-center gap-3 mb-3">
                                <HiArrowPath className="w-5 h-5 text-[#81D7B4]" />
                                <p className="text-sm font-semibold text-gray-800">Try these steps:</p>
                              </div>
                              <ul className="text-xs text-gray-600 space-y-2">
                                <li className="flex items-center gap-2">
                                  <HiCheckCircle className="w-3 h-3 text-[#81D7B4] flex-shrink-0" />
                                  <span>Refresh the page and try again</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <HiCheckCircle className="w-3 h-3 text-[#81D7B4] flex-shrink-0" />
                                  <span>Check your wallet connection</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <HiCheckCircle className="w-3 h-3 text-[#81D7B4] flex-shrink-0" />
                                  <span>Verify you have sufficient balance</span>
                                </li>
                                <li className="flex items-center gap-2">
                                  <HiCheckCircle className="w-3 h-3 text-[#81D7B4] flex-shrink-0" />
                                  <span>Ensure you're on the correct network</span>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Telegram Support Button for errors (excluding user rejected) */}
                    {error && error !== 'Error creating savings user rejected' && (
                      <div className="mt-6">
                        <button
                          onClick={() => window.open('https://t.me/bitsaveprotocol/2', '_blank')}
                          className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#0088cc] to-[#006ba1] rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                          aria-label="Get help on Telegram"
                        >
                          <span className="absolute inset-0 bg-white/20 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                          <svg className="w-5 h-5 mr-2 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.617-1.407 3.08-2.896 1.596l-2.123-1.596-1.018.96c-.11.11-.202.202-.418.202-.286 0-.237-.107-.335-.38L9.9 13.74l-3.566-1.199c-.778-.244-.79-.778.173-1.16L18.947 6.84c.636-.295 1.295.173.621 1.32z" />
                          </svg>
                          <span className="relative z-10">Get Help on Telegram</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Enhanced Transaction ID Button (only on success or error, not on cancel) */}
              {txHash && (success || (error && error !== 'Error creating savings user rejected')) && (
                <div className="mb-4">
                  <button
                    className="group w-full py-3 sm:py-3.5 border-2 border-gray-200 rounded-2xl text-gray-700 text-sm sm:text-base font-semibold hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-300 flex items-center justify-center gap-2"
                    aria-label="View transaction on block explorer"
                    onClick={() => window.open(
                      chain === 'celo'
                        ? `https://explorer.celo.org/tx/${txHash}`
                        : chain === 'lisk'
                          ? `https://blockscout.lisk.com/tx/${txHash}`
                          : chain === 'avalanche'
                            ? `https://snowtrace.io/tx/${txHash}`
                            : chain === 'bsc'
                              ? `https://bscscan.com/tx/${txHash}`
                              : `https://basescan.org/tx/${txHash}`,
                      '_blank'
                    )}
                  >
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on Block Explorer
                  </button>
                </div>
              )}

              {/* Enhanced Tweet Button (only on success) */}
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
                  <div className="mb-4">
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
                      className="group w-full py-3 sm:py-3.5 bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.209c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        Share on X
                      </span>
                    </a>
                  </div>
                );
              })()}

              {/* Enhanced Action Buttons */}
              <div className="flex w-full gap-3 sm:gap-4 flex-col sm:flex-row">
                <button
                  className={`group relative w-full py-3 sm:py-3.5 rounded-2xl text-white text-sm sm:text-base font-semibold transition-all duration-300 transform hover:scale-105 ${success
                    ? 'bg-gradient-to-r from-[#81D7B4] to-[#6bc4a1] hover:shadow-lg hover:shadow-green-500/25'
                    : error === 'Error creating savings user rejected'
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 hover:shadow-lg hover:shadow-yellow-500/25'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:shadow-lg hover:shadow-gray-500/25'
                    }`}
                  onClick={handleCloseTransactionModal}
                  aria-label="Close modal"
                >
                  <span className="absolute inset-0 bg-white/20 rounded-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300"></span>
                  <span className="relative z-10">
                    {success ? '🎉 Go to Dashboard' : error === 'Error creating savings user rejected' ? 'Close' : 'Close'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stepper Progress Indicator */}
      <div className="max-w-3xl mx-auto mt-6 sm:mt-8 mb-8 sm:mb-12 px-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-[#81D7B4] rounded-full -z-10 transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${
                step >= 1 
                  ? 'bg-[#81D7B4] border-[#81D7B4] text-white shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {step > 1 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="font-bold">1</span>
              )}
            </div>
            <span className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 1 ? 'text-[#2D5A4A]' : 'text-gray-400'}`}>Plan Details</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${
                step >= 2 
                  ? 'bg-[#81D7B4] border-[#81D7B4] text-white shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              {step > 2 ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="font-bold">2</span>
              )}
            </div>
            <span className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 2 ? 'text-[#2D5A4A]' : 'text-gray-400'}`}>Configuration</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${
                step >= 3 
                  ? 'bg-[#81D7B4] border-[#81D7B4] text-white shadow-lg scale-110' 
                  : 'bg-white border-gray-200 text-gray-400'
              }`}
            >
              <span className="font-bold">3</span>
            </div>
            <span className={`mt-2 text-xs sm:text-sm font-semibold transition-colors duration-300 ${step >= 3 ? 'text-[#2D5A4A]' : 'text-gray-400'}`}>Review</span>
          </div>
        </div>
      </div>
      <motion.div
        className="max-w-3xl mx-auto min-h-[70vh] flex flex-col justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress bar now rendered at top outside the centered container */}

        {/* Card container: ensure dropdowns can overflow above */}
        <div className={(step === 1 || step === 2) ? 'overflow-visible relative' : 'bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative'}>

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
                {/* Step 1: Plan Fundamentals (Name, Network, Token) */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    <motion.div 
                      className="text-center mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#81D7B4] to-[#6bc5a0] rounded-full mb-4 shadow-lg">
                        <HiOutlineDocumentText className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Plan Details</h2>
                      <p className="text-gray-600 max-w-md mx-auto">Start by naming your plan and choosing your network.</p>
                    </motion.div>

                    <div className="space-y-8 max-w-3xl mx-auto">
                      {/* Name Input */}
                      <motion.div 
                        variants={itemVariants}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg"
                      >
                         <label htmlFor="planName" className="block text-sm font-bold text-gray-700 mb-2">Plan Name</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-focus-within:text-[#81D7B4] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="planName"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Dream Vacation, New Laptop"
                              className={`w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 text-gray-900 text-lg sm:text-xl font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-[#81D7B4]/10 transition-all ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#81D7B4]'}`}
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                         </div>
                         
                         {/* Quick Presets */}
                         <div className="mt-4 flex flex-wrap gap-2">
                            {['Emergency Fund', 'Rent', 'Fees', 'Vacation', 'Car', 'Gadget'].map((preset) => (
                              <motion.button
                                key={preset}
                                type="button"
                                onClick={() => setName(preset)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-[#81D7B4] hover:text-[#81D7B4] hover:shadow-sm transition-all"
                              >
                                {preset}
                              </motion.button>
                            ))}
                         </div>
                      </motion.div>

                      {/* Network Selection */}
                      <motion.div 
                        variants={itemVariants}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg relative z-20"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Network</h3>
                        <div className="relative" ref={networkDropdownRef}>
                          <motion.button
                            type="button"
                            onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 bg-white ${isNetworkDropdownOpen ? 'border-[#81D7B4] ring-2 ring-[#81D7B4]/20' : 'border-gray-200 hover:border-[#81D7B4]/50'}`}
                            aria-haspopup="listbox"
                            aria-expanded={isNetworkDropdownOpen}
                          >
                            <div className="flex items-center">
                              <div className="relative w-8 h-8 mr-3 flex-shrink-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                                <Image 
                                  src={chains.find(c => c.id === chain)?.logo || '/default-network.png'} 
                                  alt={chains.find(c => c.id === chain)?.name || 'Network'} 
                                  fill 
                                  className="object-contain p-0.5" 
                                />
                              </div>
                              <span className="font-bold text-gray-900 text-lg">
                                {chains.find(c => c.id === chain)?.name || 'Select Network'}
                              </span>
                            </div>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${isNetworkDropdownOpen ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.button>

                          <AnimatePresence>
                            {isNetworkDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-20 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                              >
                                <div className="max-h-64 overflow-y-auto py-1">
                                  {chains.map((c) => (
                                    <button
                                      key={c.id}
                                      type="button"
                                      disabled={c.isComingSoon}
                                      onClick={() => {
                                        if (!c.isComingSoon) {
                                          setChain(c.id);
                                          switchToNetwork(c.id);
                                          setIsNetworkDropdownOpen(false);
                                        }
                                      }}
                                      className={`w-full flex items-center justify-between p-3 px-4 hover:bg-gray-50 transition-colors ${chain === c.id ? 'bg-[#81D7B4]/5' : ''} ${c.isComingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                      role="option"
                                      aria-selected={chain === c.id}
                                    >
                                      <div className="flex items-center">
                                        <div className="relative w-8 h-8 mr-3 flex-shrink-0 bg-white rounded-full p-0.5 border border-gray-100">
                                          <Image src={c.logo} alt={c.name} fill className="object-contain p-0.5" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                          <span className={`font-medium ${chain === c.id ? 'text-[#2D5A4A]' : 'text-gray-900'}`}>{c.name}</span>
                                          {c.isComingSoon && <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">Coming Soon</span>}
                                        </div>
                                      </div>
                                      {chain === c.id && (
                                        <HiCheckCircle className="w-5 h-5 text-[#81D7B4]" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>

                      {/* Token Selection */}
                      <motion.div 
                        variants={itemVariants}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Currency</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {NETWORKS.find(n => n.id === chain)?.tokens.map((curr) => (
                            <motion.button
                              key={curr.symbol}
                              type="button"
                              onClick={() => setCurrency(curr.symbol)}
                              aria-label={`Select ${curr.symbol} currency`}
                              aria-pressed={currency === curr.symbol}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all relative ${currency === curr.symbol ? 'border-[#81D7B4] bg-[#81D7B4]/5 ring-1 ring-[#81D7B4] shadow-md' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'}`}
                            >
                               {currency === curr.symbol && (
                                 <div className="absolute top-2 right-2 text-[#81D7B4]">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                   </svg>
                                 </div>
                               )}
                               <div className="relative w-12 h-12 mb-3 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                  <Image 
                                    src={
                                      curr.symbol === 'Gooddollar' ? '/$g.png'
                                      : curr.symbol === 'cUSD' ? '/cusd.png'
                                      : curr.symbol === 'USDGLO' ? '/usdglo.png'
                                      : curr.symbol === 'USDC' ? '/usdclogo.png'
                                      : curr.symbol === 'cNGN' ? '/cngn.png'
                                      : `/${curr.symbol.toLowerCase().replace('$', '')}.png`
                                    }
                                    alt={curr.symbol} 
                                    fill 
                                    className="object-contain p-1" 
                                  />
                               </div>
                               <div className="font-bold text-gray-900 text-lg">{curr.symbol}</div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>

                      <div className="pt-4 flex justify-end">
                        <motion.button
                          type="button"
                          onClick={handleNext}
                          disabled={!name.trim()}
                          aria-label="Go to next step"
                          whileHover={name.trim() ? { scale: 1.02, x: 2 } : {}}
                          whileTap={name.trim() ? { scale: 0.98 } : {}}
                          className={`inline-flex items-center px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${name.trim() ? 'bg-gradient-to-r from-[#81D7B4] to-[#6bc5a0] hover:shadow-xl' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                          Next Step
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Plan Settings (Amount, Currency, Network, Duration, Penalties) */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    {/* Enhanced Step 2 Header */}
                    <motion.div
                      className="mb-8 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#81D7B4] to-[#6bc5a0] rounded-full mb-4 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <motion.h2
                        className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                      >
                        Configure Your Plan
                      </motion.h2>
                      <motion.p
                        className="text-base sm:text-lg text-gray-600 max-w-md mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Set your savings amount and define your timeline
                      </motion.p>
                    </motion.div>

                    <motion.div
                      className="space-y-6 sm:space-y-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Amount - Enhanced with better visual hierarchy */}
                      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">How much do you want to save?</h3>
                            <p className="text-sm text-gray-600">Choose your target savings amount</p>
                          </div>
                          <div className="w-10 h-10 bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>

                        <div className="relative mb-6">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-2xl font-bold">$</span>
                          </div>
                          <input
                            type="text"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            aria-label="Savings Amount"
                            className={`w-full pl-10 pr-24 py-5 bg-white rounded-xl border-2 text-gray-900 text-3xl font-bold tracking-tight shadow-sm focus:outline-none focus:ring-4 focus:ring-[#81D7B4]/10 transition-all ${errors.amount ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#81D7B4]'}`}
                          />
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <div className="bg-gray-100 rounded-lg px-3 py-1.5 flex items-center space-x-2">
                              {currency === 'Gooddollar' ? (
                                <Image src="/$g.png" alt="$G" width={20} height={20} className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-bold text-gray-600">{currency}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick amount cards - Enhanced */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          {[
                            { value: '10' },
                            { value: '100' },
                            { value: '500' },
                            { value: '1000' }
                          ].map((option) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => setAmount(option.value)}
                              aria-label={`Select $${option.value} amount`}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${amount === option.value
                                ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#2D5A4A] shadow-md'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-[#81D7B4]/50 hover:shadow-sm'
                                }`}
                            >
                              <div className="font-bold text-lg sm:text-xl">${option.value}</div>
                            </motion.button>
                          ))}
                        </div>
                        {errors.amount && <p className="mt-2 text-sm text-red-500 font-medium">{errors.amount}</p>}

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





                      {/* Date selection - enhanced */}
                      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Savings Duration</h3>
                            <p className="text-sm text-gray-600">Set your savings timeline and end date</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Your savings will start today. Choose an end date at least 30 days from now to maximize your returns.
                        </p>

                        {/* Quick preset buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                          {startDate && [
                            { label: '1 Month', days: 30 },
                            { label: '2 Months', days: 60 },
                            { label: '6 Months', days: 180 },
                            { label: '1 Year', days: 365 }
                          ].map((preset) => {
                            const presetDate = new Date(startDate);
                            presetDate.setDate(presetDate.getDate() + preset.days);
                            const isSelected = endDate && format(presetDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');

                            return (
                              <motion.button
                                key={preset.label}
                                type="button"
                                onClick={() => {
                                  setEndDate(presetDate);
                                  setCalendarNavigateDate(presetDate);
                                }}
                                aria-label={`Select ${preset.label} duration`}
                                 aria-pressed={!!isSelected}
                                 whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center relative overflow-hidden ${isSelected
                                  ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#2D5A4A] shadow-md'
                                  : 'bg-white border-gray-100 text-gray-600 hover:border-[#81D7B4]/50 hover:shadow-sm'
                                  }`}
                              >
                                <div className="font-bold text-sm">{preset.label}</div>
                                <div className="text-xs opacity-75">{preset.days} days</div>
                                {isSelected && (
                                  <motion.div
                                    layoutId="selectedCheck"
                                    className="absolute top-1 right-1 text-[#81D7B4]"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </motion.div>
                                )}
                              </motion.button>
                            );
                          })
                          }
                        </div>

                        <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <CustomDatePicker
                            selectedDate={endDate}
                            onSelectDate={(date) => setEndDate(date)}
                            navigateToDate={calendarNavigateDate}
                          />
                        </div>

                        {startDate && endDate && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-[#81D7B4]/10 to-[#6bc5a0]/10 rounded-xl p-6 border border-[#81D7B4]/30 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#81D7B4]/20 rounded-full blur-xl"></div>
                            
                            <div className="flex items-center mb-4 relative z-10">
                              <div className="w-8 h-8 bg-[#81D7B4] rounded-lg flex items-center justify-center mr-3 shadow-sm text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-lg font-bold text-gray-800">
                                Total Duration: <span className="text-[#2D5A4A]">{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days</span>
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm relative z-10 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
                              <div className="text-center">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</div>
                                <div className="text-gray-900 font-bold text-base">
                                  {format(startDate, 'MMM d, yyyy')}
                                </div>
                              </div>
                              <div className="flex-1 px-4 flex justify-center">
                                <div className="w-full max-w-[100px] h-1 bg-gradient-to-r from-gray-200 via-[#81D7B4] to-gray-200 rounded-full relative">
                                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#81D7B4] rounded-full shadow-sm"></div>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">End Date</div>
                                <div className="text-gray-900 font-bold text-base">
                                  {format(endDate, 'MMM d, yyyy')}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        {errors.endDate && <p className="mt-4 text-sm text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.endDate}
                        </p>}
                      </motion.div>

                      {/* Penalties - enhanced */}
                      <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Early Withdrawal Penalty</h3>
                            <p className="text-sm text-gray-600">Choose a penalty to stay committed to your goal</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                          Setting a penalty helps you stay committed to your savings goal. If you withdraw funds before the end date, this percentage will be deducted from your savings.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                          {penalties.map((p, index) => (
                            <motion.button
                              key={p}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05) }}
                              type="button"
                              onClick={() => setPenalty(p)}
                              aria-label={`Select ${p} penalty`}
                              aria-pressed={penalty === p}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center relative overflow-hidden ${penalty === p
                                ? 'bg-[#81D7B4]/10 border-[#81D7B4] text-[#2D5A4A] shadow-md'
                                : 'bg-white border-gray-100 text-gray-600 hover:border-[#81D7B4]/50 hover:shadow-sm'
                                }`}
                            >
                              <div className="text-2xl font-bold mb-1">{p}</div>
                              <div className="text-xs font-semibold uppercase tracking-wider opacity-75">Penalty</div>
                              {penalty === p && (
                                <motion.div
                                  layoutId="selectedPenaltyCheck"
                                  className="absolute top-2 right-2 text-[#81D7B4]"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </motion.div>
                              )}
                            </motion.button>
                          ))}
                        </div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start text-sm text-gray-600 bg-amber-50 p-5 rounded-xl border border-amber-100 shadow-sm"
                        >
                          <div className="bg-amber-100 p-2 rounded-lg mr-4 flex-shrink-0 text-amber-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                             </svg>
                          </div>
                          <div>
                            <div className="font-bold text-amber-900 mb-1 text-base">Penalty Impact Analysis</div>
                            <div className="leading-relaxed">
                              With a <span className="font-bold text-amber-700 bg-amber-100 px-1 rounded">{penalty}</span> penalty, if you withdraw early:
                              <ul className="mt-2 space-y-1 list-disc list-inside text-amber-800/80">
                                <li>Principal Amount: <strong>${amount || '1000'}</strong></li>
                                <li>Penalty Fee: <strong className="text-red-600">-${(Number(amount || '1000') * parseFloat(penalty) / 100).toFixed(2)}</strong></li>
                                <li>You Receive: <strong className="text-green-700">${(Number(amount || '1000') * (100 - parseFloat(penalty)) / 100).toFixed(2)}</strong></li>
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    <motion.div
                      className="mt-8 sm:mt-10 flex flex-row flex-wrap justify-between gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button
                        type="button"
                        onClick={handlePrevious}
                        aria-label="Go to previous step"
                        whileHover={{ scale: 1.02, x: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-200 group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:translate-x-[-2px] transition-transform" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        aria-label="Review savings plan"
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center px-8 sm:px-10 py-4 bg-gradient-to-r from-[#81D7B4] to-[#6bc5a0] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:brightness-105 transition-all duration-200 group"
                      >
                        Review Plan
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 group-hover:translate-x-[2px] transition-transform" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
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
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="p-4 sm:p-6 md:p-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                      className="text-center mb-8"
                    >
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 rounded-2xl mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <motion.h2
                        className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Review Your Plan
                      </motion.h2>
                      <motion.p
                        className="text-gray-600 text-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Double-check your savings plan details before creating
                      </motion.p>
                    </motion.div>

                    <motion.div
                      className="space-y-6 max-w-4xl mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Main Amount Card - Hero Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden"
                      >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#81D7B4]/10 to-transparent rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#6bc5a0]/10 to-transparent rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>

                        <div className="relative z-10">
                          {/* Plan Name */}
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center mb-6"
                          >
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{name || "My Savings Plan"}</h3>
                            <div className="inline-flex items-center space-x-2 bg-[#81D7B4]/10 rounded-full px-4 py-2">
                              <div className="flex items-center space-x-1">
                                <div className="bg-white rounded-full p-1 shadow-sm">
                                  <Image
                                    src={
                                      currency === 'Gooddollar' ? '/$g.png'
                                        : currency === 'cUSD' ? '/cusd.png'
                                          : currency === 'USDGLO' ? '/usdglo.png'
                                            : currency === 'USDC' ? '/usdclogo.png'
                                              : `/${currency.toLowerCase().replace('$', '')}.png`
                                    }
                                    alt={currency}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{currency}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <div className="flex items-center space-x-1">
                                {chains.map(c => c.id === chain && (
                                  <div key={c.id} className="flex items-center space-x-1">
                                    <div className="bg-white rounded-full p-1 shadow-sm">
                                      <Image src={c.logo} alt={c.name} width={16} height={16} className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{c.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>

                          {/* Amount Display */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="text-center"
                          >
                            <div className="inline-flex items-baseline space-x-2">
                              <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                ${amount || "0.00"}
                              </span>
                              <span className="text-xl text-gray-500 font-medium">{currency}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">Total Savings Amount</div>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Plan Details Grid */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        {/* Timeline Card */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#81D7B4]/20 to-[#6bc5a0]/20 rounded-xl flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Timeline</h4>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Start Date</span>
                              <span className="text-sm font-medium text-gray-800">
                                {startDate ? format(startDate, 'MMM d, yyyy') : 'Today'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">End Date</span>
                              <span className="text-sm font-medium text-gray-800">
                                {endDate ? format(endDate, 'MMM d, yyyy') : 'Not selected'}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Duration</span>
                                <span className="text-sm font-semibold text-[#81D7B4]">
                                  {startDate && endDate
                                    ? `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days`
                                    : 'Not calculated'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>

                        {/* Penalty Card */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Early Withdrawal</h4>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Penalty Rate</span>
                              <span className="inline-flex items-center bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-sm font-semibold">
                                {penalty}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Penalty Amount</span>
                              <span className="text-sm font-medium text-gray-800">
                                ${(Number(amount || '0') * parseFloat(penalty) / 100).toFixed(2)}
                              </span>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">You'd Receive</span>
                                <span className="text-sm font-semibold text-green-700">
                                  ${(Number(amount || '0') * (100 - parseFloat(penalty)) / 100).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Cost Info Card */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-r from-[#81D7B4]/5 to-[#6bc5a0]/5 rounded-xl p-4 border border-[#81D7B4]/20"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#81D7B4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-[#2D5A4A]">$1</span> creation fee required
                              {savingsData.deposits === 0 && (
                                <>
                                  {' • '}<span className="font-semibold text-[#2D5A4A]">$1</span> join fee for first-time users
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Comprehensive Penalties Information Section - Collapsible (compact) */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="rounded-xl relative overflow-hidden"
                      >
                        {/* Background decorative elements removed */}

                        <div className="relative z-10">
                          {/* Collapsible Header */}
                          <button
                            onClick={() => setPenaltiesExpanded(!penaltiesExpanded)}
                            className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-[#81D7B4]/5 transition-colors duration-200 rounded-xl"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-9 h-9 bg-[#81D7B4] rounded-lg flex items-center justify-center">
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
                      className="mt-8 sm:mt-10 flex flex-row flex-wrap justify-between gap-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button
                        type="button"
                        onClick={handlePrevious}
                        aria-label="Go to previous step"
                        whileHover={{ scale: 1.02, x: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-200 group"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:translate-x-[-2px] transition-transform" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || isLoading || !termsAgreed}
                        aria-busy={submitting || isLoading}
                        aria-label={submitting || isLoading ? "Creating Savings Plan" : "Create Savings Plan"}
                        whileHover={!(submitting || isLoading || !termsAgreed) ? { scale: 1.02, x: 2 } : {}}
                        whileTap={!(submitting || isLoading || !termsAgreed) ? { scale: 0.98 } : {}}
                        className={`inline-flex items-center justify-center px-8 sm:px-10 py-4 font-bold rounded-xl shadow-xl transition-all duration-200 group ${submitting || isLoading || !termsAgreed
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-[#81D7B4] to-[#6bc5a0] text-white hover:shadow-2xl hover:brightness-105'
                          }`}
                      >
                        {(submitting || isLoading) ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Plan...
                          </>
                        ) : (
                          <>
                            Create Savings Plan
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-3 group-hover:translate-x-[2px] transition-transform" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Wallet Recommendation Modal */}
      <WalletRecommendationModal
        isOpen={shouldShowModal}
        onClose={dismissRecommendation}
        onDontShowAgain={() => { }}
        currentWallet={walletInfo?.name || 'Unknown Wallet'}
      />
    </div>
  )
}