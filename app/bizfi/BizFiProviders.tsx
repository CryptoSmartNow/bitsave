"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { base, mainnet } from "viem/chains";

export const privyConfig = createConfig({
    chains: [mainnet, base],
    transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
    },
});

const queryClient = new QueryClient();

export default function BizFiProviders({ children }: { children: React.ReactNode }) {
    // Replace with environment variable later
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

    return (
        <PrivyProvider
            appId={appId}
            config={{
                appearance: {
                    theme: "dark",
                    accentColor: "#81D7B4",
                    logo: "/bitsavelogo.png",
                },
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    }
                },
                loginMethods: ['email', 'wallet', 'google', 'twitter', 'linkedin', 'discord', 'apple'],
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={privyConfig}>
                    {children}
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
