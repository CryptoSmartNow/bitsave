import { z } from 'zod';

export const savefiTransactionSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number string",
  }),
  txHash: z.string().min(10, "Invalid transaction hash"),
  chain: z.enum(['base', 'celo', 'lisk', 'bsc', 'avalanche', 'solana']),
  planName: z.string().min(1, "Plan name is required"),
  type: z.enum(['deposit', 'top_up', 'topup', 'withdrawal', 'withdraw', 'early_withdrawal', 'maturity_withdrawal']),
  currency: z.string().optional(),
});

export const bizswapReferralGenerateSchema = z.object({
  walletAddress: z.string().min(10, "Invalid wallet address"),
});

export const bizswapReferralWithdrawSchema = z.object({
  walletAddress: z.string().min(10, "Invalid wallet address"),
  amount: z.number().positive("Amount must be greater than 0"),
});
