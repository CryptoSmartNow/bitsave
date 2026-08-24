import { NextResponse } from 'next/server';

const CHAINGPT_API_KEY = process.env.CHAINGPT_API_KEY;
const CHAINGPT_URL = 'https://api.chaingpt.org/chat/stream';

const SYSTEM_CONTEXT = `You are Savvy Bot, the official AI personal finance and savings assistant for Bitsave — a decentralized SaveFi (Savings Finance) platform.

About Bitsave:
- Users create time-locked savings plans on-chain across multiple networks (Base, Celo, Lisk, Avalanche, BSC).
- Supported tokens: USDC, ETH, cUSD, CELO, USDGLO, GoodDollar ($G), AVAX, BNB, USDT.
- Early withdrawal incurs an optional penalty (5%, 10%, 15%, or 20%) to build discipline.
- Users earn $BTS loyalty reward tokens based on on-chain savings activity.
- Savvy Names are unique usernames (like @username) for peer-to-peer sharing and referrals.
- Shared Vaults (Group Savings) let friends & family pool funds together toward shared goals.

Your personality:
- Friendly, encouraging, intelligent, and concise. Use clear markdown formatting.
- Provide practical budgeting, personal finance, and crypto savings tips.
- Remind users that you provide general financial education, not financial advice.`;

const QUIZ_CONTEXT = `You are Savvy Bot running a financial literacy quiz. Generate EXACTLY 5 multiple-choice questions about the requested topic. You MUST respond with valid JSON only — no markdown, no code fences, no explanation text.

Response format (STRICT JSON):
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct": 0,
      "explanation": "Brief explanation of why this answer is correct"
    }
  ]
}`;

const CHALLENGE_CONTEXT = `You are Savvy Bot generating a personal savings challenge. Generate a motivating crypto savings challenge. You MUST respond with valid JSON only — no markdown, no code fences, no explanation text.

Response format (STRICT JSON):
{
  "title": "Challenge Name",
  "description": "What the user needs to do",
  "duration": "7 days",
  "goal": "Specific measurable goal",
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "difficulty": "Easy"
}`;

function generateSmartFallback(question: string, mode: string) {
  const q = question.toLowerCase();

  if (mode === 'quiz') {
    return {
      title: 'Crypto & DeFi Savings Quiz',
      questions: [
        {
          question: 'What does DeFi stand for?',
          options: ['A) Digital Finance', 'B) Decentralized Finance', 'C) Derivative Finance', 'D) Direct Finance'],
          correct: 1,
          explanation: 'DeFi stands for Decentralized Finance — peer-to-peer financial services built on public blockchains.'
        },
        {
          question: 'What is the primary benefit of BitSave time-locked savings?',
          options: ['A) High gas fees', 'B) Enforcing discipline through early withdrawal penalties', 'C) Centralized custody', 'D) Required credit checks'],
          correct: 1,
          explanation: 'Time-locked savings encourage financial discipline by locking funds until maturity with custom penalty rates.'
        },
        {
          question: 'Which network is known for sub-cent transaction fees on BitSave?',
          options: ['A) Ethereum Mainnet', 'B) Base Network', 'C) Bitcoin', 'D) Solana'],
          correct: 1,
          explanation: 'Base (Layer 2) offers extremely low transaction costs, perfect for frequent automated micro-savings.'
        },
        {
          question: 'What are $BTS tokens on BitSave?',
          options: ['A) Stablecoins pegged to USD', 'B) Platform loyalty tokens earned from savings activity', 'C) Governance-only tokens with no utility', 'D) Mining fees'],
          correct: 1,
          explanation: '$BTS tokens are loyalty rewards automatically earned as you save and lock funds on BitSave.'
        },
        {
          question: 'Why choose stablecoins (like USDC or cUSD) for emergency savings?',
          options: ['A) They have 100x volatility', 'B) Price stability pegged to the US Dollar minimizes market risk', 'C) They cannot be withdrawn', 'D) Gas is always free'],
          correct: 1,
          explanation: 'Stablecoins maintain price parity with fiat currencies, protecting your savings from crypto market swings.'
        }
      ]
    };
  }

  if (mode === 'challenge') {
    return {
      title: '7-Day Consistent Saver Challenge',
      description: 'Build a solid habit by creating a micro-savings plan each day on Base or Celo.',
      duration: '7 Days',
      goal: 'Deposit and lock at least $5 every day for 7 consecutive days',
      tips: [
        'Use Base or Celo to keep gas fees under $0.01 per transaction.',
        'Choose a 10% penalty to build strong financial discipline.',
        'Earn bonus $BTS loyalty reward tokens for completing your streak.'
      ],
      difficulty: 'Easy'
    };
  }

  // Smart chat responses based on keywords
  if (q.includes('fee') || q.includes('base') || q.includes('celo') || q.includes('network') || q.includes('lisk') || q.includes('cheap')) {
    return `### ⚡ Comparing Networks on BitSave

Here is how our supported networks compare for savings:

1. **Base (L2)**:
   - **Fees**: < $0.01 per transaction
   - **Best For**: Micro-savings, frequent deposits, USDC & ETH.
2. **Celo**:
   - **Fees**: Ultra-low (< $0.005)
   - **Best For**: Mobile-first savings, cUSD, cNGN, and GoodDollar ($G).
3. **Lisk**:
   - **Fees**: Low cost on emerging ecosystem
   - **Best For**: Long-term holdings & ecosystem incentives.
4. **BNB Chain & Avalanche**:
   - **Best For**: Deep liquidity, USDT, and native token growth.

💡 **Recommendation**: For daily or weekly savings, **Base** and **Celo** provide the smoothest, lowest-cost experience!`;
  }

  if (q.includes('penalty') || q.includes('withdraw') || q.includes('early')) {
    return `### 🛡️ Understanding BitSave Penalties

BitSave uses **customizable penalties** to help you stay committed to your financial goals:

- **10% (Flexible)**: Great for beginners or general savings goals where emergencies might arise.
- **15% (Standard)**: The balanced sweet spot to deter impulsive spending.
- **20% (Strict)**: For high-priority goals (like emergency funds or big purchases) where you want maximum discipline.

🔒 **How it works**: If you withdraw *before* your maturity date, the penalty percentage is deducted and redistributed to reward loyal savers in $BTS. When you withdraw *at or after* maturity, **0% penalty** is charged!`;
  }

  if (q.includes('bts') || q.includes('reward') || q.includes('loyalty')) {
    return `### 💎 $BTS Loyalty Rewards

**$BTS** is the official loyalty token of the BitSave ecosystem:

- **Earn by Saving**: Every dollar locked in active savings plans accrues $BTS rewards over time.
- **Consistency Bonus**: Maintaining streak challenges and reaching full maturity boosts your rewards.
- **Utility**: Unlock exclusive platform features, higher reward tiers, and governance participation.

Track your accumulated $BTS anytime directly in your **Dashboard Overview**! 🚀`;
  }

  return `Hello! I'm **Savvy Bot**, your BitSave financial companion. 🤖✨

I can help you with:
- 💡 **Smart Savings Strategies**: Choosing the best tokens (USDC, ETH, cUSD, $G) for your goals.
- ⚡ **Network Comparisons**: Finding the lowest gas fees (Base, Celo, Lisk).
- 👥 **Shared Vaults**: Setting up collaborative group goals with family & friends.
- 🎯 **Creating Plans**: Step-by-step guidance on lock times and penalty rates.

What would you like to explore today? You can also try our **Quizzes** or **Challenges** tabs above!`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, chatHistory, mode = 'chat' } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // If ChainGPT API key is not set, use resilient smart advisor fallback immediately
    if (!CHAINGPT_API_KEY) {
      const fallback = generateSmartFallback(question, mode);
      if (typeof fallback === 'object' && 'questions' in fallback) {
        return NextResponse.json({ structured: fallback, mode, status: 'success' });
      }
      if (typeof fallback === 'object' && 'title' in fallback) {
        return NextResponse.json({ structured: fallback, mode, status: 'success' });
      }
      return NextResponse.json({ reply: fallback as string, status: 'success' });
    }

    // Select system context based on mode
    let systemPrompt = SYSTEM_CONTEXT;
    if (mode === 'quiz') systemPrompt = QUIZ_CONTEXT;
    if (mode === 'challenge') systemPrompt = CHALLENGE_CONTEXT;

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
        stream: mode === 'chat'
      }),
    });

    if (!response.ok) {
      console.warn('ChainGPT upstream issue, delivering smart fallback:', response.status);
      const fallback = generateSmartFallback(question, mode);
      if (typeof fallback === 'object') {
        return NextResponse.json({ structured: fallback, mode, status: 'success' });
      }
      return NextResponse.json({ reply: fallback as string, status: 'success' });
    }

    if (mode === 'chat') {
      return new Response(response.body, {
        headers: {
          'Content-Type': response.headers.get('content-type') || 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // For quiz/challenge JSON parsing
    const text = await response.text();
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();

    try {
      const structured = JSON.parse(jsonStr);
      return NextResponse.json({ reply: text, structured, mode, status: 'success' });
    } catch {
      const fallback = generateSmartFallback(question, mode);
      return NextResponse.json({ reply: text, structured: fallback, mode, status: 'success' });
    }
  } catch (error) {
    console.error('Savvy Bot error:', error);
    const fallback = generateSmartFallback('help', 'chat');
    return NextResponse.json({ reply: fallback, status: 'success' });
  }
}
