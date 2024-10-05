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

const liskMainnet: Chain = {
  id:  1135, 
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
};

export const config = getDefaultConfig({
  appName: 'Bitsave App',
  projectId: 'dfffb9bb51c39516580c01f134de2345',
  chains: [
    mainnet,
    liskMainnet, 
    liskSepolia,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
