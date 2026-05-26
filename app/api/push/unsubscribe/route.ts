import { NextResponse } from 'next/server';
import { getPushSubscriptionsCollection } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const collection = await getPushSubscriptionsCollection();
    if (!collection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    await collection.deleteOne({ endpoint });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
