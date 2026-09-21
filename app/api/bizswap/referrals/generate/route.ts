import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import { bizswapReferralGenerateSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { escapeRegex } from '@/lib/escapeRegex';

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
    const rateLimitResponse = rateLimit(request, 10, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validationResult = bizswapReferralGenerateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { walletAddress } = validationResult.data;
    const cleanWallet = walletAddress.trim();
    const isEvm = cleanWallet.startsWith('0x');

    const db = await getDatabase();
    if (!db) {
      // Deterministic fallback code
      const fallbackCode = `BIZ${cleanWallet.slice(2, 7).toUpperCase()}`;
      return NextResponse.json({
        bizswapReferralCode: fallbackCode,
        bizswapPendingUsdcEarnings: 0,
        bizswapTotalUsdcEarned: 0,
        isNew: true
      });
    }

    const usersCollection = db.collection('users');
    const earningsCollection = db.collection('bizswap_referral_earnings');

    const existingUser = await usersCollection.findOne({
      $or: [
        { walletAddress: { $regex: new RegExp(`^${escapeRegex(cleanWallet)}$`, 'i') } },
        { evm_wallet: { $regex: new RegExp(`^${escapeRegex(cleanWallet)}$`, 'i') } },
        { userId: cleanWallet }
      ]
    });

    if (existingUser?.referralCode || existingUser?.referral_code) {
      const code = existingUser.referralCode || existingUser.referral_code;
      const earnings = await earningsCollection.findOne({ wallet: cleanWallet });
      return NextResponse.json({
        bizswapReferralCode: code,
        bizswapPendingUsdcEarnings: earnings?.pending_usdc || 0,
        bizswapTotalUsdcEarned: earnings?.total_earned_usdc || 0,
        isNew: false
      });
    }

    const newCode = `BIZ${cleanWallet.slice(2, 6).toUpperCase()}${generateRandomCode(2)}`;
    await usersCollection.updateOne(
      { walletAddress: cleanWallet },
      { 
        $set: { 
          referralCode: newCode,
          referral_code: newCode,
          updatedAt: new Date(),
          evm_wallet: isEvm ? cleanWallet : null,
          solana_wallet: !isEvm ? cleanWallet : null
        } 
      },
      { upsert: true }
    );

    await earningsCollection.updateOne(
      { wallet: cleanWallet },
      { 
        $setOnInsert: { 
          pending_usdc: 0,
          total_earned_usdc: 0
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
    return NextResponse.json({ 
      bizswapReferralCode: `BIZ${generateRandomCode(5)}`,
      bizswapPendingUsdcEarnings: 0,
      bizswapTotalUsdcEarned: 0,
      isNew: true
    });
  }
}
