import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapPayoutsCollection } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const collection = await getBizSwapPayoutsCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Fetch payment history for the user, sorted by date descending
    const payments = await collection.find({ wallet }).sort({ date: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: payments
    });
  } catch (error: any) {
    console.error('Error fetching bizswap payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
