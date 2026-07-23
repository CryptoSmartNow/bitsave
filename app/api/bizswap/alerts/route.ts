import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection, getBizSwapPayoutsCollection } from '@/lib/mongodb';

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const holdingsCol = await getBizSwapCollection();
    const payoutsCol = await getBizSwapPayoutsCollection();

    if (!holdingsCol || !payoutsCol) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const [holdings, payouts] = await Promise.all([
      holdingsCol.find({ wallet }).sort({ createdAt: -1 }).toArray(),
      payoutsCol.find({ wallet }).sort({ date: -1 }).toArray(),
    ]);

    const alerts: Array<{
      id: string;
      type: 'success' | 'info' | 'warning';
      title: string;
      message: string;
      time: string;
      timestamp: string;
      isNew: boolean;
    }> = [];

    // Alert: each payout received
    for (const payout of payouts) {
      const payoutDate = new Date(payout.date || payout.createdAt);
      const isNew = (new Date().getTime() - payoutDate.getTime()) < 7 * 24 * 60 * 60 * 1000; // within 7 days
      alerts.push({
        id: `payout-${payout._id}`,
        type: 'success',
        title: 'Yield Payment Received',
        message: `Your ${payout.instrument} distribution of $${Number(payout.amount).toFixed(2)} ${payout.currency || 'USDC'} has been successfully deposited to your wallet.`,
        time: timeAgo(payoutDate),
        timestamp: payoutDate.toISOString(),
        isNew,
      });
    }

    // Alert: each certificate purchased
    for (const holding of holdings) {
      const purchaseDate = new Date(holding.purchaseDate || holding.createdAt);
      const isNew = (new Date().getTime() - purchaseDate.getTime()) < 3 * 24 * 60 * 60 * 1000; // within 3 days
      alerts.push({
        id: `holding-${holding._id}`,
        type: 'success',
        title: 'Certificate Minted Successfully',
        message: `Your ${holding.instrument} certificate (#${holding.serialNumber ? holding.serialNumber.slice(0, 8).toUpperCase() : 'N/A'}) has been minted and recorded on the Blockchain.`,
        time: timeAgo(purchaseDate),
        timestamp: purchaseDate.toISOString(),
        isNew,
      });

      // Upcoming payment alert: if next payment is within 7 days
      if (holding.nextPayment) {
        const nextPaymentDate = new Date(holding.nextPayment);
        const daysUntil = Math.floor((nextPaymentDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          alerts.push({
            id: `upcoming-${holding._id}`,
            type: 'info',
            title: 'Upcoming Payment',
            message: `Your ${holding.instrument} yield payment is due in ${daysUntil === 0 ? 'today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}. Estimated amount: $${(holding.investmentAmount * 0.05).toFixed(2)}.`,
            time: timeAgo(nextPaymentDate),
            timestamp: nextPaymentDate.toISOString(),
            isNew: true,
          });
        }
      }
    }

    // Sort by timestamp descending (most recent first)
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ success: true, data: alerts });
  } catch (error: any) {
    console.error('Fetch alerts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
