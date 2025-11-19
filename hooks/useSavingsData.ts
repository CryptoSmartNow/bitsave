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
    
    console.log(`=== Starting Base savings debug for user: ${address} ===`);
    
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
      
      console.log(`Network configuration: chainId=${chainId}, chainIdBig=${chainIdBig}, isBase=${chainIdBig === BASE_CHAIN_ID}, rpcUrl=${rpcUrl}`);
      
      // Test Base network RPC connection
      if (chainIdBig === BASE_CHAIN_ID) {
        try {
          const blockNumber = await provider.getBlockNumber();
          console.log(`Base network RPC test successful - Current block number: ${blockNumber}`);
        } catch (rpcError) {
          console.error(`Base network RPC connection failed:`, rpcError);
        }
      }
      
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
      
      console.log(`Contract address selection: chainIdBig=${chainIdBig}, BASE_CHAIN_ID=${BASE_CHAIN_ID}, isBase=${chainIdBig === BASE_CHAIN_ID}, contractAddress=${contractAddress}`);
      
      // Initialize contract
      const contract = new ethers.Contract(contractAddress, BitSaveABI, provider);
      
      // Get user's child contract address with timeout
      let userChildContractAddress;
      try {
        console.log(`Fetching child contract address for user: ${address} on Base network: ${chainIdBig === BASE_CHAIN_ID}`);
        // Pass explicit from override to preserve msg.sender even without a signer
        const contractPromise = (fromAddress
          ? (contract as any).getUserChildContractAddress({ from: fromAddress })
          : contract.getUserChildContractAddress());
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Contract call timeout')), 10000)
        );
        
        userChildContractAddress = await Promise.race([contractPromise, timeoutPromise]);
        console.log(`Child contract address result: ${userChildContractAddress}`);
        
        // Additional Base network debugging
        if (chainIdBig === BASE_CHAIN_ID) {
          console.log(`Base network specific: Child contract address retrieved successfully`);
          console.log(`Base network: Checking if address is valid zero address: ${userChildContractAddress === ethers.ZeroAddress}`);
        }
        
        // Handle case where user hasn't created a savings plan yet
        if (!userChildContractAddress || userChildContractAddress === ethers.ZeroAddress) {
          console.log('No child contract found for user - returning empty savings data');
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
        
        // Base network specific error logging
        if (chainIdBig === BASE_CHAIN_ID) {
          console.error(`Base network specific error:`, {
            error: error,
            userAddress: address,
            contractAddress: contractAddress,
            rpcUrl: rpcUrl,
            chainId: chainIdBig
          });
        }
        
        // Reset loading states before returning
        if (isBackgroundFetch) {
          setIsBackgroundLoading(false);
        } else {
          setIsLoading(false);
        }
        
        return defaultSavingsData;
      }
      
      // Initialize child contract
      console.log(`Creating child contract instance for Base network: Address=${userChildContractAddress}, ChainId=${chainIdBig}`);
      const childContract = new ethers.Contract(
        userChildContractAddress,
        childContractABI,
        provider
      );
      console.log(`Child contract created successfully for Base network`);
      
      // Fetch savings names with timeout
      console.log(`Fetching savings names from child contract: ${userChildContractAddress} for Base network: ${chainIdBig === BASE_CHAIN_ID}`);
      const savingsNamesPromise = (fromAddress
        ? (childContract as any).getSavingsNames({ from: fromAddress })
        : childContract.getSavingsNames());
      const savingsTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Savings names timeout')), 8000)
      );
      
      let savingsNamesArray: string[] = [];
      try {
        const savingsNamesObj = await Promise.race([savingsNamesPromise, savingsTimeoutPromise]);
        console.log(`Savings names response for Base network:`, savingsNamesObj);
        savingsNamesArray = savingsNamesObj?.savingsNames || [];
      } catch (timeoutError) {
        console.error('Timeout fetching savings names:', timeoutError);
        // If timeout, try to use cached data if available
        const cachedData = getCachedSavingsData(address, chainId.toString());
        if (cachedData) {
          console.log('Using cached data due to timeout');
          return cachedData;
        }
        // If no cached data, continue with empty array
        savingsNamesArray = [];
      }
      
      console.log(`Processing ${savingsNamesArray.length} savings names for user ${address} on Base network: ${chainIdBig === BASE_CHAIN_ID}`);
      console.log(`Savings names list:`, savingsNamesArray);
      if (savingsNamesArray.length === 0) {
        console.log(`No savings names found for user ${address} on Base network: ${chainIdBig === BASE_CHAIN_ID}`);
        console.log(`This could mean: 1) User has no savings, 2) Child contract exists but no savings created, 3) Contract call failed silently`);
        
        // Reset loading states before returning
        if (isBackgroundFetch) {
          setIsBackgroundLoading(false);
        } else {
          setIsLoading(false);
        }
        
        return {
          totalLocked: "0.00",
          deposits: 0,
          rewards: "0.00",
          currentPlans: [],
          completedPlans: []
        };
      }
      
      console.log(`Processing ${savingsNamesArray.length} savings names:`, savingsNamesArray);
      
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
      
      console.log(`Valid savings names: ${validSavingNames.length} out of ${savingsNamesArray.length}`);
      console.log(`Valid names:`, validSavingNames);
      
      // Process savings plans in batches
      for (let i = 0; i < validSavingNames.length; i += BATCH_SIZE) {
        const batch = validSavingNames.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}: ${batch.length} plans`);
        
        const batchPromises = batch.map(async (savingName: string) => {
          try {
            processedPlanNames.add(savingName);
            
            console.log(`Fetching saving data for "${savingName}" on Base network: ${chainIdBig === BASE_CHAIN_ID}`);
            const savingDataPromise = (fromAddress
              ? (childContract as any).getSaving(savingName, { from: fromAddress })
              : childContract.getSaving(savingName));
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout for ${savingName}`)), 5000)
            );
            
            const savingData = await Promise.race([savingDataPromise, timeoutPromise]);
            console.log(`Saving data result for "${savingName}" on Base network:`, savingData);
            
            console.log(`Contract response for "${savingName}":`, {
              savingName,
              savingData: savingData ? {
                isValid: savingData.isValid,
                amount: savingData.amount?.toString(),
                tokenId: savingData.tokenId,
                startTime: savingData.startTime?.toString(),
                maturityTime: savingData.maturityTime?.toString(),
                penaltyPercentage: savingData.penaltyPercentage?.toString()
              } : 'null'
            });
            
            return { savingName, savingData };
          } catch (err) {
            console.error(`Failed to fetch data for "${savingName}":`, handleContractError(err));
            return null;
          }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Process batch results
        console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1} results:`, batchResults.map(r => r.status));
        
        // Log any rejected promises for debugging
        const rejectedResults = batchResults.filter(r => r.status === 'rejected');
        if (rejectedResults.length > 0) {
          console.warn(`Batch ${Math.floor(i/BATCH_SIZE) + 1} had ${rejectedResults.length} rejected promises`);
        }
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value) {
            const { savingName, savingData } = result.value;
            
            try {
              // More lenient validation - allow savings even if isValid is false
              // This helps with older contracts or edge cases
              if (savingData === null || savingData === undefined) {
                console.warn(`Skipping saving "${savingName}": No data returned from contract`);
                console.log(`Saving data for "${savingName}":`, savingData);
                continue;
              }
              
              // Log saving data for debugging
              console.log(`Processing saving "${savingName}":`, {
                isValid: savingData.isValid,
                amount: savingData.amount?.toString(),
                startTime: savingData.startTime?.toString(),
                maturityTime: savingData.maturityTime?.toString(),
                tokenId: savingData.tokenId
              });
              
              // Determine token properties with error handling
              const tokenId = savingData.tokenId || ethers.ZeroAddress;
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
              
              // Format amounts with error handling
              let targetFormatted = "0";
              let currentFormatted = "0";
              
              try {
                if (savingData.amount) {
                  targetFormatted = ethers.formatUnits(savingData.amount, decimals);
                  currentFormatted = ethers.formatUnits(savingData.amount, decimals);
                } else {
                  console.warn(`Saving "${savingName}" has no amount field`);
                }
              } catch (error) {
                console.error(`Error formatting amount for saving "${savingName}":`, error);
                targetFormatted = "0";
                currentFormatted = "0";
              }
              
              // Calculate progress with better error handling
              const now = Math.floor(Date.now() / 1000); // Convert to seconds to match contract time format
              const startTime = savingData.startTime ? Number(savingData.startTime) : now;
              const maturityTime = savingData.maturityTime ? Number(savingData.maturityTime) : startTime + (30 * 24 * 60 * 60); // Default 30 days if not provided
              
              // Debug time values
              console.log(`Time debug for "${savingName}":`, {
                now: new Date(now * 1000).toISOString(),
                startTime: new Date(startTime * 1000).toISOString(),
                maturityTime: new Date(maturityTime * 1000).toISOString(),
                timeDiff: maturityTime - startTime,
                nowVsMaturity: now - maturityTime,
                nowSeconds: now,
                startSeconds: startTime,
                maturitySeconds: maturityTime
              });
              
              // Handle edge cases for progress calculation
              let progress = 0;
              if (maturityTime <= startTime) {
                // If maturity time is same as or before start time, consider it completed
                progress = 100;
                console.log(`Edge case: maturityTime <= startTime, setting progress to 100%`);
              } else if (now >= maturityTime) {
                // If current time is past maturity, it's completed
                progress = 100;
                console.log(`Edge case: now >= maturityTime, setting progress to 100%`);
              } else {
                // Normal progress calculation
                const timeProgress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);
                progress = timeProgress;
                console.log(`Normal progress calculation: ${timeProgress}%`);
              }
              
              const penaltyPercentage = savingData.penaltyPercentage ? Number(savingData.penaltyPercentage) : 0;
              
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
              
              // Create plan data with validation
              const planData = {
                id: savingName.trim(),
                address: userChildContractAddress,
                name: savingName.trim(),
                currentAmount: currentFormatted,
                targetAmount: targetFormatted,
                progress,
                isEth,
                startTime: startTime, // Already in seconds
                maturityTime: maturityTime, // Already in seconds
                penaltyPercentage,
                tokenName,
                tokenLogo
              };
              
              // Validate required fields before adding to arrays
              if (!planData.id || !planData.name) {
                console.warn(`Skipping saving "${savingName}": Missing required fields (id or name)`);
                continue;
              }
              
              // Categorize plan
              const isCompleted = progress >= 100 || now >= maturityTime;
              console.log(`Categorizing "${savingName}": progress=${progress}%, nowSeconds=${now}, maturitySeconds=${maturityTime}, now>=maturity=${now >= maturityTime}, isCompleted=${isCompleted}`);
              
              if (isCompleted) {
                console.log(`Adding "${savingName}" to completed plans`);
                completedPlans.push(planData);
              } else {
                console.log(`Adding "${savingName}" to current plans`);
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
      
      console.log(`Processed ${validSavingNames.length} savings: ${currentPlans.length} current, ${completedPlans.length} completed`);
      console.log(`Current plans:`, currentPlans.map(p => ({id: p.id, name: p.name, progress: p.progress, startTime: p.startTime, maturityTime: p.maturityTime})));
      console.log(`Completed plans:`, completedPlans.map(p => ({id: p.id, name: p.name, progress: p.progress, startTime: p.startTime, maturityTime: p.maturityTime})));
      
      // Base network specific final summary
      if (chainIdBig === BASE_CHAIN_ID) {
        console.log(`=== Base Network Summary for user ${address} ===`);
        console.log(`Total savings processed: ${validSavingNames.length}`);
        console.log(`Current plans count: ${currentPlans.length}`);
        console.log(`Completed plans count: ${completedPlans.length}`);
        console.log(`User child contract: ${userChildContractAddress}`);
        console.log(`=== End Base Network Summary ===`);
      }
      
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
      
      console.log(`Final data summary: ${totalDeposits} total deposits, ${currentPlans.length} current plans, ${completedPlans.length} completed plans, $${totalUsdValue.toFixed(2)} total locked`);
      console.log(`Final current plans count: ${finalData.currentPlans.length}`);
      console.log(`Final completed plans count: ${finalData.completedPlans.length}`);
      
      // Final Base network debug completion
      if (chainIdBig === BASE_CHAIN_ID) {
        console.log(`=== Base Network Debug Complete for user ${address} ===`);
      }
      
      return finalData;
      
    } catch (error: any) {
      const code = error?.code;
      const msg = String(error?.message || '').toLowerCase();
      const userRejected = code === 4001 || code === 'ACTION_REJECTED' || msg.includes('rejected') || msg.includes('denied');
      
      console.error('Error in fetchSavingsData:', {
        code,
        message: error?.message,
        stack: error?.stack,
        error: error
      });
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
        console.log(`Using cached savings data for user ${address} on chain ${networkChainId}`);
        if (networkChainId === '8453') {
          console.log(`Base network: Using cached data - ${cachedData.currentPlans.length} current, ${cachedData.completedPlans.length} completed plans`);
        }
        setSavingsData(cachedData);
        setIsLoading(false); 
        setError(null);
        return;
      }
    }
    
    // No cached data or forced refresh - fetch from blockchain
    console.log(`Fetching fresh savings data for user ${address} on chain ${networkChainId}`);
    if (networkChainId === '8453') {
      console.log(`Base network: Fetching fresh data from blockchain`);
    }
    
    const freshData = await fetchSavingsDataFromBlockchain(false);
    
    if (freshData && isMountedRef.current) {
      console.log(`Fresh data received for user ${address} on chain ${networkChainId}`);
      if (networkChainId === '8453') {
        console.log(`Base network fresh data: ${freshData.currentPlans.length} current, ${freshData.completedPlans.length} completed plans`);
      }
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