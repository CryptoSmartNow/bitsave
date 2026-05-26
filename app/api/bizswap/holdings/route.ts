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

    const holdings = await collection.find({ wallet }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: holdings });
  } catch (error: any) {
    console.error('Fetch holdings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
