"use client";

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
import { getContract, formatUnits, parseUnits, keccak256, toBytes, zeroAddress, encodeFunctionData } from 'viem';
import BizFiABI from '../../abi/BizFi.json';

const BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Minimal ERC20 ABI for approval and allowance
const ERC20_ABI = [
    {
        "inputs": [
            { "name": "spender", "type": "address" },
            { "name": "amount", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "name": "", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "name": "owner", "type": "address" },
            { "name": "spender", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

const TIER_MAPPING: Record<TierType, number> = {
    'micro': 0,
    'builder': 1,
    'growth': 2,
    'enterprise': 3
};

export interface ReferralDiscount {
    recipient: `0x${string}`;
    tier: number;
    discountedPrice: bigint;
    businessName: string;
    nonce: bigint;
    deadline: bigint;
}

// Helper function to parse error messages into user-friendly format
function parseErrorMessage(error: any): string {
    const errorMessage = error?.message || error?.toString() || 'An unknown error occurred';

    // Check for common error patterns
    if (errorMessage.includes('insufficient funds')) {
        return 'Insufficient funds in your wallet. Please add ETH to cover gas fees and try again.';
    }

    if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        return 'Transaction was cancelled. Please try again when ready.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('Network')) {
        return 'Network connection issue. Please check your internet and try again.';
    }

    if (errorMessage.includes('nonce')) {
        return 'Transaction conflict detected. Please refresh the page and try again.';
    }

    if (errorMessage.includes('gas')) {
        return 'Gas estimation failed. You may not have enough ETH for transaction fees.';
    }

    // For other errors, extract the most relevant part
    // Look for "Details:" section which usually has the core error
    const detailsMatch = errorMessage.match(/Details:\s*([^Version]+)/);
    if (detailsMatch) {
        return detailsMatch[1].trim();
    }

    // If error is too long, truncate and add technical details note
    if (errorMessage.length > 200) {
        const shortMessage = errorMessage.substring(0, 150) + '...';
        return `${shortMessage}\n\nFor technical details, please contact support.`;
    }

    return errorMessage;
}

export function useBizFi() {
    const { address } = useAccount();
    const { wallets } = useWallets();
    const publicClient = usePublicClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get Privy wallet client (embedded wallet)
    const getWalletClient = useCallback(async () => {
        const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
        if (!embeddedWallet) {
            throw new Error("Privy embedded wallet not found");
        }
        await embeddedWallet.switchChain(8453); // Base chain
        return await embeddedWallet.getEthereumProvider();
    }, [wallets]);

    // Check USDC Allowance
    const checkAllowance = useCallback(async (amount: bigint) => {
        if (!address || !publicClient) return false;
        try {
            const allowance = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, BIZFI_PROXY_ADDRESS]
            });
            return allowance >= amount;
        } catch (err) {
            console.error("Error checking allowance:", err);
            return false;
        }
    }, [address, publicClient]);

    // Approve USDC
    const approveUSDC = useCallback(async (amount: bigint) => {
        if (!address) throw new Error("Wallet not connected");

        try {
            setLoading(true);
            const provider = await getWalletClient();

            // Use eth_sendTransaction via the provider
            const hash = await provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: address,
                    to: USDC_ADDRESS,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [BIZFI_PROXY_ADDRESS, amount]
                    })
                }]
            });

            await publicClient?.waitForTransactionReceipt({ hash: hash as `0x${string}` });
            return true;
        } catch (err: any) {
            console.error("Approval error:", err);
            const userFriendlyMessage = parseErrorMessage(err);
            setError(userFriendlyMessage);
            throw new Error(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    }, [address, publicClient, getWalletClient]);

    // Register Business
    const registerBusiness = useCallback(async (
        name: string,
        metadata: any,
        tier: TierType,
        referral?: {
            code: string;
            discountPercent: number;
            signature?: `0x${string}`;
            referralData?: ReferralDiscount;
        }
    ) => {
        if (!publicClient || !address) throw new Error("Wallet not connected");
        setError(null);
        setLoading(true);

        try {
            const tierValue = TIER_MAPPING[tier];

            let finalPrice: bigint;
            let referralStruct: ReferralDiscount;
            let signature: `0x${string}` = "0x";

            // Get standard fee from contract
            const standardFee = await publicClient.readContract({
                address: BIZFI_PROXY_ADDRESS,
                abi: BizFiABI,
                functionName: 'getListingFee',
                args: [tierValue]
            }) as bigint;

            if (referral && referral.referralData) {
                finalPrice = referral.referralData.discountedPrice;
                referralStruct = referral.referralData;
                signature = referral.signature || "0x";
            } else {
                finalPrice = standardFee;
                referralStruct = {
                    recipient: zeroAddress,
                    tier: 0,
                    discountedPrice: BigInt(0),
                    businessName: "",
                    nonce: BigInt(0),
                    deadline: BigInt(0)
                };
            }

            // Check ETH Balance for gas
            const ethBalance = await publicClient.getBalance({ address });
            if (ethBalance === BigInt(0)) {
                throw new Error("Insufficient ETH. You need ETH on Base network to pay for gas fees.");
            }

            // Check USDC Balance
            const usdcBalance = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address]
            });

            if (usdcBalance < finalPrice) {
                const required = formatUnits(finalPrice, 6); // USDC has 6 decimals
                const available = formatUnits(usdcBalance, 6);
                throw new Error(`Insufficient USDC balance. You have ${available} USDC but need ${required} USDC.`);
            }

            // Check Allowance
            const hasAllowance = await checkAllowance(finalPrice);
            if (!hasAllowance) {
                await approveUSDC(finalPrice);
            }

            // Hash Metadata
            const metadataString = JSON.stringify(metadata);
            const metadataHash = keccak256(toBytes(metadataString));

            // Get Privy wallet provider
            const provider = await getWalletClient();

            // Register using Privy provider
            const hash = await provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: address,
                    to: BIZFI_PROXY_ADDRESS,
                    data: encodeFunctionData({
                        abi: BizFiABI,
                        functionName: 'registerBusiness',
                        args: [
                            name,
                            metadataHash,
                            tierValue,
                            referralStruct,
                            signature
                        ]
                    })
                }]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
            return receipt;

        } catch (err: any) {
            console.error("Registration error:", err);
            const userFriendlyMessage = parseErrorMessage(err);
            setError(userFriendlyMessage);
            throw new Error(userFriendlyMessage);
        } finally {
            setLoading(false);
        }
    }, [publicClient, address, checkAllowance, approveUSDC, getWalletClient]);

    return {
        registerBusiness,
        loading,
        error,
        address
    };
}
