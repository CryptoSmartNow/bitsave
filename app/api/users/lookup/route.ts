import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const savvyName = searchParams.get('savvyName');

    if (!savvyName) {
        return NextResponse.json({ error: 'Savvy name is required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
        }
        const db = client.db('bitsave');
        const collection = db.collection('users');

        const user = await collection.findOne({
            savvyName: { $regex: new RegExp(`^${savvyName}$`, 'i') }
        });

        if (!user) {
            return NextResponse.json({ exists: false });
        }

        return NextResponse.json({
            exists: true,
            savvyName: user.savvyName
        });
    } catch (error) {
        console.error('Error looking up savvy name:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
