"use client";

import { useState, useCallback, useMemo } from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { getContract, formatUnits, parseUnits, keccak256, toBytes, zeroAddress, encodeFunctionData, createPublicClient, http } from 'viem';
import { base, celo } from 'viem/chains';
import BizFiABI from '../../abi/BizFi.json';
import { parseErrorMessage } from '@/lib/utils';

// Base Mainnet Configuration
const BASE_BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base Mainnet

// Celo Mainnet Configuration
const CELO_BIZFI_PROXY_ADDRESS = "0x956a6F2841A714806375BB3E7bDacb18DD26ACeB";
const GDOLLAR_ADDRESS = "0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A"; // G$ on Celo Mainnet

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
    const { address: wagmiAddress } = useAccount();
    const { user } = usePrivy();
    // Prioritize wagmi address (external wallet), fallback to Privy embedded wallet
    const address = wagmiAddress || user?.wallet?.address as `0x${string}` | undefined;
    const { data: walletClient } = useWalletClient();
    const { switchChainAsync } = useSwitchChain();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Create dedicated public clients
    const basePublicClient = useMemo(() => createPublicClient({
        chain: base,
        transport: http(),
    }), []);

    const celoPublicClient = useMemo(() => createPublicClient({
        chain: celo,
        transport: http(),
    }), []);

    // Get Wallet Client (Embedded or External)
    const getWalletClient = useCallback(async (targetChainId: number) => {
        if (!walletClient) {
            throw new Error("No connected wallet found to sign transaction. Please connect your wallet.");
        }

        console.log("Using wallet:", walletClient.account.address);

        // Ensure we are on the target network
        if (walletClient.chain.id !== targetChainId) {
            try {
                await switchChainAsync({ chainId: targetChainId });
            } catch (switchErr) {
                console.warn("Failed to switch chain via wallet, proceeding anyway:", switchErr);
            }
        }

        return walletClient;
    }, [walletClient, switchChainAsync]);

    // Check Token Allowance
    const checkAllowance = useCallback(async (amount: bigint, tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, publicClient: any) => {
        if (!address || !publicClient) return false;
        try {
            const allowance = await publicClient.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address, spenderAddress]
            }) as bigint;
            return allowance >= amount;
        } catch (err) {
            console.error("Error checking allowance:", err);
            return false;
        }
    }, [address]);

    // Approve Token
    const approveToken = useCallback(async (amount: bigint, tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, targetChainId: number, publicClient: any) => {
        if (!address) throw new Error("Wallet not connected");

        try {
            setLoading(true);
            const provider = await getWalletClient(targetChainId);

            // Use eth_sendTransaction via the provider
            const hash = await provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: address,
                    to: tokenAddress,
                    data: encodeFunctionData({
                        abi: ERC20_ABI,
                        functionName: 'approve',
                        args: [spenderAddress, amount]
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
    }, [address, getWalletClient]);

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
        },
        paymentNetwork: 'base' | 'celo' = 'base'
    ) => {
        const publicClient = paymentNetwork === 'celo' ? celoPublicClient : basePublicClient;
        const targetChainId = paymentNetwork === 'celo' ? 42220 : 8453;
        const targetProxyAddress = paymentNetwork === 'celo' ? CELO_BIZFI_PROXY_ADDRESS : BASE_BIZFI_PROXY_ADDRESS;
        const targetTokenAddress = paymentNetwork === 'celo' ? GDOLLAR_ADDRESS : USDC_ADDRESS;
        const tokenDecimals = paymentNetwork === 'celo' ? 18 : 6;
        const tokenSymbol = paymentNetwork === 'celo' ? 'G$' : 'USDC';
        const networkName = paymentNetwork === 'celo' ? 'Celo' : 'Base';

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
                address: targetProxyAddress,
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

            // Check Native Token Balance for gas (ETH or CELO)
            const nativeBalance = await publicClient.getBalance({ address });
            if (nativeBalance === BigInt(0)) {
                throw new Error(`Insufficient funds. You need ${networkName === 'Celo' ? 'CELO' : 'ETH'} on ${networkName} network to pay for gas fees.`);
            }

            // Check Token Balance
            const tokenBalance = await publicClient.readContract({
                address: targetTokenAddress,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address]
            }) as bigint;

            console.log("Registration Check:", {
                tier,
                network: networkName,
                standardFee: formatUnits(standardFee, tokenDecimals),
                referralProvided: !!referral,
                referralDataProvided: !!referral?.referralData,
                finalPrice: formatUnits(finalPrice, tokenDecimals),
                tokenBalance: formatUnits(tokenBalance, tokenDecimals)
            });

            if (tokenBalance < finalPrice) {
                const required = formatUnits(finalPrice, tokenDecimals);
                const available = formatUnits(tokenBalance, tokenDecimals);
                const isDiscounted = referral && referral.referralData;
                throw new Error(`Insufficient ${tokenSymbol} balance. You have ${available} ${tokenSymbol} but need ${required} ${tokenSymbol}${isDiscounted ? ' (Discount Applied)' : ' (Standard Fee)'}.`);
            }

            // Check Allowance
            const hasAllowance = await checkAllowance(finalPrice, targetTokenAddress, targetProxyAddress, publicClient);
            if (!hasAllowance) {
                await approveToken(finalPrice, targetTokenAddress, targetProxyAddress, targetChainId, publicClient);
            }

            // Hash Metadata
            const metadataString = JSON.stringify(metadata);
            const metadataHash = keccak256(toBytes(metadataString));

            // Get Privy wallet provider
            const provider = await getWalletClient(targetChainId);

            // Register using Privy provider
            const hash = await provider.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: address,
                    to: targetProxyAddress,
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
    }, [basePublicClient, celoPublicClient, address, checkAllowance, approveToken, getWalletClient]);

    // Transfer Token (ETH, USDC, CELO, or G$)
    const transferToken = useCallback(async (
        recipient: string,
        amount: string,
        tokenType: 'ETH' | 'USDC' | 'CELO' | 'G$'
    ) => {
        if (!address) throw new Error("Wallet not connected");
        if (!recipient || !amount) throw new Error("Recipient and amount required");

        setLoading(true);
        setError(null);

        try {
            const isCeloNetwork = tokenType === 'CELO' || tokenType === 'G$';
            const targetChainId = isCeloNetwork ? 42220 : 8453;
            const provider = await getWalletClient(targetChainId);
            const publicClient = isCeloNetwork ? celoPublicClient : basePublicClient;

            let hash;

            if (tokenType === 'ETH' || tokenType === 'CELO') {
                // Native Gas Token Transfer
                const value = parseUnits(amount, 18);
                // Check Balance
                const balance = await publicClient.getBalance({ address });
                if (balance < value) {
                    throw new Error(`Insufficient ${tokenType} balance. You have ${formatUnits(balance, 18)} ${tokenType}.`);
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
                // ERC20 Token Transfer (USDC or G$)
                const isGd = tokenType === 'G$';
                const tokenAddress = isGd ? GDOLLAR_ADDRESS : USDC_ADDRESS;
                const decimals = isGd ? 18 : 6;
                const value = parseUnits(amount, decimals);

                // Check Balance
                const balance = await publicClient.readContract({
                    address: tokenAddress,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address]
                }) as bigint;

                if (balance < value) {
                    throw new Error(`Insufficient ${tokenType} balance. You have ${formatUnits(balance, decimals)} ${tokenType}.`);
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
                        to: tokenAddress,
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
    }, [address, basePublicClient, getWalletClient]);

    return {
        registerBusiness,
        transferToken,
        loading,
        error,
        address
    };
}
