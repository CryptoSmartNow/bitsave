import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapUsersCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { bizswapReferralCode, buyerWalletAddress } = await request.json();

    if (!bizswapReferralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const collection = await getBizSwapUsersCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Convert code to uppercase for consistency
    const code = bizswapReferralCode.toUpperCase();

    const referrer = await collection.findOne({ bizswapReferralCode: code });

    if (!referrer) {
      return NextResponse.json({ valid: false, error: 'Invalid referral code' }, { status: 404 });
    }

    if (buyerWalletAddress && referrer.walletAddress === buyerWalletAddress) {
      return NextResponse.json({ valid: false, error: 'Cannot use your own referral code' }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      referrerWallet: referrer.walletAddress
    });

  } catch (error: any) {
    console.error('Error validating BizSwap referral code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
