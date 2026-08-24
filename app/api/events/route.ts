import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ events: [] });
    }

    const eventsCollection = db.collection('events');
    const events = await eventsCollection
      .find({})
      .sort({ date: 1 })
      .toArray();

    const formattedEvents = events.map(evt => ({
      id: evt._id.toString(),
      title: evt.title,
      description: evt.description || '',
      date: evt.date,
      time: evt.time || '12:00 PM UTC',
      location: evt.location || 'Online',
      type: evt.type || 'Community',
      url: evt.url || ''
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, time, location, type, url } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const eventsCollection = db.collection('events');
    const newEvent = {
      title,
      description: description || '',
      date: new Date(date).toISOString(),
      time: time || '12:00 PM UTC',
      location: location || 'Online',
      type: type || 'Community',
      url: url || '',
      createdAt: new Date().toISOString()
    };

    const result = await eventsCollection.insertOne(newEvent);

    return NextResponse.json({
      success: true,
      event: {
        id: result.insertedId.toString(),
        ...newEvent
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
