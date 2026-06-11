import { NextRequest, NextResponse } from 'next/server';
import { getWc26TransactionsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const txCollection = await getWc26TransactionsCollection();
    
    if (!txCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const transactions = await txCollection
        .find({ user_id: userId })
        .sort({ created_at: -1 })
        .limit(50)
        .toArray();

    return NextResponse.json({ transactions });

  } catch (error: any) {
    console.error('Fetch wc26 transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
