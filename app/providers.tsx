"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import { base, celo, avalanche, mainnet } from 'viem/chains';
import { ThemeProvider, useTheme } from 'next-themes';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { usePathname } from 'next/navigation';

// Define the project ID for WalletConnect (used by Privy if configured, or internally)
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
const chains = [base, celo, avalanche, lisk, hedera, mainnet] as const;

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
});

const queryClient = new QueryClient();

function PrivyWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isBizFi = pathname?.startsWith('/bizfi');
  
  // Force dark theme for BizFi pages
  const effectiveTheme = isBizFi ? 'dark' : (theme === 'dark' ? 'dark' : 'light');

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: effectiveTheme,
          accentColor: '#81D7B4', // Matching BitSave green
          logo: "/bitsavelogo.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ['wallet', 'email', 'google', 'twitter', 'linkedin', 'discord', 'apple'],
        supportedChains: [base, celo, avalanche, lisk, hedera, mainnet],
        externalWallets: {
          walletConnect: { enabled: true },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

import PageLoader from './components/PageLoader';
import { useState, useEffect } from 'react';

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
      <PrivyWrapper>
        {loading && <PageLoader />}
        {children}
      </PrivyWrapper>
    </ThemeProvider>
  );
}
