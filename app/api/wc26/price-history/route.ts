import { NextResponse } from 'next/server';
import { getWc26PriceHistoryCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const historyCollection = await getWc26PriceHistoryCollection();
    
    if (!historyCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const priceHistory = await historyCollection
        .find()
        .sort({ created_at: 1 })
        .toArray();

    return NextResponse.json({ priceHistory });

  } catch (error: any) {
    console.error('Fetch wc26 price history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
