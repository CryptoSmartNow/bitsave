import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const body = await request.json();
        const { name, token, network, maturityDate, creatorWallet, invitedSavvyNames, description, penalty, targetAmount } = body;

        if (!name || !token || !creatorWallet) {
            return NextResponse.json({ error: 'Name, token, and creator wallet are required' }, { status: 400 });
        }

        const normalizedCreator = creatorWallet.toLowerCase();

        // Resolve Savvy Names or raw 0x wallet addresses to member records
        const members: Array<{ wallet: string; role: string; joinedAt: Date; contributed: number }> = [
            { wallet: normalizedCreator, role: 'creator', joinedAt: new Date(), contributed: 0 }
        ];
        const existingWallets = new Set([normalizedCreator]);

        if (invitedSavvyNames && Array.isArray(invitedSavvyNames)) {
            const usersCollection = db.collection('users');
            for (const rawInvite of invitedSavvyNames) {
                const invite = (rawInvite || '').trim().replace(/^@/, '');
                if (!invite) continue;

                // Direct wallet address
                if (invite.startsWith('0x') && invite.length === 42) {
                    const cleanWallet = invite.toLowerCase();
                    if (!existingWallets.has(cleanWallet)) {
                        members.push({ wallet: cleanWallet, role: 'member', joinedAt: new Date(), contributed: 0 });
                        existingWallets.add(cleanWallet);
                    }
                } else {
                    // Look up via Savvy Name
                    const user = await usersCollection.findOne({ savvyName: { $regex: new RegExp(`^${invite}$`, 'i') } });
                    if (user && user.walletAddress) {
                        const cleanWallet = user.walletAddress.toLowerCase();
                        if (!existingWallets.has(cleanWallet)) {
                            members.push({ wallet: cleanWallet, role: 'member', joinedAt: new Date(), contributed: 0 });
                            existingWallets.add(cleanWallet);
                        }
                    }
                }
            }
        }

        const group = {
            name: name.trim(),
            description: description ? description.trim() : '',
            currentAmount: 0,
            targetAmount: targetAmount ? parseFloat(targetAmount) : 0,
            token,
            network: network || 'Base',
            penalty: penalty || '10%',
            maturityDate: maturityDate ? new Date(maturityDate) : null,
            creatorWallet: normalizedCreator,
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
        const enrichedGroups = await Promise.all(groups.map(async (group: any) => {
            const enrichedMembers = await Promise.all(group.members.map(async (member: { wallet: string; role: string; contributed: number; joinedAt: Date }) => {
                const user = await usersCollection.findOne({ walletAddress: member.wallet });
                return { ...member, savvyName: user?.savvyName || null };
            }));
            return { ...group, members: enrichedMembers };
        }));

        return NextResponse.json(enrichedGroups);
    } catch (error) {
        console.warn('Group savings database unreachable, returning empty list:', error);
        return NextResponse.json([]);
    }
}

export async function PUT(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const body = await request.json();
        const { groupId, walletAddress, amount, action, invitedSavvyNames } = body;

        if (!groupId || !walletAddress) {
            return NextResponse.json({ error: 'Group ID and wallet address are required' }, { status: 400 });
        }

        const collection = db.collection('group_savings');
        const group = await collection.findOne({ _id: new ObjectId(groupId) });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        if (action === 'contribute' && amount) {
            const numAmount = parseFloat(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                return NextResponse.json({ error: 'Invalid contribution amount' }, { status: 400 });
            }

            // Update member contribution and group total if member exists
            const updateRes = await collection.updateOne(
                { _id: new ObjectId(groupId), 'members.wallet': walletAddress.toLowerCase() },
                {
                    $inc: { 'members.$.contributed': numAmount, currentAmount: numAmount },
                    $set: { updatedAt: new Date() }
                }
            );

            // If user contributed without being previously listed in members array, add them
            if (updateRes.matchedCount === 0) {
                await collection.updateOne(
                    { _id: new ObjectId(groupId) },
                    {
                        $push: {
                            members: {
                                wallet: walletAddress.toLowerCase(),
                                role: 'member',
                                joinedAt: new Date(),
                                contributed: numAmount
                            }
                        } as any,
                        $inc: { currentAmount: numAmount },
                        $set: { updatedAt: new Date() }
                    }
                );
            }
            return NextResponse.json({ success: true, message: 'Contribution recorded' });
        }

        if (action === 'join') {
            const cleanWallet = walletAddress.toLowerCase();
            const isAlreadyMember = group.members.some((m: any) => m.wallet.toLowerCase() === cleanWallet);
            if (isAlreadyMember) {
                return NextResponse.json({ success: true, message: 'Already a member of this vault' });
            }

            await collection.updateOne(
                { _id: new ObjectId(groupId) },
                {
                    $push: {
                        members: {
                            wallet: cleanWallet,
                            role: 'member',
                            joinedAt: new Date(),
                            contributed: 0
                        }
                    } as any,
                    $set: { updatedAt: new Date() }
                }
            );
            return NextResponse.json({ success: true, message: 'Successfully joined the vault' });
        }

        if (action === 'leave') {
            const cleanWallet = walletAddress.toLowerCase();
            if (group.creatorWallet.toLowerCase() === cleanWallet) {
                return NextResponse.json({ error: 'Vault creator cannot leave the vault. You can delete the vault instead.' }, { status: 400 });
            }

            await collection.updateOne(
                { _id: new ObjectId(groupId) },
                { $pull: { members: { wallet: cleanWallet } } as any, $set: { updatedAt: new Date() } }
            );
            return NextResponse.json({ success: true, message: 'Left the vault successfully' });
        }

        if (action === 'invite' && invitedSavvyNames && Array.isArray(invitedSavvyNames)) {
            const usersCollection = db.collection('users');
            const newMembers = [];
            const existingWallets = new Set(group.members.map((m: any) => m.wallet.toLowerCase()));

            for (const rawInvite of invitedSavvyNames) {
                const invite = (rawInvite || '').trim().replace(/^@/, '');
                if (!invite) continue;

                if (invite.startsWith('0x') && invite.length === 42) {
                    const cleanWallet = invite.toLowerCase();
                    if (!existingWallets.has(cleanWallet)) {
                        newMembers.push({ wallet: cleanWallet, role: 'member', joinedAt: new Date(), contributed: 0 });
                        existingWallets.add(cleanWallet);
                    }
                } else {
                    const user = await usersCollection.findOne({ savvyName: { $regex: new RegExp(`^${invite}$`, 'i') } });
                    if (user && user.walletAddress) {
                        const cleanWallet = user.walletAddress.toLowerCase();
                        if (!existingWallets.has(cleanWallet)) {
                            newMembers.push({ wallet: cleanWallet, role: 'member', joinedAt: new Date(), contributed: 0 });
                            existingWallets.add(cleanWallet);
                        }
                    }
                }
            }

            if (newMembers.length > 0) {
                await collection.updateOne(
                    { _id: new ObjectId(groupId) },
                    { 
                        $push: { members: { $each: newMembers } } as any,
                        $addToSet: { invitedSavvyNames: { $each: invitedSavvyNames } } as any,
                        $set: { updatedAt: new Date() } 
                    }
                );
            }
            return NextResponse.json({ success: true, message: 'Members invited successfully' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating group savings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        const db = client.db('bitsave');

        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        const walletAddress = searchParams.get('walletAddress');

        if (!groupId || !walletAddress) {
            return NextResponse.json({ error: 'Group ID and wallet address are required' }, { status: 400 });
        }

        const collection = db.collection('group_savings');
        const group = await collection.findOne({ _id: new ObjectId(groupId) });

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        // Verify creator
        if (group.creatorWallet.toLowerCase() !== walletAddress.toLowerCase()) {
            return NextResponse.json({ error: 'Only the creator can delete the group' }, { status: 403 });
        }

        await collection.deleteOne({ _id: new ObjectId(groupId) });

        return NextResponse.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group savings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
