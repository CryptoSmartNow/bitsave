import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const apiKey = process.env.DEXPAY_API_KEY;
        const apiSecret = process.env.DEXPAY_API_SECRET;

        // Base URL for sandbox
        const DEXPAY_API_URL = 'https://sandbox-b2b.dexpay.io';

        if (!apiKey || !apiSecret) {
            console.error("DexPay credentials missing");
            return NextResponse.json({ error: 'DexPay API credentials not configured.' }, { status: 500 });
        }

        const body = await request.json();

        // Proxies executing a quote into an active order.
        const res = await fetch(`${DEXPAY_API_URL}/order`, { // Route can vary (e.g., /transaction) in DexPay, assuming /order from standard convention. 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
                'X-API-SECRET': apiSecret,
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('DexPay Order API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to submit DexPay order' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('DexPay order error:', error);
        return NextResponse.json({ error: 'Internal Server Error communicating with DexPay' }, { status: 500 });
    }
}
