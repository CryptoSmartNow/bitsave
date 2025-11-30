import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch HBAR price from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const hbarPrice = data['hedera-hashgraph']?.usd;

    if (!hbarPrice) {
      throw new Error('HBAR price not found in response');
    }

    return NextResponse.json({ 
      price: hbarPrice,
      currency: 'USD',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching HBAR price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HBAR price' },
      { status: 500 }
    );
  }
}