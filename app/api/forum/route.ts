import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const body = await request.json();
        const { title, content, walletAddress, tags } = body;

        if (!title || !content || !walletAddress) {
            return NextResponse.json({ error: 'Title, content, and wallet address are required' }, { status: 400 });
        }

        // Get author's savvy name
        const user = await db.collection('users').findOne({ walletAddress: walletAddress.toLowerCase() });

        const post = {
            title: title.trim(),
            content: content.trim(),
            walletAddress: walletAddress.toLowerCase(),
            savvyName: user?.savvyName || null,
            tags: tags || [],
            replies: [],
            replyCount: 0,
            likes: 0,
            likedBy: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('forum_posts').insertOne(post);
        return NextResponse.json({ success: true, postId: result.insertedId, post: { ...post, _id: result.insertedId } });
    } catch (error) {
        console.error('Error creating forum post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const tag = searchParams.get('tag');

        const filter: Record<string, unknown> = {};
        if (tag) filter.tags = tag;

        const posts = await db.collection('forum_posts')
            .find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        const total = await db.collection('forum_posts').countDocuments(filter);

        return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('Error fetching forum posts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');
        const { ObjectId } = await import('mongodb');

        const body = await request.json();
        const { postId, walletAddress, replyContent, action } = body;

        if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        if (action === 'reply' && replyContent && walletAddress) {
            const user = await db.collection('users').findOne({ walletAddress: walletAddress.toLowerCase() });
            const reply = {
                _id: new ObjectId(),
                content: replyContent.trim(),
                walletAddress: walletAddress.toLowerCase(),
                savvyName: user?.savvyName || null,
                createdAt: new Date(),
            };

            await db.collection('forum_posts').updateOne(
                { _id: new ObjectId(postId) },
                { $push: { replies: reply } as any, $inc: { replyCount: 1 }, $set: { updatedAt: new Date() } }
            );
            return NextResponse.json({ success: true, reply });
        }

        if (action === 'like' && walletAddress) {
            const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });
            if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

            const alreadyLiked = (post.likedBy || []).includes(walletAddress.toLowerCase());
            if (alreadyLiked) {
                await db.collection('forum_posts').updateOne(
                    { _id: new ObjectId(postId) },
                    { $pull: { likedBy: walletAddress.toLowerCase() } as any, $inc: { likes: -1 } }
                );
            } else {
                await db.collection('forum_posts').updateOne(
                    { _id: new ObjectId(postId) },
                    { $push: { likedBy: walletAddress.toLowerCase() } as any, $inc: { likes: 1 } }
                );
            }
            return NextResponse.json({ success: true, liked: !alreadyLiked });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating forum post:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
