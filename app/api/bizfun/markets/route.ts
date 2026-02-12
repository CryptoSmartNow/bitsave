
import { NextRequest, NextResponse } from 'next/server';
import { getMarketsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const collection = await getMarketsCollection();
        if (!collection) {
            return NextResponse.json({ markets: [] });
        }

        const { searchParams } = new URL(req.url);
        const creator = searchParams.get('creator');

        const query: any = { txHash: { $exists: true, $ne: null } };
        if (creator) {
            query.creator = { $regex: new RegExp(`^${creator}$`, 'i') };
        }

        // Only fetch markets that have a transaction hash (proof of on-chain creation)
        const markets = await collection.find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
            
        return NextResponse.json({ markets });
    } catch (error) {
        console.error('Markets API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            question, 
            description, 
            vibe, 
            tradingDeadline, 
            chainId, 
            creator, 
            txHash,
            metadataUri 
        } = body;

        if (!question || !description || !tradingDeadline || !txHash) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const collection = await getMarketsCollection();
        if (!collection) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        const newMarket = {
            question,
            description,
            vibe: vibe || 'Experimental',
            outcome: 'UNDECIDED',
            tradingDeadline,
            chainId,
            creator,
            txHash,
            metadataUri,
            createdAt: new Date(),
            volume: '0',
            liquidity: '1000' // Initial liquidity from createMarket
        };

        const result = await collection.insertOne(newMarket);

        return NextResponse.json({ success: true, market: { ...newMarket, _id: result.insertedId } });
    } catch (error) {
        console.error('Create Market API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
