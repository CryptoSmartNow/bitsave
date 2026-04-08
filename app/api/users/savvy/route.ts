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
        const collection = db.collection('users');

        const user = await collection.findOne({ walletAddress: walletAddress.toLowerCase() });

        if (!user || !user.savvyName) {
            return NextResponse.json({ savvyName: null });
        }

        return NextResponse.json({ savvyName: user.savvyName });
    } catch (error) {
        console.error('Error fetching savvy name:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { walletAddress, savvyName } = body;

        if (!walletAddress || !savvyName) {
            return NextResponse.json({ error: 'Wallet address and savvy name are required' }, { status: 400 });
        }

        // Basic validation for savvy name (e.g., alphanumeric, underscores, 3-20 chars base part)
        const baseName = savvyName.endsWith('.savvy') ? savvyName.slice(0, -6) : savvyName;
        const finalSavvyName = savvyName.endsWith('.savvy') ? savvyName : `${savvyName}.savvy`;

        const savvyNameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!savvyNameRegex.test(baseName)) {
            return NextResponse.json({
                error: 'Savvy name must be 3-20 characters long and contain only letters, numbers, and underscores'
            }, { status: 400 });
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }
        const db = client.db('bitsave');
        const collection = db.collection('users');

        // Check if savvy name is already taken (case-insensitive)
        const existingName = await collection.findOne({
            savvyName: { $regex: new RegExp(`^${finalSavvyName}$`, 'i') }
        });

        if (existingName) {
            if (existingName.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
                return NextResponse.json({ success: true, message: 'You already own this Savvy Name', savvyName: existingName.savvyName });
            }
            return NextResponse.json({ error: 'This Savvy Name is already taken' }, { status: 409 });
        }

        // Check if user already has a savvy name (Optional: decide if they can change it. Let's allow changing it for now)
        // Store it as provided (preserves casing)
        await collection.updateOne(
            { walletAddress: walletAddress.toLowerCase() },
            {
                $set: {
                    savvyName: finalSavvyName,
                    updatedAt: new Date()
                },
                $setOnInsert: {
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, savvyName: finalSavvyName });
    } catch (error) {
        console.error('Error setting savvy name:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
