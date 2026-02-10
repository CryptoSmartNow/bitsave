
import { NextRequest, NextResponse } from 'next/server';
import { getMarketsCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ error: 'Market ID required' }, { status: 400 });
        }

        const collection = await getMarketsCollection();
        if (!collection) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        let query = {};
        try {
            query = { _id: new ObjectId(id) };
        } catch (e) {
            // If ID is not a valid ObjectId, try to find by string id if you store it that way,
            // or just return 404. Assuming _id is ObjectId.
            return NextResponse.json({ error: 'Invalid Market ID' }, { status: 400 });
        }

        const market = await collection.findOne(query);

        if (!market) {
            return NextResponse.json({ error: 'Market not found' }, { status: 404 });
        }

        return NextResponse.json({ market });
    } catch (error) {
        console.error('Market Detail API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
