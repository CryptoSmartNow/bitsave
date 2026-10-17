'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig } from 'wagmi';
import { fallback, http } from 'viem';
import { base, celo, avalanche, mainnet, baseSepolia, optimismSepolia, arbitrumSepolia, polygonAmoy } from 'viem/chains';
import { ThemeProvider, useTheme } from 'next-themes';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { usePathname } from 'next/navigation';
import { injected } from 'wagmi/connectors';
import { Toaster } from 'react-hot-toast';

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

// Define custom Arc Testnet
const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network', 'https://rpc.testnet.arc.io'] },
    public: { http: ['https://rpc.testnet.arc.network', 'https://rpc.testnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
} as const;

// Define custom Arc Mainnet
const arcMainnet = {
  id: 5042,
  name: 'Arc Mainnet',
  network: 'arc-mainnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.arc.network', 'https://rpc.mainnet.arc.io'] },
    public: { http: ['https://rpc.mainnet.arc.network', 'https://rpc.mainnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://arcscan.app' },
  },
} as const;

// Wagmi configuration for EVM chains with multi-RPC high availability fallback
export const config = createConfig({
  chains: [base, celo, lisk, avalanche, mainnet, baseSepolia, optimismSepolia, arbitrumSepolia, polygonAmoy, arcTestnet, arcMainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [base.id]: fallback([
      http('https://mainnet.base.org'),
      http('https://base.llamarpc.com'),
      http('https://base.publicnode.com'),
    ]),
    [celo.id]: fallback([
      http('https://forno.celo.org'),
      http('https://celo.drpc.org'),
      http('https://rpc.ankr.com/celo'),
    ]),
    [lisk.id]: fallback([
      http('https://rpc.api.lisk.com'),
      http('https://lisk.drpc.org'),
    ]),
    [avalanche.id]: fallback([
      http('https://api.avax.network/ext/bc/C/rpc'),
      http('https://avalanche.drpc.org'),
    ]),
    [mainnet.id]: fallback([
      http('https://cloudflare-eth.com'),
      http('https://eth.llamarpc.com'),
    ]),
    [baseSepolia.id]: fallback([
      http('https://sepolia.base.org'),
      http('https://base-sepolia-rpc.publicnode.com'),
    ]),
    [optimismSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygonAmoy.id]: http(),
    [arcTestnet.id]: fallback([
      http('https://rpc.testnet.arc.network'),
      http('https://rpc.testnet.arc.io'),
    ]),
    [arcMainnet.id]: fallback([
      http('https://rpc.mainnet.arc.network'),
      http('https://rpc.mainnet.arc.io'),
    ]),
  },
  ssr: true,
});

function InnerProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { theme } = useTheme();
  const pathname = usePathname();
  const isBizSwap = pathname?.startsWith('/bizswap');
  const isBizFi = pathname?.startsWith('/bizfi') || pathname?.startsWith('/bizfun');

  // Force dark theme for BizFi pages
  const effectiveTheme = isBizFi ? 'dark' : (theme === 'dark' ? 'dark' : 'light');

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: effectiveTheme as 'light' | 'dark',
          accentColor: '#81D7B4',
          logo: "/bitsavelogo.png",
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        loginMethods: ['wallet', 'email', 'google', 'twitter', 'linkedin', 'discord', 'apple'],
        supportedChains: [base, baseSepolia, arcTestnet, arcMainnet, optimismSepolia, arbitrumSepolia, polygonAmoy, celo, avalanche, lisk, hedera, mainnet],
        externalWallets: {
          walletConnect: { enabled: true },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          {children}
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#81D7B4',
                  secondary: '#fff',
                },
              },
            }} 
          />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InnerProviders>{children}</InnerProviders>
    </ThemeProvider>
  );
}
