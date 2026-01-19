import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { format } from 'date-fns';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const collection = db.collection('businesses');
    const businesses = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const headers = ['Business Name', 'Owner', 'Tier', 'Status', 'Date Joined', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...businesses.map(b => [
        `"${b.businessName}"`,
        `"${b.owner}"`,
        b.tier,
        b.status,
        b.createdAt ? format(new Date(b.createdAt), 'yyyy-MM-dd') : '',
        b.transactionHash
      ].join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bizfi_businesses_${format(new Date(), 'yyyyMMdd')}.csv"`
      }
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
