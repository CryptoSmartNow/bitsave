import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ completedQuests: [] });
    }

    const normalizedAddress = walletAddress.toLowerCase();
    const doc = await db.collection('user_quests').findOne({
      walletAddress: normalizedAddress
    });

    return NextResponse.json({
      completedQuests: doc?.completedQuests || []
    });
  } catch (error) {
    console.warn('Error fetching completed quests:', error);
    return NextResponse.json({ completedQuests: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, questId } = body;

    if (!walletAddress || !questId) {
      return NextResponse.json({ error: 'walletAddress and questId are required' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, message: 'Cached locally' });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    await db.collection('user_quests').updateOne(
      { walletAddress: normalizedAddress },
      {
        $addToSet: { completedQuests: questId },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, questId });
  } catch (error) {
    console.error('Error saving completed quest:', error);
    return NextResponse.json({ error: 'Failed to record quest' }, { status: 500 });
  }
}
