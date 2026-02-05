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
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import axios from 'axios';
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

  // Privy hooks for authentication state
  const { ready, authenticated, user } = usePrivy();

  // Use Privy's wallet address as fallback, prioritizing wagmi address
  const address = wagmiAddress || user?.wallet?.address as `0x${string}` | undefined;
  // Consider connected if either Privy is authenticated or wagmi is connected
  const isConnected = (ready && authenticated) || isWagmiConnected;



  // State management
  const [savingsData, setSavingsData] = useState<SavingsData>(defaultSavingsData);
  const [isLoading, setIsLoading] = useState(false);
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
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

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
    if (!chainId) {
      setIsBaseNetwork(false);
      setIsCeloNetwork(false);
      setIsLiskNetwork(false);
      setIsBSCNetwork(false);
      setIsHederaNetwork(false);
      setIsAvalancheNetwork(false);
      setIsCorrectNetwork(false);
      return;
    }

    const chainIdBigInt = BigInt(chainId);
    const isBase = chainIdBigInt === BASE_CHAIN_ID;
    const isCelo = chainIdBigInt === CELO_CHAIN_ID;
    const isLisk = chainIdBigInt === LISK_CHAIN_ID;
    const isBSC = chainIdBigInt === BSC_CHAIN_ID;
    const isHedera = chainIdBigInt === HEDERA_CHAIN_ID;
    const isAvalanche = chainIdBigInt === AVALANCHE_CHAIN_ID;

    // Force immediate state updates
    setIsBaseNetwork(isBase);
    setIsCeloNetwork(isCelo);
    setIsLiskNetwork(isLisk);
    setIsBSCNetwork(isBSC);
    setIsHederaNetwork(isHedera);
    setIsAvalancheNetwork(isAvalanche);
    setIsCorrectNetwork(isBase || isCelo || isLisk || isBSC || isHedera || isAvalanche);
  }, [chainId]);

  // Handle initial loading state when wallet connection changes
  useEffect(() => {
    if (!isConnected || !address || !chainId) {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setIsBackgroundLoading(false);
      setError(null);
    }
  }, [isConnected, address, chainId]);

  // Network Configurations
  const NETWORKS_CONFIG = [
    {
      chainId: BASE_CHAIN_ID,
      rpcUrl: 'https://base.publicnode.com',
      contractAddress: BASE_CONTRACT_ADDRESS_OLD, // Use old contract to fetch existing savings
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
                    // For Base, older savings used 18 decimals, newer use 6
                    if (network.contractAddress === BASE_CONTRACT_ADDRESS_OLD) {
                      decimals = 18;
                    } else {
                      decimals = 6;
                    }
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
                  contractAddress: network.chainId === BASE_CHAIN_ID
                    ? getBaseContractAddress(startTime)
                    : network.contractAddress // Store the actual contract address used
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

      const finalSavingsData: SavingsData = {
        totalLocked: aggregatedTotalUsdValue.toFixed(2),
        deposits: aggregatedDeposits,
        rewards: aggregatedRewards.toFixed(0),
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
  }, [isConnected, address, fetchEthPrice, fetchGoodDollarPrice]);

  // Main fetch function with caching logic
  const fetchSavingsData = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !address || !chainId) {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setIsBackgroundLoading(false);
      setError(null);
      return;
    }

    // Use "all-chains" as the cache key since data is aggregated across all networks
    const networkChainId = "all-chains";
    const cachedData = getCachedSavingsData(address, networkChainId);
    const needsRefresh = needsBackgroundRefresh(address, networkChainId);

    // If we have cached data and not forcing refresh
    if (cachedData && !forceRefresh) {
      // Use cached data immediately
      setSavingsData(cachedData);

      // If cache is fresh enough, we are done
      if (!needsRefresh) {
        if (DEBUG) console.log(`Using cached savings data for user ${address} on chain ${networkChainId}`);
        setIsLoading(false);
        setError(null);
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
  }, [isConnected, address, chainId, fetchSavingsDataFromBlockchain]);

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

      setIsBaseNetwork(isBase);
      setIsCeloNetwork(isCelo);
      setIsLiskNetwork(isLisk);
      setIsBSCNetwork(isBSC);
      setIsHederaNetwork(isHedera);
      setIsAvalancheNetwork(isAvalanche);
      setIsCorrectNetwork(isBase || isCelo || isLisk || isBSC || isHedera || isAvalanche);
    }
  }, [chainId]);

  // Initial data fetch on mount or when dependencies change
  useEffect(() => {
    if (isConnected && address && chainId) {
      fetchSavingsData();
    } else {
      setSavingsData(defaultSavingsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId]);

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
    isCorrectNetwork,
    refetch,
    clearCache,
    forceRefreshNetworkState
  };
}