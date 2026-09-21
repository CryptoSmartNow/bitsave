import { NextRequest, NextResponse } from 'next/server';
import { fetchSavingsDataForAddress } from '@/lib/savings';

export async function GET(request: NextRequest) {
  try {
    const rawAddress = request.nextUrl.searchParams.get('address');
    
    if (!rawAddress) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const getPriceFn = async () => {
      const priceRes = await fetch(`${request.nextUrl.origin}/api/prices?ids=ethereum,gooddollar`);
      if (priceRes.ok) {
        const prices = await priceRes.json();
        return {
          eth: prices.ethereum?.usd || 3500,
          gd: prices.gooddollar?.usd || 0.0001086
        };
      }
      return { eth: 3500, gd: 0.0001086 };
    };

    const data = await fetchSavingsDataForAddress(rawAddress, getPriceFn);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching savings data in API route:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch savings data" }, { status: 500 });
  }
}
