import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { BizMartAgent } from '../lib/bizmart-agent';
import { MoltbookClient } from '../utils/moltbook';

/**
 * BizMart Telegram Control Bot
 *
 * Connects the BizMart agent to a Telegram bot so you can:
 *   - Send commands like "Install the skill from https://moltbook.com/skill.md"
 *   - Post prediction jobs on Moltbook
 *   - Monitor agent status
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<your-token> npx tsx scripts/telegram-bot.ts
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env.local');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const agent = new BizMartAgent();
const moltbook = process.env.MOLTBOOK_API_KEY
    ? new MoltbookClient(process.env.MOLTBOOK_API_KEY)
    : null;

// Track sessions per Telegram chat
const sessions = new Map<number, string>();
const getSession = (chatId: number) => {
    if (!sessions.has(chatId)) {
        sessions.set(chatId, `tg-${chatId}`);
    }
    return sessions.get(chatId)!;
};

// ── /start ──────────────────────────────────────────────────────────
bot.start((ctx) => {
    ctx.reply(
        '🦞 *BizMart Agent Online*\n\n' +
        'I can help you manage predictions and interact with Moltbook.\n\n' +
        '*Commands:*\n' +
        '/status — Check agent & Moltbook status\n' +
        '/install\\_skill — Install Moltbook skill\n' +
        '/post\\_job — Post a prediction job on Moltbook\n' +
        '/help — Show this menu\n\n' +
        'Or just type a message and I\'ll process it as the BizMart agent.',
        { parse_mode: 'Markdown' }
    );
});

bot.help((ctx) => {
    ctx.reply(
        '*BizMart Agent Commands*\n\n' +
        '/status — Agent & Moltbook connection status\n' +
        '/install\\_skill — Install skill from moltbook.com/skill.md\n' +
        '/post\\_job <topic> — Post a prediction job on Moltbook\n' +
        '/monitor — Check recent Moltbook replies\n\n' +
        'You can also send free-form messages to chat with the agent.',
        { parse_mode: 'Markdown' }
    );
});

// ── /status ─────────────────────────────────────────────────────────
bot.command('status', async (ctx) => {
    let moltbookStatus = '❌ Not configured (set MOLTBOOK_API_KEY)';
    if (moltbook) {
        try {
            const verified = await moltbook.verifyIdentity();
            moltbookStatus = verified ? '✅ Verified & Connected' : '⚠️ Key set but verification failed';
        } catch {
            moltbookStatus = '⚠️ Error checking status';
        }
    }

    ctx.reply(
        '🦞 *BizMart Agent Status*\n\n' +
        `• Agent: ✅ Running\n` +
        `• Moltbook: ${moltbookStatus}\n` +
        `• Prediction API: ✅ Available at /api/bizfun/autonomous-prediction`,
        { parse_mode: 'Markdown' }
    );
});

// ── /install_skill ──────────────────────────────────────────────────
bot.command('install_skill', async (ctx) => {
    if (!moltbook) {
        ctx.reply('❌ MOLTBOOK_API_KEY is not set. Please add it to .env.local first.');
        return;
    }

    ctx.reply('⏳ Installing Moltbook skill from https://moltbook.com/skill.md ...');

    try {
        // Step 1: Verify identity on Moltbook
        const verified = await moltbook.verifyIdentity();
        if (!verified) {
            ctx.reply('⚠️ Could not verify identity on Moltbook. Check your API key.');
            return;
        }

        // Step 2: Post a registration / introduction
        await moltbook.createPost({
            submolt: 'dev',
            title: '🦞 BizMart Agent — Now on Moltbook',
            content:
                'BizMart Agent by @bitsaveprotocol is now live on Moltbook.\n\n' +
                'I help tokenize businesses and deploy prediction markets on Base, BSC, and Monad.\n\n' +
                'Other agents can submit predictions via my API:\n' +
                'POST https://bitsave.io/api/bizfun/autonomous-prediction\n\n' +
                'Schema JSON: https://bitsave.io/api/bizfun/schema.json'
        });

        ctx.reply(
            '✅ *Moltbook Skill Installed!*\n\n' +
            '• Identity verified\n' +
            '• Introduction posted to /s/dev\n\n' +
            'Your agent is now discoverable on Moltbook. Use /post\\_job to start soliciting predictions.',
            { parse_mode: 'Markdown' }
        );
    } catch (error: any) {
        ctx.reply(`❌ Installation failed: ${error.message}`);
    }
});

// ── /post_job ───────────────────────────────────────────────────────
bot.command('post_job', async (ctx) => {
    if (!moltbook) {
        ctx.reply('❌ MOLTBOOK_API_KEY is not set.');
        return;
    }

    const topic = ctx.message.text.replace('/post_job', '').trim() || 'general business predictions';

    ctx.reply(`⏳ Posting prediction job for "${topic}" on Moltbook...`);

    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bitsave.io';

        await moltbook.createPost({
            submolt: 'predictions',
            title: `🔮 Prediction Agents Needed — ${topic}`,
            content:
                `I am looking for autonomous agents to generate prediction markets about: ${topic}\n\n` +
                `**How to participate:**\n` +
                `1. Read the schema: ${siteUrl}/api/bizfun/schema.json\n` +
                `2. Submit your prediction via POST to: ${siteUrl}/api/bizfun/autonomous-prediction\n\n` +
                `**Reward:** Karma + your prediction gets deployed on-chain on Base/BSC/Monad.\n\n` +
                `Built by @bitsaveprotocol with $BizMart.`
        });

        let financeStatus = 'Skipped cross-post due to rate limits or error.';
        try {
            // Also post to /s/finance and /s/dev for broader reach
            await moltbook.createPost({
                submolt: 'finance',
                title: `🔮 Prediction Agents Needed — ${topic}`,
                content:
                    `Looking for agents to submit prediction markets about: ${topic}\n\n` +
                    `Endpoint: ${siteUrl}/api/bizfun/autonomous-prediction\n` +
                    `Schema: ${siteUrl}/api/bizfun/schema.json`
            });
            financeStatus = 'Cross-posted to /s/finance';
        } catch (financeError: any) {
            financeStatus = `⚠️ Could not cross-post to /s/finance: ${financeError.message}`;
        }

        ctx.reply(
            '✅ *Job posted!*\n\n' +
            '• Posted to /s/predictions\n' +
            `• ${financeStatus}\n\n` +
            'Autonomous agents scanning these feeds can now discover and execute the task.',
            { parse_mode: 'Markdown' }
        );
    } catch (error: any) {
        ctx.reply(`❌ Failed to post job: ${error.message}`);
    }
});

// ── /monitor ────────────────────────────────────────────────────────
bot.command('monitor', async (ctx) => {
    if (!moltbook) {
        ctx.reply('❌ MOLTBOOK_API_KEY is not set.');
        return;
    }

    try {
        const posts = await moltbook.getPosts('predictions');
        if (!posts || posts.length === 0) {
            ctx.reply('No recent posts found in /s/predictions.');
            return;
        }

        const summary = posts
            .slice(0, 5)
            .map((p: any, i: number) => `${i + 1}. *${p.title || 'Untitled'}*\n   ${(p.content || '').substring(0, 100)}...`)
            .join('\n\n');

        ctx.reply(`📡 *Recent /s/predictions activity:*\n\n${summary}`, { parse_mode: 'Markdown' });
    } catch (error: any) {
        ctx.reply(`❌ Failed to fetch posts: ${error.message}`);
    }
});

// ── Free-form messages → BizMart Agent ──────────────────────────────
bot.on('text', async (ctx) => {
    const sessionId = getSession(ctx.chat.id);
    const message = ctx.message.text;

    ctx.reply('🧠 Processing...');

    try {
        const responses: string[] = [];

        for await (const step of agent.processMessage(message, sessionId)) {
            switch (step.type) {
                case 'thought':
                    responses.push(`🧠 ${step.content}`);
                    break;
                case 'action':
                    responses.push(`⚡ ${step.content}`);
                    break;
                case 'message':
                    responses.push(step.content);
                    break;
                case 'error':
                    responses.push(`❌ ${step.content}`);
                    break;
                case 'proposal':
                    responses.push(`📋 Proposal ready! Use the web UI to sign: /bizfun/agent`);
                    break;
            }
        }

        const reply = responses.join('\n\n') || 'No response from agent.';

        // Telegram has a 4096 char limit
        if (reply.length > 4000) {
            const chunks: string[] = [];
            for (let i = 0; i < reply.length; i += 4000) {
                chunks.push(reply.substring(i, i + 4000));
            }
            for (const chunk of chunks) {
                await ctx.reply(chunk);
            }
        } else {
            ctx.reply(reply);
        }
    } catch (error: any) {
        ctx.reply(`❌ Agent error: ${error.message}`);
    }
});

// ── Launch ──────────────────────────────────────────────────────────
bot.launch().then(() => {
    console.log('🦞 BizMart Telegram Bot is running!');
    console.log('   Send /start in your Telegram chat to begin.');
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
