import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: ' + authError }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getDatabase();
    if (!db) {
      console.warn('SaveFi history notice: Database offline');
      return NextResponse.json({ success: true, data: [] });
    }

    const userIdStr = (user as any)._id ? (user as any)._id.toString() : (user as any).privy_did || (user as any).id;

    try {
      const history = await db.collection('savefi_transactions')
        .find({ user_id: userIdStr })
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray();

      return NextResponse.json({ success: true, data: history || [] });
    } catch (fetchError: any) {
      console.warn('SaveFi history notice:', fetchError.message);
      return NextResponse.json({ success: true, data: [] });
    }

  } catch (error: any) {
    console.warn('SaveFi history notice:', error?.message);
    return NextResponse.json({ success: true, data: [] });
  }
}
