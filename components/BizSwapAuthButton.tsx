'use client';

import { Logout01Icon } from "hugeicons-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";

export function BizSwapAuthButton({ className, style, connectText = "Connect Wallet" }: { className?: string, style?: React.CSSProperties, connectText?: string }) {
    const { login, ready, authenticated, user, logout } = usePrivy();
    const { publicKey, connected: isSolanaConnected, disconnect: solanaDisconnect } = useWallet();

    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const isSignedIn = ready && (authenticated || isSolanaConnected) && !isDisconnecting;

    useEffect(() => {
        if (!authenticated && !isSolanaConnected) {
            setIsDisconnecting(false);
        }
    }, [authenticated, isSolanaConnected]);

    if (isSignedIn) {
        const privySolanaWallet = user?.linkedAccounts?.find(
            (account) => account.type === 'wallet' && account.chainType === 'solana'
        ) as { address: string } | undefined;
        
        const address = isSolanaConnected 
            ? publicKey?.toBase58() 
            : (privySolanaWallet?.address || user?.wallet?.address);
            
        const displayAddress = address
            ? `${address.slice(0, 4)}...${address.slice(-4)}`
            : user?.email?.address || "Connected";

        const handleSignOut = async () => {
            setIsDisconnecting(true);
            if (isSolanaConnected) {
                solanaDisconnect();
            }
            await logout();
        };

        return (
            <div className={`flex items-center gap-2 ${className || ''}`} style={style ? { height: style.height } : undefined}>
                <div 
                    className="flex items-center gap-3 border border-[#2C3E5D] bg-[#1C2538] rounded-xl shadow-sm"
                    style={{ ...style, width: 'auto', padding: '0 16px', minHeight: style?.height || '44px' }}
                >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#81D7B4] animate-pulse shadow-[0_0_8px_#81D7B4]" />
                    <span className="font-mono font-bold text-sm md:text-base text-[#F9F9FB] whitespace-nowrap tracking-wide">{displayAddress}</span>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center border border-[#2C3E5D] bg-[#1C2538] text-[#7B8B9A] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 hover:border-[#FF6B6B]/30 transition-all flex-shrink-0 rounded-xl"
                    style={{ ...style, width: style?.height || '44px', minHeight: style?.height || '44px', padding: 0 }}
                    title="Disconnect Wallet"
                >
                    <Logout01Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className={`flex items-center justify-center gap-2 font-bold transition-all rounded-xl ${className || 'bg-[#1C2538] border border-[#2C3E5D] hover:bg-[#2C3E5D] text-[#F9F9FB]'}`}
            style={{ padding: '0 16px', ...style }}
        >
            {connectText}
        </button>
    );
}
