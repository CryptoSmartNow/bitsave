import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { bizswapReferralCode, buyerWalletAddress } = await request.json();

    if (!bizswapReferralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const code = bizswapReferralCode.trim().toUpperCase();

    // 1. Try Supabase
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data: referrer } = await supabase
          .from('users')
          .select('evm_wallet, solana_wallet')
          .ilike('referral_code', code)
          .single();

        if (referrer) {
          const referrerWallet = referrer.evm_wallet || referrer.solana_wallet;
          if (buyerWalletAddress && referrerWallet && referrerWallet.toLowerCase() === buyerWalletAddress.toLowerCase()) {
            return NextResponse.json({ valid: false, error: 'Cannot use your own referral link' }, { status: 400 });
          }
          return NextResponse.json({ valid: true, referrerWallet, code });
        }
      }
    } catch(e) {}

    // 2. Try MongoDB
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection('users');
      const referrer = await usersCollection.findOne({
        $or: [
          { referralCode: { $regex: new RegExp(`^${code}$`, 'i') } },
          { referral_code: { $regex: new RegExp(`^${code}$`, 'i') } },
          { bizswapReferralCode: { $regex: new RegExp(`^${code}$`, 'i') } }
        ]
      });

      if (referrer) {
        const referrerWallet = referrer.walletAddress || referrer.evm_wallet || referrer.wallet;
        if (buyerWalletAddress && referrerWallet && referrerWallet.toLowerCase() === buyerWalletAddress.toLowerCase()) {
          return NextResponse.json({ valid: false, error: 'Cannot use your own referral link' }, { status: 400 });
        }
        return NextResponse.json({ valid: true, referrerWallet, code });
      }
    }

    // Format check fallback
    if (code.startsWith('BIZ') && code.length >= 5) {
      return NextResponse.json({ valid: true, code });
    }

    return NextResponse.json({ valid: false, error: 'Invalid referral link' }, { status: 404 });

  } catch (error: any) {
    console.error('Error validating BizSwap referral code:', error);
    return NextResponse.json({ valid: true, code: 'BIZSWAP' });
  }
}
