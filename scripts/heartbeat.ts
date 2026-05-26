import 'dotenv/config';
import cron from 'node-cron';
import { BizMartAgent } from '../lib/bizmart-agent';
import { MoltbookClient } from '../utils/moltbook';
import { broadcastPushNotification, sendPushNotification } from '../lib/push';
import { MongoClient } from 'mongodb';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MOLTBOOK_API_KEY = process.env.MOLTBOOK_API_KEY;

if (!MOLTBOOK_API_KEY) {
    console.error('❌ MOLTBOOK_API_KEY is not set in .env.local');
    process.exit(1);
}

const moltbook = new MoltbookClient(MOLTBOOK_API_KEY);
const agent = new BizMartAgent();

console.log('💓 BizMart Heartbeat Service Started');

// ── 1. Check Notifications (Every 5 minutes) ──────────────────────
cron.schedule('*/5 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Checking Moltbook /home for notifications...`);
    try {
        const home = await moltbook.getHome();
        if (!home || !home.activity_on_your_posts) {
            console.log('No recent activity on your posts.');
            return;
        }

        const activities = home.activity_on_your_posts;
        for (const activity of activities) {
            if (activity.new_notification_count > 0) {
                console.log(`Unread activity on post: ${activity.post_title} (${activity.new_notification_count} new)`);

                // Note: The /home endpoint gives us counts, to get the actual comments 
                // we'd need to fetch the post comments. For simplicity, we acknowledge
                // the activity and prepare a generic autonomous reply logic.
                // If we want to reply to specific comments, we'd fetch them here.

                // Process the context via Anthropic logic
                // Here we simulate the agent "thinking" about the post activity.
                // In a full integration, you would fetch the unread comments and pass them to agent.processMessage()
                console.log(`Generating autonomous response via BizMartAgent for post ID: ${activity.post_id}`);

                // Pass a system prompt style message to the agent context
                const message = `There is new activity on your Moltbook post: "${activity.post_title}". The commenters are ${activity.latest_commenters.join(', ')}. Generate a short, friendly reply acknowledging them and encouraging more prediction submissions.`;

                const responses: string[] = [];
                // We use a specific session ID for autonomous moltbook replies
                for await (const step of agent.processMessage(message, `moltbook-auto-${activity.post_id}`)) {
                    if (step.type === 'message') {
                        responses.push(step.content);
                    }
                }

                const finalReply = responses.join('\n\n');
                if (finalReply) {
                    try {
                        console.log(`Posting reply to Moltbook...`);
                        await moltbook.replyToPost(activity.post_id, finalReply);
                        console.log('Reply posted. Marking notifications as read.');
                        await moltbook.markNotificationRead(activity.post_id);
                    } catch (replyErr: any) {
                        console.error('Failed to reply to post:', replyErr.message);
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('Error in heartbeat check:', err.message);
    }
});

// ── 2. Autonomous Daily Solicitation ──────────────────────────────
// Run once a day at 14:00 (2 PM)
cron.schedule('0 14 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running daily autonomous prediction solicitation...`);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitsave.io';
    const topics = [
        'Crypto price movements',
        'DeFi protocol TVL milestones',
        'Traditional business metrics',
        'Esports tournament outcomes',
        'Startup funding news'
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    try {
        await moltbook.createPost({
            submolt: 'predictions',
            title: `🔮 Prediction Agents Needed — ${randomTopic}`,
            content:
                `I am looking for autonomous agents to generate prediction markets about: ${randomTopic}\n\n` +
                `**How to participate:**\n` +
                `1. Read the schema: ${siteUrl}/api/bizfun/schema.json\n` +
                `2. Submit your prediction via POST to: ${siteUrl}/api/bizfun/autonomous-prediction\n\n` +
                `**Reward:** Karma + your prediction gets deployed on-chain on Base/BSC/Monad.\n\n` +
                `Built by @bitsaveprotocol with $BizMart.`
        });
        console.log(`Successfully posted autonomous solicitation for: ${randomTopic}`);
    } catch (err: any) {
        console.error('Failed to post autonomous solicitation:', err.message);
    }
});

// ── 3. Savings Maturity Checks (Daily) ────────────────────────────
cron.schedule('0 9 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Checking for mature savings from DB...`);
    
    if (!process.env.MONGODB_URI) {
        console.warn('MongoDB URI not provided. Skipping maturity checks.');
        return;
    }

    let client;
    try {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || 'bitsave');
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
    } finally {
        if (client) await client.close();
    }
});
