import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapPayoutsCollection, getDatabase } from '@/lib/mongodb';
import { getCache, setCache } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const cacheKey = `bizswap:payments:${wallet}`;
    const cached = await getCache<any[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const collection = await getBizSwapPayoutsCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Fetch pending/processing transactions using the proper getDatabase() helper
    const db = await getDatabase();
    let pendingTransactions: any[] = [];
    const isDid = wallet.startsWith('did:privy:');
    const walletRegex = { $regex: new RegExp(`^${wallet}$`, 'i') };

    if (db) {
      const transactionsCollection = db.collection('bizswap_transactions');
      const rawPending = await transactionsCollection.find({
        $or: [
          { 'metadata.wallet': walletRegex },
          { 'metadata.wallet': wallet },
          { userId: wallet },
          { userId: walletRegex }
        ],
        status: { $ne: 'completed' }
      }).sort({ timestamp: -1 }).toArray();

      const now = Date.now();
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;

      for (const tx of rawPending) {
        const rawDate = tx.timestamp || tx.createdAt || tx.created_at;
        const txTime = rawDate ? new Date(rawDate).getTime() : 0;
        const isStale = txTime > 0 ? (now - txTime) > ONE_DAY_MS : true;

        if (isStale && ['pending', 'processing', 'awaiting_deposit', 'failed_fulfillment'].includes(tx.status)) {
          // Auto-expire stale transaction in DB
          await transactionsCollection.updateOne(
            { _id: tx._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          tx.status = 'expired';
        }
        pendingTransactions.push(tx);
      }
    }

    const formattedPending = pendingTransactions.map(tx => ({
      _id: tx._id.toString(),
      date: tx.timestamp || tx.createdAt || new Date().toISOString(),
      instrument: tx.metadata?.instrument || 'BizSwap Instrument',
      amount: tx.usdcAmount || tx.metadata?.totalCharged || tx.fiatAmount || 0,
      currency: tx.currency || 'USD (Fiat Pending)',
      txHash: tx.status === 'expired' ? 'Failed: Expired (>24h)' :
              ['failed', 'cancelled', 'failed_underpaid'].includes(tx.status) ? `Failed: ${tx.status}` :
              tx.status === 'processing' ? 'Processing...' :
              tx.status === 'failed_fulfillment' ? 'Retrying...' :
              'Pending Transfer',
      status: tx.status,
      type: 'order' as const,
    }));

    // Fetch payment history for the user, sorted by date descending (case-insensitive)
    const payments = await collection.find({
      $or: [
        { wallet: walletRegex },
        { wallet: wallet }
      ]
    }).sort({ date: -1 }).toArray();

    const formattedPayouts = payments.map(p => ({
      ...p,
      _id: p._id.toString(),
      type: 'payout' as const,
    }));

    const combinedPayments = [...formattedPending, ...formattedPayouts];

    await setCache(cacheKey, combinedPayments, 60); // cache for 60 seconds

    return NextResponse.json({
      success: true,
      data: combinedPayments
    });
  } catch (error: any) {
    console.error('Error fetching bizswap payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
