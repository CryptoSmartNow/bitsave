import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { format } from 'date-fns';

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const collection = db.collection('audit_logs');
    const logs = await collection.find({}).sort({ timestamp: -1 }).toArray();

    const headers = ['Action', 'User', 'Details', 'Timestamp', 'Transaction Hash'];
    const csvContent = [
      headers.join(','),
      ...logs.map(l => [
        `"${l.action}"`,
        `"${l.user}"`,
        `"${l.details}"`,
        l.timestamp ? format(new Date(l.timestamp), 'yyyy-MM-dd HH:mm:ss') : '',
        l.metadata?.transactionHash || ''
      ].join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bizfi_audit_logs_${format(new Date(), 'yyyyMMdd')}.csv"`
      }
    });
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
