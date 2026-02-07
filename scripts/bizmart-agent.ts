
import { MoltbookClient } from '../utils/moltbook';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * BizMart Agent - "The Real Deal"
 * 
 * This agent acts as an autonomous entity for the BizFi ecosystem.
 * It uses the Moltbook API to communicate its actions to the AI social network.
 */
class BizMartAgent {
    private moltbook: MoltbookClient;
    private name: string;

    constructor(name: string, moltbookApiKey: string) {
        this.name = name;
        this.moltbook = new MoltbookClient(moltbookApiKey);
    }

    async start() {
        console.log(`[${this.name}] 🚀 Agent starting up...`);
        
        // 1. Verify Identity on Moltbook
        console.log(`[${this.name}] 🔐 Verifying Moltbook identity...`);
        const verified = await this.moltbook.verifyIdentity();
        if (!verified) {
            console.warn(`[${this.name}] ⚠️  Could not verify identity. Proceeding with caution (some actions may fail).`);
        } else {
            console.log(`[${this.name}] ✅ Identity verified.`);
        }

        // 2. Main Workflow Loop
        try {
            await this.runWorkflow();
        } catch (error) {
            console.error(`[${this.name}] ❌ Workflow error:`, error);
        }
    }

    private async runWorkflow() {
        // Step 1: Analyze Business
        await this.think("Analyzing incoming business proposal: 'GreenEnergy Co'");
        const businessData = {
            name: "GreenEnergy Co",
            symbol: "GNRG",
            valuation: 5_000_000,
            chain: "Base"
        };
        console.log(`[${this.name}] 📊 Business Analysis Complete:`, businessData);

        // Step 2: Tokenize (Simulation of On-Chain Interaction)
        // In a full production env, this would call the BizFi contract.
        await this.act("tokenize_business", businessData);

        // Step 3: Deploy Prediction Market
        await this.think("Determining prediction market parameters...");
        const marketData = {
            question: "Will GreenEnergy Co surpass $1M revenue in Q3?",
            resolutionDate: "2026-09-30",
            liquidity: "50k USDC"
        };
        await this.act("deploy_prediction_market", marketData);

        // Step 4: Post to Moltbook (REAL API CALL)
        const postContent = `Just launched $${businessData.symbol} on BizFi! Prediction markets are live. 🌿⚡ #RealWorldAssets #Base`;
        console.log(`[${this.name}] 📢 Posting to Moltbook...`);
        
        try {
            await this.moltbook.createPost({
                submolt: "bizfi", // Target specific community if exists, or 'general'
                title: `New Listing: ${businessData.name}`,
                content: postContent
            });
            console.log(`[${this.name}] ✅ Post successful!`);
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.error(`[${this.name}] ❌ Authentication failed. Please check your MOLTBOOK_API_KEY.`);
            } else {
                console.error(`[${this.name}] ❌ Failed to post:`, error.message);
            }
        }
    }

    private async think(thought: string) {
        console.log(`[${this.name}] 🧠 Thinking: "${thought}"`);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    private async act(action: string, data: any) {
        console.log(`[${this.name}] ⚡ Executing Action: [${action}]`);
        console.dir(data, { depth: null, colors: true });
        // Simulate execution time
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function main() {
    const apiKey = process.env.MOLTBOOK_API_KEY;
    
    if (!apiKey) {
        console.error("❌ Error: MOLTBOOK_API_KEY is not set in environment variables.");
        console.error("Please create a .env file or set the variable.");
        console.error("Example: MOLTBOOK_API_KEY=mb_live_...");
        process.exit(1);
    }

    const agent = new BizMartAgent("BizMart", apiKey);
    await agent.start();
}

main().catch(console.error);
