import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const cacheKey = `bizswap:holdings:${wallet}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: JSON.parse(cached) });
      }
    }

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const holdings = await collection.find({ wallet }).sort({ createdAt: -1 }).toArray();

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(holdings), 'EX', 60); // cache for 60 seconds
    }

    return NextResponse.json({ success: true, data: holdings });
  } catch (error: any) {
    console.error('Fetch holdings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
