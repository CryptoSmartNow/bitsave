import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const db = client.db('bitsave');
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const userAddress = searchParams.get('userAddress');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);

        const query: any = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (userAddress) {
            query.walletAddress = { $regex: new RegExp(`^${userAddress}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
                { walletAddress: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { savvyName: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;

        const [items, total, pendingCount, reviewedCount, resolvedCount] = await Promise.all([
            db.collection('feedback_submissions')
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            db.collection('feedback_submissions').countDocuments(query),
            db.collection('feedback_submissions').countDocuments({ status: 'pending' }),
            db.collection('feedback_submissions').countDocuments({ status: 'reviewed' }),
            db.collection('feedback_submissions').countDocuments({ status: 'resolved' }),
        ]);

        return NextResponse.json({
            success: true,
            feedback: items,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                limit
            },
            stats: {
                totalAll: pendingCount + reviewedCount + resolvedCount,
                pending: pendingCount,
                reviewed: reviewedCount,
                resolved: resolvedCount,
            }
        });
    } catch (error: any) {
        console.error('Error fetching feedback:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const db = client.db('bitsave');
        const body = await request.json();
        const { category, subject, message, walletAddress, email, savvyName, appContext, images } = body;

        if (!category || !subject?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'Category, subject, and message are required.' }, { status: 400 });
        }

        // Validate images count (max 3)
        let validatedImages: string[] = [];
        if (Array.isArray(images)) {
            if (images.length > 3) {
                return NextResponse.json({ error: 'Maximum 3 images allowed.' }, { status: 400 });
            }
            validatedImages = images.filter((img: any) => typeof img === 'string' && img.startsWith('data:image/'));
        }

        const newSubmission = {
            category: category.toLowerCase().trim(),
            subject: subject.trim(),
            message: message.trim(),
            walletAddress: walletAddress ? walletAddress.toLowerCase().trim() : null,
            email: email ? email.trim() : null,
            savvyName: savvyName ? savvyName.trim() : null,
            appContext: appContext || 'savefi-dashboard',
            images: validatedImages,
            status: 'pending', // 'pending' | 'reviewed' | 'resolved'
            adminNotes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('feedback_submissions').insertOne(newSubmission);

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully! Our team will review it.',
            id: result.insertedId,
        });
    } catch (error: any) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const client = await clientPromise;
        if (!client) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const db = client.db('bitsave');
        const body = await request.json();
        const { id, status, adminNotes, action } = body;

        if (!id) {
            return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
        }

        if (action === 'delete') {
            await db.collection('feedback_submissions').deleteOne({ _id: new ObjectId(id) });
            return NextResponse.json({ success: true, message: 'Feedback entry deleted' });
        }

        const updateFields: any = { updatedAt: new Date() };
        if (status) updateFields.status = status;
        if (typeof adminNotes === 'string') updateFields.adminNotes = adminNotes;

        const result = await db.collection('feedback_submissions').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Status updated successfully' });
    } catch (error: any) {
        console.error('Error updating feedback:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
