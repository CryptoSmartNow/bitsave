import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: ' + authError }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: plans, error: fetchError } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) {
      console.warn('Savings plans notice:', fetchError.message);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: plans || [] });

  } catch (error: any) {
    console.warn('Savings plans fetch notice:', error?.message);
    return NextResponse.json({ success: true, data: [] });
  }
}
