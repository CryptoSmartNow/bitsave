import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { bizswapReferralWithdrawSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validationResult = bizswapReferralWithdrawSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { walletAddress, amount } = validationResult.data;
    const cleanWallet = walletAddress.trim();

    const db = await getDatabase();
    if (db) {
      const earningsCollection = db.collection('bizswap_referral_earnings');
      const withdrawalsCollection = db.collection('bizswap_withdrawals');

      const earnings = await earningsCollection.findOne({ wallet: cleanWallet });
      const pendingBalance = Number(earnings?.pending_usdc || 0);

      if (amount > pendingBalance && pendingBalance > 0) {
        return NextResponse.json({ error: 'Insufficient pending earnings' }, { status: 400 });
      }

      await earningsCollection.updateOne(
        { wallet: cleanWallet },
        { 
          $set: { 
            pending_usdc: Math.max(0, pendingBalance - amount),
            updated_at: new Date()
          } 
        },
        { upsert: true }
      );

      const withdrawalDoc = {
        wallet: cleanWallet,
        amount,
        currency: 'USDC',
        status: 'pending',
        created_at: new Date()
      };

      const result = await withdrawalsCollection.insertOne(withdrawalDoc);

      return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        data: {
          _id: result.insertedId.toString(),
          walletAddress: cleanWallet,
          amount,
          status: 'pending',
          requestDate: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  } catch (error: any) {
    console.error('Error submitting withdrawal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
