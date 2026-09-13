import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const db = client.db('bitsave');
    const { ticketId, userAddress, message } = await req.json();

    if (!ticketId || !userAddress || !message?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const feedbackDoc = await db.collection('feedback_submissions').findOne({
      _id: new ObjectId(ticketId),
      userAddress: userAddress.toLowerCase(),
    });

    if (!feedbackDoc) {
      return NextResponse.json({ error: 'Ticket not found or unauthorized' }, { status: 404 });
    }

    if (feedbackDoc.status === 'resolved') {
      return NextResponse.json({ error: 'Ticket is already resolved.' }, { status: 400 });
    }

    const replyEntry = {
      id: new ObjectId().toString(),
      message: message.trim(),
      sentBy: 'User',
      createdAt: new Date(),
    };

    await db.collection('feedback_submissions').updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { replies: replyEntry } as any,
        $set: {
          updatedAt: new Date(),
          status: 'pending_admin'
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      reply: replyEntry
    });
  } catch (error: any) {
    console.error('Error in user reply API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
