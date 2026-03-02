import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ownerAddress, savingName, sharedWithSavvyName, network, contractAddress, chainId } = body;

        if (!ownerAddress || !savingName || !sharedWithSavvyName || !network) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }
        const db = client.db('bitsave');

        // Step 1: Verify the savvy name exists
        const usersCollection = db.collection('users');
        const targetUser = await usersCollection.findOne({
            savvyName: { $regex: new RegExp(`^${sharedWithSavvyName}$`, 'i') }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'Savvy Name not found' }, { status: 404 });
        }

        // Prevent sharing with oneself
        if (targetUser.walletAddress.toLowerCase() === ownerAddress.toLowerCase()) {
            return NextResponse.json({ error: 'Cannot share a plan with yourself' }, { status: 400 });
        }

        // Step 2: Store the share record
        const sharedCollection = db.collection('shared_savings');

        // Check if already shared
        const existingShare = await sharedCollection.findOne({
            ownerAddress: ownerAddress.toLowerCase(),
            savingName,
            sharedWithSavvyName: targetUser.savvyName
        });

        if (existingShare) {
            return NextResponse.json({ error: 'Plan already shared with this user' }, { status: 409 });
        }

        await sharedCollection.insertOne({
            ownerAddress: ownerAddress.toLowerCase(),
            savingName,
            sharedWithSavvyName: targetUser.savvyName,
            network,
            contractAddress: contractAddress || null, // Store contract address to help querying directly
            chainId: chainId || null,
            sharedAt: new Date()
        });

        return NextResponse.json({ success: true, message: 'Plan shared successfully' });
    } catch (error) {
        console.error('Error sharing plan:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
