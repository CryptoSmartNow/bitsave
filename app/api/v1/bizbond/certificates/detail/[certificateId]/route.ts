import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getBizSwapCollection } from '@/lib/mongodb';

export async function GET(
  request: Request,
  context: any
) {
  const { certificateId } = await context.params;
  
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  if (!certificateId) {
    return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
  }

  try {
    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const query: any = { mintAddress: certificateId };
    if (auth.developerId) {
       query.developerId = auth.developerId;
    }

    const certificate = await collection.findOne(query);

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Sanitize output (remove internal DB ids)
    const { _id, developerId, ...rest } = certificate;

    return NextResponse.json({
      success: true,
      data: rest
    });
  } catch (error: any) {
    console.error('API /certificates/detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
