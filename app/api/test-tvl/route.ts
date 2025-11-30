import { NextResponse } from 'next/server';
import { calculateTVLFromUserInteractions } from '@/utils/tvlCalculationUtils';

export async function GET() {
  try {
    console.log('🧪 Testing TVL calculation...');
    const tvlData = await calculateTVLFromUserInteractions();
    
    return NextResponse.json({
      success: true,
      data: tvlData,
      message: 'TVL calculation completed successfully'
    });
  } catch (error) {
    console.error('❌ Test TVL calculation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'TVL calculation failed'
    }, { status: 500 });
  }
}