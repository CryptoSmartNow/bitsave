import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getTransactionsCollection } from '@/lib/mongodb';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { newUserWalletAddress, referralCode } = await request.json();
    
    if (!newUserWalletAddress || !referralCode) {
      return NextResponse.json(
        { error: 'New user wallet address and referral code are required' },
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
    
    // Find the referrer
    const referrer = await usersCollection.findOne({ referralCode });
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }
    
    // Don't allow self-referrals
    if (referrer.walletAddress === newUserWalletAddress) {
      return NextResponse.json(
        { error: 'Self-referral not allowed' },
        { status: 400 }
      );
    }
    
    // Check if this user has created savings before (only new users should count as referrals)
    try {
      const transactionsCollection = await getTransactionsCollection();
      if (transactionsCollection) {
        // Check local transactions
        const existingTx = await transactionsCollection.findOne({ 
          useraddress: { $regex: new RegExp(`^${newUserWalletAddress}$`, 'i') } 
        });
        
        if (existingTx) {
          return NextResponse.json(
            { message: 'User already has existing savings - referral only valid for new users' },
            { status: 200 }
          );
        }
      }
    } catch (dbError) {
      console.warn('Could not check user savings history:', dbError);
      // Continue with referral conversion if check fails
    }
    
    // Check if this user was already converted through this referral
    const existingConversion = await referralVisitsCollection.findOne({
      referralCode,
      visitorWalletAddress: newUserWalletAddress,
      converted: true
    });
    
    if (existingConversion) {
      return NextResponse.json(
        { message: 'User already converted through this referral' },
        { status: 200 }
      );
    }
    
    // Mark the most recent visit from this user as converted
    const updateResult = await referralVisitsCollection.updateOne(
      {
        referralCode,
        $or: [
          { visitorWalletAddress: newUserWalletAddress },
          { visitorWalletAddress: null } // For cases where wallet wasn't connected during visit
        ]
      },
      {
        $set: {
          converted: true,
          visitorWalletAddress: newUserWalletAddress,
          conversionTimestamp: new Date().toISOString()
        }
      },
      { sort: { timestamp: -1 } } // Update the most recent visit
    );
    
    // If no existing visit found, create a new conversion record
    if (updateResult.matchedCount === 0) {
      await referralVisitsCollection.insertOne({
        referralCode,
        referrerWalletAddress: referrer.walletAddress,
        visitorWalletAddress: newUserWalletAddress,
        timestamp: new Date().toISOString(),
        converted: true,
        conversionTimestamp: new Date().toISOString(),
        visitorIP: null,
        userAgent: null
      });
    }
    
    // Calculate referral reward (5 points per successful referral conversion)
    const referralReward = 5; // 5 points per referral when user saves
    
    // Update referrer's stats
    await usersCollection.updateOne(
      { walletAddress: referrer.walletAddress },
      {
        $inc: {
          referralCount: 1,
          totalReferralRewards: referralReward
        },
        $set: {
          lastReferralConversion: new Date().toISOString()
        }
      }
    );
    
    // Create or update the new user record
    await usersCollection.updateOne(
      { walletAddress: newUserWalletAddress },
      {
        $set: {
          referredBy: referrer.walletAddress,
          referredByCode: referralCode,
          signupTimestamp: new Date().toISOString()
        },
        $setOnInsert: {
          walletAddress: newUserWalletAddress,
          createdAt: new Date().toISOString(),
          referralCount: 0,
          totalReferralRewards: 0
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({
      message: 'Referral conversion tracked successfully',
      referralReward,
      referrer: {
        walletAddress: referrer.walletAddress
      }
    });
    
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}