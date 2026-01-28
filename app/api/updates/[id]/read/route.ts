import { NextRequest, NextResponse } from 'next/server';
import { getUserReadUpdatesCollection } from '@/lib/mongodb';

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const updateId = params.id;
    const body = await request.json();
    const { useraddress } = body;

    if (!updateId || !useraddress) {
      return NextResponse.json(
        { error: 'Missing updateId or useraddress' },
        { status: 400 }
      );
    }

    const collection = await getUserReadUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Upsert the read status
    await collection.updateOne(
      { 
        useraddress: { $regex: new RegExp(`^${useraddress}$`, 'i') },
        updateId: updateId
      },
      { 
        $set: { 
          useraddress,
          updateId,
          readAt: new Date().toISOString()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking update as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark update as read' },
      { status: 500 }
    );
  }
}
