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
        const user = await db.collection('users').findOne({ 
            walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
        });

        const post = {
            title: title.trim(),
            content: content.trim(),
            walletAddress: walletAddress.toLowerCase(),
            savvyName: user?.savvyName || null,
            tags: tags && tags.length > 0 ? tags : ['general'],
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
        const limit = parseInt(searchParams.get('limit') || '50');
        const tag = searchParams.get('tag');
        const userAddress = searchParams.get('userAddress');
        const sort = searchParams.get('sort') || 'latest'; // 'latest' | 'popular' | 'replies'

        const filter: Record<string, unknown> = {};
        if (tag && tag !== 'all') {
            filter.tags = tag;
        }

        if (userAddress) {
            const normalizedAddr = userAddress.toLowerCase();
            filter.$or = [
                { walletAddress: normalizedAddr },
                { 'replies.walletAddress': normalizedAddr }
            ];
        }

        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
        if (sort === 'popular') {
            sortOption = { likes: -1, createdAt: -1 };
        } else if (sort === 'replies') {
            sortOption = { replyCount: -1, createdAt: -1 };
        }

        const posts = await db.collection('forum_posts')
            .find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray();

        const total = await db.collection('forum_posts').countDocuments(filter);

        // Fetch all posts for dynamic sidebar aggregations
        const allPosts = await db.collection('forum_posts').find({}).toArray();

        // 1. Dynamic Active Topics aggregation
        const tagCountMap: Record<string, number> = {};
        const userScoreMap: Record<string, { name: string; walletAddress: string; likes: number; posts: number; replies: number }> = {};

        allPosts.forEach((p: any) => {
            // Count tags
            (p.tags || []).forEach((t: string) => {
                const cleanTag = t.toLowerCase().trim();
                if (cleanTag) {
                    tagCountMap[cleanTag] = (tagCountMap[cleanTag] || 0) + 1;
                }
            });

            // Count user engagement
            const authorAddr = p.walletAddress ? p.walletAddress.toLowerCase() : '';
            if (authorAddr) {
                if (!userScoreMap[authorAddr]) {
                    userScoreMap[authorAddr] = {
                        name: p.savvyName || `${authorAddr.slice(0, 6)}...${authorAddr.slice(-4)}`,
                        walletAddress: authorAddr,
                        likes: 0,
                        posts: 0,
                        replies: 0
                    };
                }
                userScoreMap[authorAddr].posts += 1;
                userScoreMap[authorAddr].likes += (p.likes || 0);
                if (p.savvyName && !userScoreMap[authorAddr].name.includes('...')) {
                    userScoreMap[authorAddr].name = p.savvyName;
                }
            }

            // Count reply authors
            (p.replies || []).forEach((r: any) => {
                const replyAddr = r.walletAddress ? r.walletAddress.toLowerCase() : '';
                if (replyAddr) {
                    if (!userScoreMap[replyAddr]) {
                        userScoreMap[replyAddr] = {
                            name: r.savvyName || `${replyAddr.slice(0, 6)}...${replyAddr.slice(-4)}`,
                            walletAddress: replyAddr,
                            likes: 0,
                            posts: 0,
                            replies: 0
                        };
                    }
                    userScoreMap[replyAddr].replies += 1;
                    if (r.savvyName && !userScoreMap[replyAddr].name.includes('...')) {
                        userScoreMap[replyAddr].name = r.savvyName;
                    }
                }
            });
        });

        // Format active topics sorted by thread count
        const activeTopics = Object.entries(tagCountMap)
            .map(([tag, count]) => ({ tag, threads: count }))
            .sort((a, b) => b.threads - a.threads);

        // Format top users sorted by activity points (posts * 2 + replies * 1 + likes * 3)
        const topUsers = Object.values(userScoreMap)
            .map(u => ({
                name: u.name,
                walletAddress: u.walletAddress,
                avatar: u.name.slice(0, 2).toUpperCase(),
                points: `${u.likes + u.posts * 2 + u.replies}`,
                rawPoints: u.likes * 3 + u.posts * 2 + u.replies
            }))
            .sort((a, b) => b.rawPoints - a.rawPoints)
            .slice(0, 5);

        return NextResponse.json({ 
            posts, 
            total, 
            page, 
            totalPages: Math.ceil(total / limit),
            activeTopics,
            topUsers
        });
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
        const { postId, walletAddress, replyContent, action, savvyName } = body;

        if (!postId) return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });

        if (action === 'reply' && replyContent && walletAddress) {
            const isBot = walletAddress.toLowerCase().includes('savvybot');
            const user = !isBot ? await db.collection('users').findOne({ 
                walletAddress: { $regex: new RegExp(`^${walletAddress}$`, 'i') } 
            }) : null;

            const reply = {
                _id: new ObjectId(),
                content: replyContent.trim(),
                walletAddress: walletAddress.toLowerCase(),
                savvyName: isBot ? 'SavvyBot' : (savvyName || user?.savvyName || null),
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

            const lowerAddress = walletAddress.toLowerCase();
            const alreadyLiked = (post.likedBy || []).includes(lowerAddress);
            if (alreadyLiked) {
                await db.collection('forum_posts').updateOne(
                    { _id: new ObjectId(postId) },
                    { $pull: { likedBy: lowerAddress } as any, $inc: { likes: -1 } }
                );
            } else {
                await db.collection('forum_posts').updateOne(
                    { _id: new ObjectId(postId) },
                    { $push: { likedBy: lowerAddress } as any, $inc: { likes: 1 } }
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
