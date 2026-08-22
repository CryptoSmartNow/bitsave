/**
 * BizSwap Multi-Chain Contract Configuration
 *
 * Central module exporting ABIs, addresses, chains, and types for BizSwap
 * supporting both Base (Chain 8453) and Botchain (Chain 968 Testnet / 677 Mainnet).
 */

// ─── ABIs ────────────────────────────────────────────────────────
import MarketFactoryABI from '@/app/abi/bizswap_abi/MarketFactory.json';
import BizShareABI from '@/app/abi/bizswap_abi/BizShare.json';
import BizSwapSaleABI from '@/app/abi/bizswap_abi/BizSwapSale.json';
import PayoutVaultABI from '@/app/abi/bizswap_abi/PayoutVault.json';
import BizSwapLPABI from '@/app/abi/bizswap_abi/BizSwapLP.json';
import TreasuryRouterABI from '@/app/abi/bizswap_abi/TreasuryRouter.json';
import BotchainBizSwapABI from '@/app/abi/bizswap_abi/BotchainBizSwap.json';
import BizSwapControllerABI from '@/app/abi/bizswap_abi/BizSwapController.json';

export {
  MarketFactoryABI,
  BizShareABI,
  BizSwapSaleABI,
  PayoutVaultABI,
  BizSwapLPABI,
  TreasuryRouterABI,
  BotchainBizSwapABI,
  BizSwapControllerABI,
};

// ─── Minimal ERC-20 ABI ─────────────────────────────────────────
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

// ─── Supported Chains ───────────────────────────────────────────
export type BizSwapSupportedChain = 'base' | 'botchain';

export interface ChainConfig {
  id: number;
  key: BizSwapSupportedChain;
  name: string;
  shortName: string;
  badge: string;
  currency: string;
  tokenDecimals: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerTokenPath: string;
  contracts: {
    controllerOrProxy: `0x${string}`;
    bizYield?: `0x${string}`;
    bizBond?: `0x${string}`;
    bizCredit?: `0x${string}`;
    paymentAsset: `0x${string}`;
    revenueWallet: `0x${string}`;
  };
}

export const BIZSWAP_CHAINS: Record<BizSwapSupportedChain, ChainConfig> = {
  base: {
    id: 8453,
    key: 'base',
    name: 'Base Mainnet',
    shortName: 'Base',
    badge: 'Base',
    currency: 'USDC',
    tokenDecimals: 6,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    explorerTokenPath: 'https://basescan.org/token',
    contracts: {
      controllerOrProxy: (process.env.NEXT_PUBLIC_BASE_BIZSWAP_CONTROLLER || '0x67af817940de8AEC1bE17920f2c1Bafa2D40F1c0') as `0x${string}`,
      bizYield: '0x6eDD7CC9497Ec9F369171c5bA863626A7d7B9489',
      bizBond: '0xfEe5bF9a0E8C2DC6ab9c5A77631720CfEB58c90b',
      bizCredit: '0xD1B0DD3F45e7D20f6e9F7755211454975Cc96745',
      paymentAsset: (process.env.NEXT_PUBLIC_BIZSWAP_ASSET || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913') as `0x${string}`,
      revenueWallet: (process.env.NEXT_PUBLIC_BIZSWAP_EVM_REVENUE_WALLET || '0x125629FAab442e459C1015FCBa50499D0aAB8EE0') as `0x${string}`,
    },
  },
  botchain: {
    id: 968, // Testnet 968 (or 677 for Mainnet)
    key: 'botchain',
    name: 'BOT Chain',
    shortName: 'Botchain',
    badge: 'Botchain',
    currency: 'USDT',
    tokenDecimals: 6,
    rpcUrl: process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || 'https://testnet-rpc.botchain.ai',
    explorerUrl: 'https://testnet-explorer.botchain.ai',
    explorerTokenPath: 'https://testnet-explorer.botchain.ai/token',
    contracts: {
      controllerOrProxy: (process.env.NEXT_PUBLIC_BOTCHAIN_BIZSWAP_PROXY || '0x1621E1f293D9a31e4d598cFA5309ec061899704b') as `0x${string}`,
      paymentAsset: (process.env.NEXT_PUBLIC_BOTCHAIN_USDT || '0x75edC9335175Fc0552D51D48439F229c10420fe3') as `0x${string}`,
      revenueWallet: (process.env.NEXT_PUBLIC_BOTCHAIN_REVENUE_WALLET || '0x038a4e7c11193eBdF6FE574bD9eCf6989c8bEafe') as `0x${string}`,
    },
  },
};

// ─── Default Legacy Base Addresses ──────────────────────────────
export const BIZSWAP_FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_BIZSWAP_FACTORY ??
  '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const BIZSWAP_ASSET_ADDRESS = BIZSWAP_CHAINS.base.contracts.paymentAsset;
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

export function parseMarketConfig(
  result: readonly [`0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`, `0x${string}`] | undefined,
): MarketConfig | null {
  if (!result) return null;
  const [token, sale, vault, lp, router] = result;
  if (!isValidAddress(token)) return null;
  return { token, sale, vault, lp, router };
}

export function getChainConfig(chainKey?: string | null): ChainConfig {
  if (chainKey === 'botchain' || chainKey === '968' || chainKey === '677') {
    return BIZSWAP_CHAINS.botchain;
  }
  return BIZSWAP_CHAINS.base;
}

export function getExplorerUrl(chainKey?: string | null, txOrAddress?: string, type: 'tx' | 'address' | 'token' = 'tx'): string {
  const config = getChainConfig(chainKey);
  if (!txOrAddress) return config.explorerUrl;
  return `${config.explorerUrl}/${type}/${txOrAddress}`;
}

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

export function toTokenUnits(amount: string | number, decimals = 18): bigint {
  const str = typeof amount === 'number' ? amount.toString() : amount;
  const [whole, fraction = ''] = str.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
