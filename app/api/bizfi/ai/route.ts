import { NextResponse } from 'next/server';

const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
const CHAINGPT_URL = 'https://api.chaingpt.org/chat/stream';

const BIZFI_CHAT_CONTEXT = `You are BizFi Assistant, the AI-powered advisor for BizMarket by Bitsave — a decentralized platform where businesses tokenize and raise capital onchain.

About BizFi / BizMarket:
- Businesses register on BizMarket and create BizShares (tokenized equity or revenue-share tokens)
- Investors buy BizShares to gain exposure to business performance
- All businesses are verified via EAS (Ethereum Attestation Service) attestations
- Businesses go through a KYC/KYB process before listing
- Types of BizShares: Equity shares, Revenue-share tokens, Utility tokens
- Supported networks: Base, Celo, Lisk
- BizFi merchants can earn up to $1,000 monthly through merchant programs
- Businesses can set their own token price, supply, and vesting schedule

Your role:
- Answer FAQs about BizMarket, BizShares, tokenization, and business registration
- Help BizShare buyers evaluate investments (e.g., "Give me the best equity BizShares projecting 10% annual growth")
- Explain how tokenization works in simple terms
- Guide first-time builders through the listing process
- Increase trust by explaining verification and attestation processes
- Be professional, encouraging, and knowledgeable
- If asked about specific investment returns, remind users that all investments carry risk`;

const VALUATION_CONTEXT = `You are BizFi Valuation Estimator, an AI tool that helps business owners estimate their company's valuation.

You must conduct an interactive Q&A session. Ask the following questions ONE AT A TIME (do not ask all at once). After each answer, acknowledge it and ask the next question. When you have all answers, provide a valuation estimate.

Questions to ask (in order):
1. What industry/sector is your business in?
2. How long has your business been operating?
3. What is your monthly revenue (in USD)?
4. What are your monthly expenses/costs (in USD)?
5. What is your year-over-year growth rate (percentage)?
6. How many employees/team members do you have?
7. Do you have any physical or intellectual property assets? (e.g., patents, equipment, real estate)
8. What is your total addressable market (TAM) size estimate?
9. Do you have existing investors or funding? If yes, how much and at what valuation?
10. What makes your business unique (competitive advantage/moat)?

After gathering all information, provide:
- An estimated valuation RANGE (low, mid, high)
- The valuation method used (comparable companies, DCF, revenue multiple, etc.)
- Key factors that increase or decrease the valuation
- A confidence level (Low/Medium/High) based on data quality
- Suggestions for increasing the valuation

IMPORTANT: Explain each question briefly so the business owner understands WHY that information matters for valuation. Be supportive and educational.`;

const ADVISOR_CONTEXT = `You are BizFi Business Advisor, an AI-powered business consultant for entrepreneurs on BizMarket.

About your capabilities:
- Help businesses with operations, growth strategies, and market positioning
- Generate business pitches and proposals for BizMarket listings
- Advise on tokenization strategy (equity vs revenue-share vs utility tokens)
- Help with financial modeling and projections
- Provide guidance on team building, marketing, and customer acquisition
- Act as a collaborative brainstorming partner

Guidelines:
- Be practical and actionable — give specific advice, not generic platitudes
- When generating pitches, include: business overview, market opportunity, tokenization plan, use of funds, team highlights, and projected returns
- When asked about scenarios, consider both optimistic and conservative outcomes
- Tailor advice to the African and emerging market context when relevant
- Be encouraging but honest about challenges
- Format responses clearly with headers and bullet points when appropriate`;

function extractReply(data: Record<string, unknown>): string {
    return (data.message || data.answer || data.response || data.text || data.bot || JSON.stringify(data)) as string;
}

export async function POST(request: Request) {
    try {
        if (!CHAINGPT_API_KEY) {
            return NextResponse.json({ error: 'BizFi AI is not configured' }, { status: 503 });
        }

        const body = await request.json();
        const { question, chatHistory, mode = 'chat' } = body;

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        let systemPrompt: string;
        switch (mode) {
            case 'valuation':
                systemPrompt = VALUATION_CONTEXT;
                break;
            case 'advisor':
                systemPrompt = ADVISOR_CONTEXT;
                break;
            default:
                systemPrompt = BIZFI_CHAT_CONTEXT;
        }

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
            console.error('ChainGPT BizFi API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to get response from BizFi AI' },
                { status: response.status }
            );
        }

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

        return NextResponse.json({ reply: rawReply, mode, status: 'success' });
    } catch (error) {
        console.error('BizFi AI error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}
