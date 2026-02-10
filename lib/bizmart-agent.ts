
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { MoltbookClient } from '../utils/moltbook';
import { agentTools, TOOLS_DESCRIPTION } from './web3/agent-tools';
import { getChatSessionsCollection, getMarketsCollection } from './mongodb';

/**
 * BizMart Agent - Core Logic
 * 
 * This agent acts as an autonomous entity for the BizFi ecosystem.
 * It integrates with OpenClaw to provide real AI capabilities.
 */

export interface AgentResponse {
    type: 'thought' | 'action' | 'message' | 'error' | 'proposal';
    content: string;
    data?: any;
}

interface CreationState {
    isActive: boolean;
    step: number;
    data: {
        type?: string;
        name?: string;
        description?: string;
        valueAudience?: string;
        stage?: string;
        predictionGoal?: string;
        predictionQuestion?: string;
        duration?: string;
        chain?: string;
        vibe?: string;
        marketing?: string;
        wallet?: string;
    }
}

const FLOW_STEPS = {
    INIT: 0,
    TYPE: 1,
    NAME: 2,
    DESCRIPTION: 3,
    VALUE: 4,
    STAGE: 5,
    GOAL: 6,
    QUESTION: 7,
    DURATION: 8,
    CHAIN: 9,
    VIBE: 10,
    MARKETING: 11,
    WALLET: 12,
    DEPLOY: 13
};

    // EXACT text as requested by user
const SCRIPT = {
    INIT: "Hey 👋\n I’m $BizMart. I help tokenize ideas, businesses, and even careers and launch their prediction markets.\n Takes about 10 minutes. Ready?",
    
    TYPE: "First things first — what are we tokenizing today?\n\n**Options:**\n- A business\n- A startup / product\n- An idea\n- My career / personal brand\n- Just an experiment",
    
    NAME: "What should we call it publicly? Include links to your/business socials so I can do my research.",
    
    DESCRIPTION: "Explain your business/your career in a few sentence.\n Pretend you’re explaining it to someone on X scrolling fast.",
    
    VALUE: "What value are you providing and who is your target audience?",
    
    STAGE: "Be honest — what stage are you at?\n\n**Options:**\n- Just an idea\n- Building\n- Launched, no revenue yet\n- Making money\n- Growing my career fast",
    
    GOAL: "Let’s make this interesting 😈\n What should the market predict?\n\n**Options:**\n- Revenue goal\n- Sales target\n- User growth\n- Launch milestone\n- Social growth (e.g your twitter following will get to 50k in 3 months)",
    
    QUESTION: "Write the prediction in plain English.\n Example: “Will this business make $3,000 in the next 30 days?”",
    
    DURATION: "How long should the prediction run?\n\n**Options:**\n- 7 days\n- 14 days\n- 30 days",
    
    CHAIN: "What chain should I deploy your Prediction on?\n\n**Options (multi-select):**\n- Base\n- Monad\n- BSC",
    
    VIBE: "What vibe should the prediction have?\n\n**Options:**\n- Meme\n- Serious\n- Experimental",
    
    MARKETING: "Last thing — can I market this publicly for you?\n\n**Checkboxes:**\n- Post on MoltBook\n- Spark AI agent debates\n- Reply under big accounts\n- Go full chaos mode",
    
    WALLET: "Drop a USDC address for settlement, this is where your revenue from the prediction market will come.",
    
    DONE: "That’s Savvy, fund the BizFun wallet with the 10USDC fee, I’m deploying the prediction market, and letting the agents cook 🧠📈🔥"
};

export class BizMartAgent {
    private name: string;
    private openclawBin: string;
    private moltbook: MoltbookClient | null = null;
    private stateDir: string;
    private isInitialized: boolean = false;

    constructor(name: string = "BizMart") {
        this.name = name;
        this.openclawBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'openclaw');
        this.stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.cwd(), '.bizmart-agent');
        
        if (process.env.MOLTBOOK_API_KEY) {
            this.moltbook = new MoltbookClient(process.env.MOLTBOOK_API_KEY);
        }
    }

    private initializeWorkspace() {
        if (this.isInitialized) return;

        try {
            const workspaceDir = path.join(this.stateDir, 'workspace');
            if (!fs.existsSync(workspaceDir)) {
                fs.mkdirSync(workspaceDir, { recursive: true });
            }

            const sourceIdentity = path.join(process.cwd(), 'docs', 'agent', 'IDENTITY.md');
            const destIdentity = path.join(workspaceDir, 'IDENTITY.md');

            if (fs.existsSync(sourceIdentity)) {
                let identityContent = fs.readFileSync(sourceIdentity, 'utf-8');
                if (!identityContent.includes("BizFi Protocol tools")) {
                    identityContent += "\n\n" + TOOLS_DESCRIPTION;
                }
                fs.writeFileSync(destIdentity, identityContent);
            } else {
                fs.writeFileSync(destIdentity, `Name: BizMart\nEmoji: 🦞\n\n${TOOLS_DESCRIPTION}`);
            }

            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize agent workspace:", error);
        }
    }

    private async *_processJsonPayload(json: any): AsyncGenerator<AgentResponse> {
        if (json.action) {
             if (json.message || json.reply || json.text) {
                 yield { type: 'message', content: json.message || json.reply || json.text };
             }

             yield { type: 'thought', content: `Executing tool: ${json.action}` };
             try {
                 let result: any = null;
                 const params = json.parameters || {};
                 
                 if (json.action === 'create_market') {
                    result = await agentTools.createMarket(params as any);
                    if (result && result.proposal) {
                        yield { 
                            type: 'proposal', 
                            content: result.message || 'Market Creation Proposed',
                            data: result.proposal
                        };
                        return true;
                    }
                } else if (['buy_shares', 'approve_usdc', 'mint_usdc', 'resolve_market', 'redeem_winnings'].includes(json.action)) {
                    // Map other actions dynamically if needed, or explicitly like before
                    if (json.action === 'buy_shares') result = await agentTools.buyShares(params as any);
                    else if (json.action === 'approve_usdc') result = await agentTools.approveUsdc(params as any);
                    else if (json.action === 'mint_usdc') result = await agentTools.mintUsdc();
                    else if (json.action === 'resolve_market') result = await agentTools.resolveMarket(params as any);
                    else if (json.action === 'redeem_winnings') result = await agentTools.redeemWinnings(params as any);
                }
                 
                 if (result) {
                     yield { type: 'message', content: `✅ **Action Executed**: ${result.message}` };
                 } else {
                     yield { type: 'error', content: `Unknown action: ${json.action}` };
                 }
                 return true;
             } catch (e: any) {
                 yield { type: 'error', content: `❌ **Action Failed**: ${e.message}` };
                 return true;
             }
        }
        
        if (json.reply || json.message) {
            yield { type: 'message', content: json.reply || json.message };
            return true;
        }

        if (json.thought) {
            yield { type: 'thought', content: json.thought };
        }
        
        return false;
    }

    /**
     * Handles the structured conversational flow for creating a market.
     */
    private async *handleConversationalFlow(
        message: string, 
        state: CreationState, 
        sessionId: string
    ): AsyncGenerator<AgentResponse> {
        const collection = await getChatSessionsCollection();
        if (!collection) {
            yield { type: 'error', content: "Database unavailable." };
            return;
        }

        const updateState = async (newState: Partial<CreationState>) => {
            await collection.updateOne(
                { sessionId },
                { $set: { creationState: { ...state, ...newState } } }
            );
        };

        // If step is INIT (0), we just showed the greeting. 
        // If user says "yes" or "ready", move to TYPE.
        if (state.step === FLOW_STEPS.INIT) {
            // Assume any positive intent starts it, or really anything since they engaged
            yield { type: 'message', content: SCRIPT.TYPE };
            await updateState({ step: FLOW_STEPS.TYPE });
            return;
        }

        // Process input based on CURRENT step to advance to NEXT step
        const nextStep = state.step + 1;
        const newData = { ...state.data };

        // Save data from current step
        switch (state.step) {
            case FLOW_STEPS.TYPE: newData.type = message; break;
            case FLOW_STEPS.NAME: newData.name = message; break;
            case FLOW_STEPS.DESCRIPTION: newData.description = message; break;
            case FLOW_STEPS.VALUE: newData.valueAudience = message; break;
            case FLOW_STEPS.STAGE: newData.stage = message; break;
            case FLOW_STEPS.GOAL: newData.predictionGoal = message; break;
            case FLOW_STEPS.QUESTION: newData.predictionQuestion = message; break;
            case FLOW_STEPS.DURATION: newData.duration = message; break;
            case FLOW_STEPS.CHAIN: newData.chain = message; break;
            case FLOW_STEPS.VIBE: newData.vibe = message; break;
            case FLOW_STEPS.MARKETING: newData.marketing = message; break;
            case FLOW_STEPS.WALLET: newData.wallet = message; break;
        }

        // Move to next step
        await updateState({ step: nextStep, data: newData });

        // Show prompt for the NEW step
        switch (nextStep) {
            case FLOW_STEPS.NAME: yield { type: 'message', content: SCRIPT.NAME }; break;
            case FLOW_STEPS.DESCRIPTION: yield { type: 'message', content: SCRIPT.DESCRIPTION }; break;
            case FLOW_STEPS.VALUE: yield { type: 'message', content: SCRIPT.VALUE }; break;
            case FLOW_STEPS.STAGE: yield { type: 'message', content: SCRIPT.STAGE }; break;
            case FLOW_STEPS.GOAL: yield { type: 'message', content: SCRIPT.GOAL }; break;
            case FLOW_STEPS.QUESTION: yield { type: 'message', content: SCRIPT.QUESTION }; break;
            case FLOW_STEPS.DURATION: yield { type: 'message', content: SCRIPT.DURATION }; break;
            case FLOW_STEPS.CHAIN: yield { type: 'message', content: SCRIPT.CHAIN }; break;
            case FLOW_STEPS.VIBE: yield { type: 'message', content: SCRIPT.VIBE }; break;
            case FLOW_STEPS.MARKETING: yield { type: 'message', content: SCRIPT.MARKETING }; break;
            case FLOW_STEPS.WALLET: yield { type: 'message', content: SCRIPT.WALLET }; break;
            case FLOW_STEPS.DEPLOY:
                yield { type: 'message', content: SCRIPT.DONE };
                
                // Execute Creation
                yield { type: 'thought', content: "Deploying prediction market..." };
                
                // Parse duration
                let resolveTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // Default 30 days
                if (newData.duration?.includes('7')) resolveTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
                else if (newData.duration?.includes('14')) resolveTime = Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60);

                const marketParams = {
                    metadataUri: `ipfs://mock-metadata-${Date.now()}`, // In real app, upload metadata
                    tradingDeadline: resolveTime - 86400, // 1 day before resolve
                    resolveTime: resolveTime
                };

                // Call Agent Tool
                const result = await agentTools.createMarket(marketParams);
                
                if (result.proposal) {
                    yield { 
                        type: 'proposal', 
                        content: "Sign the transaction to create your market.",
                        data: result.proposal
                    };
                    
                    // Save to Markets Collection
                    const marketsCollection = await getMarketsCollection();
                    if (marketsCollection) {
                        await marketsCollection.insertOne({
                            question: newData.predictionQuestion,
                            description: newData.description,
                            vibe: newData.vibe,
                            outcome: 'UNDECIDED',
                            tradingDeadline: marketParams.tradingDeadline.toString(),
                            resolveTime: marketParams.resolveTime.toString(),
                            chainId: 84532, // Default Base Sepolia
                            creator: newData.wallet,
                            createdAt: new Date(),
                            volume: '0',
                            liquidity: '5000',
                            data: newData // Save full form data
                        });
                    }

                    // Step 4: Marketing on MoltBook
                    if (this.moltbook && newData.marketing?.toLowerCase().includes('moltbook')) {
                        try {
                            const marketLink = "https://bitsave.vercel.app/bizfun/market"; // In prod, append ID
                            await this.moltbook.createPost({
                                submolt: "BizFun",
                                title: `🚀 New Prediction: ${newData.predictionQuestion}`,
                                content: `Target: ${newData.predictionGoal}\nDuration: ${newData.duration}\n\nTrade now: ${marketLink}`
                            });
                        } catch (e) {
                            console.error("Failed to post to MoltBook:", e);
                        }
                    }
                }

                // Reset state
                await updateState({ isActive: false, step: 0, data: {} });
                break;
        }
    }

    async *processMessage(message: string, sessionId: string = 'default'): AsyncGenerator<AgentResponse> {
        this.initializeWorkspace();

        // Check for active conversation flow
        const collection = await getChatSessionsCollection();
        let session = null;
        if (collection) {
            session = await collection.findOne({ sessionId });
        }

        const creationState: CreationState = session?.creationState || { isActive: false, step: 0, data: {} };

        // Check trigger words if not active
        if (!creationState.isActive) {
            // Remove punctuation for easier matching (e.g. "Hello!" -> "hello")
            const lowerMsg = message.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
            const greetings = ['hello', 'hi', 'hey', 'start', 'begin', 'yo'];
            const triggers = ['create', 'tokenize', 'launch', 'deploy'];
            
            const isGreeting = greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + ' '));
            const isTrigger = triggers.some(t => lowerMsg.includes(t));

            if (isGreeting || isTrigger) {
                // Initialize Flow
                yield { type: 'message', content: SCRIPT.INIT };
                if (collection) {
                    await collection.updateOne(
                        { sessionId },
                        { $set: { creationState: { isActive: true, step: FLOW_STEPS.INIT, data: {} } } }
                    );
                }
                return;
            }
        } else {
            // Continue Flow
            yield* this.handleConversationalFlow(message, creationState, sessionId);
            return;
        }

        // Fallback to OpenClaw for non-flow messages
        yield { type: 'thought', content: `Consulting BizMart Agent...` };

        try {
            // REMOVED "introduce yourself" instruction to avoid conflicts
            const systemReminder = `[SYSTEM: You are BizMart Agent (Identity: 🦞). 
If the user asks to "create a market", "deploy", or "bet", you MUST use the provided JSON tools (create_market, etc.). 
DO NOT respond as a web developer building a website. DO NOT mention localhost. 
DO NOT ask for the user's name or onboarding details unless they explicitly asked to start the flow (which should have been caught by the trigger).
IMMEDIATELY generate the JSON action block for the requested task if applicable.
If the user just says "hello" or greets you, simply respond with a short greeting like "Hey! Want to tokenize something?" without listing all capabilities.]`;
            
            const fullMessage = `${systemReminder}\n\nUser: ${message}`;
            const result = await this.callOpenClaw(fullMessage, sessionId);
            
            if (result.error) {
                 yield { type: 'error', content: `OpenClaw Error: ${result.error}` };
                 return;
            }

            if (result.json) {
                const processed = yield* this._processJsonPayload(result.json);
                if (processed) return;

                if (result.json.reply) yield { type: 'message', content: result.json.reply };
                else if (result.json.message) yield { type: 'message', content: result.json.message };
                else yield { type: 'message', content: result.json.text || result.json.content || "I received a response but couldn't parse it." };
            } else {
                const raw = result.raw?.trim() || "";
                const parsed = this.extractJsonFromText(raw);
                if (parsed) {
                    const processed = yield* this._processJsonPayload(parsed);
                    if (processed) return;
                }
                yield { type: 'message', content: raw || "No response from agent." };
            }

        } catch (error: any) {
            console.error("OpenClaw execution failed:", error);
            yield { type: 'thought', content: "OpenClaw connection failed. Falling back to internal logic." };
            yield { type: 'error', content: `OpenClaw unavailable: ${error.message}.` };
        }
    }

    private extractJsonFromText(text: string): any {
        let startIndex = text.indexOf('{');
        while (startIndex !== -1) {
            let braceCount = 0;
            let endIndex = -1;
            
            for (let i = startIndex; i < text.length; i++) {
                if (text[i] === '{') braceCount++;
                else if (text[i] === '}') braceCount--;
                
                if (braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
            
            if (endIndex !== -1) {
                const jsonStr = text.substring(startIndex, endIndex + 1);
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.action || parsed.reply || parsed.message || parsed.text || parsed.content || parsed.payloads) {
                        return parsed;
                    }
                } catch (e) { }
            }
            startIndex = text.indexOf('{', startIndex + 1);
        }
        return null;
    }

    private callOpenClaw(message: string, sessionId: string): Promise<{ json?: any, raw?: string, error?: string }> {
        return new Promise((resolve, reject) => {
             // Mock implementation since I can't run the binary in this environment check
             // In real env, this spawns the process.
             
             if (!fs.existsSync(this.openclawBin)) {
                 // UPDATED mock to avoid the unwanted capability list
                 resolve({ raw: "Hey! 🦞 Want to create a prediction market? Just say 'start' or 'create'!" });
                 return;
             }
             
             const childProcess = spawn(this.openclawBin, ['chat', '--agent', 'bizmart', '--session', sessionId], {
                 env: { ...process.env, OPENCLAW_STATE_DIR: this.stateDir }
             });

             let output = '';
             let errorOutput = '';

             childProcess.stdout.on('data', (data: any) => { output += data.toString(); });
             childProcess.stderr.on('data', (data: any) => { errorOutput += data.toString(); });

             childProcess.on('close', (code: number) => {
                 if (code !== 0) {
                     resolve({ error: `Agent process exited with code ${code}: ${errorOutput}` });
                 } else {
                     try {
                        const json = JSON.parse(output);
                        resolve({ json });
                     } catch (e) {
                        resolve({ raw: output });
                     }
                 }
             });
             
             childProcess.on('error', (err: any) => {
                 resolve({ error: err.message });
             });
        });
    }
}
