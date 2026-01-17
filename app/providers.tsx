"use client";

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { base, celo, avalanche, mainnet } from 'viem/chains';
import { ThemeProvider } from 'next-themes';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { CDPReactProvider } from "@coinbase/cdp-react";
import PageLoader from './components/PageLoader';

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
const chains = [base, celo, avalanche, lisk, hedera, mainnet] as const;

import { injected } from 'wagmi/connectors';

const config = createConfig({
  chains,
  ssr: true,
  transports: {
    [base.id]: http(),
    [celo.id]: http(),
    [avalanche.id]: http(),
    [lisk.id]: http(),
    [hedera.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: [
    injected(),
  ],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading for smooth entrance
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={base}
          >
            <CDPReactProvider
              config={{
                projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "8fb8463e-ce60-41f1-8dda-e5b2308db356",
                ethereum: {
                  createOnLogin: 'eoa'
                },
                appName: "BizFi"
              }}
            >
              {loading && <PageLoader />}
              {children}
            </CDPReactProvider>
          </OnchainKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
