import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: ' + authError }, { status: 401 });
    }

    const db = await getDatabase();
    if (!db) {
      console.warn('Savings plans notice: Database offline');
      return NextResponse.json({ success: true, data: [] });
    }

    const userIdStr = (user as any)._id ? (user as any)._id.toString() : (user as any).privy_did || (user as any).id;

    try {
      const plans = await db.collection('savings_plans')
        .find({ user_id: userIdStr })
        .toArray();

      return NextResponse.json({ success: true, data: plans || [] });
    } catch (fetchError: any) {
      console.warn('Savings plans notice:', fetchError.message);
      return NextResponse.json({ success: true, data: [] });
    }

  } catch (error: any) {
    console.warn('Savings plans fetch notice:', error?.message);
    return NextResponse.json({ success: true, data: [] });
  }
}
