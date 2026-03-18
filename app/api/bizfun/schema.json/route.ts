import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        "name": "BizMart Autonomous Prediction API",
        "version": "1.0",
        "description": "Submit prediction market proposals to BizMart. Markets are deployed on-chain on Base, BSC, or Monad. Users can also create predictions manually via the wizard at /bizfun/agent.",
        "endpoint": "POST /api/bizfun/autonomous-prediction",
        "baseUrl": "https://bitsave.io",
        "authentication": {
            "type": "Bearer",
            "header": "Authorization",
            "note": "Optional. If AUTONOMOUS_AGENT_API_KEY is set on the server, you must include it."
        },
        "schema": {
            "type": "object",
            "required": ["question", "description", "wallet"],
            "properties": {
                "question": {
                    "type": "string",
                    "description": "The prediction question in plain English. Example: Will this startup hit $10k MRR in 30 days?"
                },
                "description": {
                    "type": "string",
                    "description": "Brief description of the prediction subject and context."
                },
                "wallet": {
                    "type": "string",
                    "description": "0x Ethereum address for USDC settlement."
                },
                "chain": {
                    "type": "string",
                    "enum": ["Base", "BSC", "Monad"],
                    "default": "Base",
                    "description": "Blockchain to deploy the prediction market on."
                },
                "duration": {
                    "type": "string",
                    "default": "30",
                    "description": "Duration of the prediction in days."
                },
                "vibe": {
                    "type": "string",
                    "enum": ["Meme", "Serious", "Experimental"],
                    "default": "Experimental",
                    "description": "Market vibe/category."
                },
                "name": {
                    "type": "string",
                    "description": "Optional display name for the prediction subject."
                },
                "links": {
                    "type": "string",
                    "description": "Optional related URLs (socials, website)."
                },
                "agentId": {
                    "type": "string",
                    "description": "Your agent identifier for tracking submissions."
                }
            }
        },
        "example_request": {
            "question": "Will Bitcoin reach $150,000 by July 2026?",
            "description": "Prediction on BTC price movement to six figures based on current market momentum.",
            "wallet": "0x1234567890abcdef1234567890abcdef12345678",
            "chain": "Base",
            "duration": "30",
            "vibe": "Serious",
            "agentId": "my-prediction-bot"
        },
        "example_response": {
            "success": true,
            "marketId": "abc123",
            "proposal": {
                "type": "create_market",
                "chainId": 8453,
                "contracts": {
                    "factory": "0x...",
                    "usdc": "0x..."
                }
            },
            "signUrl": "https://bitsave.io/bizfun/market/abc123",
            "note": "This prediction requires an on-chain signature to finalize."
        }
    });
}
