"use client";

import { createConfig } from '@privy-io/wagmi';
import { http } from "wagmi";
import { base, mainnet } from "viem/chains";

// We keep this export in case other files import it, but we don't use it in the provider wrapper anymore
// since the global provider handles it.
export const privyConfig = createConfig({
    chains: [mainnet, base],
    transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
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
