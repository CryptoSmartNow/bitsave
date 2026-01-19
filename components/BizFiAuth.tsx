"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import { HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

/**
 * Custom Auth Button that triggers Privy login flow.
 * Handles both signed-out (Login button) and signed-in (Address + Logout) states.
 * Supports both Privy Embedded Wallet and Wagmi External Wallets.
 */
export function BizFiAuthButton({ className }: { className?: string }) {
    const { login, ready, authenticated, user, logout } = usePrivy();
    const { isConnected: isWagmiConnected, address: wagmiAddress } = useAccount();
    const { disconnect: wagmiDisconnect } = useDisconnect();

    // Determine if user is signed in (either via Privy or external Wallet)
    const isSignedIn = ready && (authenticated || isWagmiConnected);

    if (isSignedIn) {
        // Prefer Wagmi address if connected, otherwise Privy wallet
        const address = isWagmiConnected ? wagmiAddress : user?.wallet?.address;

        // Truncate address for display or use email if no wallet address
        const displayAddress = address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : user?.email?.address || "Connected";

        const handleSignOut = async () => {
            if (isWagmiConnected) {
                wagmiDisconnect();
            }
            await logout();
        };

        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1F2937] rounded-lg border border-gray-700">
                    <div className="w-2 h-2 rounded-full bg-[#81D7B4]"></div>
                    <span className="text-sm font-mono text-gray-300">{displayAddress}</span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Logout"
                >
                    <HiOutlineArrowLeftOnRectangle className="w-5 h-5" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            disabled={!ready}
            className={`px-4 py-2 font-bold text-[#0F1825] bg-[#81D7B4] rounded-xl hover:bg-[#6BC4A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            Login
        </button>
    );
}
