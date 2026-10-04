import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getBizSwapCollection } from '@/lib/mongodb';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    const collection = await getBizSwapCollection();
    let totalDeposits = 0;
    let activeBonds = 0;

    if (collection) {
      // In a real app, you might aggregate actual values across MongoDB or an indexer.
      // For now, we do a basic aggregation or fallback if DB is empty
      const certs = await collection.find({}).toArray();
      activeBonds = certs.length;
      totalDeposits = certs.reduce((acc, cert) => acc + (Number(cert.investmentAmount) || 0), 0);
    }

    const stats = {
      tvlUsd: totalDeposits, 
      totalYieldDistributedUsd: 0,
      activeBonds: activeBonds,
      apyRange: '10% - 16%',
      defaultRate: '0.00%',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('API /stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
