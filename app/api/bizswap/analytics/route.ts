import { NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';
import { getCache, setCache } from '@/lib/redis';

export async function GET() {
  try {
    const cacheKey = 'bizswap:analytics:global:v2';
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

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
      let amount = holding.investmentAmount || 0;
      const currency = holding.currency || 'USDC';
      
      // Clean sweep: if amount is suspiciously large (e.g., > 10000) and no NGN currency was explicitly set, 
      // it was likely an NGN purchase that wasn't tagged correctly in the past.
      const isNgn = currency === 'NGN' || currency === 'cNGN' || amount > 10000;
      
      if (isNgn) {
        amount = amount / 1346.49; // Convert NGN to USD using the platform rate
      }

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

    const roundedInstrumentBreakdown = Object.fromEntries(
      Object.entries(instrumentBreakdown).map(([k, v]) => [k, Math.round(v * 100) / 100])
    );

    const globalStats = {
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalCertificates: allHoldings.length,
      uniqueInvestors: uniqueWallets.size,
      instrumentBreakdown: roundedInstrumentBreakdown
    };

    const usersList = Object.values(usersMap).map(u => ({
      ...u,
      totalInvested: Math.round(u.totalInvested * 100) / 100,
      instruments: Object.fromEntries(Object.entries(u.instruments).map(([k, v]) => [k, Math.round((v as number) * 100) / 100]))
    })).sort((a, b) => b.totalInvested - a.totalInvested);

    const responseData = {
      success: true,
      data: {
        globalStats,
        users: usersList
      }
    };

    await setCache(cacheKey, responseData, 120); // cache for 2 minutes

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Fetch bizswap analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
