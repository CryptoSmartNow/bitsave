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
    
    // Tick Redis cache first
    const cachedPrices = await getCache<any>(cacheKey);
    if (cachedPrices) {
      return NextResponse.json(cachedPrices);
    }

    const fallbackData: Record<string, { usd: number }> = {
      ethereum: { usd: 3500 },
      gooddollar: { usd: 0.0001086 },
      celo: { usd: 0.55 },
      'usd-coin': { usd: 1.0 },
      tether: { usd: 1.0 },
    };

    // Construct quick fallback response for requested ids
    const defaultResponse: Record<string, { usd: number }> = {};
    ids.split(',').forEach((id) => {
      const cleanId = id.trim().toLowerCase();
      defaultResponse[cleanId] = fallbackData[cleanId] || { usd: 1.0 };
    });

    try {
      // Fetch from CoinGecko with 3.5s timeout
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
        { signal: AbortSignal.timeout(3500) }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Merge with defaults
        const finalData = { ...defaultResponse, ...data };
        await setCache(cacheKey, finalData, 120); // 2 mins cache
        return NextResponse.json(finalData);
      }
    } catch {
      // CoinGecko timeout or network failure — use fallback
    }

    // Return safe fallback with 200 OK so client never throws 500
    return NextResponse.json(defaultResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ethereum: { usd: 3500 }, gooddollar: { usd: 0.0001086 } },
      { status: 200 }
    );
  }
}
