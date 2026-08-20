import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Mock endpoint to simulate a completed payment from Onswitch.
 * Used when the user clicks "I have paid" in the sandbox environment.
 */
export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const payload = {
      status: 'completed',
      type: 'ONRAMP',
      reference: reference,
      meta: {
        mocked: true
      }
    };

    const bodyStr = JSON.stringify(payload);

    const ONSWITCH_API_KEY = process.env.ONSWITCH_API_KEY || '';

    const signature = crypto
      .createHmac('sha256', ONSWITCH_API_KEY || 'default')
      .update(bodyStr)
      .digest('hex');

    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const webhookUrl = `${origin}/api/onswitch/webhook`;

    console.log(`[Mock Pay] Firing fake webhook to ${webhookUrl} for reference ${reference}`);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-switch-signature': signature
      },
      body: bodyStr
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Mock Pay] Webhook failed:', errText);
      return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Mock Pay] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
