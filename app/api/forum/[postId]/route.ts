import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');
        const { ObjectId } = await import('mongodb');

        const { postId } = await params;
        if (!postId) {
            return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
        }

        const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Error fetching single forum post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
