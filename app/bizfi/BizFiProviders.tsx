"use client";

import { createConfig } from '@privy-io/wagmi';
import { http } from "wagmi";
import { base, mainnet } from "viem/chains";

// We keep this export in case other files import it, but we don't use it in the provider wrapper anymore
// since the global provider handles it.
// Mainnet Configuration
export const privyConfig = createConfig({
    chains: [base, mainnet], // Base Mainnet primary
    transports: {
        [base.id]: http(),
        [mainnet.id]: http(),
    },
});

export default function BizFiProviders({ children }: { children: React.ReactNode }) {
    // The global layout now provides PrivyProvider, WagmiProvider, and QueryClientProvider.
    // We just pass through the children.
    return (
        <>
            {children}
        </>
    );
}
