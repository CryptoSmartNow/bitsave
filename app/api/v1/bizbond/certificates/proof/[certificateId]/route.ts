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

    // Default/fallback deployment data if not explicitly filled out by admin yet
    const deployment = certificate.deployment || {
       status: 'PENDING DEPLOYMENT',
       broker: 'Bitsave Institutional Custody',
       reference: 'NG-TB-' + (certificate.mintAddress ? certificate.mintAddress.substring(0, 6).toUpperCase() : 'REQ123'),
       amountDeployed: certificate.investmentAmount || 0,
       tradeDate: certificate.createdAt ? new Date(certificate.createdAt).toISOString() : new Date().toISOString(),
       maturityDate: 'Strict Maturity Match',
       documentUrl: null // URL to the uploaded document
    };

    return NextResponse.json({
      success: true,
      data: {
        certificateId: certificate.mintAddress || certificateId,
        wallet: certificate.wallet,
        deployment
      }
    });
  } catch (error: any) {
    console.error('API /certificates/proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: any
) {
  const { certificateId } = await context.params;

  // Protect this endpoint so only internal Bitsave admins can upload/update proof data
  const adminPassword = request.headers.get('x-admin-password');
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!envPassword) {
    console.error('FATAL: ADMIN_PASSWORD is not set in environment variables');
    return NextResponse.json({ error: 'Server misconfiguration: Admin password not set' }, { status: 500 });
  }

  if (!adminPassword || adminPassword !== envPassword) {
    return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
  }

  if (!certificateId) {
    return NextResponse.json({ error: 'Certificate ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, broker, reference, amountDeployed, tradeDate, maturityDate, documentUrl } = body;

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const updateResult = await collection.updateOne(
      { mintAddress: certificateId },
      {
        $set: {
          deployment: {
            status: status || 'FUNDS SECURED & DEPLOYED',
            broker: broker || 'Bitsave Institutional Custody',
            reference: reference || 'NG-TB-REQ123',
            amountDeployed: amountDeployed || 0,
            tradeDate: tradeDate || new Date().toISOString(),
            maturityDate: maturityDate || 'Strict Maturity Match',
            documentUrl: documentUrl || null
          }
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Deployment proof updated successfully'
    });

  } catch (error: any) {
    console.error('API POST /certificates/proof error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
