import '@rainbow-me/rainbowkit/styles.css';
// import type { AppProps } from 'next/app';
import '../styles/animate.min.css';
import '../styles/bootstrap.min.css';
import '../styles/owl.carousel.min.css';
import '../styles/responsive.css';
import '../styles/style.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { darkTheme, midnightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';

const client = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider 
        theme={darkTheme({
          borderRadius: 'large',
          overlayBlur: 'small',
          // ...midnightTheme.accentColors.green,
          accentColor: '#81D7B4'
        })}
        initialChain={4202}
        >
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
