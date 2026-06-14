import { NextResponse } from 'next/server';
import { Chainrails, crapi } from '@chainrails/sdk';

const DEFAULT_API_KEY = process.env.CHAINRAILS_API_KEY;
const BIZSWAP_API_KEY = process.env.BIZSWAP_CHAINRAILS_API_KEY;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source');

        const CHAINRAILS_API_KEY = source === 'bizswap' ? BIZSWAP_API_KEY : DEFAULT_API_KEY;

        if (!CHAINRAILS_API_KEY) {
            return NextResponse.json({ error: 'ChainRails is not configured for this source' }, { status: 503 });
        }

        const recipient = searchParams.get('recipient') || '';
        let amount = searchParams.get('amount') || '0';
        const destinationChain = searchParams.get('chain') || 'BASE';
        const token = searchParams.get('token') || 'USDC';
        const mode = searchParams.get('mode') || 'buy';


        let finalAmount = parseFloat(amount);
        if (!isNaN(finalAmount)) {
            amount = finalAmount.toFixed(2);
        }

        if (!recipient) {
            return NextResponse.json({ error: 'Recipient wallet address is required' }, { status: 400 });
        }

        const env = 'production' as any;
        Chainrails.config({
            api_key: CHAINRAILS_API_KEY,
            env: env,
        });

        const session = await crapi.auth.getSessionToken({
            amount: amount,
            recipient: recipient,
            destinationChain: destinationChain as any,
            token: token as any,
        });

        return NextResponse.json(session);
    } catch (error: any) {
        console.error('ChainRails session error:', error);

        if (error.response) {
            console.error('Response data:', error.response.data);
            return NextResponse.json({ error: 'Failed to create payment session', details: error.response.data }, { status: error.response.status });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
