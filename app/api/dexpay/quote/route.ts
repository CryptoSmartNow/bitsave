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

        // This proxies the quote creation to DexPay
        // DexPay requires creating a quote before placing an order.
        const res = await fetch(`${DEXPAY_API_URL}/quote`, {
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
            console.error('DexPay Quote API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to fetch DexPay quote' }, { status: res.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('DexPay quote error:', error);
        return NextResponse.json({ error: 'Internal Server Error fetching DexPay quote' }, { status: 500 });
    }
}
