# Testing BizMart Agent

This guide explains how to test the BizMart AI Agent, including its web3 capabilities (Prediction Markets).

## Prerequisites

1.  **Environment Variables**: Ensure your `.env` file has the following:
    ```env
    # Required for Web3
    AGENT_PRIVATE_KEY=0x...                  # Private key with ETH (Base)
    PREDICTION_MARKET_FACTORY_ADDRESS=0x...  # Address of the Factory contract
    MOCK_USDC_ADDRESS=0x...                  # Address of the USDC contract
    
    # Required for AI
    OPENAI_API_KEY=sk-... (or ANTHROPIC_API_KEY)
    ```

2.  **Dependencies**: Run `npm install` to ensure `viem` and other tools are installed.

## Step 1: Verify Web3 Configuration

Run the verification script to check if your wallet and contracts are correctly configured:

```bash
npx tsx scripts/verify-web3.ts
```

This script will:
- Check connection to Base RPC.
- Verify the Factory contract exists.
- Check if your Agent wallet has ETH for gas.

## Step 2: Test Agent Logic (CLI)

You can interact with the agent directly in your terminal to test its reasoning and tool execution.

### Test 1: General Chat
```bash
npx tsx scripts/bizmart-agent.ts --message "Who are you?"
```
**Expected Output**: The agent should identify itself as BizMart Agent (🦞) and mention its capabilities.

### Test 2: Create a Prediction Market
```bash
npx tsx scripts/bizmart-agent.ts --message "Create a prediction market for 'Will Bitcoin hit 100k in 2025?'"
```
**Expected Output**:
1.  **Thought**: "Executing tool: create_market"
2.  **Action**: JSON payload with `create_market` parameters.
3.  **Result**: "✅ Action Executed: Market creation transaction sent: 0x..."

### Test 3: Buy Shares
```bash
npx tsx scripts/bizmart-agent.ts --message "Buy 10 YES shares in the latest market"
```
*(Note: You might need to provide a specific market address if the agent doesn't know context, e.g., "Buy 10 YES shares in market 0x123...")*

## Troubleshooting

- **"Agent wallet not configured"**: Check `AGENT_PRIVATE_KEY` in `.env`.
- **"Insufficient funds"**: Send some ETH (Base) to the agent's address.
- **"OpenClaw connection failed"**: Check your `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
