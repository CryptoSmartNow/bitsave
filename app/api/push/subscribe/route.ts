import { NextResponse } from 'next/server';
import { getPushSubscriptionsCollection } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { subscription, walletAddress } = await req.json();

    if (!subscription || !subscription.endpoint || !walletAddress) {
      return NextResponse.json(
        { error: 'Subscription and wallet address are required' },
        { status: 400 }
      );
    }

    const collection = await getPushSubscriptionsCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Upsert the subscription using the endpoint as the unique identifier
    await collection.updateOne(
      { endpoint: subscription.endpoint },
      { 
        $set: { 
          subscription,
          keys: subscription.keys, // store keys directly for easier querying
          walletAddress,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
