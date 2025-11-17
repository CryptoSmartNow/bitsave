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

// Contract addresses for different networks
const BASE_CONTRACT_ADDRESS = "0x3593546078eecd0ffd1c19317f53ee565be6ca13";
const CELO_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const LISK_CONTRACT_ADDRESS = "0x3593546078eECD0FFd1c19317f53ee565be6ca13";
const HEDERA_CONTRACT_ADDRESS = "0x2f33f1f07f6e56c11fd48a4f3596d9dadfe67409";
const AVALANCHE_CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33"; 

// Network chain IDs
const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);
const LISK_CHAIN_ID = BigInt(1135);
const HEDERA_CHAIN_ID = BigInt(296);
const AVALANCHE_CHAIN_ID = BigInt(43114);

// Token mapping for Celo network
const CELO_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  "0x765de816845861e75a25fca122bb6898b8b1282a": { name: "cUSD", decimals: 18, logo: "/cusd.png" },
  "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3": { name: "USDGLO", decimals: 18, logo: "/usdglo.png" },
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": { name: "USDC", decimals: 6, logo: "/usdc.png" },
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
  isHederaNetwork: boolean;
  isAvalancheNetwork: boolean;
  isCorrectNetwork: boolean;
  refetch: () => Promise<void>;
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

export function useSavingsData(): UseSavingsDataReturn {

  
  // Wagmi hooks for wallet connection
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  

  
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
      setIsHederaNetwork(false);
      setIsAvalancheNetwork(false);
      setIsCorrectNetwork(false);
      return;
    }
    
    const chainIdBigInt = BigInt(chainId);
    const isBase = chainIdBigInt === BASE_CHAIN_ID;
    const isCelo = chainIdBigInt === CELO_CHAIN_ID;
    const isLisk = chainIdBigInt === LISK_CHAIN_ID;
    const isHedera = chainIdBigInt === HEDERA_CHAIN_ID;
    const isAvalanche = chainIdBigInt === AVALANCHE_CHAIN_ID;
    
    // Force immediate state updates
    setIsBaseNetwork(isBase);
    setIsCeloNetwork(isCelo);
    setIsLiskNetwork(isLisk);
    setIsHederaNetwork(isHedera);
    setIsAvalancheNetwork(isAvalanche);
    setIsCorrectNetwork(isBase || isCelo || isLisk || isHedera || isAvalanche);
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
  
  // Fetch ETH price from CoinGecko
  const fetchEthPrice = useCallback(async (): Promise<number> => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data.ethereum.usd;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return 3500; // Fallback price
    }
  }, []);
  
  // Fetch GoodDollar price from CoinGecko
  const fetchGoodDollarPrice = useCallback(async (): Promise<number> => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=gooddollar&vs_currencies=usd"
      );
      return response.data.gooddollar?.usd || 0.00001;
    } catch (error) {
      console.error("Error fetching GoodDollar price:", error);
      return 0.00001; // Fallback price
    }
  }, []);
  
  // Main function to fetch savings data from blockchain
  const fetchSavingsDataFromBlockchain = useCallback(async (
    isBackgroundFetch = false
  ): Promise<SavingsData | null> => {
    if (!isConnected || !address) {
      return null;
    }
    
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
      
      // Use a public RPC provider for read-only calls to avoid wallet prompts
      const chainIdBig = BigInt(chainId);
      const rpcUrl = (() => {
        if (chainIdBig === BASE_CHAIN_ID) return 'https://mainnet.base.org';
        if (chainIdBig === CELO_CHAIN_ID) return 'https://forno.celo.org';
        if (chainIdBig === LISK_CHAIN_ID) return 'https://rpc.api.lisk.com';
        if (chainIdBig === HEDERA_CHAIN_ID) return 'https://mainnet.hashio.io/api';
        if (chainIdBig === AVALANCHE_CHAIN_ID) return 'https://api.avax.network/ext/bc/C/rpc';
        return 'https://forno.celo.org';
      })();
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Fetch prices concurrently
      const [currentEthPrice, goodDollarPrice] = await Promise.all([
        ethPricePromise,
        goodDollarPricePromise
      ]);
      
      setEthPrice(currentEthPrice || 3500);
      
      // Update simple network state from chainId
      setCurrentNetwork({ chainId: chainIdBig });
      
      // Validate network
      if (chainIdBig !== BASE_CHAIN_ID && chainIdBig !== CELO_CHAIN_ID && chainIdBig !== LISK_CHAIN_ID && chainIdBig !== HEDERA_CHAIN_ID) {
        throw new Error("Please switch to Base, Celo, Lisk, or Hedera network");
      }
      const fromAddress: string | undefined = address ?? undefined;
      
      // Select contract address based on network
      const contractAddress = (chainIdBig === BASE_CHAIN_ID)
        ? BASE_CONTRACT_ADDRESS
        : (chainIdBig === CELO_CHAIN_ID)
        ? CELO_CONTRACT_ADDRESS
        : (chainIdBig === LISK_CHAIN_ID)
        ? LISK_CONTRACT_ADDRESS
        : (chainIdBig === HEDERA_CHAIN_ID)
        ? HEDERA_CONTRACT_ADDRESS
        : AVALANCHE_CONTRACT_ADDRESS;
      
      // Initialize contract
      const contract = new ethers.Contract(contractAddress, BitSaveABI, provider);
      
      // Get user's child contract address with timeout
      let userChildContractAddress;
      try {
        // Pass explicit from override to preserve msg.sender even without a signer
        const contractPromise = (fromAddress
          ? (contract as any).getUserChildContractAddress({ from: fromAddress })
          : contract.getUserChildContractAddress());
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Contract call timeout')), 10000)
        );
        
        userChildContractAddress = await Promise.race([contractPromise, timeoutPromise]);
        
        // Handle case where user hasn't created a savings plan yet
        if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) {
          // Reset loading states before returning
          if (isBackgroundFetch) {
            setIsBackgroundLoading(false);
          } else {
            setIsLoading(false);
          }
          
          return defaultSavingsData;
        }
      } catch (error) {
        console.error("Error getting user child contract:", handleContractError(error));
        
        // Reset loading states before returning
        if (isBackgroundFetch) {
          setIsBackgroundLoading(false);
        } else {
          setIsLoading(false);
        }
        
        return defaultSavingsData;
      }
      
      // Initialize child contract
      const childContract = new ethers.Contract(
        userChildContractAddress,
        childContractABI,
        provider
      );
      
      // Fetch savings names with timeout
      const savingsNamesPromise = (fromAddress
        ? (childContract as any).getSavingsNames({ from: fromAddress })
        : childContract.getSavingsNames());
      const savingsTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Savings names timeout')), 8000)
      );
      
      const savingsNamesObj = await Promise.race([savingsNamesPromise, savingsTimeoutPromise]);
      const savingsNamesArray = savingsNamesObj?.savingsNames || [];
      
      // Initialize processing variables
      const currentPlans = [];
      const completedPlans = [];
      let totalDeposits = 0;
      let totalUsdValue = 0;
      const processedPlanNames = new Set();
      
      // Process savings in batches
      const BATCH_SIZE = 3;
      const validSavingNames = savingsNamesArray.filter((savingName: string) => 
        savingName && typeof savingName === "string" && savingName !== "" && !processedPlanNames.has(savingName)
      );
      
      // Process savings plans in batches
      for (let i = 0; i < validSavingNames.length; i += BATCH_SIZE) {
        const batch = validSavingNames.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (savingName: string) => {
          try {
            processedPlanNames.add(savingName);
            
            const savingDataPromise = (fromAddress
              ? (childContract as any).getSaving(savingName, { from: fromAddress })
              : childContract.getSaving(savingName));
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout for ${savingName}`)), 5000)
            );
            
            const savingData = await Promise.race([savingDataPromise, timeoutPromise]);
            return { savingName, savingData };
          } catch (err) {
            console.error(`Failed to fetch data for "${savingName}":`, handleContractError(err));
            return null;
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value) {
            const { savingName, savingData } = result.value;
            
            try {
              if (!savingData?.isValid) continue;
              
              // Determine token properties
              const tokenId = savingData.tokenId;
              const isEth = tokenId.toLowerCase() === ethers.ZeroAddress.toLowerCase();
              
              let tokenName = "USDC";
              let decimals = 6;
              let tokenLogo = '/usdc.png';
              
              if (isEth) {
                tokenName = "ETH";
                decimals = 18;
                tokenLogo = '/eth.png';
              } else if (chainIdBig === CELO_CHAIN_ID) {
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
              } else if (chainIdBig === BASE_CHAIN_ID) {
                if (tokenId.toLowerCase() === "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913") {
                  tokenName = "USDC";
                  decimals = 6;
                  tokenLogo = '/usdc.png';
                } else if (tokenId.toLowerCase() === "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3") {
                  tokenName = "USDGLO";
                  decimals = 18;
                  tokenLogo = '/usdglo.png';
                }
              } else if (chainIdBig === LISK_CHAIN_ID) {
                if (tokenId.toLowerCase() === "0xf242275d3a6527d877f2c927a82d9b057609cc71") {
                  tokenName = "USDC";
                  decimals = 6;
                  tokenLogo = '/usdc.png';
                }
              } else if (chainIdBig === HEDERA_CHAIN_ID) {
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
              } else if (chainIdBig === AVALANCHE_CHAIN_ID) {
                if (tokenId.toLowerCase() === AVALANCHE_USDC_E) {
                  tokenName = 'USDC';
                  decimals = 6;
                  tokenLogo = '/usdc.png';
                }
              }
              
              // Format amounts
              const targetFormatted = ethers.formatUnits(savingData.amount, decimals);
              const currentFormatted = ethers.formatUnits(savingData.amount, decimals);
              
              // Calculate progress
              const now = Date.now();
              const startTime = Number(savingData.startTime) * 1000;
              const maturityTime = Number(savingData.maturityTime) * 1000;
              const progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);
              const penaltyPercentage = Number(savingData.penaltyPercentage);
              
              // Calculate USD value
              if (isEth) {
                const ethAmount = parseFloat(currentFormatted);
                totalUsdValue += ethAmount * currentEthPrice;
              } else if (tokenName === 'Gooddollar') {
                const gAmount = parseFloat(currentFormatted);
                totalUsdValue += gAmount * goodDollarPrice;
              } else {
                // Assume USD parity for stablecoins
                totalUsdValue += parseFloat(currentFormatted);
              }
              
              totalDeposits++;
              
              // Create plan data
              const planData = {
                id: savingName.trim(),
                address: userChildContractAddress,
                name: savingName.trim(),
                currentAmount: currentFormatted,
                targetAmount: targetFormatted,
                progress,
                isEth,
                startTime: startTime / 1000,
                maturityTime: maturityTime / 1000,
                penaltyPercentage,
                tokenName,
                tokenLogo
              };
              
              // Categorize plan
              if (progress >= 100 || now >= maturityTime) {
                completedPlans.push(planData);
              } else {
                currentPlans.push(planData);
              }
            } catch (err) {
              console.error(`Failed to process plan "${savingName}":`, handleContractError(err));
            }
          }
        }
      }
      
      // Sort plans
      currentPlans.sort((a, b) => b.startTime! - a.startTime!);
      completedPlans.sort((a, b) => b.startTime! - a.startTime!);
      
      // Calculate rewards
      const totalBtsRewards = (totalUsdValue * 0.005 * 1000).toFixed(2);
      
      // Create final data object
      const finalData: SavingsData = {
        totalLocked: totalUsdValue.toFixed(2),
        deposits: totalDeposits,
        rewards: totalBtsRewards,
        currentPlans,
        completedPlans
      };
      
      return finalData;
      
    } catch (error: any) {
      const code = error?.code;
      const msg = String(error?.message || '').toLowerCase();
      const userRejected = code === 4001 || code === 'ACTION_REJECTED' || msg.includes('rejected') || msg.includes('denied');
      if (userRejected) {
        // Silent fallback when user cancels wallet interaction; use default data
        console.warn('Savings fetch: user cancelled wallet interaction, using default data');
        if (!isBackgroundFetch) {
          setError(null);
        }
        return defaultSavingsData;
      }
      console.error("Error fetching savings data:", handleContractError(error));
      
      // Set error state but don't throw - let cached data be used if available
      if (!isBackgroundFetch) {
        setError(handleContractError(error));
      }
      
      return null;
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        if (isBackgroundFetch) {
          setIsBackgroundLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    }
  }, [isConnected, address, chainId, fetchEthPrice, fetchGoodDollarPrice]);
  
  // Main fetch function with caching logic
  const fetchSavingsData = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !address || !chainId) {
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setIsBackgroundLoading(false);
      setError(null);
      return;
    }
    
    const networkChainId = chainId.toString();
    
    // Check for cached data first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedData = getCachedSavingsData(address, networkChainId);
      const needsRefresh = needsBackgroundRefresh(address, networkChainId);
      
      if (cachedData && !forceRefresh && !needsRefresh) {
        setSavingsData(cachedData);
        setIsLoading(false); // ✅ FIXED: Set loading to false when using cached data
        setError(null);
        return;
      }
    }
    
    // No cached data or forced refresh - fetch from blockchain
    
    const freshData = await fetchSavingsDataFromBlockchain(false);
    
    if (freshData && isMountedRef.current) {
      setSavingsData(freshData);
      cacheSavingsData(freshData, address, networkChainId);
    } else if (!freshData && isMountedRef.current) {
      // Fallback to default data if fetch failed
      setSavingsData(defaultSavingsData);
    }
  }, [isConnected, address, chainId, fetchSavingsDataFromBlockchain]);
  
  // Clear cache function
  const clearCache = useCallback(() => {
    if (address && chainId) {
      clearCachedSavingsData(address, chainId.toString());
  
    }
  }, [address, chainId]);
  
  // Refetch function (forces fresh data)
  const refetch = useCallback(async () => {
    await fetchSavingsData(true);
  }, [fetchSavingsData]);
  
  // Force refresh network state by manually triggering network detection
  const forceRefreshNetworkState = useCallback(() => {
    if (chainId) {
      const chainIdBigInt = BigInt(chainId);
      const isBase = chainIdBigInt === BASE_CHAIN_ID;
      const isCelo = chainIdBigInt === CELO_CHAIN_ID;
      const isLisk = chainIdBigInt === LISK_CHAIN_ID;
      const isHedera = chainIdBigInt === HEDERA_CHAIN_ID;
      
      setIsBaseNetwork(isBase);
      setIsCeloNetwork(isCelo);
      setIsLiskNetwork(isLisk);
      setIsHederaNetwork(isHedera);
      setIsCorrectNetwork(isBase || isCelo || isLisk || isHedera);
    }
  }, [chainId]);
  
  // Initial data fetch on mount or when dependencies change
  useEffect(() => {
    if (isConnected && address && chainId) {
      fetchSavingsData();
    } else {
      // Set default data when not connected
      setSavingsData(defaultSavingsData);
      setIsLoading(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId]); // Remove fetchSavingsData to prevent infinite loop
  
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
    isHederaNetwork,
    isAvalancheNetwork,
    isCorrectNetwork,
    refetch,
    clearCache,
    forceRefreshNetworkState
  };
}