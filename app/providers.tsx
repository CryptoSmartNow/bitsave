"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base, celo } from 'wagmi/chains';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
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

// Define the supported chains
const chains = [base, celo, lisk] as const;

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
    [lisk.id]: http(),
  },
  connectors,
});

const queryClient = new QueryClient();

function ThemedRainbowKit({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <RainbowKitProvider
      modalSize="compact"
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