
import { NextRequest, NextResponse } from 'next/server';
import { getCommentsCollection } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id: marketId } = params;
        
        if (!marketId) {
            return NextResponse.json({ error: 'Market ID required' }, { status: 400 });
        }

        const collection = await getCommentsCollection();
        if (!collection) {
            return NextResponse.json({ comments: [] });
        }

        const comments = await collection
            .find({ marketId })
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Comments API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id: marketId } = params;
        const body = await req.json();
        const { user, text, sentiment } = body;

        if (!marketId || !user || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const collection = await getCommentsCollection();
        if (!collection) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }

        const newComment = {
            marketId,
            user,
            text,
            sentiment: sentiment || 'neutral',
            timestamp: new Date(),
            createdAt: new Date()
        };

        const result = await collection.insertOne(newComment);

        return NextResponse.json({ 
            success: true, 
            comment: { ...newComment, _id: result.insertedId } 
        });

    } catch (error) {
        console.error('Post Comment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
