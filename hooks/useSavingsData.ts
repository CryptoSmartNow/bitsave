import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import axios from 'axios';
import { SavingsData } from '../utils/savingsCache';

// Network chain IDs
const BASE_CHAIN_ID = BigInt(8453);
const CELO_CHAIN_ID = BigInt(42220);
const LISK_CHAIN_ID = BigInt(1135);
const BSC_CHAIN_ID = BigInt(56);
const AVALANCHE_CHAIN_ID = BigInt(43114);

interface UseSavingsDataReturn {
  savingsData: SavingsData;
  isLoading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;
  ethPrice: number;
  currentNetwork: string | null;
  isBaseNetwork: boolean;
  isCeloNetwork: boolean;
  isLiskNetwork: boolean;
  isBSCNetwork: boolean;
  isAvalancheNetwork: boolean;
  isCorrectNetwork: boolean;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  forceRefreshNetworkState: () => void;
}

const defaultSavingsData: SavingsData = {
  totalLocked: "0.00",
  deposits: 0,
  rewards: "0.00",
  currentPlans: [],
  completedPlans: []
};

function getTokenLogo(tokenName: string, tokenLogo?: string) {
  if (tokenLogo) return tokenLogo;
  if (tokenName === 'cUSD') return '/cusd.png';
  if (tokenName === 'cNGN') return '/cngn.png';
  if (tokenName === 'USDGLO') return '/usdglo.png';
  if (tokenName === 'Gooddollar' || tokenName === '$G') return '/$g.png';
  if (tokenName === 'USDC') return '/usdclogo.png';
  return `/${tokenName.toLowerCase()}.png`;
}

// In-memory global cache across route transitions
const memoryCache: Record<string, { data: SavingsData; timestamp: number }> = {};

export function useSavingsData(): UseSavingsDataReturn {
  const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
  const chainId = useChainId();
  const { ready, authenticated, user, getAccessToken } = usePrivy();

  const privyEvmWallet = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'ethereum'
  ) as { address: string } | undefined;
  const activeAddress = (wagmiAddress || privyEvmWallet?.address || user?.wallet?.address || '').toLowerCase();

  // Instant SWR initial state from memory or localStorage
  const [savingsData, setSavingsData] = useState<SavingsData>(() => {
    if (!activeAddress) return defaultSavingsData;
    if (memoryCache[activeAddress]?.data) return memoryCache[activeAddress].data;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`bitsave_cache_${activeAddress}`);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return defaultSavingsData;
  });

  const [isLoading, setIsLoading] = useState(() => {
    if (!activeAddress) return true;
    if (memoryCache[activeAddress]?.data) return false;
    if (typeof window !== 'undefined') {
      try {
        if (localStorage.getItem(`bitsave_cache_${activeAddress}`)) return false;
      } catch {}
    }
    return true;
  });

  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState(3500);
  
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
  const [isBaseNetwork, setIsBaseNetwork] = useState(false);
  const [isCeloNetwork, setIsCeloNetwork] = useState(false);
  const [isLiskNetwork, setIsLiskNetwork] = useState(false);
  const [isBSCNetwork, setIsBSCNetwork] = useState(false);
  const [isAvalancheNetwork, setIsAvalancheNetwork] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const isFetchingRef = useRef(false);

  // Network State
  useEffect(() => {
    if (!chainId) {
      setIsBaseNetwork(false); setIsCeloNetwork(false); setIsLiskNetwork(false);
      setIsBSCNetwork(false); setIsAvalancheNetwork(false);
      setIsCorrectNetwork(false); setCurrentNetwork(null);
      return;
    }

    const chainIdBigInt = BigInt(chainId);
    const isBase = chainIdBigInt === BASE_CHAIN_ID;
    const isCelo = chainIdBigInt === CELO_CHAIN_ID;
    const isLisk = chainIdBigInt === LISK_CHAIN_ID;
    const isBSC = chainIdBigInt === BSC_CHAIN_ID;
    const isAvalanche = chainIdBigInt === AVALANCHE_CHAIN_ID;

    setIsBaseNetwork(isBase); setIsCeloNetwork(isCelo);
    setIsLiskNetwork(isLisk); setIsBSCNetwork(isBSC); setIsAvalancheNetwork(isAvalanche);
    
    if (isBase) setCurrentNetwork('base');
    else if (isCelo) setCurrentNetwork('celo');
    else if (isLisk) setCurrentNetwork('lisk');
    else if (isBSC) setCurrentNetwork('bsc');
    else if (isAvalanche) setCurrentNetwork('avalanche');
    else setCurrentNetwork(null);

    setIsCorrectNetwork(isBase || isCelo || isLisk || isBSC || isAvalanche);
  }, [chainId]);

  // Price fetcher
  useEffect(() => {
    axios.get("/api/prices?ids=ethereum").then(res => setEthPrice(res.data?.ethereum?.usd || 3500)).catch(() => {});
  }, []);

  const saveCache = (addr: string, data: SavingsData) => {
    if (!addr) return;
    memoryCache[addr] = { data, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`bitsave_cache_${addr}`, JSON.stringify(data));
      } catch {}
    }
  };

  const fetchSavingsData = useCallback(async (forceRefresh = false) => {
    if (!ready) return;

    if (!authenticated && !isWagmiConnected && !activeAddress) {
      setIsLoading(false);
      setSavingsData(defaultSavingsData);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const hasCachedData = Boolean(memoryCache[activeAddress]?.data);
    if (!hasCachedData || forceRefresh) {
      if (hasCachedData) setIsBackgroundLoading(true);
      else setIsLoading(true);
    } else {
      setIsBackgroundLoading(true);
    }

    try {
      // 1. Try on-chain contract savings data first if address is present
      if (activeAddress && activeAddress.startsWith('0x')) {
        try {
          const onchainRes = await fetch(`/api/savings-data?address=${activeAddress}`);
          if (onchainRes.ok) {
            const onchainData = await onchainRes.json();
            if (onchainData && Array.isArray(onchainData.currentPlans)) {
              setSavingsData(onchainData);
              saveCache(activeAddress, onchainData);
              setError(null);
              setIsLoading(false);
              setIsBackgroundLoading(false);
              isFetchingRef.current = false;
              return;
            }
          }
        } catch {
          // Fallback to supplemental API
        }
      }

      // 2. Try SaveFi plans API
      let token: string | null = null;
      try {
        token = await getAccessToken();
      } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/savefi/plans', { headers }).catch(() => null);
      if (response && response.ok) {
        const resJson = await response.json().catch(() => ({}));
        const plans = resJson?.data || [];

        const currentPlans: any[] = [];
        const completedPlans: any[] = [];
        let totalLockedUsd = 0;
        let depositsCount = plans.length;

        const now = Math.floor(Date.now() / 1000);

        plans.forEach((p: any) => {
          if (currentNetwork && p.chain !== currentNetwork) return;

          const currentAmount = parseFloat(p.current_amount || "0");
          
          const startTime = new Date(p.start_time).getTime() / 1000;
          const maturityTime = new Date(p.maturity_time).getTime() / 1000;
          
          let progress = 0;
          if (maturityTime <= startTime || now >= maturityTime) progress = 100;
          else progress = Math.min(Math.floor(((now - startTime) / (maturityTime - startTime)) * 100), 100);

          const isCompleted = progress >= 100 || p.status === 'completed';

          const planObj = {
            id: p.id,
            name: p.plan_name,
            currentAmount: p.current_amount,
            targetAmount: p.target_amount,
            progress,
            isEth: p.token_symbol === 'ETH' || p.token_symbol === 'WETH',
            startTime,
            maturityTime,
            penaltyPercentage: p.penalty_percentage,
            tokenName: p.token_symbol,
            tokenLogo: getTokenLogo(p.token_symbol),
            network: p.chain,
            contractAddress: p.contract_address,
          };

          if (planObj.isEth) totalLockedUsd += currentAmount * ethPrice;
          else if (p.token_symbol === 'cNGN') totalLockedUsd += currentAmount * 0.0007426;
          else totalLockedUsd += currentAmount;

          if (isCompleted || p.status === 'withdrawn') {
            completedPlans.push(planObj);
          } else {
            currentPlans.push(planObj);
          }
        });

        setSavingsData({
          totalLocked: totalLockedUsd.toFixed(2),
          deposits: depositsCount,
          rewards: "0.00",
          currentPlans,
          completedPlans
        });
        setError(null);
      } else {
        setSavingsData(defaultSavingsData);
      }
      
    } catch {
      setSavingsData(defaultSavingsData);
      setError(null);
    } finally {
      setIsLoading(false);
      setIsBackgroundLoading(false);
      isFetchingRef.current = false;
    }
  }, [ready, authenticated, isWagmiConnected, activeAddress, currentNetwork, ethPrice, getAccessToken]);

  // Initial and reactive fetch on account/network changes
  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);

  // Reactive listener for transaction events (topup, withdraw, create)
  useEffect(() => {
    const handleUpdate = () => {
      fetchSavingsData(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('bitsave_tx_updated', handleUpdate);
      window.addEventListener('bitsave_plan_created', handleUpdate);
      return () => {
        window.removeEventListener('bitsave_tx_updated', handleUpdate);
        window.removeEventListener('bitsave_plan_created', handleUpdate);
      };
    }
  }, [fetchSavingsData]);

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
    isAvalancheNetwork,
    isCorrectNetwork,
    refetch: fetchSavingsData,
    clearCache: () => setSavingsData(defaultSavingsData),
    forceRefreshNetworkState: () => {},
  };
}