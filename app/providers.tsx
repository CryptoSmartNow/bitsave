"use client";

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { base, celo, avalanche, mainnet } from 'viem/chains';
import { ThemeProvider } from 'next-themes';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { CDPReactProvider } from "@coinbase/cdp-react";
import PageLoader from './components/PageLoader';

// Proxy configuration
const PROXY_ENDPOINT = process.env.NODE_ENV === 'development' 
  ? 'https://bitsave-git-beta-primidacs-projects.vercel.app/api/coinbase-proxy' 
  : '/api/coinbase-proxy';
const USE_PROXY = true; // Toggle this to enable/disable proxy

// Helper to proxify URLs
const proxify = (url: string) => {
  if (!USE_PROXY) return url;
  return `${PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`;
};

// Global Fetch Interceptor Component
function ProxyInterceptor() {
  useEffect(() => {
    if (!USE_PROXY) return;

    const originalFetch = window.fetch;
    const blockedDomains = [
      'api.coinbase.com',
      'api.developer.coinbase.com',
      'keys.coinbase.com',
      'pay.coinbase.com',
      'bc.coinbase.com',
      'mainnet.base.org'
    ];

    window.fetch = async (...args) => {
      let [resource, config] = args;
      
      // Handle Request object
      let url = resource instanceof Request ? resource.url : resource.toString();
      
      const shouldProxy = blockedDomains.some(domain => url.includes(domain));
      
      if (shouldProxy && !url.includes(PROXY_ENDPOINT)) {
        console.log(`[ProxyInterceptor] Redirecting ${url} through proxy`);
        const newUrl = proxify(url);
        
        if (resource instanceof Request) {
          // Clone the request to modify it
          // Note: Request objects are immutable, so we must create a new one
          // We also need to strip credentials/mode if they cause issues with CORS in the proxy flow
          const requestInit: RequestInit = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            // Don't use 'no-cors' as we need the response
            mode: 'cors', 
            credentials: 'omit', // Important: let the proxy handle auth if needed, or pass explicitly
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
          };

          // If body is used, we might need to read it. 
          // However, reading body from a Request that's already being used is tricky.
          // For now, let's assume the SDK creates fresh requests we can intercept.
          
          resource = new Request(newUrl, requestInit);
        } else {
          resource = newUrl;
        }
      }

      return originalFetch(resource, config);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

// Define custom Lisk chain
const lisk = {
  id: 1135,
  name: 'Lisk',
  network: 'lisk',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [proxify('https://rpc.api.lisk.com')] },
    public: { http: [proxify('https://rpc.api.lisk.com')] },
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
    default: { http: [proxify('https://testnet.hashio.io/api')] },
    public: { http: [proxify('https://testnet.hashio.io/api')] },
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
    [base.id]: http(proxify(base.rpcUrls.default.http[0])),
    [celo.id]: http(proxify(celo.rpcUrls.default.http[0])),
    [avalanche.id]: http(proxify(avalanche.rpcUrls.default.http[0])),
    [lisk.id]: http(proxify('https://rpc.api.lisk.com')),
    [hedera.id]: http(proxify('https://testnet.hashio.io/api')),
    [mainnet.id]: http(proxify(mainnet.rpcUrls.default.http[0])),
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
      <ProxyInterceptor />
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
