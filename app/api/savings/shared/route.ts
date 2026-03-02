import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }
        const db = client.db('bitsave');

        // 1. Get the user's Savvy Name
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ walletAddress: walletAddress.toLowerCase() });

        if (!user || !user.savvyName) {
            return NextResponse.json({ sharedPlans: [] });
        }

        // 2. Fetch all shared plans for this Savvy Name
        const sharedCollection = db.collection('shared_savings');
        const sharedPlans = await sharedCollection.find({
            sharedWithSavvyName: user.savvyName
        }).toArray();

        return NextResponse.json({ sharedPlans });
    } catch (error) {
        console.error('Error fetching shared plans:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
