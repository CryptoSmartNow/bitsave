import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getChainConfig, BizSwapSupportedChain } from '@/lib/bizswap-contracts';
import { getBizSwapCollection } from '@/lib/mongodb';
import { z } from 'zod';

const claimSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  certificateId: z.string().min(1, 'Certificate ID is required'),
  chain: z.enum(['BASE', 'SOLANA']).default('BASE'),
});

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    const body = await request.json();
    const parsed = claimSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { walletAddress, certificateId, chain } = parsed.data;

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const certificate = await collection.findOne({ mintAddress: certificateId, wallet: walletAddress });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found or does not belong to this wallet' }, { status: 404 });
    }

    const selectedChainKey: BizSwapSupportedChain = chain.toLowerCase() === 'botchain' ? 'botchain' : 'base';
    const chainConfig = getChainConfig(selectedChainKey);

    // Return the unsigned transaction payload so the third party can prompt their user to sign
    return NextResponse.json({
      success: true,
      message: 'Ready to claim yield. Please sign the transaction using the provided payload.',
      data: {
        certificateId,
        contractAddress: chainConfig.contracts.controllerOrProxy,
        abi: '... [BizBond ABI details] ...', // Note: You would import and provide the ABI here
        methodName: 'claimYield', // The smart contract function to call
        args: [
          certificateId // Assuming the contract uses the certificateId or a numeric token ID
        ],
      }
    });

  } catch (error: any) {
    console.error('API /claim error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
