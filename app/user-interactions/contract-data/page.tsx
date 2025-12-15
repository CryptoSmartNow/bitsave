'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Exo } from 'next/font/google';
import UserInteractionsSidebar, { SidebarState } from '../../../components/UserInteractionsSidebar';
import { contractDataFetcher, NETWORK_CONFIGS, ContractData } from '../../../utils/contractDataUtils';
import { 
  Database, 
  TrendingUp, 
  RefreshCw, 
  DollarSign, 
  Activity, 
  Globe,
  Wallet,
  BarChart3,
  Info,
  Coins
} from 'lucide-react';

const exo = Exo({
  subsets: ['latin'],
  display: 'swap',
});

interface NetworkData extends ContractData {
  network: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export default function ContractDataPage() {
  const [sidebarState, setSidebarState] = useState<SidebarState>('open');
  const [networkData, setNetworkData] = useState<Record<string, NetworkData>>({});
  const [totalTVL, setTotalTVL] = useState<string>('0');
  const [totalSavingsLocked, setTotalSavingsLocked] = useState<string>('0');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState<Date | null>(null);

  // Initialize network data


  const fetchNetworkData = async (networkKey: string) => {
    try {
      setNetworkData(prev => ({
        ...prev,
        [networkKey]: { ...prev[networkKey], isLoading: true, error: null }
      }));

      // Use the contract data fetcher to get real data
      const contractData = await contractDataFetcher.fetchNetworkData(networkKey);

      setNetworkData(prev => ({
        ...prev,
        [networkKey]: {
          ...prev[networkKey],
          ...contractData,
          isLoading: false,
          lastUpdated: new Date(),
        }
      }));
    } catch (error) {
      setNetworkData(prev => ({
        ...prev,
        [networkKey]: {
          ...prev[networkKey],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch data',
        }
      }));
    }
  };

  const fetchAllNetworkData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Use the new user interactions method for TVL calculation
      console.log('🔄 Fetching TVL data from user interactions...');
      const userInteractionsData = await contractDataFetcher.fetchTVLFromUserInteractions();
      
      // Update network data with user interactions results
      const updatedNetworkData: Record<string, NetworkData> = {};
      Object.keys(NETWORK_CONFIGS).forEach(networkKey => {
        const data = userInteractionsData[networkKey];
        updatedNetworkData[networkKey] = {
          network: networkKey,
          tvl: data?.tvl || '0.00',
          userCount: data?.userCount || '0',
          vaultState: data?.vaultState || '0.00',
          rewardPool: data?.rewardPool || '0.00',
          fountain: data?.fountain || '0.00',
          totalSavingsLocked: data?.totalSavingsLocked || '0.00',
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        };
      });
      
      setNetworkData(updatedNetworkData);
      console.log('✅ Updated network data from user interactions:', updatedNetworkData);
      
    } catch (error) {
      console.error('❌ Error fetching data from user interactions:', error);
      
      // Fallback to contract method if user interactions fail
      console.log('🔄 Falling back to contract method...');
      const promises = Object.keys(NETWORK_CONFIGS).map(network => fetchNetworkData(network));
      await Promise.all(promises);
    }
    
    setIsRefreshing(false);
    setLastGlobalUpdate(new Date());
  }, []);

  // Initialize network data
  useEffect(() => {
    const initialData: Record<string, NetworkData> = {};
    Object.keys(NETWORK_CONFIGS).forEach(networkKey => {
      initialData[networkKey] = {
        network: networkKey,
        tvl: '0.00',
        userCount: '0',
        vaultState: '0.00',
        rewardPool: '0.00',
        fountain: '0.00',
        totalSavingsLocked: '0.00',
        isLoading: true,
        error: null,
        lastUpdated: null,
      };
    });
    setNetworkData(initialData);
    fetchAllNetworkData();
  }, [fetchAllNetworkData]);

  // Calculate total TVL
  useEffect(() => {
    const total = Object.values(networkData).reduce((sum, data) => {
      if (!data.isLoading && !data.error) {
        return sum + parseFloat(data.tvl);
      }
      return sum;
    }, 0);
    setTotalTVL(total.toFixed(2));
  }, [networkData]);

  // Calculate total savings locked
  useEffect(() => {
    const total = Object.values(networkData).reduce((sum, data) => {
      if (!data.isLoading && !data.error) {
        return sum + parseFloat(data.totalSavingsLocked);
      }
      return sum;
    }, 0);
    setTotalSavingsLocked(total.toFixed(2));
  }, [networkData]);

  return (
    <div className={`${exo.className} min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}>
      <div className="flex">
        <UserInteractionsSidebar 
          sidebarState={sidebarState} 
          setSidebarState={setSidebarState} 
        />

        {/* Main Content */}
        <div className={`flex-1 p-8 transition-all duration-300 ${
          sidebarState === 'open' ? 'ml-80' : 
          sidebarState === 'collapsed' ? 'ml-24' : 
          'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] bg-clip-text text-transparent">
                  Contract Data
                </h1>
                <p className="text-gray-300 mt-2">Monitor Total Value Locked and contract metrics across networks</p>
              </div>
              <button
                onClick={fetchAllNetworkData}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total TVL</p>
                    <p className="text-3xl font-bold text-white mt-1">{contractDataFetcher.formatCurrency(totalTVL)}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#81D7B4] to-[ #81D7B4] rounded-xl">
                    <DollarSign className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Savings Locked</p>
                    <p className="text-3xl font-bold text-white mt-1">{contractDataFetcher.formatCurrency(totalSavingsLocked)}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#81D7B4] to-[ #81D7B4] rounded-xl">
                    <Coins className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Active Networks</p>
                    <p className="text-3xl font-bold text-white mt-1">{Object.keys(NETWORK_CONFIGS).length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#81D7B4] to-[ #81D7B4] rounded-xl">
                    <Globe className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Last Updated</p>
                    <p className="text-lg font-semibold text-white mt-1">
                      {lastGlobalUpdate ? lastGlobalUpdate.toLocaleTimeString() : 'Never'}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#81D7B4] to-[ #81D7B4] rounded-xl">
                    <Activity className="w-6 h-6 text-gray-900" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Network Data Cards */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Network Details</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(NETWORK_CONFIGS).map(([networkKey, network], index) => {
                  const data = networkData[networkKey];
                  if (!data) return null;

                  return (
                    <motion.div
                      key={networkKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-gray-700/30 shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-gradient-to-r ${network.color} rounded-lg`}>
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white">{network.name}</h3>
                        </div>
                        {data.isLoading && (
                          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                        )}
                      </div>

                      {data.error ? (
                        <div className="text-center py-8">
                          <div className="p-3 bg-red-500/20 rounded-xl mb-4 inline-block">
                            <Info className="w-6 h-6 text-red-400" />
                          </div>
                          <p className="text-red-400 text-sm">{data.error}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <TrendingUp className={`w-5 h-5 ${network.textColor}`} />
                              <span className="text-gray-300 font-medium">TVL</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                              {data.isLoading ? '...' : contractDataFetcher.formatCurrency(data.tvl)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <Wallet className={`w-5 h-5 ${network.textColor}`} />
                              <span className="text-gray-300 font-medium">Users</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                              {data.isLoading ? '...' : contractDataFetcher.formatNumber(data.userCount)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <Coins className={`w-5 h-5 ${network.textColor}`} />
                              <span className="text-gray-300 font-medium">Savings Locked</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                              {data.isLoading ? '...' : contractDataFetcher.formatCurrency(data.totalSavingsLocked)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <BarChart3 className={`w-5 h-5 ${network.textColor}`} />
                              <span className="text-gray-300 font-medium">Vault State</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                              {data.isLoading ? '...' : contractDataFetcher.formatCurrency(data.vaultState)}
                            </span>
                          </div>

                          {data.lastUpdated && (
                            <div className="text-center pt-2">
                              <p className="text-gray-400 text-xs">
                                Updated: {data.lastUpdated.toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}