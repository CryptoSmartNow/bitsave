import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getDatabase } from '@/lib/mongodb';
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

import { bizswapReferralGenerateSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';

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

    // 1. Try Supabase first if available
    try {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const orFilter = isEvm 
          ? `evm_wallet.ilike.${cleanWallet},privy_did.eq.${cleanWallet}`
          : `solana_wallet.eq.${cleanWallet},privy_did.eq.${cleanWallet}`;

        const { data: users } = await supabase
          .from('users')
          .select('id, referral_code')
          .or(orFilter)
          .limit(1);

        let user: any = users && users.length > 0 ? users[0] : null;

        if (user && user.referral_code) {
          const { data: earnings } = await supabase
            .from('bizswap_referral_earnings')
            .select('pending_usdc, total_earned_usdc')
            .eq('user_id', user.id)
            .single();

          return NextResponse.json({
            bizswapReferralCode: user.referral_code,
            bizswapPendingUsdcEarnings: earnings?.pending_usdc || 0,
            bizswapTotalUsdcEarned: earnings?.total_earned_usdc || 0,
            isNew: false
          });
        }

        // Generate unique code
        let newCode = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
          newCode = `BIZ${generateRandomCode(5)}`;
          const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', newCode)
            .single();
            
          if (!existing) isUnique = true;
          attempts++;
        }

        if (isUnique && newCode) {
          if (!user) {
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                privy_did: cleanWallet.startsWith('did:') ? cleanWallet : `wallet_${cleanWallet}`,
                evm_wallet: isEvm ? cleanWallet : null,
                solana_wallet: !isEvm && !cleanWallet.startsWith('did:') ? cleanWallet : null,
                referral_code: newCode
              })
              .select('id')
              .single();
            user = newUser;
          } else {
            await supabase
              .from('users')
              .update({ referral_code: newCode })
              .eq('id', user.id);
          }

          if (user?.id) {
            try {
              await supabase
                .from('bizswap_referral_earnings')
                .insert({
                  user_id: user.id,
                  pending_usdc: 0,
                  total_earned_usdc: 0
                });
            } catch(e) {}

            return NextResponse.json({
              bizswapReferralCode: newCode,
              bizswapPendingUsdcEarnings: 0,
              bizswapTotalUsdcEarned: 0,
              isNew: true
            });
          }
        }
      }
    } catch (supabaseErr) {
      console.warn('[Referrals] Supabase fallback to MongoDB:', (supabaseErr as any)?.message);
    }

    // 2. Resilient MongoDB fallback
    const db = await getDatabase();
    if (db) {
      const usersCollection = db.collection('users');
      const earningsCollection = db.collection('bizswap_referral_earnings');

      const existingUser = await usersCollection.findOne({
        $or: [
          { walletAddress: { $regex: new RegExp(`^${cleanWallet}$`, 'i') } },
          { evm_wallet: { $regex: new RegExp(`^${cleanWallet}$`, 'i') } },
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
            updatedAt: new Date()
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
    }

    // Deterministic fallback code
    const fallbackCode = `BIZ${cleanWallet.slice(2, 7).toUpperCase()}`;
    return NextResponse.json({
      bizswapReferralCode: fallbackCode,
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
