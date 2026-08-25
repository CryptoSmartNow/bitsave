import 'dotenv/config';
import cron from 'node-cron';

import { broadcastPushNotification, sendPushNotification } from '../lib/push';
import { MongoClient } from 'mongodb';

console.log('💓 BitSave Heartbeat Service Started');


let cachedClient: MongoClient | null = null;
async function getHeartbeatDb() {
    if (!process.env.MONGODB_URI) return null;
    if (!cachedClient) {
        cachedClient = new MongoClient(process.env.MONGODB_URI, {
            maxPoolSize: 3,
            minPoolSize: 0,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
        });
        await cachedClient.connect();
    }
    return cachedClient.db(process.env.MONGODB_DB_NAME || 'bitsave');
}

// ── 3. Savings Maturity Checks (Daily) ────────────────────────────
cron.schedule('0 9 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Checking for mature savings from DB...`);
    
    try {
        const db = await getHeartbeatDb();
        if (!db) {
            console.warn('MongoDB not configured. Skipping maturity checks.');
            return;
        }

        const subsCollection = db.collection('push_subscriptions');
        
        // Find all users who are subscribed to push notifications
        const subscriptions = await subsCollection.find({}).toArray();
        const uniqueAddresses = [...new Set(subscriptions.map(sub => sub.walletAddress).filter(Boolean))];
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const now = Math.floor(Date.now() / 1000);
        const oneDayAgo = now - 24 * 60 * 60; // 24 hours ago

        for (const address of uniqueAddresses) {
            try {
                // Fetch their savings data from the blockchain via our API
                const res = await fetch(`${siteUrl}/api/savings-data?address=${address}`);
                if (!res.ok) continue;
                
                const data = await res.json();
                
                // Check completed plans
                for (const plan of data.completedPlans || []) {
                    // Only notify if it matured within the last 24 hours
                    if (plan.maturityTime && plan.maturityTime >= oneDayAgo && plan.maturityTime <= now) {
                        await sendPushNotification(address as string, { 
                            title: 'Savings Complete! 🎉', 
                            body: `Your saving plan "${plan.name}" has matured! You can now withdraw your funds penalty-free.`,
                            url: '/dashboard'
                        });
                        console.log(`Sent maturity notification to ${address} for plan ${plan.name}`);
                    }
                }
            } catch (err: any) {
                console.error(`Failed to check maturity for ${address}:`, err.message);
            }
        }
    } catch (err: any) {
        console.error('Error in mature savings DB check:', err.message);
    }
});

// ── 4. Onswitch Pending Reconciliation (Every 1 minute) ──────────
cron.schedule('* * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Triggering Onswitch Pending Reconciler...`);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    try {
        const res = await fetch(`${siteUrl}/api/cron/reconcile-pending`, {
            headers: {
                ...(process.env.CRON_SECRET ? { 'Authorization': `Bearer ${process.env.CRON_SECRET}` } : {})
            }
        });
        
        const data = await res.json();
        console.log(`[Onswitch Reconciler Response]:`, data.message || data.error || data);
    } catch (err: any) {
        console.error('Failed to trigger Onswitch Reconciler:', err.message);
    }
});
