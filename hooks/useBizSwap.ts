/**
 * useBizSwap – Comprehensive hook for the BizSwap multi-market protocol.
 *
 * Reads all on-chain state (sale, holdings, LP, vault) and exposes typed
 * write actions (approve, buy, claim, sell, provideLiquidity).
 *
 * Usage:
 *   const biz = useBizSwap();
 *   biz.buy(5n); // buy 5 shares
 */

import { useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  MarketFactoryABI,
  BizShareABI,
  BizSwapSaleABI,
  PayoutVaultABI,
  BizSwapLPABI,
  ERC20ABI,
  BIZSWAP_FACTORY_ADDRESS,
  BIZSWAP_ASSET_ADDRESS,
  BIZSWAP_CHAIN_ID,
  isValidAddress,
  parseMarketConfig,
  formatTokenAmount,
  toTokenUnits,
  type MarketConfig,
  type SaleData,
  type UserHoldings,
  type LPData,
} from '@/lib/bizswap-contracts';

// ─── Constants ──────────────────────────────────────────────────
const SHARE_DECIMALS = 18; // BizShare is 18-decimal ERC20
const ASSET_DECIMALS = 6;  // USDC is 6-decimal
const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

// ─── Hook ───────────────────────────────────────────────────────
export function useBizSwap() {
  const { address } = useAccount();
  const factoryValid = isValidAddress(BIZSWAP_FACTORY_ADDRESS);

  // ── Step 1: Resolve market addresses from factory ─────────
  const {
    data: marketConfigRaw,
    isLoading: isMarketLoading,
    refetch: refetchMarket,
  } = useReadContract({
    address: BIZSWAP_FACTORY_ADDRESS,
    abi: MarketFactoryABI as any,
    functionName: 'marketConfigByAsset',
    args: [BIZSWAP_ASSET_ADDRESS],
    chainId: BIZSWAP_CHAIN_ID,
    query: { enabled: factoryValid },
  });

  const market: MarketConfig | null = useMemo(
    () => parseMarketConfig(marketConfigRaw as any),
    [marketConfigRaw],
  );

  const hasMarket = !!market && isValidAddress(market.token);

  // ── Step 2: Factory-level config reads ────────────────────
  const { data: factoryReads } = useReadContracts({
    contracts: [
      {
        address: BIZSWAP_FACTORY_ADDRESS,
        abi: MarketFactoryABI as any,
        functionName: 'salePricePerShare',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: BIZSWAP_FACTORY_ADDRESS,
        abi: MarketFactoryABI as any,
        functionName: 'saleMaxSupply',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: BIZSWAP_FACTORY_ADDRESS,
        abi: MarketFactoryABI as any,
        functionName: 'DEFAULT_WEEKLY_PAYOUT',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: BIZSWAP_FACTORY_ADDRESS,
        abi: MarketFactoryABI as any,
        functionName: 'TOTAL_CYCLES',
        chainId: BIZSWAP_CHAIN_ID,
      },
    ],
    query: { enabled: factoryValid },
  });

  const salePricePerShare = (factoryReads?.[0]?.result as bigint) ?? 0n;
  const saleMaxSupply = (factoryReads?.[1]?.result as bigint) ?? 0n;
  const defaultWeeklyPayout = (factoryReads?.[2]?.result as bigint) ?? 0n;
  const totalCycles = (factoryReads?.[3]?.result as bigint) ?? 0n;

  // ── Step 3: Sale contract reads ───────────────────────────
  const { data: saleReads, refetch: refetchSale } = useReadContracts({
    contracts: [
      {
        address: market?.sale,
        abi: BizSwapSaleABI as any,
        functionName: 'totalSold',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.sale,
        abi: BizSwapSaleABI as any,
        functionName: 'isActive',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.sale,
        abi: BizSwapSaleABI as any,
        functionName: 'startTime',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.sale,
        abi: BizSwapSaleABI as any,
        functionName: 'endTime',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.sale,
        abi: BizSwapSaleABI as any,
        functionName: 'maxSupply',
        chainId: BIZSWAP_CHAIN_ID,
      },
    ],
    query: { enabled: hasMarket },
  });

  const sale: SaleData = useMemo(() => ({
    pricePerShare: salePricePerShare,
    maxSupply: (saleReads?.[4]?.result as bigint) ?? saleMaxSupply,
    totalSold: (saleReads?.[0]?.result as bigint) ?? 0n,
    isActive: (saleReads?.[1]?.result as boolean) ?? false,
    startTime: (saleReads?.[2]?.result as bigint) ?? 0n,
    endTime: (saleReads?.[3]?.result as bigint) ?? 0n,
  }), [saleReads, salePricePerShare, saleMaxSupply]);

  // ── Step 4: User-specific reads ───────────────────────────
  const { data: userReads, refetch: refetchUser } = useReadContracts({
    contracts: [
      // BizShare balance
      {
        address: market?.token,
        abi: BizShareABI as any,
        functionName: 'balanceOf',
        args: [address!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // Pending yield
      {
        address: market?.vault,
        abi: PayoutVaultABI as any,
        functionName: 'pending',
        args: [address!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // Current cycle
      {
        address: market?.vault,
        abi: PayoutVaultABI as any,
        functionName: 'currentCycle',
        chainId: BIZSWAP_CHAIN_ID,
      },
      // Last claimed cycle
      {
        address: market?.vault,
        abi: PayoutVaultABI as any,
        functionName: 'lastClaimedCycle',
        args: [address!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // Payout per share
      {
        address: market?.vault,
        abi: PayoutVaultABI as any,
        functionName: 'payoutPerShare',
        chainId: BIZSWAP_CHAIN_ID,
      },
      // USDC balance
      {
        address: BIZSWAP_ASSET_ADDRESS,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: [address!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // USDC allowance for Sale
      {
        address: BIZSWAP_ASSET_ADDRESS,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [address!, market?.sale!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // USDC allowance for LP
      {
        address: BIZSWAP_ASSET_ADDRESS,
        abi: ERC20ABI,
        functionName: 'allowance',
        args: [address!, market?.lp!],
        chainId: BIZSWAP_CHAIN_ID,
      },
      // BizShare expiry
      {
        address: market?.token,
        abi: BizShareABI as any,
        functionName: 'expiryTimestamp',
        chainId: BIZSWAP_CHAIN_ID,
      },
    ],
    query: { enabled: hasMarket && !!address },
  });

  const holdings: UserHoldings = useMemo(() => ({
    balance: (userReads?.[0]?.result as bigint) ?? 0n,
    pendingYield: (userReads?.[1]?.result as bigint) ?? 0n,
    currentCycle: (userReads?.[2]?.result as bigint) ?? 0n,
    lastClaimed: (userReads?.[3]?.result as bigint) ?? 0n,
    payoutPerShare: (userReads?.[4]?.result as bigint) ?? defaultWeeklyPayout,
  }), [userReads, defaultWeeklyPayout]);

  const usdcBalance = (userReads?.[5]?.result as bigint) ?? 0n;
  const saleAllowance = (userReads?.[6]?.result as bigint) ?? 0n;
  const lpAllowance = (userReads?.[7]?.result as bigint) ?? 0n;
  const expiryTimestamp = (userReads?.[8]?.result as bigint) ?? 0n;

  // ── Step 5: LP reads ──────────────────────────────────────
  const { data: lpReads } = useReadContracts({
    contracts: [
      {
        address: market?.lp,
        abi: BizSwapLPABI as any,
        functionName: 'fixedSellFee',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.lp,
        abi: BizSwapLPABI as any,
        functionName: 'feePercent',
        chainId: BIZSWAP_CHAIN_ID,
      },
      {
        address: market?.lp,
        abi: BizSwapLPABI as any,
        functionName: 'principalPerShare',
        chainId: BIZSWAP_CHAIN_ID,
      },
    ],
    query: { enabled: hasMarket },
  });

  const lp: LPData = useMemo(() => ({
    fixedSellFee: (lpReads?.[0]?.result as bigint) ?? 0n,
    feePercent: (lpReads?.[1]?.result as bigint) ?? 0n,
    principalPerShare: (lpReads?.[2]?.result as bigint) ?? 0n,
  }), [lpReads]);

  // ── Step 6: Write contract hooks ──────────────────────────
  const { writeContractAsync, data: txHash, isPending: isTxPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // ── Approve USDC for sale contract ─────────────────────────
  const approveSale = useCallback(async (shareAmount: bigint) => {
    if (!market?.sale) throw new Error('Market not loaded');
    const cost = shareAmount * salePricePerShare;
    return writeContractAsync({
      address: BIZSWAP_ASSET_ADDRESS,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [market.sale, cost],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, salePricePerShare, writeContractAsync]);

  // ── Buy shares from primary sale ───────────────────────────
  const buy = useCallback(async (shareAmount: bigint) => {
    if (!market?.sale) throw new Error('Market not loaded');
    // shareAmount is in whole shares; the contract expects share units (18 decimals)
    const units = shareAmount * (10n ** BigInt(SHARE_DECIMALS));
    return writeContractAsync({
      address: market.sale,
      abi: BizSwapSaleABI as any,
      functionName: 'buy',
      args: [units],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Claim accrued yield ────────────────────────────────────
  const claimYield = useCallback(async () => {
    if (!market?.vault) throw new Error('Market not loaded');
    return writeContractAsync({
      address: market.vault,
      abi: PayoutVaultABI as any,
      functionName: 'claim',
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Approve BizShare tokens for LP (sell) ──────────────────
  const approveLpSell = useCallback(async (shareAmount: bigint) => {
    if (!market?.lp || !market?.token) throw new Error('Market not loaded');
    const units = shareAmount * (10n ** BigInt(SHARE_DECIMALS));
    return writeContractAsync({
      address: market.token,
      abi: BizShareABI as any,
      functionName: 'approve',
      args: [market.lp, units],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Sell shares on secondary market ────────────────────────
  const sell = useCallback(async (shareAmount: bigint) => {
    if (!market?.lp) throw new Error('Market not loaded');
    const units = shareAmount * (10n ** BigInt(SHARE_DECIMALS));
    return writeContractAsync({
      address: market.lp,
      abi: BizSwapLPABI as any,
      functionName: 'sell',
      args: [units],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Approve USDC for LP liquidity provision ────────────────
  const approveLpDeposit = useCallback(async (usdcAmount: bigint) => {
    if (!market?.lp) throw new Error('Market not loaded');
    return writeContractAsync({
      address: BIZSWAP_ASSET_ADDRESS,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [market.lp, usdcAmount],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Provide liquidity to LP pool ───────────────────────────
  const provideLiquidity = useCallback(async (usdcAmount: bigint) => {
    if (!market?.lp) throw new Error('Market not loaded');
    return writeContractAsync({
      address: market.lp,
      abi: BizSwapLPABI as any,
      functionName: 'provideLiquidity',
      args: [usdcAmount],
      chainId: BIZSWAP_CHAIN_ID,
    });
  }, [market, writeContractAsync]);

  // ── Helpers ────────────────────────────────────────────────
  const needsSaleApproval = useCallback((shareAmount: bigint): boolean => {
    const cost = shareAmount * salePricePerShare;
    return saleAllowance < cost;
  }, [saleAllowance, salePricePerShare]);

  const needsLpApproval = useCallback((usdcAmount: bigint): boolean => {
    return lpAllowance < usdcAmount;
  }, [lpAllowance]);

  const refetch = useCallback(() => {
    refetchMarket();
    refetchSale();
    refetchUser();
  }, [refetchMarket, refetchSale, refetchUser]);

  // ── Derived display values ────────────────────────────────
  const shareBalanceFormatted = formatTokenAmount(holdings.balance, SHARE_DECIMALS, 0);
  const pendingYieldFormatted = formatTokenAmount(holdings.pendingYield, ASSET_DECIMALS, 2);
  const usdcBalanceFormatted = formatTokenAmount(usdcBalance, ASSET_DECIMALS, 2);
  const priceFormatted = formatTokenAmount(salePricePerShare, ASSET_DECIMALS, 2);
  const totalSoldShares = sale.totalSold / (10n ** BigInt(SHARE_DECIMALS));
  const maxSupplyShares = sale.maxSupply / (10n ** BigInt(SHARE_DECIMALS));
  const availableShares = maxSupplyShares - totalSoldShares;
  const payoutPerShareFormatted = formatTokenAmount(holdings.payoutPerShare, ASSET_DECIMALS, 2);

  return {
    // Status
    isLoading: isMarketLoading,
    isTxPending,
    isConfirming,
    isConfirmed,
    txHash,
    hasMarket,
    factoryValid,

    // Market config
    market,

    // Sale state
    sale,
    salePricePerShare,
    totalSoldShares,
    maxSupplyShares,
    availableShares,
    priceFormatted,

    // User position
    holdings,
    shareBalanceFormatted,
    pendingYieldFormatted,
    payoutPerShareFormatted,
    expiryTimestamp,

    // USDC
    usdcBalance,
    usdcBalanceFormatted,
    saleAllowance,
    lpAllowance,

    // LP
    lp,

    // Factory config
    totalCycles,
    defaultWeeklyPayout,

    // Actions
    approveSale,
    buy,
    claimYield,
    approveLpSell,
    sell,
    approveLpDeposit,
    provideLiquidity,

    // Helpers
    needsSaleApproval,
    needsLpApproval,
    refetch,
  };
}
