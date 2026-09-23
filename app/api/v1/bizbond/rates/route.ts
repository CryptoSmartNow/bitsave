import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  try {
    // Current rates and configuration for BizBond instruments
    const rates = [
      {
        instrument: 'BizBond',
        description: 'Treasury Backed Pool',
        apr: '10% Fixed',
        payoutFrequency: 'Quarterly',
        vestingPeriodDays: 90,
        typeIndex: 2,
        available: true,
      }
    ];

    return NextResponse.json({
      success: true,
      data: rates
    });
  } catch (error: any) {
    console.error('API /rates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
