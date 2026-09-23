import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getChainConfig, BizSwapSupportedChain } from '@/lib/bizswap-contracts';
import { getBizSwapCollection } from '@/lib/mongodb';
import { z } from 'zod';

const redeemSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  certificateId: z.string().min(1, 'Certificate ID is required'),
  chain: z.enum(['BASE', 'SOLANA']).default('BASE'),
});

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    const body = await request.json();
    const parsed = redeemSchema.safeParse(body);
    
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

    // Usually, you'd check if maturity date has passed here, e.g.:
    // if (new Date() < new Date(certificate.maturityDate)) {
    //   return NextResponse.json({ error: 'Bond has not reached maturity date' }, { status: 403 });
    // }

    const selectedChainKey: BizSwapSupportedChain = chain.toLowerCase() === 'botchain' ? 'botchain' : 'base';
    const chainConfig = getChainConfig(selectedChainKey);

    // Return the unsigned transaction payload so the third party can prompt their user to sign
    return NextResponse.json({
      success: true,
      message: 'Ready to redeem bond principal and final yield. Please sign the transaction using the provided payload.',
      data: {
        certificateId,
        contractAddress: chainConfig.contracts.controllerOrProxy,
        abi: '... [BizBond ABI details] ...',
        methodName: 'redeemBond',
        args: [
          certificateId
        ],
      }
    });

  } catch (error: any) {
    console.error('API /redeem error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
