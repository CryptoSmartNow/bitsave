import { NextRequest, NextResponse } from 'next/server';
import { handleMint } from '@/lib/handleMint';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const purchaseRecord = await handleMint(data);

    return NextResponse.json({
      success: true,
      message: 'Certificate generated successfully',
      data: purchaseRecord
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message === 'Database unavailable' || error.message === 'Invalid instrument type') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
