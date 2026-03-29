import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, currentRewards } = body;

        if (!address) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }
        
        const db = client.db('bitsave');
        const collection = db.collection('users');

        // Case-insensitive address lookup
        const addressRegex = new RegExp(`^${address}$`, 'i');
        const user = await collection.findOne({ walletAddress: addressRegex });

        const currentRewardsNum = Number(currentRewards) || 0;
        let finalRewards = currentRewardsNum;

        if (user) {
            const existingRewards = Number(user.rewards) || 0;
            finalRewards = Math.max(existingRewards, currentRewardsNum);
            
            await collection.updateOne(
                { _id: user._id },
                { $set: { rewards: finalRewards } }
            );
        } else {
            // Create user placeholder if it doesn't exist
            await collection.insertOne({
                walletAddress: address.toLowerCase(),
                rewards: finalRewards,
                createdAt: new Date()
            });
        }

        return NextResponse.json({ rewards: finalRewards, success: true });
    } catch (error) {
        console.error('Error syncing rewards:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
