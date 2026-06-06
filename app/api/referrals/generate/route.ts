import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    const usersCollection = db.collection('users');
    
    // Tick if user already exists
    const user = await usersCollection.findOne({ walletAddress });
    
    if (user && user.referralCode) {
      // User already has a referral code
      return NextResponse.json({
        referralCode: user.referralCode,
        referralLink: `https://bitsave.io/ref/${user.referralCode}`,
        isNew: false
      });
    }
    
    // Generate unique referral code
    let referralCode;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = nanoid(8); // Generate 8-character code
      const existingUser = await usersCollection.findOne({ referralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    // Update or create user with referral code
    await usersCollection.updateOne(
      { walletAddress },
      {
        $set: {
          referralCode,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          walletAddress,
          createdAt: new Date().toISOString(),
          referralCount: 0,
          totalReferralRewards: 0
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({
      referralCode,
      referralLink: `https://bitsave.io/ref/${referralCode}`,
      isNew: !user
    });
    
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}