import { NextResponse } from 'next/server';
import { getWc26PoolCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const poolCollection = await getWc26PoolCollection();
    if (!poolCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const poolState = await poolCollection.findOne({ _id: 'main_pool' } as any);

    if (!poolState) {
      // Default initial state if none exists yet
      return NextResponse.json({
        current_price_usd: 10.00,
        total_shares_issued: 0,
        total_shares_sold: 0,
        is_active: false,
        trading_open: false,
      });
    }

    return NextResponse.json({
      current_price_usd: poolState.current_price_usd,
      total_shares_issued: poolState.total_shares_issued,
      total_shares_sold: poolState.total_shares_sold,
      is_active: poolState.is_active,
      trading_open: poolState.trading_open,
      fee_rate: poolState.fee_rate || 0.01
    });

  } catch (error: any) {
    console.error('Failed to fetch wc26 pool:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
