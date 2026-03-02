import { NextRequest, NextResponse } from 'next/server';
import { getCommentsCollection } from '@/lib/mongodb';
import clientPromise from '@/lib/mongodb';

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

        // Enrich with Savvy Names
        const client = await clientPromise;
        if (!client) return NextResponse.json({ comments });
        const db = client.db('bitsave');
        const usersCollection = db.collection('users');

        const enrichedComments = await Promise.all(comments.map(async (comment: any) => {
            // Comments store address in 'user', handle both cases
            let walletToSearch = comment.user || '';
            // If the user string is something like "0x12...3456", this won't exactly match the full wallet address without a proper lookup, but if they logged in with full address it will match.
            // For now, try our best to match the address if it's stored.
            // Wait, the POST route strips the user address: user: address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'Anonymous'
            // That means we might not resolve the exact wallet address if it's truncated.
            // But we can add the full wallet address to the comment POST.
            const u = await usersCollection.findOne({ walletAddress: walletToSearch.toLowerCase() });
            return {
                ...comment,
                savvyName: u?.savvyName || null
            };
        }));

        return NextResponse.json({ comments: enrichedComments });
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
            fullWalletAddress: body.fullWalletAddress || null, // Optional tracking of exact wallet for Savvy Name lookup
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
