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

// Define Lisk mainnet without 'network' property
const liskMainnet: Chain = {
  id: 1, // Replace this with the actual chain ID for Lisk mainnet
  name: 'Lisk Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Lisk',
    symbol: 'LSK',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.api.lisk.com'], // Replace with actual Lisk mainnet RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Lisk Explorer',
      url: 'https://blockscout.lisk.com', // Replace with actual Lisk explorer URL
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Bitsave App',
  projectId: 'dfffb9bb51c39516580c01f134de2345',
  chains: [
    mainnet,
    liskMainnet, // Add Lisk mainnet here
    liskSepolia,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
