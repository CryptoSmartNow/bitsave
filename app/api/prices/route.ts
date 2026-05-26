import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    
    if (!ids) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 });
    }

    const cacheKey = `api:prices:${ids}`;
    
    // Check Redis cache first
    const cachedPrices = await getCache<any>(cacheKey);
    if (cachedPrices) {
      return NextResponse.json(cachedPrices);
    }

    // Fetch from CoinGecko
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API responded with ${response.status}`);
    }
    
    const data = await response.json();

    // Cache the response in Redis for 60 seconds to respect rate limits
    await setCache(cacheKey, data, 60);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prices from CoinGecko:', error);
    // Return empty object on error so client doesn't crash
    return NextResponse.json({}, { status: 500 });
  }
}
