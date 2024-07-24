import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  liskSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
  
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Bitsave App',
  projectId: 'dfffb9bb51c39516580c01f134de2345',
  chains: [
    mainnet,
    liskSepolia,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});