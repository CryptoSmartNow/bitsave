
import { NextRequest, NextResponse } from 'next/server';
import { BizMartAgent } from '@/lib/bizmart-agent';

// Initialize agent (stateless for now, or use a store/db for context)
// For a real production app, we'd use a session store.
const agent = new BizMartAgent();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Generate or retrieve session ID (simple implementation for now)
        const sessionId = req.cookies.get('bizfun_session')?.value || 'session-' + Date.now();

        // Collect all steps from the generator
        const steps = [];
        for await (const step of agent.processMessage(message, sessionId)) {
            steps.push(step);
        }

        return NextResponse.json({ steps });

    } catch (error) {
        console.error('Agent API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
