"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { PREDICTION_MARKET_FACTORY_ABI, ERC20_ABI } from "@/lib/web3/abi";
import { HiOutlineCheck } from "react-icons/hi2";

interface MarketProposalProps {
    data: {
        type: string;
        description: string;
        chainId: number;
        contracts: {
            factory: `0x${string}`;
            usdc: `0x${string}`;
        };
        params: {
            oracle: string;
            tradingDeadline: string;
            resolveTime: string;
            b: string;
            metadataUri: string;
            creationFee: string;
        };
        rawArgs: any[];
    };
    onSuccess?: (marketId: string, txHash: string, chainId: number) => void;
}

export const MarketProposalCard = ({ data, onSuccess }: MarketProposalProps) => {
    const { address } = useAccount();
    const [step, setStep] = useState<'check' | 'approve' | 'create' | 'indexing' | 'done'>('check');
    const [createTxHash, setCreateTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>(undefined);
    const [marketId, setMarketId] = useState<string | undefined>(undefined);

    const { writeContractAsync: writeApprove, isPending: isApproving } = useWriteContract();
    const { writeContractAsync: writeCreate, isPending: isCreating } = useWriteContract();

    // Wait for Creation
    const { isLoading: isConfirmingCreate, isSuccess: isConfirmedCreate } = useWaitForTransactionReceipt({
        hash: createTxHash,
    });

    // Wait for Approval
    const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } = useWaitForTransactionReceipt({
        hash: approveTxHash,
    });

    // Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: data.contracts.usdc,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, data.contracts.factory],
        query: {
             enabled: !!address,
        }
    });

    const creationFee = BigInt(data.params.creationFee);

    useEffect(() => {
        if (isConfirmedApprove) {
            refetchAllowance();
        }
    }, [isConfirmedApprove, refetchAllowance]);

    useEffect(() => {
        if (allowance !== undefined && allowance >= creationFee) {
            if (step === 'check' || step === 'approve') {
                setStep('create');
            }
        } else if (step === 'check') {
            setStep('approve');
        }
    }, [allowance, creationFee, step]);

    useEffect(() => {
        if (isConfirmedCreate && createTxHash && step === 'indexing') {
            const indexMarket = async () => {
                try {
                    const res = await fetch('/api/bizfun/markets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            question: data.description, // Use description as question
                            description: data.description,
                            vibe: 'Community',
                            tradingDeadline: data.params.tradingDeadline,
                            chainId: 8453,
                            creator: address,
                            txHash: createTxHash,
                            metadataUri: data.params.metadataUri
                        })
                    });
                    
                    const responseData = await res.json();
                    if (responseData.market && responseData.market._id) {
                        setMarketId(responseData.market._id);
                        if (onSuccess) {
                            onSuccess(responseData.market._id, createTxHash, data.chainId);
                        }
                    }
                    setStep('done');
                } catch (error) {
                    console.error("Indexing failed", error);
                    setStep('done'); // Show done anyway, maybe with warning?
                }
            };
            indexMarket();
        }
    }, [isConfirmedCreate, createTxHash, step, data, address]);

    const handleApprove = async () => {
        if (!address) {
            console.error("Wallet not connected");
            return;
        }
        try {
            const hash = await writeApprove({
                address: data.contracts.usdc,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [data.contracts.factory, creationFee],
            });
            console.log("Approval tx:", hash);
            setApproveTxHash(hash);
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    const handleCreate = async () => {
        if (!address) {
            console.error("Wallet not connected");
            return;
        }
        try {
            // Replace oracle placeholder with user address if it's the 0x0...0 address
            const oracle = data.params.oracle === "0x0000000000000000000000000000000000000000" ? address : data.params.oracle;
            
            const hash = await writeCreate({
                address: data.contracts.factory,
                abi: PREDICTION_MARKET_FACTORY_ABI,
                functionName: 'createMarket',
                args: [
                    oracle as `0x${string}`,
                    BigInt(data.params.tradingDeadline),
                    BigInt(data.params.resolveTime),
                    BigInt(data.params.b),
                    data.params.metadataUri
                ]
            });
            setCreateTxHash(hash);
            setStep('indexing');
        } catch (error) {
            console.error("Creation failed", error);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-2 max-w-md">
            <h3 className="text-[#81D7B4] font-bold text-lg mb-2">Market Creation Proposal</h3>
            <p className="text-gray-400 text-sm mb-4">{data.description}</p>
            
            <div className="space-y-2 mb-4 text-sm text-gray-300">
                <div className="flex justify-between">
                    <span>Fee:</span>
                    <span className="font-mono text-white">{formatUnits(creationFee, 6)} USDC</span>
                </div>
                <div className="flex justify-between">
                    <span>Deadline:</span>
                    <span className="font-mono text-white">{new Date(Number(data.params.tradingDeadline) * 1000).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Initial Liquidity:</span>
                    <span className="font-mono text-white">{formatUnits(BigInt(data.params.b), 6)} USDC</span>
                </div>
            </div>

            <div className="flex gap-2">
                {step === 'approve' && (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving || isConfirmingApprove}
                        className="flex-1 bg-[#81D7B4]/20 hover:bg-[#81D7B4]/30 text-[#81D7B4] border border-[#81D7B4]/50 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isApproving || isConfirmingApprove ? "Approving..." : "1. Approve USDC"}
                    </button>
                )}
                
                {step === 'create' && (
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || isConfirmingCreate}
                        className="flex-1 bg-[#81D7B4]/20 hover:bg-[#81D7B4]/30 text-[#81D7B4] border border-[#81D7B4]/50 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isCreating || isConfirmingCreate ? "Creating..." : "2. Create Market"}
                    </button>
                )}

                {step === 'done' && (
                    <div className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded-lg font-bold text-center">
                        <div className="flex items-center justify-center gap-2">
                            <HiOutlineCheck className="w-5 h-5" />
                            <span>Created!</span>
                        </div>
                        {createTxHash && (
                            <div className="flex justify-center gap-3 mt-1">
                                <a 
                                    href={`https://basescan.org/tx/${createTxHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs underline hover:text-green-300"
                                >
                                    View TX
                                </a>
                                {marketId && (
                                    <a 
                                        href={`/bizfun/market/${marketId}`}
                                        className="text-xs underline hover:text-green-300"
                                    >
                                        Open Market
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}
                
                {step === 'approve' && (
                     <button 
                        onClick={() => refetchAllowance()}
                        className="p-2 text-gray-400 hover:text-white"
                        title="Refresh Allowance"
                    >
                        ↻
                    </button>
                )}
            </div>
        </div>
    );
};
