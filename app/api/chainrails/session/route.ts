import { NextResponse } from 'next/server';
import { Chainrails, crapi } from '@chainrails/sdk';

const CHAINRAILS_API_KEY = process.env.CHAINRAILS_API_KEY;

export async function GET(request: Request) {
    try {
        if (!CHAINRAILS_API_KEY) {
            return NextResponse.json({ error: 'ChainRails is not configured' }, { status: 503 });
        }

        const { searchParams } = new URL(request.url);
        const recipient = searchParams.get('recipient') || '';
        const amount = searchParams.get('amount') || '0';
        const destinationChain = searchParams.get('chain') || 'BASE';
        const token = searchParams.get('token') || 'USDC';

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient wallet address is required' }, { status: 400 });
        }

        Chainrails.config({
            api_key: CHAINRAILS_API_KEY,
        });

        const session = await crapi.auth.getSessionToken({
            amount: amount,
            recipient: recipient,
            destinationChain: destinationChain as any,
            token: token as any,
        });

        // The SDK returns the session URL directly or an object. Let's return the whole thing.
        // It's likely returning `{ url: "...", token: "..." }`
        return NextResponse.json(session);
    } catch (error: any) {
        console.error('ChainRails session error:', error);
        
        // Log more details if it's an Axios or API error
        if (error.response) {
            console.error('Response data:', error.response.data);
            return NextResponse.json({ error: 'Failed to create payment session', details: error.response.data }, { status: error.response.status });
        }
        
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
