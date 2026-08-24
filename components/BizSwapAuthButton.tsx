'use client';

import { Logout01Icon, Copy01Icon, Tick01Icon } from "hugeicons-react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect } from "react";

export function BizSwapAuthButton({
    className,
    style,
    connectText = "Connect Wallet",
    redirectToLanding = true,
}: {
    className?: string;
    style?: React.CSSProperties;
    connectText?: string;
    redirectToLanding?: boolean;
}) {
    const { login, ready, authenticated, user, logout } = usePrivy();
    const { address: wagmiAddress, isConnected: isWagmiConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [copied, setCopied] = useState(false);

    const isSignedIn = ready && (authenticated || isWagmiConnected) && !isDisconnecting;

    useEffect(() => {
        if (!authenticated && !isWagmiConnected) {
            setIsDisconnecting(false);
        }
    }, [authenticated, isWagmiConnected]);

    if (isSignedIn) {
        // Find the EVM wallet if they use Privy embedded
        const privyEvmWallet = user?.linkedAccounts?.find(
            (account) => account.type === 'wallet' && account.chainType === 'ethereum'
        ) as { address: string } | undefined;

        // Prefer wagmi address (external wallets), then Privy EVM, then user.wallet
        const address = wagmiAddress || privyEvmWallet?.address || user?.wallet?.address || user?.id;
            
        const displayAddress = (address && address.startsWith('0x'))
            ? `${address.slice(0, 4)}...${address.slice(-4)}`
            : "Connected";

        const handleSignOut = async () => {
            setIsDisconnecting(true);
            try {
                if (disconnect) {
                    disconnect();
                }
                await logout();
            } catch (err) {
                console.error("Sign out error:", err);
            } finally {
                if (redirectToLanding && typeof window !== 'undefined') {
                    window.location.href = '/bizswap';
                }
            }
        };

        const handleCopy = () => {
            if (address) {
                navigator.clipboard.writeText(address);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        };

        return (
            <div className={`flex items-center gap-1.5 ${className || ''}`} style={style ? { height: style.height } : undefined}>
                <div 
                    className="flex items-center gap-1.5 sm:gap-2 border border-[#1E293B] bg-[#0E1726] rounded-xl shadow-sm px-2.5 py-1"
                    style={{ ...style, width: 'auto', minHeight: style?.height || '34px', height: style?.height || '34px' }}
                >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#81D7B4] animate-pulse shadow-[0_0_8px_#81D7B4] flex-shrink-0" />
                    <span className="font-mono font-bold text-[11px] sm:text-xs text-[#F9F9FB] whitespace-nowrap tracking-tight">{displayAddress}</span>
                    {address && (
                        <button
                            onClick={handleCopy}
                            className="p-0.5 hover:bg-[#1E293B] rounded transition-colors text-[#64748B] hover:text-[#81D7B4] flex-shrink-0 cursor-pointer"
                            title="Copy Address"
                        >
                            {copied ? <Tick01Icon className="w-3 h-3 text-[#81D7B4]" /> : <Copy01Icon className="w-3 h-3" />}
                        </button>
                    )}
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center border border-[#1E293B] bg-[#0E1726] text-[#64748B] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/30 transition-all flex-shrink-0 rounded-xl cursor-pointer"
                    style={{ ...style, width: style?.height || '34px', minHeight: style?.height || '34px', height: style?.height || '34px', padding: 0 }}
                    title="Disconnect & Sign Out"
                >
                    <Logout01Icon className="w-3.5 h-3.5 text-current" strokeWidth={2} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className={`flex items-center justify-center gap-2 font-bold transition-all rounded-xl cursor-pointer ${className || 'bg-[#1C2538] border border-white/20 hover:bg-[#2C3E5D] text-[#F9F9FB]'}`}
            style={{ padding: '0 16px', ...style }}
        >
            {connectText}
        </button>
    );
}
