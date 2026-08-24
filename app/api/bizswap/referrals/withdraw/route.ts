import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
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

    // 1. Try Supabase
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: users, error: userError } = await supabase
          .from('users')
          .select('id')
          .or(`evm_wallet.ilike.${cleanWallet},solana_wallet.eq.${cleanWallet}`);

        const user = users && users.length > 0 ? users[0] : null;

        if (user) {
          const { data: earnings } = await supabase
            .from('bizswap_referral_earnings')
            .select('pending_usdc')
            .eq('user_id', user.id)
            .single();

          const pendingBalance = Number(earnings?.pending_usdc || 0);

          if (amount > pendingBalance) {
            return NextResponse.json({ error: 'Insufficient pending earnings' }, { status: 400 });
          }

          await supabase
            .from('bizswap_referral_earnings')
            .update({
              pending_usdc: pendingBalance - amount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          const { data: withdrawal } = await supabase
            .from('bizswap_withdrawals')
            .insert({
              user_id: user.id,
              wallet: cleanWallet,
              amount,
              currency: 'USDC',
              status: 'pending',
            })
            .select()
            .single();

          return NextResponse.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            data: {
              _id: withdrawal?.id || new Date().getTime().toString(),
              walletAddress: cleanWallet,
              amount,
              status: 'pending',
              requestDate: new Date().toISOString()
            }
          });
        }
      }
    } catch (supabaseErr) {
      console.warn('[Referrals Withdraw] Supabase fallback to MongoDB:', (supabaseErr as any)?.message);
    }

    // 2. MongoDB fallback
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
