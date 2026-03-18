import { NextRequest, NextResponse } from 'next/server';
import { agentTools } from '@/lib/web3/agent-tools';
import { getMarketsCollection } from '@/lib/mongodb';

/**
 * Autonomous Prediction API
 *
 * This endpoint allows external autonomous agents (e.g. from Moltbook)
 * to submit structured prediction market data.
 *
 * Users still create predictions via the MarketWizard UI at /bizfun/agent.
 * This endpoint is the machine-to-machine equivalent for bots.
 */

const AGENT_API_KEY = process.env.AUTONOMOUS_AGENT_API_KEY;

export async function POST(req: NextRequest) {
    try {
        // Optional API key auth for autonomous agents
        if (AGENT_API_KEY) {
            const authHeader = req.headers.get('authorization');
            if (!authHeader || authHeader !== `Bearer ${AGENT_API_KEY}`) {
                return NextResponse.json(
                    { error: 'Unauthorized. Provide a valid Bearer token.' },
                    { status: 401 }
                );
            }
        }

        const body = await req.json();

        // Validate required fields
        const { question, description, chain, duration, wallet, agentId } = body;

        if (!question || !description || !wallet) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['question', 'description', 'wallet'],
                optional: ['chain', 'duration', 'agentId', 'vibe', 'name', 'links']
            }, { status: 400 });
        }

        // Calculate resolve time from duration
        const durationDays = parseInt(duration) || 30;
        const resolveTime = Math.floor(Date.now() / 1000) + (durationDays * 24 * 60 * 60);
        const tradingDeadline = resolveTime - 86400; // 1 day before resolve

        // Generate proposal using agent tools
        const proposalResult = await agentTools.createMarket({
            metadataUri: question,
            tradingDeadline,
            resolveTime,
            chain: chain || 'Base'
        });

        if (!proposalResult?.proposal) {
            return NextResponse.json(
                { error: 'Failed to generate market proposal' },
                { status: 500 }
            );
        }

        // Index the prediction in MongoDB for tracking
        const collection = await getMarketsCollection();
        let marketId: string | null = null;

        if (collection) {
            const record = {
                question,
                description,
                vibe: body.vibe || 'Experimental',
                outcome: 'UNDECIDED',
                tradingDeadline: tradingDeadline.toString(),
                resolveTime: resolveTime.toString(),
                chainId: proposalResult.proposal.chainId,
                creator: wallet,
                source: 'autonomous-agent',
                agentId: agentId || 'unknown',
                createdAt: new Date(),
                volume: '0',
                liquidity: '5',
                status: 'pending_signature',
                data: body
            };

            const result = await collection.insertOne(record);
            marketId = result.insertedId.toString();
        }

        return NextResponse.json({
            success: true,
            marketId,
            proposal: proposalResult.proposal,
            message: proposalResult.message,
            signUrl: `https://bitsave.io/bizfun/market/${marketId}`,
            note: 'This prediction requires an on-chain signature to finalize. Direct the creator to the signUrl.'
        });

    } catch (error: any) {
        console.error('Autonomous Prediction API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

// GET — return the prediction schema for agent discovery
export async function GET() {
    return NextResponse.json({
        name: 'BizMart Autonomous Prediction API',
        version: '1.0',
        description: 'Submit prediction market proposals. Users can also create predictions manually at /bizfun/agent.',
        endpoint: 'POST /api/bizfun/autonomous-prediction',
        authentication: 'Bearer token (optional, set AUTONOMOUS_AGENT_API_KEY)',
        schema: {
            question: { type: 'string', required: true, description: 'The prediction question in plain English' },
            description: { type: 'string', required: true, description: 'Brief description of what is being predicted' },
            wallet: { type: 'string', required: true, description: '0x address for USDC settlement' },
            chain: { type: 'string', required: false, default: 'Base', enum: ['Base', 'BSC', 'Monad'] },
            duration: { type: 'string', required: false, default: '30', description: 'Duration in days' },
            vibe: { type: 'string', required: false, default: 'Experimental', enum: ['Meme', 'Serious', 'Experimental'] },
            name: { type: 'string', required: false, description: 'Display name for the prediction subject' },
            links: { type: 'string', required: false, description: 'Related URLs' },
            agentId: { type: 'string', required: false, description: 'Your agent identifier for tracking' }
        },
        example: {
            question: 'Will Bitcoin reach $150,000 by July 2026?',
            description: 'Prediction on BTC price movement to six figures',
            wallet: '0x1234...abcd',
            chain: 'Base',
            duration: '30',
            vibe: 'Serious',
            agentId: 'my-prediction-bot'
        }
    });
}
