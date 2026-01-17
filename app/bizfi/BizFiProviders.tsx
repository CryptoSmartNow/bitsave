"use client";

import React from 'react';

export default function BizFiProviders({ children }: { children: React.ReactNode }) {
    // The global layout now provides WagmiProvider and OnchainKitProvider.
    // We just pass through the children.
    return (
        <>
            {children}
        </>
    );
}
