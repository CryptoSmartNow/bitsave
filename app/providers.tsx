'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, base } from 'wagmi/chains';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { 
  walletConnectWallet,
  coinbaseWallet,
  zerionWallet,
  rabbyWallet,
  metaMaskWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets';
import { useTheme } from 'next-themes';

// Import Rainbow Kit styles
import '@rainbow-me/rainbowkit/styles.css';

// Define the project ID for WalletConnect
const projectId = 'dfffb9bb51c39516580c01f134de2345';

// Define the supported chains - needs to be a tuple type with at least one chain
const chains = [mainnet, sepolia, base] as const;

// Create wallet groups with connectorsForWallets - Only supported wallets
const connectors = connectorsForWallets([
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
], {
    appName: 'BitSave',
    projectId,
});

const config = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
  },
  connectors,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact"
          theme={theme === 'dark' ? darkTheme({
            accentColor: '#66C4A3',
            accentColorForeground: 'white',
            borderRadius: 'large',
          }) : lightTheme({
            accentColor: '#81D7B4',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}