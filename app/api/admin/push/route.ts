import { NextResponse } from 'next/server';
import { broadcastPushNotification } from '@/lib/push';

// NOTE: In a real app, you should protect this route with admin authentication
export async function POST(req: Request) {
  try {
    const { title, body, icon, url, adminPassword } = await req.json();

    if (adminPassword !== process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    const success = await broadcastPushNotification({ title, body, icon, url });

    if (success) {
      return NextResponse.json({ success: true, message: 'Broadcast sent to all subscribers' });
    } else {
      return NextResponse.json({ error: 'Failed to broadcast notifications' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error broadcasting push notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
