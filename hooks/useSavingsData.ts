/**
 * Custom Hook for Savings Data with Caching
 * 
 * This hook provides a comprehensive solution for fetching and caching user savings data.
 * It implements a cache-first strategy with background updates for optimal performance.
 * 
 * Features:
 * - Immediate display of cached data
 * - Background fetching and cache updates
 * - Error handling with fallback to cached data
 * - Automatic cache invalidation
 * - Loading states for both initial and background fetches
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import axios from 'axios';
import { useBitsaveSolana } from './useBitsaveSolana';
import {
  SavingsData,
  cacheSavingsData,
  getCachedSavingsData,
  needsBackgroundRefresh,
  clearCachedSavingsData
} from '../utils/savingsCache';
import { handleContractError } from '../lib/contractErrorHandler';

// Import contract ABIs and addresses
import BitSaveABI from '../app/abi/contractABI.js';
import childContractABI from '../app/abi/childContractABI.js';


const DEBUG = process.env.NODE_ENV === 'development';

// Contract addresses for different networks
// Base network - dual contract support
const BASE_CONTRACT_ADDRESS_OLD = "0x3593546078eecd0ffd1c19317f53ee565be6ca13"; // For existing savings
const BASE_CONTRACT_ADDRESS_NEW = "0x67FFa7a1eb0D05BEaF9dB039c1bD604063040be9"; // For new savings
const BASE_CONTRACT_MIGRATION_DATE = new Date('2026-02-05T00:00:00Z').getTime() / 1000; // Unix timestamp

// Other networks
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const BSC_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";
const HEDERA_CONTRACT_ADDRESS = "0x2f33f1f07f6e56c11fd48a4f3596d9dadfe67409";
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";

// Network chain IDs
const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);
const LISK_CHAIN_ID = BigInt(1135);
const BSC_CHAIN_ID = BigInt(56);
const HEDERA_CHAIN_ID = BigInt(296);
const AVALANCHE_CHAIN_ID = BigInt(43114);

// Token mapping for Celo network
const CELO_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  "0x765de816845861e75a25fca122bb6898b8b1282a": { name: "cUSD", decimals: 18, logo: "/cusd.png" },
  "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3": { name: "USDGLO", decimals: 18, logo: "/usdglo.png" },
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": { name: "USDC", decimals: 6, logo: "/usdclogo.png" },
  "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a": { name: "Gooddollar", decimals: 18, logo: "/$g.png" }
};

// Token mapping for Hedera network
const HEDERA_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  [HEDERA_CONTRACT_ADDRESS]: { name: "HBAR", decimals: 18, logo: "/hedera-logo.svg" }
};

const AVALANCHE_USDC_E = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664";

// Token mapping for Solana Devnet mock tokens
const SOLANA_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  "cb8mk8fag4qa3h6mhaghfnp86j15gwzhowvm9jz9zod": { name: "USDC", decimals: 6, logo: "/usdclogo.png" },
  "cawshfepcyuzukezvrbskphrfsmsdpyjtkdydjpisi": { name: "USDT", decimals: 6, logo: "/usdt.png" },
  "9jguwzdzncczkcddojkndsb4yjaglimxg9mdwvkk1eyw": { name: "cNGN", decimals: 6, logo: "/cngn.png" }
};

interface UseSavingsDataReturn {
  savingsData: SavingsData;
  isLoading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;
  ethPrice: number;
  currentNetwork: any;
  isBaseNetwork: boolean;
  isCeloNetwork: boolean;
  isLiskNetwork: boolean;
  isBSCNetwork: boolean;
  isHederaNetwork: boolean;
  isAvalancheNetwork: boolean;
  isSolanaNetwork: boolean;
  isCorrectNetwork: boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  forceRefreshNetworkState: () => void;
}

// Default empty savings data
const defaultSavingsData: SavingsData = {
  totalLocked: "0.00",
  deposits: 0,
  rewards: "0.00",
  currentPlans: [],
  completedPlans: []
};

// Helper function to determine which Base contract to use
const getBaseContractAddress = (creationTimestamp?: number): string => {
  // If no timestamp provided or it's before migration date, use old contract
  if (!creationTimestamp || creationTimestamp < BASE_CONTRACT_MIGRATION_DATE) {
    return BASE_CONTRACT_ADDRESS_OLD;
  }
  // Otherwise use new contract
  return BASE_CONTRACT_ADDRESS_NEW;
};

export function useSavingsData(): UseSavingsDataReturn {


  // Wagmi hooks for wallet connection
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const chainId = useChainId();
  
  // Solana hook
  const { publicKey } = useWallet();
  const solanaWalletAdapterAddress = publicKey?.toBase58();
  const { getUserSavings } = useBitsaveSolana();

  // Privy hooks for authentication state
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  // Detect Solana wallet from all Privy sources including MetaMask Solana
  const privySolanaWallet = wallets?.find((w: any) => {
    if (w.chainType === 'solana') return true;
    if (['phantom', 'solflare', 'backpack'].includes(w.walletClientType)) return true;
    if (w.chainId && String(w.chainId).startsWith('solana')) return true;
    // Any wallet with a Solana-style address (base58, 32-44 chars, not 0x-prefixed)
    if (w.address && !w.address.startsWith('0x') && w.address.length >= 32 && w.address.length <= 44) return true;
    return false;
  });
  // Also check Privy user's linked accounts for Solana wallet addresses
  const privyLinkedSolanaAddress = (user as any)?.linkedAccounts?.find(
    (account: any) => (account.type === 'wallet' && account.chainType === 'solana') || account.chainId === 'solana:mainnet'
  )?.address;
  const solanaAddress = solanaWalletAdapterAddress || privySolanaWallet?.address || privyLinkedSolanaAddress;

  // Network overrides from storage
  const activeNetwork = typeof window !== 'undefined' ? localStorage.getItem('bitsave_active_network') : null;
  // Consider Solana active if localStorage says so OR if user has a connected Solana wallet
  const isSolanaActive = activeNetwork === 'solana' || (!!solanaAddress && !wagmiAddress);

  // Use Privy's wallet address as fallback, prioritizing wagmi address
  const evmAddress = wagmiAddress || user?.wallet?.address as `0x${string}` | undefined;
  
  // The effective address based on the active network (fall back to EVM address if no Solana wallet)
  const address = isSolanaActive ? (solanaAddress || evmAddress) : evmAddress;
  
  // Consider connected if either Privy is authenticated, wagmi is connected, or solana wallet is connected
  const isConnected = isSolanaActive ? (!!solanaAddress || (ready && authenticated) || isWagmiConnected) : ((ready && authenticated) || isWagmiConnected);


  // State management - initialize from cache synchronously to avoid empty flash
  const [savingsData, setSavingsData] = useState<SavingsData>(() => {
    // Try to load cached data synchronously on first render
    if (typeof window !== 'undefined' && address) {
      const networkKey = isSolanaActive ? 'solana' : 'all-chains';
      const cached = getCachedSavingsData(address, networkKey);
      if (cached) {
        if (DEBUG) console.log('Initialized with cached savings data');
        return cached;
      }
    }
    return defaultSavingsData;
  });
  // Start loading as true - will be set to false once data is ready or if wallet isn't connected
  const [isLoading, setIsLoading] = useState(true);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState(3500);
  const [currentNetwork, setCurrentNetwork] = useState<any>(null);
  const [isBaseNetwork, setIsBaseNetwork] = useState(false);
  const [isCeloNetwork, setIsCeloNetwork] = useState(false);
  const [isLiskNetwork, setIsLiskNetwork] = useState(false);
  const [isBSCNetwork, setIsBSCNetwork] = useState(false);
  const [isHederaNetwork, setIsHederaNetwork] = useState(false);
  const [isAvalancheNetwork, setIsAvalancheNetwork] = useState(false);
  const [isSolanaNetwork, setIsSolanaNetwork] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Determine current network string identifier
  useEffect(() => {
    if (isSolanaNetwork) {
      setCurrentNetwork('solana');
    } else if (isBaseNetwork) {
      setCurrentNetwork('base');
    } else if (isCeloNetwork) {
      setCurrentNetwork('celo');
    } else if (isLiskNetwork) {
      setCurrentNetwork('lisk');
    } else if (isBSCNetwork) {
      setCurrentNetwork('bsc');
    } else if (isHederaNetwork) {
      setCurrentNetwork('hedera');
    } else if (isAvalancheNetwork) {
      setCurrentNetwork('avalanche');
    } else {
      setCurrentNetwork(null);
    }
  }, [isBaseNetwork, isCeloNetwork, isLiskNetwork, isBSCNetwork, isHederaNetwork, isAvalancheNetwork, isSolanaNetwork]);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update network states based on wagmi chainId
  useEffect(() => {
    // Also check local storage for manually selected network overrides
    // or solana wallet adapter connection
    const activeNetwork = localStorage.getItem('bitsave_active_network');
    const isSolana = activeNetwork === 'solana' || !!solanaAddress;

    if (!chainId && !isSolana) {
      setIsBaseNetwork(false);
      setIsCeloNetwork(false);
      setIsLiskNetwork(false);
      setIsBSCNetwork(false);
      setIsHederaNetwork(false);
      setIsAvalancheNetwork(false);
      setIsSolanaNetwork(false);
      setIsCorrectNetwork(false);
      return;
    }

    if (isSolana) {
      setIsSolanaNetwork(true);
      setIsBaseNetwork(false);
      setIsCeloNetwork(false);
      setIsLiskNetwork(false);
      setIsBSCNetwork(false);
      setIsHederaNetwork(false);
      setIsAvalancheNetwork(false);
      setIsCorrectNetwork(true);
      return;
    }

    if (!chainId) return;

    const chainIdBigInt = BigInt(chainId);
    const isBase = chainIdBigInt === BASE_CHAIN_ID;
    const isCelo = chainIdBigInt === CELO_CHAIN_ID;
    const isLisk = chainIdBigInt === LISK_CHAIN_ID;
    const isBSC = chainIdBigInt === BSC_CHAIN_ID;
    const isHedera = chainIdBigInt === HEDERA_CHAIN_ID;
    const isAvalanche = chainIdBigInt === AVALANCHE_CHAIN_ID;

    setIsSolanaNetwork(false);
    setIsBaseNetwork(isBase);
    setIsCeloNetwork(isCelo);
    setIsLiskNetwork(isLisk);
    setIsBSCNetwork(isBSC);
    setIsHederaNetwork(isHedera);
    setIsAvalancheNetwork(isAvalanche);

    // Check if user is on one of the supported EVM networks
    const isSupported = isBase || isCelo || isLisk || isBSC || isAvalanche || isHedera;
    setIsCorrectNetwork(isSupported);
  }, [chainId, solanaAddress]);

  // Handle initial loading state when wallet connection changes
  // Don't reset when chainId is missing if Solana is the active network
  useEffect(() => {
    const activeNetwork = localStorage.getItem('bitsave_active_network');
    const isSolanaActive = activeNetwork === 'solana' || !!solanaAddress;
    
    if (!isConnected || !address || (!chainId && !isSolanaActive)) {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setIsBackgroundLoading(false);
      setError(null);
    }
  }, [isConnected, address, chainId, solanaAddress]);

  // Network Configurations
  const NETWORKS_CONFIG = [
    {
      chainId: BASE_CHAIN_ID,
      rpcUrl: 'https://base.publicnode.com',
      contractAddress: BASE_CONTRACT_ADDRESS_OLD, // Use old contract to fetch existing savings
      name: 'Base'
    },
    {
      chainId: BASE_CHAIN_ID,
      rpcUrl: 'https://base.publicnode.com',
      contractAddress: BASE_CONTRACT_ADDRESS_NEW, // Use new contract to fetch new savings
      name: 'Base'
    },
    {
      chainId: CELO_CHAIN_ID,
      rpcUrl: 'https://forno.celo.org',
      contractAddress: CELO_CONTRACT_ADDRESS,
      name: 'Celo'
    },
    {
      chainId: LISK_CHAIN_ID,
      rpcUrl: 'https://rpc.api.lisk.com',
      contractAddress: LISK_CONTRACT_ADDRESS,
      name: 'Lisk'
    },
    {
      chainId: BSC_CHAIN_ID,
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      contractAddress: BSC_CONTRACT_ADDRESS,
      name: 'BSC'
    },
    {
      chainId: HEDERA_CHAIN_ID,
      rpcUrl: 'https://testnet.hashio.io/api',
      contractAddress: HEDERA_CONTRACT_ADDRESS,
      name: 'Hedera'
    },
    {
      chainId: AVALANCHE_CHAIN_ID,
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      contractAddress: AVALANCHE_CONTRACT_ADDRESS,
      name: 'Avalanche'
    }
  ];

  // Fetch ETH price from CoinGecko
  const fetchEthPrice = useCallback(async (): Promise<number> => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data?.ethereum?.usd || 3500;
    } catch (error) {
      if (DEBUG) console.warn("Using fallback ETH price (API Error)");
      return 3500; // Fallback price
    }
  }, []);

  // Fetch GoodDollar price from CoinGecko
  const fetchGoodDollarPrice = useCallback(async (): Promise<number> => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd"
      );
      return response.data?.gooddollar?.usd || 0.0001086;
    } catch (error) {
      if (DEBUG) console.warn("Using fallback GoodDollar price (API Error)");
      return 0.0001086; // Fallback price
    }
  }, []);

  // Main function to fetch savings data from blockchain
  const fetchSavingsDataFromBlockchain = useCallback(async (
    isBackgroundFetch = false
  ): Promise<SavingsData | null> => {
    if (!isConnected || !address) {
      return null;
    }

    // Check if Solana is the active network
    const activeNetwork = localStorage.getItem('bitsave_active_network');
    const isSolanaActiveForFetch = activeNetwork === 'solana' || (!!solanaAddress && !wagmiAddress);

    if (isSolanaActiveForFetch) {
      if (DEBUG) console.log(`=== Starting Solana savings fetch for user: ${address} ===`);
      try {
        if (isBackgroundFetch) {
          setIsBackgroundLoading(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const solanaSavings = await getUserSavings();
        const currentPlans: any[] = [];
        const completedPlans: any[] = [];
        let totalLockedUsd = 0;
        let depositsCount = 0;

        const now = Math.floor(Date.now() / 1000);

        for (const item of solanaSavings) {
          const account = item.account as any;
          // Temporarily removing isValid check in case it's undefined on older program deployments
          // if (!account.isValid) continue;

          const mintStr = account.tokenMint.toBase58().toLowerCase();
          const tokenInfo = SOLANA_TOKEN_MAP[mintStr] || { name: "USDC", decimals: 6, logo: "/usdclogo.png" };

          const amountVal = Number(account.amount.toString()) / Math.pow(10, tokenInfo.decimals);
          const amountFormatted = amountVal.toString();

          let price = 1.0;
          if (tokenInfo.name === "cNGN") {
            price = 0.00067; // 1 NGN to USD
          }
          const usdValue = amountVal * price;
          totalLockedUsd += usdValue;

          const startTime = Number(account.startTime.toString());
          const maturityTime = Number(account.maturityTime.toString());

          let progress = 0;
          if (maturityTime <= startTime || now >= maturityTime) {
            progress = 100;
          } else {
            progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);
          }

          const isCompleted = progress >= 100;

          const plan = {
            id: account.name,
            name: account.name,
            amount: amountFormatted,
            currentAmount: amountFormatted,
            startTime,
            maturityTime,
            isEth: false,
            tokenName: tokenInfo.name,
            tokenLogo: tokenInfo.logo,
            progress,
            status: isCompleted ? 'Completed' : 'Active',
            timeLeft: isCompleted ? 'Completed' : `${Math.ceil((maturityTime - now) / 86400)} days`,
            penalty: account.penaltyPercentage.toString(),
            penaltyPercentage: account.penaltyPercentage,
            network: 'Solana',
            chainId: 0,
            contractAddress: "2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ"
          };

          if (isCompleted) {
            completedPlans.push(plan);
          } else {
            currentPlans.push(plan);
          }
          depositsCount++;
        }

        // Calculate rewards based on USD value (5 BTS per $1 saved)
        const rewardsVal = totalLockedUsd * 5;

        const solanaSavingsData: SavingsData = {
          totalLocked: totalLockedUsd.toFixed(2),
          deposits: depositsCount,
          rewards: rewardsVal.toFixed(0),
          currentPlans,
          completedPlans
        };

        // Cache the result
        if (address) {
          cacheSavingsData(solanaSavingsData, address, "solana");
        }

        return solanaSavingsData;

      } catch (err: any) {
        console.error("Error fetching Solana savings from chain:", err);
        setError(err.message || "Failed to fetch Solana savings data");
        return null;
      } finally {
        setIsLoading(false);
        setIsBackgroundLoading(false);
      }
    }

    if (DEBUG) console.log(`=== Starting savings fetch for user: ${address} ===`);

    try {
      // Set appropriate loading state
      if (isBackgroundFetch) {
        setIsBackgroundLoading(true);
      } else {
        setIsLoading(true);
      }

      // Clear any previous errors
      setError(null);

      // Start price fetches in parallel
      const ethPricePromise = fetchEthPrice();
      const goodDollarPricePromise = fetchGoodDollarPrice();

      // Fetch prices concurrently
      const [currentEthPrice, goodDollarPrice] = await Promise.all([
        ethPricePromise,
        goodDollarPricePromise
      ]);

      setEthPrice(currentEthPrice || 3500);

      // Process all networks in parallel
      const networkPromises = NETWORKS_CONFIG.map(async (network) => {
        try {
          const provider = new ethers.JsonRpcProvider(network.rpcUrl);
          const contract = new ethers.Contract(network.contractAddress, BitSaveABI, provider);

          // Get user's child contract address with timeout
          let userChildContractAddress;
          try {
            // Must pass { from: address } because the contract uses msg.sender and we are using a read-only provider
            const contractPromise = contract.getUserChildContractAddress({ from: address });
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Contract call timeout')), 10000)
            );
            userChildContractAddress = await Promise.race([contractPromise, timeoutPromise]);

            if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) {
              return null;
            }
          } catch (err) {
            // console.warn(`Error checking child contract on ${network.name}:`, err);
            return null;
          }

          // Initialize child contract
          const childContract = new ethers.Contract(
            userChildContractAddress,
            childContractABI,
            provider
          );

          // Fetch savings names
          const savingsNamesPromise = childContract.getSavingsNames();
          const savingsTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Savings names timeout')), 5000)
          );

          let savingsNamesArray: string[] = [];
          try {
            const savingsNamesObj: any = await Promise.race([savingsNamesPromise, savingsTimeoutPromise]);
            // Handle both tuple return (struct) and array return
            if (savingsNamesObj?.savingsNames && Array.isArray(savingsNamesObj.savingsNames)) {
              savingsNamesArray = savingsNamesObj.savingsNames;
            } else if (Array.isArray(savingsNamesObj)) {
              // Check if the first element is an array (Tuple wrapper: [[name1, name2]])
              if (Array.isArray(savingsNamesObj[0])) {
                savingsNamesArray = savingsNamesObj[0];
              } else {
                // Assume it's the direct array: [name1, name2]
                savingsNamesArray = savingsNamesObj;
              }
            } else if (savingsNamesObj?.savingsNames) {
              savingsNamesArray = savingsNamesObj.savingsNames;
            }
          } catch (err) {
            console.warn(`Error fetching savings names on ${network.name}:`, err);
            return null;
          }

          if (!savingsNamesArray || savingsNamesArray.length === 0) return null;

          const processedPlanNames = new Set();
          const validSavingNames = savingsNamesArray.filter((savingName: string) =>
            savingName && typeof savingName === "string" && savingName !== "" && !processedPlanNames.has(savingName)
          );

          // Process savings in batches
          const BATCH_SIZE = 5; // Increased batch size
          const networkPlans = [];
          const networkCompletedPlans = [];
          let networkDeposits = 0;
          let networkTotalUsdValue = 0;
          let networkRewards = 0;

          for (let i = 0; i < validSavingNames.length; i += BATCH_SIZE) {
            const batch = validSavingNames.slice(i, i + BATCH_SIZE);
            const batchPromises = batch.map(async (savingName: string) => {
              try {
                processedPlanNames.add(savingName);
                const savingDataPromise = childContract.getSaving(savingName);
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error(`Timeout for ${savingName}`)), 5000)
                );
                const savingData: any = await Promise.race([savingDataPromise, timeoutPromise]);
                return { savingName, savingData };
              } catch (err) {
                console.warn(`Failed to fetch data for "${savingName}" on ${network.name}:`, err);
                return null;
              }
            });

            const batchResults = await Promise.allSettled(batchPromises);

            for (const result of batchResults) {
              if (result.status === 'fulfilled' && result.value) {
                const { savingName, savingData } = result.value;

                if (!savingData || !savingData.isValid) continue;

                // Determine token properties
                const tokenId = savingData.tokenId || ethers.ZeroAddress;
                const isEth = tokenId.toLowerCase() === ethers.ZeroAddress.toLowerCase();

                let tokenName = "USDC";
                let decimals = 6;
                let tokenLogo = '/usdclogo.png';

                // Token mapping logic adapted for each chain
                if (isEth) {
                  tokenName = "ETH";
                  decimals = 18;
                  tokenLogo = '/eth.png';
                } else if (network.chainId === CELO_CHAIN_ID) {
                  const tokenInfo = CELO_TOKEN_MAP[(tokenId as string).toLowerCase()];
                  if (tokenInfo) {
                    tokenName = tokenInfo.name;
                    decimals = tokenInfo.decimals;
                    tokenLogo = tokenInfo.logo;
                  } else {
                    tokenName = 'USDGLO';
                    decimals = 6;
                    tokenLogo = '/usdglo.png';
                  }
                } else if (network.chainId === BASE_CHAIN_ID) {
                  if (tokenId.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
                    tokenName = "USDC";
                    decimals = 6;
                    tokenLogo = '/usdclogo.png';
                  } else if (tokenId.toLowerCase() === "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3") {
                    tokenName = "USDGLO";
                    decimals = 18;
                    tokenLogo = '/usdglo.png';
                  } else if (tokenId.toLowerCase() === "0x46c85152bfe9f96829aa94755d9f915f9b10ef5f") {
                    tokenName = "cNGN";
                    decimals = 6;
                    tokenLogo = '/cngn.png';
                  }
                } else if (network.chainId === LISK_CHAIN_ID) {
                  if (tokenId.toLowerCase() === "0xf242275d3a6527d877f2c927a82d9b057609cc71") {
                    tokenName = "USDC";
                    decimals = 6;
                    tokenLogo = '/usdclogo.png';
                  } else if (tokenId.toLowerCase() === "0x999e3a32ef3f9eabf133186512b5f29fadb8a816") {
                    tokenName = "cNGN";
                    decimals = 6;
                    tokenLogo = '/cngn.png';
                  }
                } else if (network.chainId === HEDERA_CHAIN_ID) {
                  const tokenInfo = HEDERA_TOKEN_MAP[(tokenId as string).toLowerCase()];
                  if (tokenInfo) {
                    tokenName = tokenInfo.name;
                    decimals = tokenInfo.decimals;
                    tokenLogo = tokenInfo.logo;
                  } else {
                    tokenName = 'HBAR';
                    decimals = 18;
                    tokenLogo = '/hedera-logo.svg';
                  }
                } else if (network.chainId === AVALANCHE_CHAIN_ID) {
                  if (tokenId.toLowerCase() === AVALANCHE_USDC_E) {
                    tokenName = 'USDC';
                    decimals = 6;
                    tokenLogo = '/usdclogo.png';
                  }
                }

                // Format amounts
                let amountFormatted = "0";
                try {
                  if (savingData.amount) {
                    amountFormatted = ethers.formatUnits(savingData.amount, decimals);
                  }
                } catch (e) {
                  amountFormatted = "0";
                }

                // Progress calculation
                const now = Math.floor(Date.now() / 1000);
                const startTime = savingData.startTime ? Number(savingData.startTime) : now;
                const maturityTime = savingData.maturityTime ? Number(savingData.maturityTime) : startTime + (30 * 24 * 60 * 60);

                let progress = 0;
                if (maturityTime <= startTime || now >= maturityTime) {
                  progress = 100;
                } else {
                  progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);
                }

                const isCompleted = savingData.isCompleted || progress >= 100;

                // Calculate USD value
                const amountVal = parseFloat(amountFormatted);
                let price = 1;
                if (tokenName === "ETH" || tokenName === "HBAR") price = currentEthPrice || 3500;
                if (tokenName === "Gooddollar") price = goodDollarPrice || 0.0001086;

                const usdValue = amountVal * price;
                // Calculate rewards based on USD value (5 BTS per $1 saved)
                networkRewards += usdValue * 5;

                networkTotalUsdValue += usdValue;

                const plan = {
                  id: savingName,
                  name: savingName,
                  amount: amountFormatted,
                  currentAmount: amountFormatted, // Add alias for dashboard compatibility
                  startTime: startTime, // Add startTime
                  maturityTime: maturityTime, // Add maturityTime
                  isEth: isEth, // Add isEth
                  tokenName,
                  tokenLogo,
                  progress,
                  status: isCompleted ? 'Completed' : 'Active',
                  timeLeft: isCompleted ? 'Completed' : `${Math.ceil((maturityTime - now) / (24 * 60 * 60))} days`,
                  penalty: (savingData.penaltyPercentage ?? savingData[5] ?? 0).toString(),
                  penaltyPercentage: Number(savingData.penaltyPercentage ?? savingData[5] ?? 0), // Add penaltyPercentage
                  network: network.name, // Add network name to plan
                  chainId: network.chainId, // Add chainId to plan
                  contractAddress: network.contractAddress // Store the actual contract address used
                };

                if (isCompleted) {
                  networkCompletedPlans.push(plan);
                } else {
                  networkPlans.push(plan);
                }
                networkDeposits++;
              }
            }
          }

          return {
            plans: networkPlans,
            completedPlans: networkCompletedPlans,
            deposits: networkDeposits,
            totalUsdValue: networkTotalUsdValue,
            rewards: networkRewards
          };

        } catch (error) {
          console.warn(`Error processing network ${network.name}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(networkPromises);

      // Aggregate results
      let aggregatedPlans: any[] = [];
      let aggregatedCompletedPlans: any[] = [];
      let aggregatedDeposits = 0;
      let aggregatedTotalUsdValue = 0;
      let aggregatedRewards = 0;

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          aggregatedPlans = [...aggregatedPlans, ...result.value.plans];
          aggregatedCompletedPlans = [...aggregatedCompletedPlans, ...result.value.completedPlans];
          aggregatedDeposits += result.value.deposits;
          aggregatedTotalUsdValue += result.value.totalUsdValue;
          aggregatedRewards += (result.value as any).rewards || 0;
        }
      });

      // Fetch shared plans for the current user's Savvy Name
      try {
        const sharedRes = await fetch(`/api/savings/shared?walletAddress=${address}`);
        if (sharedRes.ok) {
          const sharedData = await sharedRes.json();
          const sharedPlans = sharedData.sharedPlans || [];

          if (sharedPlans.length > 0) {
            const sharedPromises = sharedPlans.map(async (sp: any) => {
              try {
                const netConfig = NETWORKS_CONFIG.find(n => n.name === sp.network);
                if (!netConfig) return null;

                const provider = new ethers.JsonRpcProvider(netConfig.rpcUrl);
                let targetContractAddress = sp.contractAddress;
                if (!targetContractAddress) {
                  const masterContract = new ethers.Contract(netConfig.contractAddress, BitSaveABI, provider);
                  const promise = masterContract.getUserChildContractAddress({ from: sp.ownerAddress });
                  const timeout = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000));
                  targetContractAddress = await Promise.race([promise, timeout]);
                }
                if (!targetContractAddress || targetContractAddress === ethers.ZeroAddress) return null;

                const childContract = new ethers.Contract(targetContractAddress, childContractABI, provider);
                const savingPromise = childContract.getSaving(sp.savingName);
                const timeout = new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 5000));
                const savingData: any = await Promise.race([savingPromise, timeout]);

                if (!savingData || !savingData.isValid) return null;

                const tokenId = savingData.tokenId || ethers.ZeroAddress;
                const isEth = tokenId.toLowerCase() === ethers.ZeroAddress.toLowerCase();
                let decimals = isEth ? 18 : 6;

                let tokenName = "USDC";
                let tokenLogo = '/usdclogo.png';

                if (isEth) {
                  tokenName = "ETH";
                  tokenLogo = '/eth.png';
                } else if (netConfig.chainId === CELO_CHAIN_ID) {
                  const tokenInfo = CELO_TOKEN_MAP[(tokenId as string).toLowerCase()];
                  if (tokenInfo) {
                    tokenName = tokenInfo.name;
                    decimals = tokenInfo.decimals;
                    tokenLogo = tokenInfo.logo;
                  } else {
                    tokenName = 'USDGLO';
                    tokenLogo = '/usdglo.png';
                  }
                } else if (netConfig.chainId === BASE_CHAIN_ID) {
                  if (tokenId.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
                    tokenName = "USDC"; decimals = 6; tokenLogo = '/usdclogo.png';
                  } else if (tokenId.toLowerCase() === "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3") {
                    tokenName = "USDGLO"; decimals = 18; tokenLogo = '/usdglo.png';
                  } else if (tokenId.toLowerCase() === "0x46c85152bfe9f96829aa94755d9f915f9b10ef5f") {
                    tokenName = "cNGN"; decimals = 6; tokenLogo = '/cngn.png';
                  }
                } else if (netConfig.chainId === HEDERA_CHAIN_ID) {
                  tokenName = 'HBAR'; decimals = 18; tokenLogo = '/hedera-logo.svg';
                } else if (netConfig.chainId === LISK_CHAIN_ID) {
                  tokenName = 'USDC'; decimals = 6; tokenLogo = '/usdclogo.png';
                } else if (netConfig.chainId === AVALANCHE_CHAIN_ID) {
                  tokenName = 'USDC'; decimals = 6; tokenLogo = '/usdclogo.png';
                }

                let amountFormatted = "0";
                try { amountFormatted = ethers.formatUnits(savingData.amount, decimals); } catch (e) { }

                const now = Math.floor(Date.now() / 1000);
                const startTime = savingData.startTime ? Number(savingData.startTime) : now;
                const maturityTime = savingData.maturityTime ? Number(savingData.maturityTime) : startTime + (30 * 24 * 60 * 60);
                let progress = 0;
                if (maturityTime <= startTime || now >= maturityTime) progress = 100;
                else progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);

                const isCompleted = savingData.isCompleted || progress >= 100;

                return {
                  id: `${sp.savingName}-${sp.ownerAddress}`,
                  name: sp.savingName,
                  amount: amountFormatted,
                  currentAmount: amountFormatted,
                  startTime,
                  maturityTime,
                  isEth,
                  tokenName,
                  tokenLogo,
                  progress,
                  status: isCompleted ? 'Completed' : 'Active',
                  timeLeft: isCompleted ? 'Completed' : `${Math.ceil((maturityTime - now) / 86400)} days`,
                  penalty: (savingData.penaltyPercentage ?? 0).toString(),
                  penaltyPercentage: Number(savingData.penaltyPercentage ?? 0),
                  network: sp.network,
                  chainId: netConfig.chainId,
                  contractAddress: targetContractAddress,
                  isShared: true,
                  sharedBy: sp.ownerAddress
                };
              } catch (e) {
                console.warn(`Failed to fetch shared plan ${sp.savingName}:`, e);
                return null;
              }
            });

            const sharedResults = await Promise.allSettled(sharedPromises);
            sharedResults.forEach((result: any) => {
              if (result.status === 'fulfilled' && result.value) {
                if (result.value.status === 'Completed') aggregatedCompletedPlans.push(result.value);
                else aggregatedPlans.push(result.value);
              }
            });
          }
        }
      } catch (err) {
        console.warn("Error fetching shared plans mapping:", err);
      }

      let finalRewards = aggregatedRewards;
      if (address) {
        try {
          const res = await fetch('/api/users/rewards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, currentRewards: aggregatedRewards })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.rewards !== undefined) {
              finalRewards = data.rewards;
            }
          }
        } catch (err) {
          console.warn('Failed to sync rewards:', err);
        }
      }

      const finalSavingsData: SavingsData = {
        totalLocked: aggregatedTotalUsdValue.toFixed(2),
        deposits: aggregatedDeposits,
        rewards: finalRewards.toFixed(0),
        currentPlans: aggregatedPlans,
        completedPlans: aggregatedCompletedPlans
      };

      // Cache the result
      if (address) {
        cacheSavingsData(finalSavingsData, address, "all-chains");
      }

      setSavingsData(finalSavingsData);

      if (isBackgroundFetch) {
        setIsBackgroundLoading(false);
      } else {
        setIsLoading(false);
      }

      return finalSavingsData;

    } catch (error) {
      console.error("Error in fetchSavingsDataFromBlockchain:", error);
      setError("Failed to fetch savings data");

      if (isBackgroundFetch) {
        setIsBackgroundLoading(false);
      } else {
        setIsLoading(false);
      }

      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, fetchEthPrice, fetchGoodDollarPrice, getUserSavings, solanaAddress, wagmiAddress]);

  // Main fetch function with caching logic
  const fetchSavingsData = useCallback(async (forceRefresh = false) => {
    // Check if Solana is the active network
    const activeNetwork = localStorage.getItem('bitsave_active_network');
    const isSolanaActiveForFetch = activeNetwork === 'solana' || (!!solanaAddress && !wagmiAddress);

    if (!isConnected || !address || (!chainId && !isSolanaActiveForFetch)) {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setIsBackgroundLoading(false);
      setError(null);
      return;
    }

    // Use "all-chains" as the cache key since data is aggregated across all networks
    // But for Solana, keep it isolated
    const networkChainId = isSolanaActiveForFetch ? "solana" : "all-chains";
    const cachedData = getCachedSavingsData(address, networkChainId);
    const needsRefresh = needsBackgroundRefresh(address, networkChainId);

    // If we have cached data and not forcing refresh
    if (cachedData && !forceRefresh) {
      // Use cached data immediately and stop showing loading shimmer
      setSavingsData(cachedData);
      setIsLoading(false);
      setError(null);

      // If cache is fresh enough, we are done
      if (!needsRefresh) {
        return;
      }

      if (DEBUG) console.log(`Cached data exists but needs refresh for user ${address} on chain ${networkChainId}`);
      // Fall through to background fetch
    }

    // Determine if this should be a background fetch
    // It is background if we have cached data (which we just set above) and we are not forcing refresh
    const isBackgroundFetch = !!cachedData && !forceRefresh;

    // No cached data or forced refresh - fetch from blockchain
    if (DEBUG) console.log(`Fetching fresh savings data for user ${address} on chain ${networkChainId} (Background: ${isBackgroundFetch})`);

    const freshData = await fetchSavingsDataFromBlockchain(isBackgroundFetch);

    if (freshData && isMountedRef.current) {
      if (DEBUG) console.log(`Fresh data received for user ${address} on chain ${networkChainId}`);
      setSavingsData(freshData);
      cacheSavingsData(freshData, address, networkChainId);
      // Ensure loading state is reset after data is set
      if (!isBackgroundFetch) {
        setIsLoading(false);
      }
    } else if (!freshData && isMountedRef.current && !isBackgroundFetch) {
      // Fallback to default data if fetch failed and we don't have cached data
      // If it was a background fetch, we keep the cached data we already set
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, fetchSavingsDataFromBlockchain, solanaAddress, wagmiAddress]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (address && chainId) {
      clearCachedSavingsData(address, chainId.toString());

    }
  }, [address, chainId]);

  // Refetch function (forces fresh data by default, but can be soft)
  const refetch = useCallback(async (forceRefresh = true) => {
    await fetchSavingsData(forceRefresh);
  }, [fetchSavingsData]);

  // Force refresh network state by manually triggering network detection
  const forceRefreshNetworkState = useCallback(() => {
    if (chainId) {
      const chainIdBigInt = BigInt(chainId);
      const isBase = chainIdBigInt === BASE_CHAIN_ID;
      const isCelo = chainIdBigInt === CELO_CHAIN_ID;
      const isLisk = chainIdBigInt === LISK_CHAIN_ID;
      const isBSC = chainIdBigInt === BSC_CHAIN_ID;
      const isHedera = chainIdBigInt === HEDERA_CHAIN_ID;
      const isAvalanche = chainIdBigInt === AVALANCHE_CHAIN_ID;

      // Also check local storage for manually selected network overrides
      // or solana wallet adapter connection
      const activeNetwork = localStorage.getItem('bitsave_active_network');
      const isSolana = activeNetwork === 'solana';
      setIsSolanaNetwork(isSolana);

      setIsBaseNetwork(isSolana ? false : isBase);
      setIsCeloNetwork(isSolana ? false : isCelo);
      setIsLiskNetwork(isSolana ? false : isLisk);
      setIsBSCNetwork(isSolana ? false : isBSC);
      setIsHederaNetwork(isSolana ? false : isHedera);
      setIsAvalancheNetwork(isSolana ? false : isAvalanche);

      // Check if user is on one of the supported EVM networks or solana
      const isSupported = isBase || isCelo || isLisk || isBSC || isAvalanche || isHedera || isSolana;
      setIsCorrectNetwork(isSupported);
    } else {
      // If no chainId, check if we're explicitly on Solana
      const activeNetwork = localStorage.getItem('bitsave_active_network');
      const isSolana = activeNetwork === 'solana';
      if (isSolana) {
        setIsSolanaNetwork(true);
        setIsCorrectNetwork(true);
      }
    }
  }, [chainId]);

  // Initial data fetch on mount or when dependencies change
  useEffect(() => {
    if (isConnected && address && (chainId || isSolanaNetwork)) {
      fetchSavingsData();
    } else {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, isSolanaNetwork]);

  return {
    savingsData,
    isLoading,
    isBackgroundLoading,
    error,
    ethPrice,
    currentNetwork,
    isBaseNetwork,
    isCeloNetwork,
    isLiskNetwork,
    isBSCNetwork,
    isHederaNetwork,
    isAvalancheNetwork,
    isSolanaNetwork,
    isCorrectNetwork,
    refetch,
    clearCache,
    forceRefreshNetworkState
  };
}