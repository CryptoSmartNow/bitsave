
import { NextRequest, NextResponse } from 'next/server';
import { BizMartAgent } from '@/lib/bizmart-agent';
import { getChatSessionsCollection } from '@/lib/mongodb';

// Initialize agent (stateless for now, or use a store/db for context)
// If REMOTE_AGENT_URL is set, we will use that instead of local instance
const agent = new BizMartAgent();
const REMOTE_AGENT_URL = process.env.REMOTE_AGENT_URL;
// Use AGENT_SERVER_API_KEY to match the .env and server configuration
const REMOTE_AGENT_KEY = process.env.AGENT_SERVER_API_KEY || process.env.REMOTE_AGENT_KEY;

export async function GET(req: NextRequest) {
    try {
        const walletAddress = req.nextUrl.searchParams.get('wallet');
        let sessionId = req.cookies.get('bizfun_session')?.value;

        const collection = await getChatSessionsCollection();
        if (!collection) {
             return NextResponse.json({ steps: [] });
        }

        let session = null;
        
        // Prioritize wallet session if wallet is connected
        if (walletAddress) {
            // Find most recent session for this wallet
            session = await collection.findOne({ walletAddress });
            if (session) {
                sessionId = session.sessionId;
            }
        }

        // Fallback to cookie session if no wallet session found
        if (!session && sessionId) {
            session = await collection.findOne({ sessionId });
        }

        const response = NextResponse.json({ steps: session?.steps || [] });
        
        // If we switched to a wallet session, update the cookie
        if (session && session.sessionId !== req.cookies.get('bizfun_session')?.value) {
            response.cookies.set('bizfun_session', session.sessionId, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/' 
            });
        }

        return response;

    } catch (error) {
        console.error('Agent API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, walletAddress } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const collection = await getChatSessionsCollection();
        let sessionId = req.cookies.get('bizfun_session')?.value;
        let isNewSession = false;
        
        // 1. Resolve Session ID
        if (collection && walletAddress) {
            // Check if wallet already has a session
            const walletSession = await collection.findOne({ walletAddress });
            if (walletSession) {
                sessionId = walletSession.sessionId;
            }
        }

        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
            isNewSession = true;
        }

        // Helper to recursively handle BigInt serialization
        const sanitizeBigInts = (obj: any): any => {
            if (obj === null || obj === undefined) return obj;
            if (typeof obj === 'bigint') return obj.toString();
            if (Array.isArray(obj)) return obj.map(sanitizeBigInts);
            if (typeof obj === 'object') {
                const newObj: any = {};
                for (const key in obj) {
                    newObj[key] = sanitizeBigInts(obj[key]);
                }
                return newObj;
            }
            return obj;
        };

        // Collect all steps from the generator
        const rawAgentSteps: any[] = [];

        // Force local execution to ensure latest BizMart logic is used
        // if (REMOTE_AGENT_URL) { ... }
        
        // Local execution
        for await (const step of agent.processMessage(message, sessionId)) {
            rawAgentSteps.push(step);
        }

        // Sanitize BigInts for both DB and Response
        const agentSteps = sanitizeBigInts(rawAgentSteps);

        /*
        if (REMOTE_AGENT_URL) {
            try {
                // Call remote agent server
                const response = await fetch(`${REMOTE_AGENT_URL}/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': REMOTE_AGENT_KEY ? `Bearer ${REMOTE_AGENT_KEY}` : ''
                    },
                    body: JSON.stringify({ message, sessionId })
                });

                if (!response.ok) {
                    throw new Error(`Remote agent server error: ${response.statusText}`);
                }

                const data = await response.json();
                if (data.steps && Array.isArray(data.steps)) {
                    agentSteps.push(...data.steps);
                }
            } catch (error) {
                console.error('Remote Agent Error:', error);
                // Fallback to local or error out? 
                // For now, let's push an error message so the user knows
                agentSteps.push({ 
                    type: 'error', 
                    content: 'Failed to connect to remote agent server. Please check configuration.' 
                });
            }
        } else {
            // Local execution
            for await (const step of agent.processMessage(message, sessionId)) {
                agentSteps.push(step);
            }
        }
        */

        // Prepare steps to save (User message + Agent responses)
        const userStep = { type: 'message', content: `> ${message}`, timestamp: new Date() };
        
        // Add timestamp to agent steps
        const stepsToSave = [
            userStep,
            ...(Array.isArray(agentSteps) ? agentSteps : []).map((step: any) => ({ ...step, timestamp: new Date() }))
        ];

        // Save to MongoDB
        if (collection) {
            const updateDoc: any = {
                $push: { steps: { $each: stepsToSave } },
                $setOnInsert: { createdAt: new Date() },
                $set: { updatedAt: new Date() }
            };

            // Link wallet if provided
            if (walletAddress) {
                updateDoc.$set.walletAddress = walletAddress;
            }

            await collection.updateOne(
                { sessionId },
                updateDoc,
                { upsert: true }
            );
        }

        // Helper to handle BigInt serialization
        /* 
        const jsonReplacer = (key: string, value: any) => {
            if (typeof value === 'bigint') {
                return value.toString();
            }
            return value;
        };
        */

        // agentSteps is already sanitized (BigInts -> strings) by sanitizeBigInts above
        const response = NextResponse.json({ steps: agentSteps });
        
        if (isNewSession) {
            response.cookies.set('bizfun_session', sessionId, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/' 
            });
        }

        return response;

    } catch (error) {
        console.error('Agent API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
