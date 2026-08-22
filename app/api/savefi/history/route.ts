import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: ' + authError }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = getSupabaseAdmin();

    const { data: history, error: fetchError } = await supabase
      .from('savefi_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error('Failed to fetch SaveFi history:', fetchError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: history });

  } catch (error: any) {
    console.error('SaveFi history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
