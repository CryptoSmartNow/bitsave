import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapPayoutsCollection } from '@/lib/mongodb';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const cacheKey = `bizswap:payments:${wallet}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: JSON.parse(cached) });
      }
    }

    const collection = await getBizSwapPayoutsCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Fetch pending transactions
    const client = await import('@/lib/mongodb').then(m => m.default);
    const db = client?.db('bitsave');
    const transactionsCollection = db?.collection('bizswap_transactions');
    
    let pendingTransactions: any[] = [];
    if (transactionsCollection) {
      pendingTransactions = await transactionsCollection.find({ 
        $or: [
          { 'metadata.wallet': wallet },
          { userId: wallet }
        ],
        status: 'pending' 
      }).sort({ timestamp: -1 }).toArray();
    }

    const formattedPending = pendingTransactions.map(tx => ({
      _id: tx._id.toString(),
      date: tx.timestamp || new Date().toISOString(),
      instrument: tx.metadata?.instrument || 'BizSwap Instrument',
      amount: tx.metadata?.totalCharged || tx.fiatAmount || 0,
      currency: tx.currency || 'USD (Fiat Pending)',
      txHash: 'Pending Transfer'
    }));

    // Fetch payment history for the user, sorted by date descending
    const payments = await collection.find({ wallet }).sort({ date: -1 }).toArray();

    const combinedPayments = [...formattedPending, ...payments];

    if (redis) {
      await redis.set(cacheKey, JSON.stringify(combinedPayments), 'EX', 60); // cache for 60 seconds
    }

    return NextResponse.json({
      success: true,
      data: combinedPayments
    });
  } catch (error: any) {
    console.error('Error fetching bizswap payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
