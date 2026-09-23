import { NextResponse } from 'next/server';
import { validateApiKey, unauthorizedResponse } from '@/lib/api-auth';
import { getBizSwapCollection } from '@/lib/mongodb';

export async function GET(
  request: Request,
  context: any
) {
  // Wait for the context to resolve if using next 15+ dynamic APIs, or just extract params
  const { walletAddress } = await context.params;
  
  const auth = await validateApiKey(request);
  if (auth.error) return unauthorizedResponse(auth.error, auth.status);

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Optionally filter by developerId if API keys are scoped to specific developers
    const query: any = { wallet: walletAddress };
    if (auth.developerId) {
       query.developerId = auth.developerId;
    }

    const certificates = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Sanitize output (remove internal DB ids)
    const sanitizedCertificates = certificates.map(cert => {
      const { _id, developerId, ...rest } = cert;
      return rest;
    });

    return NextResponse.json({
      success: true,
      data: sanitizedCertificates
    });
  } catch (error: any) {
    console.error('API /certificates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
