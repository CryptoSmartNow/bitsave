"use client";

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract, formatUnits, parseUnits, keccak256, toBytes, zeroAddress } from 'viem';
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

export function useBizFi() {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get contract instance helper
    const getBizFiContract = useCallback(() => {
        if (!publicClient) return null;
        return getContract({
            address: BIZFI_PROXY_ADDRESS,
            abi: BizFiABI,
            client: { public: publicClient, wallet: walletClient }
        });
    }, [publicClient, walletClient]);

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
        if (!walletClient || !address) throw new Error("Wallet not connected");

        try {
            setLoading(true);
            const hash = await walletClient.writeContract({
                address: USDC_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [BIZFI_PROXY_ADDRESS, amount]
            });
            await publicClient?.waitForTransactionReceipt({ hash });
            return true;
        } catch (err: any) {
            console.error("Approval error:", err);
            setError(err.message || "Failed to approve USDC");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [walletClient, address, publicClient]);

    // Register Business
    const registerBusiness = useCallback(async (
        name: string,
        metadata: any,
        tier: TierType,
        referral?: {
            code: string;
            discountPercent: number; // e.g., 20 for 20%
            signature?: `0x${string}`; // EIP-712 signature from backend
            referralData?: ReferralDiscount; // Full referral struct from backend
        }
    ) => {
        if (!walletClient || !publicClient || !address) throw new Error("Wallet not connected");
        setError(null);
        setLoading(true);

        try {
            const tierValue = TIER_MAPPING[tier];

            // 1. Get Listing Fee
            // In a real app with backend, we would get the discounted price and signature from the API
            // For now, we will fetch the on-chain fee to ensure we have enough funds/allowance
            // If referral exists, we use the discounted price (logic should match backend)

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

            if (referral && referral.referralData && referral.signature) {
                // Use backend provided data
                finalPrice = referral.referralData.discountedPrice;
                referralStruct = referral.referralData;
                signature = referral.signature;
            } else {
                // No referral or invalid
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

            // 2. Check Allowance
            const hasAllowance = await checkAllowance(finalPrice);
            if (!hasAllowance) {
                await approveUSDC(finalPrice);
            }

            // 3. Hash Metadata
            // Simplification: Hash the stringified JSON
            const metadataString = JSON.stringify(metadata);
            const metadataHash = keccak256(toBytes(metadataString));

            // 4. Register
            const hash = await walletClient.writeContract({
                address: BIZFI_PROXY_ADDRESS,
                abi: BizFiABI,
                functionName: 'registerBusiness',
                args: [
                    name,
                    metadataHash,
                    tierValue,
                    referralStruct,
                    signature
                ]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            return receipt;

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Failed to register business");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [walletClient, publicClient, address, checkAllowance, approveUSDC]);

    return {
        registerBusiness,
        loading,
        error,
        address
    };
}
