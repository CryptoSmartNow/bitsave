import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { escapeRegex } from '@/lib/escapeRegex';

export async function POST(request: NextRequest) {
  try {
    const { bizswapReferralCode, buyerWalletAddress } = await request.json();

    if (!bizswapReferralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const code = bizswapReferralCode.trim().toUpperCase();

    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection('users');
      const referrer = await usersCollection.findOne({
        $or: [
          { referralCode: { $regex: new RegExp(`^${escapeRegex(code)}$`, 'i') } },
          { referral_code: { $regex: new RegExp(`^${escapeRegex(code)}$`, 'i') } },
          { bizswapReferralCode: { $regex: new RegExp(`^${escapeRegex(code)}$`, 'i') } }
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
