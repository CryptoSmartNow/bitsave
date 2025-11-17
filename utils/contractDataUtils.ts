import { ethers } from 'ethers';
import CONTRACT_ABI from '@/app/abi/contractABI.js';
import { calculateTVLFromUserInteractions, formatTVLForDisplay } from './tvlCalculationUtils';

// Network configurations with contract addresses
export const NETWORK_CONFIGS = {
  base: {
    name: 'Base',
    chainId: 8453,
    contractAddress: '0x3593546078eecd0ffd1c19317f53ee565be6ca13',
    rpcUrl: 'https://mainnet.base.org',
    color: 'from-[#81D7B4] to-[#66C4A3]',
    borderColor: 'border-[#81D7B4]',
    textColor: 'text-[#81D7B4]',
  },
  lisk: {
    name: 'Lisk',
    chainId: 1135,
    contractAddress: '0x3593546078eECD0FFd1c19317f53ee565be6ca13',
    rpcUrl: 'https://rpc.api.lisk.com',
    color: 'from-[#81D7B4] to-[#66C4A3]',
    borderColor: 'border-[#81D7B4]',
    textColor: 'text-[#81D7B4]',
  },
  celo: {
    name: 'Celo',
    chainId: 42220,
    contractAddress: '0x7d839923Eb2DAc3A0d1cABb270102E481A208F33',
    rpcUrl: 'https://forno.celo.org',
    color: 'from-[#81D7B4] to-[#66C4A3]',
    borderColor: 'border-[#81D7B4]',
    textColor: 'text-[#81D7B4]',
  },
};

export interface ContractData {
  tvl: string;
  userCount: string;
  vaultState: string;
  rewardPool: string;
  fountain: string;
  totalSavingsLocked: string;
}

export class ContractDataFetcher {
  private providers: Record<string, ethers.JsonRpcProvider> = {};
  private contracts: Record<string, ethers.Contract> = {};

  constructor() {
    // Initialize providers and contracts for each network
    Object.entries(NETWORK_CONFIGS).forEach(([networkKey, config]) => {
      try {
        this.providers[networkKey] = new ethers.JsonRpcProvider(config.rpcUrl);
        this.contracts[networkKey] = new ethers.Contract(
          config.contractAddress,
          CONTRACT_ABI,
          this.providers[networkKey]
        );
      } catch (error) {
        console.error(`Failed to initialize ${networkKey} provider:`, error);
      }
    });
  }

  async fetchNetworkData(networkKey: string): Promise<ContractData> {
    const config = NETWORK_CONFIGS[networkKey as keyof typeof NETWORK_CONFIGS];
    
    if (!config) {
      throw new Error(`Network ${networkKey} not found`);
    }

    console.log(`🔍 Fetching data for ${config.name}...`);
    
    try {
      // Test provider connectivity with timeout
      const provider = this.providers[networkKey];
      const networkPromise = provider.getNetwork();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Network connection timeout')), 10000)
      );
      
      const network = await Promise.race([networkPromise, timeoutPromise]);
      console.log(`✅ Connected to ${config.name} (Chain ID: ${network.chainId})`);
      
      const contract = this.contracts[networkKey];
      
      // Fetch data with individual timeouts and error handling
      const fetchWithTimeout = async (contractCall: Promise<any>, name: string, timeout = 8000) => {
        const callPromise = contractCall;
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`${name} call timeout`)), timeout)
        );
        
        try {
          return await Promise.race([callPromise, timeoutPromise]);
        } catch (error) {
          console.error(`❌ ${name} call failed for ${config.name}:`, error);
          throw error;
        }
      };

      // Fetch available contract data (including total savings locked)
    const results = await Promise.allSettled([
      fetchWithTimeout(contract.rewardPool(), 'Reward Pool'),
      fetchWithTimeout(contract.currentVaultState(), 'Vault State'),
      fetchWithTimeout(contract.fountain(), 'Fountain'),
      fetchWithTimeout(contract.currentTotalValueLocked(), 'Total Savings Locked')
    ]);

      console.log(`📊 Raw results for ${config.name}:`, results);

      // Process results with fallbacks
      const rewardPoolResult = results[0];
    const vaultStateResult = results[1];
    const fountainResult = results[2];
    const totalSavingsLockedResult = results[3];

    console.log(`📊 Results for ${config.name}:`, {
      rewardPool: rewardPoolResult.status,
      vaultState: vaultStateResult.status,
      fountain: fountainResult.status,
      totalSavingsLocked: totalSavingsLockedResult.status,
    });

    // Calculate TVL using available data
    let tvl = '0.00';
    
    // Since currentTotalValueLocked doesn't exist, use rewardPool as a proxy for TVL
    if (rewardPoolResult.status === 'fulfilled' && rewardPoolResult.value && rewardPoolResult.value.toString() !== '0') {
      try {
        const rewardValue = rewardPoolResult.value;
        console.log(`🎁 Using reward pool as TVL proxy for ${config.name}:`, rewardValue.toString());
        tvl = ethers.formatUnits(rewardValue, 18);
        if (parseFloat(tvl) < 0.000001) {
          tvl = ethers.formatUnits(rewardValue, 6);
        }
        console.log(`💰 ${config.name} TVL (from reward pool): ${tvl}`);
      } catch (error) {
        console.error(`❌ Error using reward pool for ${config.name}:`, error);
      }
    } else {
      // If no reward pool data, try using vault state
      if (vaultStateResult.status === 'fulfilled' && vaultStateResult.value && vaultStateResult.value.toString() !== '0') {
        try {
          const vaultValue = vaultStateResult.value;
          console.log(`🏦 Using vault state as TVL proxy for ${config.name}:`, vaultValue.toString());
          tvl = ethers.formatUnits(vaultValue, 18);
          if (parseFloat(tvl) < 0.000001) {
            tvl = ethers.formatUnits(vaultValue, 6);
          }
          console.log(`💰 ${config.name} TVL (from vault state): ${tvl}`);
        } catch (error) {
          console.error(`❌ Error using vault state for ${config.name}:`, error);
        }
      }
    }

      const userCount = '0'; // userCount function not available on all contracts
        const rewardPool = rewardPoolResult.status === 'fulfilled' ? 
          ethers.formatEther(rewardPoolResult.value) : '0.00';
        const vaultState = vaultStateResult.status === 'fulfilled' ? vaultStateResult.value.toString() : '0';
        const fountain = fountainResult.status === 'fulfilled' ? 
          ethers.formatEther(fountainResult.value) : '0.00';
        
        // Process total savings locked
        let totalSavingsLocked = '0.00';
        if (totalSavingsLockedResult.status === 'fulfilled' && totalSavingsLockedResult.value) {
          try {
            totalSavingsLocked = ethers.formatUnits(totalSavingsLockedResult.value, 18);
            if (parseFloat(totalSavingsLocked) < 0.000001) {
              totalSavingsLocked = ethers.formatUnits(totalSavingsLockedResult.value, 6);
            }
            console.log(`🔒 ${config.name} Total Savings Locked: ${totalSavingsLocked}`);
          } catch (error) {
            console.error(`❌ Error processing total savings locked for ${config.name}:`, error);
            totalSavingsLocked = '0.00';
          }
        }

      console.log(`✅ Processed data for ${config.name}:`, {
        tvl,
        userCount,
        vaultState,
        rewardPool,
        fountain,
        totalSavingsLocked
      });

      return {
        tvl,
        userCount,
        vaultState,
        rewardPool,
        fountain,
        totalSavingsLocked
      };

    } catch (error) {
      console.error(`❌ Error fetching data for ${config.name}:`, error);
      
      // Return default values instead of throwing
      return {
        tvl: '0.00',
        userCount: '0',
        vaultState: '0.00',
        rewardPool: '0.00',
        fountain: '0.00',
        totalSavingsLocked: '0.00'
      };
    }
  }

  async fetchAllNetworksData(): Promise<Record<string, ContractData | null>> {
    const results: Record<string, ContractData | null> = {};
    
    const promises = Object.keys(NETWORK_CONFIGS).map(async (networkKey) => {
      try {
        const data = await this.fetchNetworkData(networkKey);
        results[networkKey] = data;
      } catch (error) {
        console.error(`Failed to fetch data for ${networkKey}:`, error);
        results[networkKey] = null;
      }
    });

    await Promise.all(promises);
    return results;
  }

  // New method to fetch TVL data from user interactions
  async fetchTVLFromUserInteractions(): Promise<Record<string, ContractData | null>> {
    try {
      console.log('🔍 Calculating TVL from user interactions...');
      
      const tvlSummary = await calculateTVLFromUserInteractions();
      const formattedTVL = formatTVLForDisplay(tvlSummary);
      
      console.log('📊 TVL Summary:', tvlSummary);
      console.log('🎨 Formatted TVL:', formattedTVL);
      
      const results: Record<string, ContractData | null> = {};
      
      // Initialize all networks with default values
      Object.keys(NETWORK_CONFIGS).forEach(networkKey => {
        results[networkKey] = {
          tvl: '0.00',
          userCount: '0',
          vaultState: '0.00',
          rewardPool: '0.00',
          fountain: '0.00',
          totalSavingsLocked: '0.00'
        };
      });
      
      // Update with actual data from user interactions
      formattedTVL.chainBreakdown.forEach(chainData => {
        const networkKey = chainData.chain.toLowerCase();
        if (results[networkKey]) {
          results[networkKey]!.tvl = chainData.totalValue;
          results[networkKey]!.userCount = chainData.savingsCount.toString();
          
          // Set rewardPool to the total value for display purposes
          results[networkKey]!.rewardPool = chainData.totalValue;
          
          console.log(`✅ Updated ${chainData.displayName}: TVL=${chainData.totalValue}, Savings=${chainData.savingsCount}`);
        }
      });
      
      console.log('🎯 Final results from user interactions:', results);
      
      return results;
      
    } catch (error) {
      console.error('❌ Error fetching TVL from user interactions:', error);
      
      // Return default values for all networks
      const results: Record<string, ContractData | null> = {};
      Object.keys(NETWORK_CONFIGS).forEach(networkKey => {
        results[networkKey] = {
          tvl: '0.00',
          userCount: '0',
          vaultState: '0.00',
          rewardPool: '0.00',
          fountain: '0.00',
          totalSavingsLocked: '0.00'
        };
      });
      
      return results;
    }
  }

  // Helper method to calculate total TVL across all networks
  calculateTotalTVL(networkData: Record<string, ContractData | null>): string {
    let total = 0;
    
    Object.values(networkData).forEach((data) => {
      if (data && data.tvl) {
        total += parseFloat(data.tvl);
      }
    });

    return total.toString();
  }

  // Helper method to format currency values
  formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  }

  // Helper method to format numbers
  formatNumber(value: string): string {
    const num = parseInt(value);
    if (isNaN(num)) return '0';
    return num.toLocaleString();
  }
}

// Export a singleton instance
export const contractDataFetcher = new ContractDataFetcher();