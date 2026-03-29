import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const body = await request.json();
        const { name, goalAmount, token, network, maturityDate, creatorWallet, invitedSavvyNames, description } = body;

        if (!name || !goalAmount || !token || !creatorWallet) {
            return NextResponse.json({ error: 'Name, goal amount, token, and creator wallet are required' }, { status: 400 });
        }

        // Resolve Savvy Names to wallet addresses
        const members = [{ wallet: creatorWallet.toLowerCase(), role: 'creator', joinedAt: new Date(), contributed: 0 }];

        if (invitedSavvyNames && Array.isArray(invitedSavvyNames)) {
            const usersCollection = db.collection('users');
            for (const savvyName of invitedSavvyNames) {
                const user = await usersCollection.findOne({ savvyName: { $regex: new RegExp(`^${savvyName}$`, 'i') } });
                if (user) {
                    members.push({ wallet: user.walletAddress, role: 'member', joinedAt: new Date(), contributed: 0 });
                }
            }
        }

        const group = {
            name,
            description: description || '',
            goalAmount: parseFloat(goalAmount),
            currentAmount: 0,
            token,
            network: network || 'Base',
            maturityDate: maturityDate ? new Date(maturityDate) : null,
            creatorWallet: creatorWallet.toLowerCase(),
            members,
            invitedSavvyNames: invitedSavvyNames || [],
            status: 'active', // active, completed, cancelled
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('group_savings').insertOne(group);

        return NextResponse.json({ success: true, groupId: result.insertedId, group });
    } catch (error) {
        console.error('Error creating group savings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('walletAddress');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        const groups = await db.collection('group_savings').find({
            'members.wallet': walletAddress.toLowerCase()
        }).sort({ createdAt: -1 }).toArray();

        // Enrich with Savvy Names for display
        const usersCollection = db.collection('users');
        const enrichedGroups = await Promise.all(groups.map(async (group) => {
            const enrichedMembers = await Promise.all(group.members.map(async (member: { wallet: string; role: string; contributed: number; joinedAt: Date }) => {
                const user = await usersCollection.findOne({ walletAddress: member.wallet });
                return { ...member, savvyName: user?.savvyName || null };
            }));
            return { ...group, members: enrichedMembers };
        }));

        return NextResponse.json(enrichedGroups);
    } catch (error) {
        console.error('Error fetching group savings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const body = await request.json();
        const { groupId, walletAddress, amount, action } = body;

        if (!groupId || !walletAddress) {
            return NextResponse.json({ error: 'Group ID and wallet address are required' }, { status: 400 });
        }

        const collection = db.collection('group_savings');
        const group = await collection.findOne({ _id: new ObjectId(groupId) });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        if (action === 'contribute' && amount) {
            // Update member contribution and group total
            await collection.updateOne(
                { _id: new ObjectId(groupId), 'members.wallet': walletAddress.toLowerCase() },
                {
                    $inc: { 'members.$.contributed': parseFloat(amount), currentAmount: parseFloat(amount) },
                    $set: { updatedAt: new Date() }
                }
            );
            return NextResponse.json({ success: true, message: 'Contribution recorded' });
        }

        if (action === 'leave') {
            await collection.updateOne(
                { _id: new ObjectId(groupId) },
                { $pull: { members: { wallet: walletAddress.toLowerCase() } } as any, $set: { updatedAt: new Date() } }
            );
            return NextResponse.json({ success: true, message: 'Left the group' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating group savings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
