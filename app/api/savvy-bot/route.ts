import { NextResponse } from 'next/server';

const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
const CHAINGPT_URL = 'https://api.chaingpt.org/chat/stream';

const SYSTEM_CONTEXT = `You are Savvy Bot, the official AI personal finance assistant for Bitsave — a decentralized SaveFi (Savings Finance) platform. 

About Bitsave:
- Users create time-locked savings plans on-chain across multiple networks (Base, Celo, Lisk, Avalanche, BSC)
- Supported tokens: USDC, ETH, cUSD, CELO, USDGLO, GoodDollar ($G), AVAX
- Early withdrawal incurs a penalty (5%, 10%, 15%, or 20%) to encourage discipline
- Users earn $BTS loyalty tokens as rewards based on savings activity
- Savvy Names are unique usernames (like @username) for peer-to-peer sharing
- Group Savings lets friends & family save together toward shared goals
- BizFi module allows businesses to register on-chain with EAS attestations
- BizFun offers prediction markets

Your role:
- Help users understand savings strategies, DeFi concepts, and Bitsave features
- Provide personal finance tips and budgeting advice
- Explain how different networks and tokens work
- Be encouraging and supportive about savings goals
- Keep responses concise and actionable
- Use a friendly, professional tone
- If asked about specific financial investments, remind users you provide general education, not financial advice

When a user asks to create a savings goal or says something like "help me save" or "I want to save for X":
1. Ask what they want to save for (the goal name)
2. Ask how much they want to save (target amount)
3. Suggest a reasonable timeline based on the amount
4. Recommend a token (USDC for stability, ETH for growth potential)
5. Recommend a network (Base for low fees, Celo for mobile-friendly)
6. Suggest a penalty percentage (higher = more discipline, recommend 10-15% for most users)
7. Summarize their plan and tell them to go to "Create Plan" in the sidebar to set it up`;

const QUIZ_CONTEXT = `You are Savvy Bot running a financial literacy quiz. Generate EXACTLY 5 multiple-choice questions about the requested topic. You MUST respond with valid JSON only — no markdown, no code fences, no explanation text.

Topics can include: DeFi basics, savings strategies, crypto terminology, blockchain fundamentals, Bitsave features, personal finance, risk management.

Response format (STRICT JSON, no other text):
{
  "title": "Quiz title",
  "questions": [
    {
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

The "correct" field is the zero-based index of the correct option. Make questions educational and varied in difficulty.`;

const CHALLENGE_CONTEXT = `You are Savvy Bot suggesting a savings challenge. Generate a practical, motivating savings challenge. You MUST respond with valid JSON only — no markdown, no code fences, no explanation text.

Response format (STRICT JSON, no other text):
{
  "title": "Challenge name",
  "description": "What the user needs to do",
  "duration": "e.g., 7 days, 30 days",
  "goal": "Specific measurable goal",
  "tips": ["tip1", "tip2", "tip3"],
  "difficulty": "Easy | Medium | Hard"
}

Make challenges realistic and tied to actual savings behavior on Bitsave (locking tokens, maintaining saving streaks, trying new networks, etc).`;

function extractReply(data: Record<string, unknown>): string {
    return (data.message || data.answer || data.response || data.text || data.bot || JSON.stringify(data)) as string;
}

export async function POST(request: Request) {
    try {
        if (!CHAINGPT_API_KEY) {
            return NextResponse.json({ error: 'Savvy Bot is not configured' }, { status: 503 });
        }

        const body = await request.json();
        const { question, chatHistory, mode = 'chat' } = body;

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        // Select system context based on mode
        let systemPrompt: string;
        switch (mode) {
            case 'quiz':
                systemPrompt = QUIZ_CONTEXT;
                break;
            case 'challenge':
                systemPrompt = CHALLENGE_CONTEXT;
                break;
            default:
                systemPrompt = SYSTEM_CONTEXT;
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
                question: `${systemPrompt}\n\nUser question: ${fullQuestion}`,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ChainGPT API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to get response from Savvy Bot' },
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

        // For quiz and challenge modes, try to extract JSON from the response
        if (mode === 'quiz' || mode === 'challenge') {
            try {
                // Try to extract JSON from the response (it may be wrapped in markdown code fences)
                let jsonStr = rawReply;
                const jsonMatch = rawReply.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1].trim();
                }
                const structured = JSON.parse(jsonStr);
                return NextResponse.json({ reply: rawReply, structured, mode, status: 'success' });
            } catch {
                // If JSON parsing fails, return raw reply
                return NextResponse.json({ reply: rawReply, mode, status: 'success' });
            }
        }

        return NextResponse.json({ reply: rawReply, status: 'success' });
    } catch (error) {
        console.error('Savvy Bot error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}
