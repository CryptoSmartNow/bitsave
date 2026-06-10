import { NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const allHoldings = await collection.find({}).sort({ createdAt: -1 }).toArray();

    let totalInvested = 0;
    const uniqueWallets = new Set<string>();
    const instrumentBreakdown: Record<string, number> = {
      BizYield: 0,
      BizCredit: 0,
      BizBond: 0,
    };

    const usersMap: Record<string, any> = {};

    for (const holding of allHoldings) {
      const amount = holding.investmentAmount || 0;
      const instrument = holding.instrument || 'Unknown';
      const wallet = holding.wallet || 'Anonymous';

      totalInvested += amount;
      uniqueWallets.add(wallet);

      if (instrumentBreakdown[instrument] !== undefined) {
        instrumentBreakdown[instrument] += amount;
      } else {
        instrumentBreakdown[instrument] = amount;
      }

      if (!usersMap[wallet]) {
        usersMap[wallet] = {
          wallet,
          totalInvested: 0,
          holdingsCount: 0,
          instruments: {} as Record<string, number>,
          latestPurchase: holding.purchaseDate || holding.createdAt,
          actions: [] as any[]
        };
      }

      usersMap[wallet].totalInvested += amount;
      usersMap[wallet].holdingsCount += 1;
      usersMap[wallet].instruments[instrument] = (usersMap[wallet].instruments[instrument] || 0) + amount;
      
      // Track action
      usersMap[wallet].actions.push({
        action: 'Purchased BizShare',
        instrument,
        amount,
        date: holding.purchaseDate || holding.createdAt,
        status: holding.status || 'Active'
      });
    }

    const globalStats = {
      totalInvested,
      totalCertificates: allHoldings.length,
      uniqueInvestors: uniqueWallets.size,
      instrumentBreakdown
    };

    const usersList = Object.values(usersMap).sort((a, b) => b.totalInvested - a.totalInvested);

    return NextResponse.json({
      success: true,
      data: {
        globalStats,
        users: usersList
      }
    });

  } catch (error: any) {
    console.error('Fetch bizswap analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
