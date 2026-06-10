import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapUsersCollection } from '@/lib/mongodb';
import crypto from 'crypto';

function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const collection = await getBizSwapUsersCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Check if user already has a code
    const existingUser = await collection.findOne({ walletAddress });
    if (existingUser?.bizswapReferralCode) {
      return NextResponse.json({
        bizswapReferralCode: existingUser.bizswapReferralCode,
        bizswapPendingUsdcEarnings: existingUser.bizswapPendingUsdcEarnings || 0,
        bizswapTotalUsdcEarned: existingUser.bizswapTotalUsdcEarned || 0,
        isNew: false
      });
    }

    // Generate a unique 8-character alphanumeric code
    let newCode = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      newCode = `BIZ${generateRandomCode(5)}`;
      const existing = await collection.findOne({ bizswapReferralCode: newCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
    }

    const now = new Date().toISOString();

    await collection.updateOne(
      { walletAddress },
      {
        $set: {
          bizswapReferralCode: newCode,
          lastUpdated: now,
        },
        $setOnInsert: {
          walletAddress,
          bizswapPendingUsdcEarnings: 0,
          bizswapTotalUsdcEarned: 0,
          createdAt: now,
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      bizswapReferralCode: newCode,
      bizswapPendingUsdcEarnings: 0,
      bizswapTotalUsdcEarned: 0,
      isNew: true
    });

  } catch (error: any) {
    console.error('Error generating BizSwap referral code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
