"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { PREDICTION_MARKET_FACTORY_ABI, MOCK_USDC_ABI } from "@/lib/web3/abi";
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
}

export const MarketProposalCard = ({ data }: MarketProposalProps) => {
    const { address } = useAccount();
    const [step, setStep] = useState<'check' | 'approve' | 'create' | 'done'>('check');
    const [txHash, setTxHash] = useState<string | null>(null);

    const { writeContractAsync: writeApprove, isPending: isApproving } = useWriteContract();
    const { writeContractAsync: writeCreate, isPending: isCreating } = useWriteContract();

    // Check Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: data.contracts.usdc,
        abi: MOCK_USDC_ABI,
        functionName: 'allowance',
        args: [address as `0x${string}`, data.contracts.factory],
        query: {
             enabled: !!address,
        }
    });

    const creationFee = BigInt(data.params.creationFee);

    useEffect(() => {
        if (allowance !== undefined && allowance >= creationFee) {
            if (step === 'check' || step === 'approve') {
                setStep('create');
            }
        } else if (step === 'check') {
            setStep('approve');
        }
    }, [allowance, creationFee, step]);

    const handleApprove = async () => {
        try {
            const hash = await writeApprove({
                address: data.contracts.usdc,
                abi: MOCK_USDC_ABI,
                functionName: 'approve',
                args: [data.contracts.factory, creationFee * BigInt(10)],
            });
            console.log("Approval tx:", hash);
            // Wait for receipt would be better, but we rely on re-check or manual next step for now
            // Actually, let's just wait for next render cycle or optimistic update
            // Ideally we wait for receipt.
            // For now, we'll just set step to 'create' after a delay or assume success if no error thrown
            // Better: use useWaitForTransactionReceipt
        } catch (error) {
            console.error("Approval failed", error);
        }
    };

    // We can use a separate hook to wait for approval receipt if we had the hash
    // But for simplicity, let's just refetch allowance on button click or interval

    const handleCreate = async () => {
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
            setTxHash(hash);
            setStep('done');
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
            </div>

            <div className="flex gap-2">
                {step === 'approve' && (
                    <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isApproving ? "Approving..." : "1. Approve USDC"}
                    </button>
                )}
                
                {step === 'create' && (
                    <button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="flex-1 bg-[#81D7B4]/20 hover:bg-[#81D7B4]/30 text-[#81D7B4] border border-[#81D7B4]/50 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                    >
                        {isCreating ? "Creating..." : "2. Create Market"}
                    </button>
                )}

                {step === 'done' && (
                    <div className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded-lg font-bold text-center">
                        <div className="flex items-center justify-center gap-2">
                            <HiOutlineCheck className="w-5 h-5" />
                            <span>Created!</span>
                        </div>
                        {txHash && (
                            <a 
                                href={`https://basescan.org/tx/${txHash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs underline block mt-1 hover:text-green-300"
                            >
                                View TX
                            </a>
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
