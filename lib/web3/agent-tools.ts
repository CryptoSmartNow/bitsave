import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { PREDICTION_MARKET_FACTORY_ABI, PREDICTION_MARKET_ABI, MOCK_USDC_ABI } from './abi';
import { BIZFI_CONFIG } from './config';

// Initialize clients
const privateKey = process.env.AGENT_PRIVATE_KEY || process.env.BIZFI_AGENT_PRIVATE_KEY || process.env.REFERRAL_SIGNER_PRIVATE_KEY;
const account = privateKey ? privateKeyToAccount(privateKey as `0x${string}`) : null;

// Determine chain based on config or default to Base Sepolia for dev
const chain = BIZFI_CONFIG.rpcUrl.includes('sepolia') ? baseSepolia : base;

const publicClient = createPublicClient({
    chain,
    transport: http(BIZFI_CONFIG.rpcUrl)
});

const walletClient = account ? createWalletClient({
    account,
    chain,
    transport: http(BIZFI_CONFIG.rpcUrl)
}) : null;

export const TOOLS_DESCRIPTION = `
You have access to the following BizFi Protocol tools. To use them, output a JSON object with "action" and "parameters".

1. create_market
   - Description: Propose a new prediction market. The agent will prepare the transaction parameters for the user to sign.
   - Parameters:
     - metadataUri (string): IPFS URI or URL for market metadata.
     - tradingDeadline (number|string): Unix timestamp (seconds) or date string (e.g. "2026-03-31").
     - resolveTime (number|string): Unix timestamp (seconds) or date string (e.g. "2026-08-01").
   - Example: { "action": "create_market", "parameters": { "metadataUri": "ipfs://...", "tradingDeadline": "2026-03-31", "resolveTime": "2026-08-01" } }

2. buy_shares
   - Description: Buy Yes or No shares in a market.
   - Parameters:
     - marketAddress (string): Address of the prediction market contract.
     - outcome (string): "YES" or "NO".
     - amount (string): Amount of USDC to spend (e.g., "10.5").
   - Example: { "action": "buy_shares", "parameters": { "marketAddress": "0x...", "outcome": "YES", "amount": "50" } }

3. approve_usdc
   - Description: Approve a market contract to spend USDC.
   - Parameters:
     - spenderAddress (string): Address to approve (usually the market address).
     - amount (string): Amount to approve (e.g., "100").
   - Example: { "action": "approve_usdc", "parameters": { "spenderAddress": "0x...", "amount": "100" } }

4. mint_usdc
   - Description: Mint testnet USDC to the agent's wallet using the faucet.
   - Parameters: {}
   - Example: { "action": "mint_usdc", "parameters": {} }

5. resolve_market
   - Description: Resolve a market (only if you are the oracle). Outcome: 1 for YES, 2 for NO.
   - Parameters:
     - marketAddress (string): Address of the prediction market.
     - outcome (number): 1 for YES, 2 for NO.
   - Example: { "action": "resolve_market", "parameters": { "marketAddress": "0x...", "outcome": 1 } }

6. redeem_winnings
   - Description: Redeem winnings from a resolved market.
   - Parameters:
     - marketAddress (string): Address of the prediction market.
   - Example: { "action": "redeem_winnings", "parameters": { "marketAddress": "0x..." } }
`;

export const agentTools = {
    async mintUsdc() {
        if (!walletClient || !account) throw new Error("Agent wallet not configured");
        
        if (chain.id === 8453) {
            throw new Error("Cannot mint USDC on Base Mainnet. Please fund the agent wallet with real USDC.");
        }

        console.log(`Minting USDC from faucet...`);
        
        const hash = await walletClient.writeContract({
            address: BIZFI_CONFIG.contracts.mockUsdc as `0x${string}`,
            abi: MOCK_USDC_ABI,
            functionName: 'faucet',
            args: []
        });
        
        return { success: true, txHash: hash, message: `Minted 1000 USDC. Tx: ${hash}` };
    },

    async resolveMarket(params: { marketAddress: string, outcome: number }) {
        if (!walletClient || !account) throw new Error("Agent wallet not configured");

        console.log(`Resolving market ${params.marketAddress} with outcome ${params.outcome} (1=YES, 2=NO)...`);

        const hash = await walletClient.writeContract({
            address: params.marketAddress as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'resolve',
            args: [params.outcome]
        });

        return { success: true, txHash: hash, message: `Market resolved. Tx: ${hash}` };
    },

    async redeemWinnings(params: { marketAddress: string }) {
        if (!walletClient || !account) throw new Error("Agent wallet not configured");

        console.log(`Redeeming winnings from market ${params.marketAddress}...`);

        const hash = await walletClient.writeContract({
            address: params.marketAddress as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: 'redeem',
            args: []
        });

        return { success: true, txHash: hash, message: `Redeemed winnings. Tx: ${hash}` };
    },

    async createMarket(params: { metadataUri: string, tradingDeadline: number | string, resolveTime: number | string }) {
        // Helper to convert to unix seconds
        const toUnix = (val: number | string): bigint => {
            let ms: number;
            if (typeof val === 'string') {
                ms = Date.parse(val);
                if (isNaN(ms)) throw new Error(`Invalid date string: ${val}`);
            } else {
                ms = val;
                if (ms < 100000000000) {
                     return BigInt(ms);
                }
            }
            return BigInt(Math.floor(ms / 1000));
        };

        const tradingDeadline = toUnix(params.tradingDeadline);
        const resolveTime = toUnix(params.resolveTime);

        console.log(`Parsed dates: Deadline=${tradingDeadline} (${new Date(Number(tradingDeadline)*1000).toISOString()}), Resolve=${resolveTime} (${new Date(Number(resolveTime)*1000).toISOString()})`);

        // We use a placeholder for the oracle if not provided, usually the user will set it.
        // For the proposal, we can default to the user's address (handled by frontend) or a known oracle.
        // For now, let's leave it to be filled by the frontend or use a default if available.
        // But wait, the ABI requires an oracle address in the args. 
        // We'll use a placeholder "0x0000000000000000000000000000000000000000" which the frontend should replace with the user's address.
        const oracle = "0x0000000000000000000000000000000000000000"; 
        
        const factoryAddress = BIZFI_CONFIG.contracts.predictionMarketFactory as `0x${string}`;
        const usdcAddress = BIZFI_CONFIG.contracts.mockUsdc as `0x${string}`;
        
        const creationFee = BigInt(10000000); // 10 USDC (10e6)
        
        // _b (liquidity parameter) must be > 0 for CPMM/LMSR
        // Using 5 USDC (5000000) as default liquidity to align with SKILL.md "initialLiquidity" recommendation
        const liquidityParam = BigInt(5000000); 

        // Instead of executing, we return the proposal details
        return {
            proposal: {
                type: 'create_market',
                description: `Create Market: ${params.metadataUri}`,
                chainId: chain.id,
                contracts: {
                    factory: factoryAddress,
                    usdc: usdcAddress
                },
                params: {
                    oracle, // Frontend should replace this with user address
                    tradingDeadline: tradingDeadline.toString(),
                    resolveTime: resolveTime.toString(),
                    b: liquidityParam.toString(),
                    metadataUri: params.metadataUri,
                    creationFee: creationFee.toString()
                },
                rawArgs: [oracle, tradingDeadline, resolveTime, liquidityParam, params.metadataUri]
            },
            message: "I've prepared the market creation transaction for you. Please sign it below."
        };
    },

    async buyShares(params: { marketAddress: string, outcome: string, amount: string }) {
        if (!walletClient || !account) throw new Error("Agent wallet not configured");

        const amountWei = parseUnits(params.amount, 6); // USDC has 6 decimals
        const isYes = params.outcome.toUpperCase() === 'YES';

        console.log(`Buying ${params.outcome} shares in ${params.marketAddress} for ${params.amount} USDC`);

        const hash = await walletClient.writeContract({
            address: params.marketAddress as `0x${string}`,
            abi: PREDICTION_MARKET_ABI,
            functionName: isYes ? 'buyYes' : 'buyNo',
            args: [amountWei]
        });

        return { success: true, txHash: hash, message: `Bought ${params.outcome} shares. Tx: ${hash}` };
    },

    async approveUsdc(params: { spenderAddress: string, amount: string }) {
        if (!walletClient || !account) throw new Error("Agent wallet not configured");

        const amountWei = parseUnits(params.amount, 6);

        console.log(`Approving ${params.spenderAddress} to spend ${params.amount} USDC`);

        const hash = await walletClient.writeContract({
            address: BIZFI_CONFIG.contracts.mockUsdc as `0x${string}`,
            abi: MOCK_USDC_ABI,
            functionName: 'approve',
            args: [params.spenderAddress as `0x${string}`, amountWei]
        });

        return { success: true, txHash: hash, message: `Approved USDC. Tx: ${hash}` };
    }
};
