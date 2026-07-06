import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const client = await import('@/lib/mongodb').then(m => m.default);
    const db = client?.db('bitsave');
    const transactionsCollection = db?.collection('bizswap_transactions');

    const holdings = await collection.find({ wallet }).sort({ createdAt: -1 }).toArray();

    let pendingTransactions: any[] = [];
    if (transactionsCollection) {
      pendingTransactions = await transactionsCollection.find({ 
        $or: [
          { 'metadata.wallet': wallet },
          { userId: wallet } // in case wallet matches userId
        ],
        status: 'pending' 
      }).toArray();
    }

    const formattedPending = pendingTransactions.map(tx => ({
      _id: tx._id.toString(),
      instrument: tx.metadata?.instrument || 'BizSwap Instrument',
      investmentAmount: tx.metadata?.investmentAmount || tx.fiatAmount || 0,
      entitlement: '-',
      status: 'Pending Fiat Transfer',
      nextPayment: '-',
      mintAddress: 'Pending',
      serialNumber: 'Pending',
      apr: 'Pending',
      payoutFrequency: 'Pending',
      purchaseDate: tx.timestamp || new Date().toISOString(),
    }));

    const combinedHoldings = [...formattedPending, ...holdings];

    return NextResponse.json({ success: true, data: combinedHoldings });
  } catch (error: any) {
    console.error('Fetch holdings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
