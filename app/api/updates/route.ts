import { NextRequest, NextResponse } from 'next/server';
import { getUpdatesCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const collection = await getUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    let updates: any[] = await collection.find({}).sort({ date: -1 }).toArray();

    // Seed default updates if none exist
    if (updates.length === 0) {
      const defaultUpdates = [
        {
          id: '1',
          title: 'Welcome to Bitsave',
          content: 'Welcome to the new Bitsave dashboard! We have made significant improvements to the user interface and performance.',
          date: new Date().toISOString(),
          isNew: true
        },
        {
          id: '2',
          title: 'New Feature: Internal API',
          content: 'We have migrated to a robust internal API for better reliability and speed.',
          date: new Date().toISOString(),
          isNew: true
        }
      ];

      await collection.insertMany(defaultUpdates);
      updates = defaultUpdates;
    }

    return NextResponse.json(updates.map((update: any) => ({
      id: update.id || update._id.toString(),
      title: update.title,
      content: update.content,
      date: update.date,
      isNew: update.isNew
    })));

  } catch (error) {
    console.error('Error fetching updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing title or content' },
        { status: 400 }
      );
    }

    const collection = await getUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const newUpdate = {
      title,
      content,
      date: new Date().toISOString(),
      isNew: true
    };

    const result = await collection.insertOne(newUpdate);

    return NextResponse.json({
      success: true,
      update: {
        ...newUpdate,
        id: result.insertedId.toString()
      }
    });

  } catch (error) {
    console.error('Error creating update:', error);
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content } = body;

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'Missing id, title, or content' },
        { status: 400 }
      );
    }

    const collection = await getUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Try to find by _id (ObjectId) or id string
    let query;
    try {
      const { ObjectId } = require('mongodb');
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    const result = await collection.updateOne(
      query,
      { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
       // Fallback for string ids
       const result2 = await collection.updateOne(
         { id: id },
         { $set: { title, content } }
       );
       if (result2.matchedCount === 0) {
         return NextResponse.json(
           { error: 'Update not found' },
           { status: 404 }
         );
       }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating update:', error);
    return NextResponse.json(
      { error: 'Failed to update update' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Update ID is required' },
        { status: 400 }
      );
    }

    const collection = await getUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Try to delete by _id (ObjectId) or id string
    let query;
    try {
      const { ObjectId } = require('mongodb');
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      // Fallback for string ids
      const result2 = await collection.deleteOne({ id: id });
      if (result2.deletedCount === 0) {
        return NextResponse.json(
            { error: 'Update not found' },
            { status: 404 }
        );
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting update:', error);
    return NextResponse.json(
      { error: 'Failed to delete update' },
      { status: 500 }
    );
  }
}
