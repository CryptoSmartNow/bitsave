import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection, getDatabase } from '@/lib/mongodb';
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

    const isDid = wallet.startsWith('did:privy:');
    let query: any;
    if (isDid) {
      const db = await getDatabase();
      let linkedWallet: string | undefined;
      if (db) {
        const tx = await db.collection('bizswap_transactions').findOne({ userId: wallet });
        linkedWallet = tx?.metadata?.wallet;
      }
      query = {
        $or: [
          { wallet: wallet },
          ...(linkedWallet ? [{ wallet: { $regex: new RegExp(`^${linkedWallet}$`, 'i') } }] : [])
        ]
      };
    } else {
      query = {
        $or: [
          { wallet: { $regex: new RegExp(`^${wallet}$`, 'i') } },
          { wallet: wallet }
        ]
      };
    }

    const holdings = await collection.find(query).sort({ createdAt: -1 }).toArray();

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(holdings), 'EX', 60); // cache for 60 seconds
    }

    return NextResponse.json({ success: true, data: holdings });
  } catch (error: any) {
    console.error('Fetch holdings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
