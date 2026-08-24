import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE || 'fallback-dev-only');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const query: any = {};
    if (search) {
      query.$or = [
        { walletAddress: { $regex: search, $options: 'i' } },
        { evm_wallet: { $regex: search, $options: 'i' } },
        { solana_wallet: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { privy_did: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
        { referral_code: { $regex: search, $options: 'i' } },
        { bizswapReferralCode: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      db.collection('users').find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('users').countDocuments(query),
    ]);

    // Enhance users with earnings and certificate count
    const enhancedUsers = await Promise.all(
      users.map(async (u: any) => {
        const wallet = u.walletAddress || u.evm_wallet || u.solana_wallet;
        let earnings = null;
        let certCount = 0;

        if (wallet) {
          earnings = await db.collection('bizswap_referral_earnings').findOne({
            wallet: { $regex: new RegExp(`^${wallet}$`, 'i') },
          });

          certCount = await db.collection('bizswap_certificates').countDocuments({
            wallet: { $regex: new RegExp(`^${wallet}$`, 'i') },
          });
        }

        return {
          _id: u._id.toString(),
          walletAddress: wallet || 'No wallet',
          email: u.email || null,
          userId: u.userId || u.privy_did || null,
          referralCode: u.referralCode || u.referral_code || u.bizswapReferralCode || null,
          pendingUsdcEarnings: earnings?.pending_usdc || u.bizswapPendingUsdcEarnings || 0,
          totalUsdcEarned: earnings?.total_earned_usdc || u.bizswapTotalUsdcEarned || 0,
          certificateCount: certCount,
          createdAt: u.createdAt || u.created_at || null,
          updatedAt: u.updatedAt || u.updated_at || null,
          raw: u,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: enhancedUsers,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Error in dev-admin users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const body = await req.json();
    const { userId, walletAddress, referralCode, pendingUsdc, totalUsdcEarned } = body;

    if (!userId && !walletAddress) {
      return NextResponse.json({ error: 'User ID or wallet address required' }, { status: 400 });
    }

    const userQuery = userId ? { _id: new ObjectId(userId) } : { walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } };

    const updateDoc: any = { updatedAt: new Date() };
    if (referralCode !== undefined) {
      updateDoc.referralCode = referralCode.trim().toUpperCase();
      updateDoc.referral_code = referralCode.trim().toUpperCase();
      updateDoc.bizswapReferralCode = referralCode.trim().toUpperCase();
    }
    if (pendingUsdc !== undefined) {
      updateDoc.bizswapPendingUsdcEarnings = Number(pendingUsdc);
    }
    if (totalUsdcEarned !== undefined) {
      updateDoc.bizswapTotalUsdcEarned = Number(totalUsdcEarned);
    }

    await db.collection('users').updateOne(userQuery, { $set: updateDoc });

    if (walletAddress) {
      const earningsUpdate: any = { updated_at: new Date() };
      if (pendingUsdc !== undefined) earningsUpdate.pending_usdc = Number(pendingUsdc);
      if (totalUsdcEarned !== undefined) earningsUpdate.total_earned_usdc = Number(totalUsdcEarned);

      await db.collection('bizswap_referral_earnings').updateOne(
        { wallet: walletAddress },
        { $set: earningsUpdate },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, message: 'User record updated successfully' });

  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
