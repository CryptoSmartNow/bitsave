import { NextResponse } from 'next/server';
import { BIZSWAP_CHAT_CONTEXT } from '@/lib/bizswap-knowledge-base';

const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
const CHAINGPT_URL = 'https://api.chaingpt.org/chat/stream';

function extractReply(data: Record<string, unknown>): string {
    return (data.message || data.answer || data.response || data.text || data.bot || JSON.stringify(data)) as string;
}

export async function POST(request: Request) {
    try {
        if (!CHAINGPT_API_KEY) {
            return NextResponse.json({ error: 'Bizswap AI is not configured' }, { status: 503 });
        }

        const body = await request.json();
        const { question, chatHistory } = body;

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // Build the prompt with context
        const fullQuestion = chatHistory && chatHistory.length > 0
            ? `Previous conversation:\n${chatHistory.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${question}`
            : question;

        const response = await fetch(CHAINGPT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHAINGPT_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'general_assistant',
                question: `${BIZSWAP_CHAT_CONTEXT}\n\nUser question: ${fullQuestion}`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ChainGPT API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to get response from Bizswap Bot' },
                { status: response.status }
            );
        }

        // ChainGPT may return streaming or JSON — handle both
        const contentType = response.headers.get('content-type') || '';
        let rawReply: string;

        if (contentType.includes('application/json')) {
            const data = await response.json();
            rawReply = extractReply(data);
        } else {
            const text = await response.text();
            try {
                const parsed = JSON.parse(text);
                rawReply = extractReply(parsed);
            } catch {
                rawReply = text;
            }
        }

        return NextResponse.json({ reply: rawReply, status: 'success' });
    } catch (error) {
        console.error('Bizswap Bot error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}
