import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

const AUDIT_COLLECTION = "audit_logs";

export async function GET() {
  try {
    const db = await getDatabase();
    if (!db) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const auditCollection = db.collection(AUDIT_COLLECTION);
    const logs = await auditCollection.find({})
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
