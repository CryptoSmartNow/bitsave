"use client";

import { useState, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
import { getContract, formatUnits, parseUnits, keccak256, toBytes, zeroAddress, encodeFunctionData, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import BizFiABI from '../../abi/BizFi.json';
import { parseErrorMessage } from '@/lib/utils';

// Base Mainnet Configuration
const BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base Mainnet

const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ name: "remaining", type: "uint256" }],
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ name: "success", type: "bool" }],
        type: "function",
    },
] as const;

export type TierType = 'micro' | 'builder' | 'growth' | 'enterprise';

export interface ReferralDiscount {
    recipient: `0x${string}`;
    tier: number;
    discountedPrice: bigint;
    businessName: string;
    nonce: bigint;
    deadline: bigint;
}

const TIER_MAPPING: Record<TierType, number> = {
    micro: 0,
    builder: 1,
    growth: 2,
    enterprise: 3
};

export function useBizFi() {
    const { address } = useAccount();
    const { wallets } = useWallets();
    const wallet = useMemo(() => wallets.find((w) => w.walletClientType === 'privy') || wallets[0], [wallets]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Create a dedicated public client for Base Mainnet
    const publicClient = useMemo(() => createPublicClient({
        chain: base,
        transport: http(),
    }), []);

    // Get Wallet Client (Embedded or External)
    const getWalletClient = useCallback(async () => {
        // ... (Log wallets)

        // ... (Find wallet logic)

        if (!wallet) {
            throw new Error("No connected wallet found to sign transaction. Please connect your wallet.");
        }

        console.log("Using wallet:", wallet.walletClientType, wallet.address);

        // Ensure we are on Base Mainnet
        if (wallet.chainId !== 'eip155:8453') {
            try {
                await wallet.switchChain(8453);
            } catch (switchErr) {
                console.warn("Failed to switch chain via wallet, proceeding anyway:", switchErr);
            }
        }

        return await wallet.getEthereumProvider();
    }, [wallets, address]);

    // Check USDC Allowance
    const checkAllowance = useCallback(async (amount: bigint) => {
        if (!address || !publicClient) return false;
        try {
            const allowance = await publicClient.readContract({
                address: USDC_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, BIZFI_PROXY_ADDRESS]
            }) as bigint;
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
            }) as bigint;

            console.log("Registration Check:", {
                tier,
                standardFee: formatUnits(standardFee, 6),
                referralProvided: !!referral,
                referralDataProvided: !!referral?.referralData,
                finalPrice: formatUnits(finalPrice, 6),
                usdcBalance: formatUnits(usdcBalance, 6)
            });

            if (usdcBalance < finalPrice) {
                const required = formatUnits(finalPrice, 6); // USDC has 6 decimals
                const available = formatUnits(usdcBalance, 6);
                const isDiscounted = referral && referral.referralData;
                throw new Error(`Insufficient USDC balance. You have ${available} USDC but need ${required} USDC${isDiscounted ? ' (Discount Applied)' : ' (Standard Fee)'}.`);
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

            if (receipt.status === 'reverted') {
                throw new Error("Transaction failed on-chain. Please check block explorer for details or contact support.");
            }

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

    // Transfer Token (ETH or USDC)
    const transferToken = useCallback(async (
        recipient: string,
        amount: string,
        tokenType: 'ETH' | 'USDC'
    ) => {
        if (!address) throw new Error("Wallet not connected");
        if (!recipient || !amount) throw new Error("Recipient and amount required");

        setLoading(true);
        setError(null);

        try {
            const provider = await getWalletClient();
            let hash;

            if (tokenType === 'ETH') {
                // Native ETH Transfer
                const value = parseUnits(amount, 18);
                // Check Balance
                const balance = await publicClient.getBalance({ address });
                if (balance < value) {
                    throw new Error(`Insufficient ETH balance. You have ${formatUnits(balance, 18)} ETH.`);
                }

                hash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: address,
                        to: recipient as `0x${string}`,
                        value: `0x${value.toString(16)}`
                    }]
                });
            } else {
                // USDC Transfer
                const value = parseUnits(amount, 6); // USDC is 6 decimals
                // Check Balance
                const balance = await publicClient.readContract({
                    address: USDC_ADDRESS,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address]
                }) as bigint;

                if (balance < value) {
                    throw new Error(`Insufficient USDC balance. You have ${formatUnits(balance, 6)} USDC.`);
                }

                const data = encodeFunctionData({
                    abi: [{
                        name: 'transfer',
                        type: 'function',
                        stateMutability: 'nonpayable',
                        inputs: [
                            { name: 'recipient', type: 'address' },
                            { name: 'amount', type: 'uint256' }
                        ],
                        outputs: [{ type: 'bool' }]
                    }],
                    functionName: 'transfer',
                    args: [recipient as `0x${string}`, value]
                });

                hash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: address,
                        to: USDC_ADDRESS,
                        data
                    }]
                });
            }

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            return receipt;

        } catch (err: any) {
            console.error("Transfer error:", err);
            const msg = parseErrorMessage(err);
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [address, publicClient, getWalletClient]);

    return {
        registerBusiness,
        transferToken,
        loading,
        error,
        address
    };
}
