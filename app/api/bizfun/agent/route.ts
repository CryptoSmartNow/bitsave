
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
        const sessionId = req.cookies.get('bizfun_session')?.value;
        if (!sessionId) {
            return NextResponse.json({ steps: [] });
        }

        const collection = await getChatSessionsCollection();
        if (!collection) {
             return NextResponse.json({ steps: [] });
        }

        const session = await collection.findOne({ sessionId });
        return NextResponse.json({ steps: session?.steps || [] });

    } catch (error) {
        console.error('Agent API GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        let sessionId = req.cookies.get('bizfun_session')?.value;
        let isNewSession = false;
        
        if (!sessionId) {
            sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
            isNewSession = true;
        }

        // Collect all steps from the generator
        const agentSteps = [];

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

        // Prepare steps to save (User message + Agent responses)
        const userStep = { type: 'message', content: `> ${message}`, timestamp: new Date() };
        
        // Add timestamp to agent steps
        const stepsToSave = [
            userStep,
            ...agentSteps.map(step => ({ ...step, timestamp: new Date() }))
        ];

        // Save to MongoDB
        const collection = await getChatSessionsCollection();
        if (collection) {
            await collection.updateOne(
                { sessionId },
                { 
                    $push: { steps: { $each: stepsToSave } } as any,
                    $setOnInsert: { createdAt: new Date() },
                    $set: { updatedAt: new Date() }
                },
                { upsert: true }
            );
        }

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
