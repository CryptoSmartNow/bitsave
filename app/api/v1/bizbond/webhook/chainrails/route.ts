import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Verify webhook signature
    const signature = request.headers.get('x-chainrails-signature');
    const secret = process.env.CHAINRAILS_WEBHOOK_SECRET;

    if (secret && signature) {
      // Recompute signature to verify
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(JSON.stringify(body));
      const computedSignature = hmac.digest('hex');

      if (computedSignature !== signature) {
        console.error('Webhook signature mismatch. Expected:', computedSignature, 'Got:', signature);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      // In production, enforce signature presence
      console.warn('Webhook received without signature in production');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const { sessionId, status, txHash } = body;

    if (!sessionId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Find the deposit intent by the Chainrails session ID or similar identifier
    // Chainrails session object usually has a `session_id` or similar.
    const result = await db.collection('bizbond_deposits').findOneAndUpdate(
      { "chainrailsSession.sessionId": sessionId }, // Adjust according to actual Chainrails session structure
      { 
        $set: { 
          status: status.toLowerCase() === 'completed' ? 'completed' : 'failed',
          txHash: txHash || null,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
       // If not found by session_id, maybe the body contains it differently. 
       console.warn(`Webhook received for unknown session: ${sessionId}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error('Chainrails Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
