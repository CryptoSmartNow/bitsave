/**
 * BizSwap Contract Configuration
 *
 * Central module exporting ABIs, addresses, and types for the BizSwap
 * multi-market protocol. All 6 contract ABIs are imported from the
 * bizswap_abi folder and re-exported as typed constants.
 */

// ─── ABIs ────────────────────────────────────────────────────────
import MarketFactoryABI from '@/app/abi/bizswap_abi/MarketFactory.json';
import BizShareABI from '@/app/abi/bizswap_abi/BizShare.json';
import BizSwapSaleABI from '@/app/abi/bizswap_abi/BizSwapSale.json';
import PayoutVaultABI from '@/app/abi/bizswap_abi/PayoutVault.json';
import BizSwapLPABI from '@/app/abi/bizswap_abi/BizSwapLP.json';
import TreasuryRouterABI from '@/app/abi/bizswap_abi/TreasuryRouter.json';

export {
  MarketFactoryABI,
  BizShareABI,
  BizSwapSaleABI,
  PayoutVaultABI,
  BizSwapLPABI,
  TreasuryRouterABI,
};

// ─── Minimal ERC-20 ABI for approve / allowance / balanceOf ─────
export const ERC20ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
] as const;

// ─── Addresses ──────────────────────────────────────────────────
export const BIZSWAP_FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_BIZSWAP_FACTORY ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

// The payment asset used for BizSwap markets (USDC on Base)
export const BIZSWAP_ASSET_ADDRESS = (process.env.NEXT_PUBLIC_BIZSWAP_ASSET ??
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913') as `0x${string}`;

// Base chain ID
export const BIZSWAP_CHAIN_ID = 8453;

// ─── Types ──────────────────────────────────────────────────────
export interface MarketConfig {
  token: `0x${string}`;
  sale: `0x${string}`;
  vault: `0x${string}`;
  lp: `0x${string}`;
  router: `0x${string}`;
}

export interface SaleData {
  pricePerShare: bigint;
  maxSupply: bigint;
  totalSold: bigint;
  isActive: boolean;
  startTime: bigint;
  endTime: bigint;
}

export interface UserHoldings {
  balance: bigint;
  pendingYield: bigint;
  currentCycle: bigint;
  lastClaimed: bigint;
  payoutPerShare: bigint;
}

export interface LPData {
  fixedSellFee: bigint;
  feePercent: bigint;
  principalPerShare: bigint;
}

// ─── Helpers ────────────────────────────────────────────────────
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export function isValidAddress(addr: `0x${string}` | undefined): boolean {
  return !!addr && addr !== ZERO_ADDRESS;
}

/**
 * Parse a MarketFactory.marketConfigByAsset() return tuple
 * into a typed MarketConfig object.
 */
export function parseMarketConfig(
  result: readonly [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`] | undefined,
): MarketConfig | null {
  if (!result) return null;
  const [token, sale, vault, lp, router] = result;
  if (!isValidAddress(token)) return null;
  return { token, sale, vault, lp, router };
}

/**
 * Format a bigint token amount to a human-readable string.
 * Defaults to 6 decimals (USDC) and 2 display decimals.
 */
export function formatTokenAmount(
  amount: bigint | undefined,
  tokenDecimals = 6,
  displayDecimals = 2,
): string {
  if (amount === undefined || amount === 0n) return '0.00';
  const divisor = 10n ** BigInt(tokenDecimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(tokenDecimals, '0').slice(0, displayDecimals);
  return `${whole.toLocaleString()}.${fractionStr}`;
}

/**
 * Convert a human-readable amount (e.g. "5") to raw token units.
 * For share amounts (18 decimals) and USDC amounts (6 decimals).
 */
export function toTokenUnits(amount: string | number, decimals = 18): bigint {
  const str = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, fraction = ''] = str.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
