import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { referralCode } = await request.json();

        if (!referralCode || typeof referralCode !== 'string') {
            return NextResponse.json(
                { valid: false, message: 'Invalid referral code format' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json(
                { valid: false, message: 'Database connection failed' },
                { status: 500 }
            );
        }
        const db = client.db('bitsave');
        const usersCollection = db.collection('users');

        // Check if referral code exists in users collection
        const user = await usersCollection.findOne({ referralCode: referralCode.trim() });

        if (user) {
            return NextResponse.json({
                valid: true,
                message: 'Referral code is valid',
                referralOwner: user.walletAddress
            });
        } else {
            return NextResponse.json({
                valid: false,
                message: 'Referral code not found'
            });
        }
    } catch (error) {
        console.error('Error validating referral code:', error);
        return NextResponse.json(
            { valid: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
