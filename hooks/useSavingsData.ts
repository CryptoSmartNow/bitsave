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

// Network chain IDs
const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);

// Token mapping for Celo network
const CELO_TOKEN_MAP: Record<string, { name: string; decimals: number; logo: string }> = {
  "0x765de816845861e75a25fca122bb6898b8b1282a": { name: "cUSD", decimals: 18, logo: "/cusd.png" },
  "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3": { name: "USDGLO", decimals: 6, logo: "/usdglo.png" },
  "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a": { name: "Gooddollar", decimals: 18, logo: "/$g.png" }
};

interface UseSavingsDataReturn {
  savingsData: SavingsData;
  isLoading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;
  ethPrice: number;
  currentNetwork: any;
  isBaseNetwork: boolean;
  isCorrectNetwork: boolean;
  refetch: () => Promise<void>;
  clearCache: () => void;
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
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
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
      
      // Ensure wallet is available
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.");
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Fetch network info and prices concurrently
      const [network, currentEthPrice, goodDollarPrice] = await Promise.all([
        provider.getNetwork(),
        ethPricePromise,
        goodDollarPricePromise
      ]);
      

      setEthPrice(currentEthPrice || 3500);
      
      // Update network state
      setCurrentNetwork(network);
      setIsBaseNetwork(network.chainId === BASE_CHAIN_ID);
      
      // Validate network
      if (network.chainId !== BASE_CHAIN_ID && network.chainId !== CELO_CHAIN_ID) {
        setIsCorrectNetwork(false);
        throw new Error("Please switch to Base or Celo network");
      }
      
      setIsCorrectNetwork(true);
      const signer = await provider.getSigner();
      
      // Select contract address based on network
      const contractAddress = (network.chainId === BASE_CHAIN_ID)
        ? BASE_CONTRACT_ADDRESS
        : CELO_CONTRACT_ADDRESS;
      
      // Initialize contract
      const contract = new ethers.Contract(contractAddress, BitSaveABI, signer);
      
      // Get user's child contract address with timeout
      let userChildContractAddress;
      try {
        const contractPromise = contract.getUserChildContractAddress();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Contract call timeout')), 10000)
        );
        
        userChildContractAddress = await Promise.race([contractPromise, timeoutPromise]);
        
        // Handle case where user hasn't created a savings plan yet
        if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) {
  
          return defaultSavingsData;
        }
      } catch (error) {
        console.error("Error getting user child contract:", handleContractError(error));
        return defaultSavingsData;
      }
      
      // Initialize child contract
      const childContract = new ethers.Contract(
        userChildContractAddress,
        childContractABI,
        signer
      );
      
      // Fetch savings names with timeout
      const savingsNamesPromise = childContract.getSavingsNames();
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
            
            const savingDataPromise = childContract.getSaving(savingName);
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
      
    } catch (error) {
      console.error("Error fetching savings data:", handleContractError(error));
      
      // Set error state but don't throw - let cached data be used if available
      if (!isBackgroundFetch) {
        setError(handleContractError(error));
      }
      
      return null;
    } finally {
      if (!isMountedRef.current) return null;
      
      if (isBackgroundFetch) {
        setIsBackgroundLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [isConnected, address, fetchEthPrice, fetchGoodDollarPrice]);
  
  // Main fetch function with caching logic
  const fetchSavingsData = useCallback(async (forceRefresh = false) => {
    if (!isConnected || !address || !chainId) {
      setSavingsData(defaultSavingsData);
      return;
    }
    
    const networkChainId = chainId.toString();
    
    // Check for cached data first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedData = getCachedSavingsData(address, networkChainId);
      if (cachedData) {
  
        setSavingsData(cachedData);
        
        // Check if background refresh is needed
        if (needsBackgroundRefresh(address, networkChainId)) {
    
          // Fetch fresh data in background
          fetchSavingsDataFromBlockchain(true).then(freshData => {
            if (freshData && isMountedRef.current) {
      
              setSavingsData(freshData);
              cacheSavingsData(freshData, address, networkChainId);
            }
          }).catch(error => {
            console.error('Background refresh failed:', error);
            // Keep using cached data on background fetch failure
          });
        }
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
  
  // Initial data fetch on mount or when dependencies change
  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);
  
  return {
    savingsData,
    isLoading,
    isBackgroundLoading,
    error,
    ethPrice,
    currentNetwork,
    isBaseNetwork,
    isCorrectNetwork,
    refetch,
    clearCache
  };
}