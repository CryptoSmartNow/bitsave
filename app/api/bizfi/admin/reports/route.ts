import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Define available dynamic reports
    const reports = [
      {
        id: 'rep_businesses_live',
        name: 'All Businesses Export (Live)',
        date: dateStr,
        size: 'Dynamic',
        type: 'csv',
        downloadUrl: '/api/bizfi/admin/export/businesses'
      },
      {
        id: 'rep_audit_live',
        name: 'Audit Logs Export (Live)',
        date: dateStr,
        size: 'Dynamic',
        type: 'csv',
        downloadUrl: '/api/bizfi/admin/export/audit'
      }
    ];

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
