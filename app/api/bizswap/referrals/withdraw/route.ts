import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapUsersCollection, getBizSwapWithdrawalsCollection } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amount } = await request.json();

    if (!walletAddress || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid wallet address and amount are required' }, { status: 400 });
    }

    const usersCollection = await getBizSwapUsersCollection();
    const withdrawalsCollection = await getBizSwapWithdrawalsCollection();

    if (!usersCollection || !withdrawalsCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const user = await usersCollection.findOne({ walletAddress });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pendingBalance = user.bizswapPendingUsdcEarnings || 0;

    if (amount > pendingBalance) {
      return NextResponse.json({ error: 'Insufficient pending earnings' }, { status: 400 });
    }

    // Deduct the requested amount from pending balance
    await usersCollection.updateOne(
      { walletAddress },
      { $inc: { bizswapPendingUsdcEarnings: -amount } }
    );

    const now = new Date().toISOString();

    // Create a withdrawal record
    const withdrawalRecord = {
      walletAddress,
      amount,
      status: 'Pending',
      requestDate: now,
    };

    await withdrawalsCollection.insertOne(withdrawalRecord);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawalRecord
    });

  } catch (error: any) {
    console.error('Error submitting withdrawal request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
