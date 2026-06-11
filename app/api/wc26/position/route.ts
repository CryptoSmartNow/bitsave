import { NextRequest, NextResponse } from 'next/server';
import { getWc26PositionsCollection, getWc26PoolCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const posCollection = await getWc26PositionsCollection();
    const poolCollection = await getWc26PoolCollection();
    
    if (!posCollection || !poolCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    let position = await posCollection.findOne({ user_id: userId } as any);
    
    if (!position) {
      await posCollection.insertOne({
        user_id: userId,
        shares_held: 0,
        avg_buy_price: 0,
        total_invested_usd: 0,
        total_fees_paid: 0
      } as any);
      position = await posCollection.findOne({ user_id: userId } as any);
    }

    const poolState = await poolCollection.findOne({ _id: 'main_pool' } as any);
    const currentPrice = poolState?.current_price_usd || 10;

    const current_value = (position?.shares_held || 0) * currentPrice;
    const unrealised_pnl = current_value - (position?.total_invested_usd || 0);

    return NextResponse.json({
      shares_held: position?.shares_held || 0,
      avg_buy_price: position?.avg_buy_price || 0,
      total_invested_usd: position?.total_invested_usd || 0,
      total_fees_paid: position?.total_fees_paid || 0,
      current_value,
      unrealised_pnl
    });

  } catch (error: any) {
    console.error('Fetch wc26 position error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
