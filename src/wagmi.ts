import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  liskSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
  Chain,
} from 'wagmi/chains';

// Custom Lisk Mainnet Configuration
const liskMainnet: Chain = {
  id: 1135,
  name: 'Lisk Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lisk',
    symbol: 'LSK',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Lisk Explorer',
      url: 'https://blockscout.lisk.com',
    },
  },
  contracts: {
    token: {
      address: '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24', // Replace with actual Lisk token contract address
    },
  },
};

// Custom Base Chain Configuration for USDC
const baseWithUSDC: Chain = {
  ...base,
  contracts: {
    token: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract address on Base
    },
  },
};

// App Configuration
export const config = getDefaultConfig({
  appName: 'Bitsave App',
  projectId: 'dfffb9bb51c39516580c01f134de2345',
  chains: [
    mainnet,
    liskMainnet, // Custom Lisk Mainnet with contract address
    liskSepolia,
    polygon,
    optimism,
    arbitrum,
    baseWithUSDC, // Custom Base with USDC contract address
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});