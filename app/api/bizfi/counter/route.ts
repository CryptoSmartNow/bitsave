import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;

        if (!client) {
            return NextResponse.json(
                { error: 'Database not available', count: 1000 },
                { status: 503 }
            );
        }

        const db = client.db();

        // Use findOneAndUpdate with upsert to atomically increment the counter
        const result = await db.collection('counters').findOneAndUpdate(
            { name: 'business_listings' },
            {
                $inc: { count: 1 },
                $setOnInsert: { name: 'business_listings', createdAt: new Date() },
                $set: { updatedAt: new Date() }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        const count = result?.count || 1000;

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Failed to increment business counter:', error);
        return NextResponse.json(
            { error: 'Failed to increment counter', count: 1000 },
            { status: 500 }
        );
    }
}

// Optional: POST endpoint to set/reset counter (admin only)
export async function POST(request: Request) {
    try {
        const { count } = await request.json();

        if (typeof count !== 'number' || count < 0) {
            return NextResponse.json({ error: 'Invalid count value' }, { status: 400 });
        }

        const client = await clientPromise;

        if (!client) {
            return NextResponse.json(
                { error: 'Database not available' },
                { status: 503 }
            );
        }

        const db = client.db();

        await db.collection('counters').updateOne(
            { name: 'business_listings' },
            {
                $set: {
                    count,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ count, message: 'Counter updated successfully' });
    } catch (error) {
        console.error('Failed to update business counter:', error);
        return NextResponse.json(
            { error: 'Failed to update counter' },
            { status: 500 }
        );
    }
}
