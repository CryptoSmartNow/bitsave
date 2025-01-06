import '@rainbow-me/rainbowkit/styles.css';
import '../styles/animate.min.css';
import '../styles/bootstrap.min.css';
import '../styles/owl.carousel.min.css';
import '../styles/responsive.css';
import '../styles/style.css';
import type { AppProps } from 'next/app';

import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  midnightTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { base } from 'wagmi/chains';
import { type Chain } from 'viem';

// Define Lisk chain
const liskChain = {
  id: 1135,
  name: 'Lisk',
  nativeCurrency: {
    decimals: 18,
    name: 'LSK',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.api.lisk.com'] },
    public: { http: ['https://rpc.api.lisk.com'] },
  },
  blockExplorers: {
    default: { name: 'LiskScan', url: 'https://blockscout.lisk.com' },
  },
} as const satisfies Chain;

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const config = getDefaultConfig({
  appName: 'Your App Name',
  projectId,
  chains: [base, liskChain],
});

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider
          modalSize="compact"
          theme={lightTheme({
            borderRadius: 'large',
            overlayBlur: 'small',
            ...midnightTheme.accentColors.green,
            accentColor: '#81D7B4'
          })}
          initialChain={base}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default MyApp; 