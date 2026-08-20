import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapPayoutsCollection, getDatabase } from '@/lib/mongodb';
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

    // Fetch pending/processing transactions using the proper getDatabase() helper
    const db = await getDatabase();
    let pendingTransactions: any[] = [];
    if (db) {
      const transactionsCollection = db.collection('bizswap_transactions');
      pendingTransactions = await transactionsCollection.find({
        $or: [
          { 'metadata.wallet': wallet },
          { userId: wallet }
        ],
        status: { $ne: 'completed' }
      }).sort({ timestamp: -1 }).toArray();
    }

    const formattedPending = pendingTransactions.map(tx => ({
      _id: tx._id.toString(),
      date: tx.timestamp || new Date().toISOString(),
      instrument: tx.metadata?.instrument || 'BizSwap Instrument',
      amount: tx.usdcAmount || tx.metadata?.totalCharged || tx.fiatAmount || 0,
      currency: tx.currency || 'USD (Fiat Pending)',
      txHash: ['failed', 'expired', 'cancelled', 'failed_underpaid'].includes(tx.status) ? `Failed: ${tx.status}` :
              tx.status === 'processing' ? 'Processing...' :
              tx.status === 'failed_fulfillment' ? 'Retrying...' :
              'Pending Transfer',
      status: tx.status,
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
