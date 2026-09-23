import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getDatabase } from '@/lib/mongodb';

export async function GET(
  request: Request,
  context: any
) {
  const { depositId } = await context.params;
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  if (!depositId) {
    return NextResponse.json({ error: 'Deposit ID is required' }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const query: any = { depositId };
    if (auth.developerId) {
       query.developerId = auth.developerId;
    }

    const deposit = await db.collection('bizbond_deposits').findOne(query);

    if (!deposit) {
      return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        depositId: deposit.depositId,
        chainrailsSessionId: deposit.chainrailsSession?.session_id,
        status: deposit.status,
        amount: deposit.amount,
        instrument: deposit.instrument,
        mintInitiated: deposit.mintInitiated || false,
        certificateId: deposit.certificateId || null,
        createdAt: deposit.createdAt,
        updatedAt: deposit.updatedAt
      }
    });
  } catch (error: any) {
    console.error('API /deposit/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
