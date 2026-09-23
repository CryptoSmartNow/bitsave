import { NextResponse } from 'next/server';
import { Chainrails, crapi } from '@chainrails/sdk';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getBizSwapCollection, getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import { z } from 'zod';

const depositSchema = z.object({
  walletAddress: z.string().min(1, 'Wallet address is required'),
  amount: z.number().min(1000, 'Minimum purchase amount is $1000'),
  chain: z.enum(['BASE', 'SOLANA']).default('BASE'),
  token: z.string().default('USDC'),
  instrument: z.enum(['BizYield', 'BizCredit', 'BizBond']),
  reference: z.string().optional(),
});

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { walletAddress, amount, chain, token, instrument, reference } = parsed.data;

    const LIVE_API_KEY = process.env.CHAINRAILS_API_KEY;
    const BIZSWAP_API_KEY = process.env.BIZSWAP_CHAINRAILS_API_KEY;
    const CHAINRAILS_API_KEY = LIVE_API_KEY || BIZSWAP_API_KEY;
    if (!CHAINRAILS_API_KEY) {
      return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 503 });
    }

    const numericAmount = Number(Math.ceil(Number(amount + 'e2')) + 'e-2');

    Chainrails.config({
      api_key: CHAINRAILS_API_KEY,
      env: 'production' as any,
    });

    const evmWallet = process.env.NEXT_PUBLIC_BIZSWAP_EVM_REVENUE_WALLET || process.env.NEXT_PUBLIC_BIZFI_EVM_REVENUE_WALLET;
    const solWallet = process.env.NEXT_PUBLIC_BIZSWAP_SOLANA_REVENUE_WALLET;
    const recipientWallet = chain === 'SOLANA' ? solWallet : evmWallet;

    if (!recipientWallet) {
      return NextResponse.json({ error: 'Server misconfiguration: Revenue wallet missing' }, { status: 500 });
    }

    const sessionResponse = await crapi.auth.getSessionToken({
      amount: numericAmount.toString(),
      recipient: recipientWallet,
      destinationChain: chain as any,
      token: token as any,
    });

    const depositId = crypto.randomUUID();
    // Save pending deposit intent in database
    const db = await getDatabase();
    if (db) {
      await db.collection('bizbond_deposits').insertOne({
        depositId, // Local tracking ID
        chainrailsSession: sessionResponse, // Save the entire response for reference
        walletAddress,
        amount: numericAmount,
        chain,
        token,
        instrument,
        reference: reference || null,
        developerId: auth.developerId || null,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        depositId,
        session: sessionResponse
      }
    });
  } catch (error: any) {
    console.error('API /deposit error:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize deposit', 
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
