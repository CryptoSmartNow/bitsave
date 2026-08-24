import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { referralCode, visitorWalletAddress, visitorIP, userAgent } = await request.json();
    
    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
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
    const referralVisitsCollection = db.collection('referral_visits');
    
    // Find the referrer by referral code
    const referrer = await usersCollection.findOne({ referralCode });
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }
    
    // Don't track self-referrals
    if (visitorWalletAddress && referrer.walletAddress?.toLowerCase() === visitorWalletAddress.toLowerCase()) {
      return NextResponse.json(
        { message: 'Self-referral not tracked' },
        { status: 200 }
      );
    }
    
    // Record the referral visit
    const visitRecord = {
      referralCode,
      referrerWalletAddress: referrer.walletAddress.toLowerCase(),
      visitorWalletAddress: visitorWalletAddress ? visitorWalletAddress.toLowerCase() : null,
      visitorIP: visitorIP || null,
      userAgent: userAgent || null,
      timestamp: new Date().toISOString(),
      converted: false
    };
    
    await referralVisitsCollection.insertOne(visitRecord);
    
    // Update referrer's visit count
    await usersCollection.updateOne(
      { walletAddress: { $regex: new RegExp(`^${referrer.walletAddress}$`, 'i') } },
      {
        $inc: { referralVisits: 1 },
        $set: { lastReferralVisit: new Date().toISOString() }
      }
    );
    
    return NextResponse.json({
      message: 'Referral visit tracked successfully',
      referrer: {
        walletAddress: referrer.walletAddress
      }
    });
    
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve referral stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase().catch(() => null);
    if (!db) {
      return NextResponse.json({
        referralCode: null,
        referralLink: `https://bitsave.io/ref/${walletAddress.slice(2, 8)}`,
        stats: {
          totalVisits: 0,
          totalConversions: 0,
          conversionRate: '0.00',
          totalRewards: 0
        },
        recentVisits: []
      });
    }

    const usersCollection = db.collection('users');
    const referralVisitsCollection = db.collection('referral_visits');
    
    const user = await usersCollection.findOne({ 
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
    }).catch(() => null);
    
    const refCode = user?.referralCode || walletAddress.slice(2, 10);
    const normalizedAddr = walletAddress.toLowerCase();

    // Get referral statistics
    const totalVisits = await referralVisitsCollection.countDocuments({
      $or: [
        { referrerWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } },
        { referralCode: user?.referralCode }
      ]
    });
    
    const totalConversions = await referralVisitsCollection.countDocuments({
      $or: [
        { referrerWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } },
        { referralCode: user?.referralCode }
      ],
      converted: true
    });
    
    const recentVisits = await referralVisitsCollection
      .find({
        $or: [
          { referrerWalletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } },
          { referralCode: user?.referralCode }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    const totalRewards = (user?.totalReferralRewards || 0) + (totalConversions * 5);

    return NextResponse.json({
      referralCode: user?.referralCode || null,
      referralLink: `https://bitsave.io/ref/${refCode}`,
      stats: {
        totalVisits,
        totalConversions,
        conversionRate: totalVisits > 0 ? (totalConversions / totalVisits * 100).toFixed(2) : '0.00',
        totalRewards
      },
      recentVisits: recentVisits.map(visit => ({
        timestamp: visit.timestamp,
        visitorWalletAddress: visit.visitorWalletAddress,
        converted: visit.converted
      }))
    });
    
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}