import webpush from 'web-push';
import { getPushSubscriptionsCollection } from './mongodb';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@bitsave.io';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushNotification(walletAddress: string, payload: PushNotificationPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured, skipping push notification');
    return false;
  }

  const collection = await getPushSubscriptionsCollection();
  if (!collection) return false;

  try {
    // Find all subscriptions for this wallet address
    const subscriptions = await collection.find({ walletAddress }).toArray();
    
    if (subscriptions.length === 0) {
      return false; // No subscriptions found
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/bitsaveicon.jpg',
      data: {
        url: payload.url || '/dashboard'
      }
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          payloadString
        );
      } catch (error: any) {
        // If subscription is gone (410), remove it from the DB
        if (error.statusCode === 410 || error.statusCode === 404) {
          await collection.deleteOne({ endpoint: sub.endpoint });
        } else {
          console.error('Error sending push notification:', error);
        }
      }
    });

    await Promise.all(sendPromises);
    return true;
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return false;
  }
}

export async function broadcastPushNotification(payload: PushNotificationPayload) {
  console.log('Broadcasting push:', payload.title);
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('VAPID keys missing in broadcastPushNotification');
    return false;
  }

  const collection = await getPushSubscriptionsCollection();
  if (!collection) {
    console.error('Failed to get push_subscriptions collection');
    return false;
  }

  try {
    const subscriptions = await collection.find({}).toArray();
    
    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/bitsaveicon.jpg',
      data: {
        url: payload.url || '/dashboard'
      }
    });

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        console.log(`Sending web push to endpoint: ${sub.endpoint.substring(0, 30)}...`);
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys
          },
          payloadString
        );
        console.log(`Successfully sent to endpoint: ${sub.endpoint.substring(0, 30)}...`);
      } catch (error: any) {
        console.error(`Web push error for ${sub.endpoint.substring(0, 30)}... :`, error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          await collection.deleteOne({ endpoint: sub.endpoint });
        }
      }
    });

    await Promise.all(sendPromises);
    return true;
  } catch (error) {
    console.error('Error broadcasting push notification:', error);
    return false;
  }
}
