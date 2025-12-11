"use client";

 import { ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, celo, avalanche } from 'viem/chains';
import { RainbowKitProvider, lightTheme, darkTheme, useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  walletConnectWallet,
  coinbaseWallet,
  zerionWallet,
  rabbyWallet,
  metaMaskWallet,
  trustWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { ThemeProvider, useTheme } from 'next-themes';
// import { HashConnectProvider } from './providers/HashConnectProvider';

// Import Rainbow Kit styles
import '@rainbow-me/rainbowkit/styles.css';

// Define the project ID for WalletConnect
const projectId = 'dfffb9bb51c39516580c01f134de2345';

// Define custom Lisk chain
const lisk = {
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.api.lisk.com'] },
    public: { http: ['https://rpc.api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'Lisk Explorer', url: 'https://blockscout.lisk.com' },
  },
} as const;

// Define custom Hedera chain
const hedera = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera',
  nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
    public: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan Testnet', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
} as const;

// Define the supported chains
const chains = [base, celo, avalanche, lisk, hedera] as const;

// Create wallet groups with connectorsForWallets - Only supported wallets
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Compatible Wallets - Fully Supported by BitSave',
      wallets: [
        walletConnectWallet,
        coinbaseWallet,
        zerionWallet,
        rabbyWallet,
        metaMaskWallet,
        trustWallet,
      ],
    },
  ],
  {
    appName: 'BitSave',
    projectId,
  }
);

const config = createConfig({
  chains,
  ssr: true,
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [avalanche.id]: http(),
    [lisk.id]: http(),
    [hedera.id]: http(),
  },
  connectors,
});

const queryClient = new QueryClient();

function ThemedRainbowKit({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider
      modalSize="wide"
      theme={
        theme === 'dark'
          ? darkTheme({
              accentColor: '#66C4A3',
              accentColorForeground: 'white',
              borderRadius: 'large',
            })
          : lightTheme({
              accentColor: '#81D7B4',
              accentColorForeground: 'white',
              borderRadius: 'large',
            })
      }
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={config} reconnectOnMount={true}>
        <QueryClientProvider client={queryClient}>
          <ThemedRainbowKit>{children}</ThemedRainbowKit>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}