import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { escapeRegex } from '@/lib/escapeRegex';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const db = client.db('bitsave');
        const body = await request.json();
        const { feedbackId, userAddress, message, images } = body;

        if (!feedbackId || !userAddress || (!message?.trim() && (!images || images.length === 0))) {
            return NextResponse.json({ error: 'Missing required fields or content.' }, { status: 400 });
        }

        // Validate images count (max 3)
        let validatedImages: string[] = [];
        if (Array.isArray(images)) {
            if (images.length > 3) {
                return NextResponse.json({ error: 'Maximum 3 images allowed.' }, { status: 400 });
            }
            validatedImages = images.filter((img: any) => typeof img === 'string' && img.startsWith('data:image/'));
        }

        // Verify the ticket exists and belongs to the user
        const ticket = await db.collection('feedback_submissions').findOne({
            _id: new ObjectId(feedbackId),
            walletAddress: { $regex: new RegExp(`^${escapeRegex(userAddress)}$`, 'i') }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found or unauthorized.' }, { status: 404 });
        }

        const replyEntry = {
            id: new ObjectId().toString(),
            message: message ? message.trim() : '',
            images: validatedImages,
            sentBy: 'User',
            createdAt: new Date(),
        };

        const result = await db.collection('feedback_submissions').updateOne(
            { _id: new ObjectId(feedbackId) },
            {
                $push: { replies: replyEntry } as any,
                $set: {
                    status: 'pending', // A user reply resets the ticket to pending for dev attention
                    updatedAt: new Date(),
                }
            }
        );

        return NextResponse.json({
            success: true,
            message: 'Reply sent successfully.',
        });
    } catch (error: any) {
        console.error('Error submitting user reply:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
