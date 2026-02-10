"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";
import { useState, useEffect } from "react";

/**
 * Custom Auth Button that triggers Privy login flow.
 * Handles both signed-out (Login button) and signed-in (Address + Logout) states.
 * Supports both Privy Embedded Wallet and Wagmi External Wallets.
 */
export function BizFiAuthButton({ className }: { className?: string }) {
    const { login, ready, authenticated, user, logout } = usePrivy();
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { disconnect: wagmiDisconnect } = useDisconnect();

    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Determine if user is signed in (either via Privy or external Wallet)
    const isSignedIn = ready && (authenticated || isWagmiConnected) && !isDisconnecting;

    // Reset disconnecting state when fully disconnected
    useEffect(() => {
        if (!authenticated && !isWagmiConnected) {
            setIsDisconnecting(false);
        }
    }, [authenticated, isWagmiConnected]);

    if (isSignedIn) {
        // Prefer Wagmi address if connected, otherwise Privy wallet
        const address = isWagmiConnected ? wagmiAddress : user?.wallet?.address;

        // Truncate address for display or use email if no wallet address
        const displayAddress = address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : user?.email?.address || "Connected";

        const handleSignOut = async () => {
            setIsDisconnecting(true);
            if (isWagmiConnected) {
                wagmiDisconnect();
            }
            await logout();
        };

        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse shadow-[0_0_8px_rgba(129,215,180,0.5)]" />
                    <span className="font-mono text-sm text-gray-300 tracking-wide">{displayAddress}</span>
                </div>

                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                    title="Disconnect Wallet"
                >
                    <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className={`px-4 py-2 font-bold text-[#0F1825] bg-[#81D7B4] rounded-xl hover:bg-[#6BC4A0] transition-colors ${className}`}
        >
            Login
        </button>
    );
}
