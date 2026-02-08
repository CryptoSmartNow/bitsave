
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { MoltbookClient } from '../utils/moltbook';
import { agentTools, TOOLS_DESCRIPTION } from './web3/agent-tools';

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

export class BizMartAgent {
    private name: string;
    private openclawBin: string;
    private moltbook: MoltbookClient | null = null;
    private stateDir: string;
    private isInitialized: boolean = false;

    constructor(name: string = "BizMart") {
        this.name = name;
        // Resolve the openclaw binary path relative to this file or CWD
        this.openclawBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'openclaw');
        
        // Use a persistent state directory. Prefer environment variable if set.
        // Default to local .bizmart-agent directory for persistence.
        this.stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.cwd(), '.bizmart-agent');
        
        if (process.env.MOLTBOOK_API_KEY) {
            this.moltbook = new MoltbookClient(process.env.MOLTBOOK_API_KEY);
        }
    }

    /**
     * Initialize the workspace with identity files
     */
    private initializeWorkspace() {
        if (this.isInitialized) return;

        try {
            const workspaceDir = path.join(this.stateDir, 'workspace');
            
            // Create directories if they don't exist
            if (!fs.existsSync(workspaceDir)) {
                fs.mkdirSync(workspaceDir, { recursive: true });
            }

            // Path to source identity files
            const sourceIdentity = path.join(process.cwd(), 'docs', 'agent', 'IDENTITY.md');
            const destIdentity = path.join(workspaceDir, 'IDENTITY.md');

            // Copy identity file if it exists and append tools description
            if (fs.existsSync(sourceIdentity)) {
                let identityContent = fs.readFileSync(sourceIdentity, 'utf-8');
                // Avoid duplicating if already present
                if (!identityContent.includes("BizFi Protocol tools")) {
                    identityContent += "\n\n" + TOOLS_DESCRIPTION;
                }
                fs.writeFileSync(destIdentity, identityContent);
            } else {
                // Fallback if no identity file exists
                fs.writeFileSync(destIdentity, `Name: BizMart\nEmoji: 🦞\n\n${TOOLS_DESCRIPTION}`);
            }

            // Configure the agent identity in OpenClaw
            const env = {
                ...process.env,
                OPENCLAW_STATE_DIR: this.stateDir,
                OPENCLAW_CONFIG_PATH: path.join(this.stateDir, 'config.json'),
            };

            // Try to set identity for 'bizmart' agent
            // We use spawnSync to ensure it completes before processing messages
            const setIdentity = () => spawnSync(this.openclawBin, [
                'agents', 'set-identity', 
                '--agent', 'bizmart', 
                '--identity-file', destIdentity
            ], { env });

            let result = setIdentity();

            // If it failed (likely agent 'bizmart' doesn't exist), try to create it first
            if (result.status !== 0) {
                // console.log("Creating 'bizmart' agent...");
                spawnSync(this.openclawBin, [
                    'agents', 'add', 'bizmart',
                    '--workspace', workspaceDir
                ], { env });
                result = setIdentity();
            }

            if (result.status === 0) {
                this.isInitialized = true;
            } else {
                console.warn("Failed to set agent identity:", result.stderr.toString());
            }

        } catch (error) {
            console.error("Failed to initialize agent workspace:", error);
        }
    }

    /**
     * Helper to process JSON payload structure
     */
    private async *_processJsonPayload(json: any): AsyncGenerator<AgentResponse> {
        // Check for explicit action first
        if (json.action) {
             // Yield the conversational message if present
             if (json.message || json.reply || json.text) {
                 const msg = json.message || json.reply || json.text;
                 yield { type: 'message', content: msg };
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
                } else if (json.action === 'buy_shares') {
                    result = await agentTools.buyShares(params as any);
                } else if (json.action === 'approve_usdc') {
                    result = await agentTools.approveUsdc(params as any);
                } else if (json.action === 'mint_usdc') {
                    result = await agentTools.mintUsdc();
                } else if (json.action === 'resolve_market') {
                    result = await agentTools.resolveMarket(params as any);
                } else if (json.action === 'redeem_winnings') {
                    result = await agentTools.redeemWinnings(params as any);
                }
                 
                 if (result) {
                     yield { type: 'message', content: `✅ **Action Executed**: ${result.message}` };
                 } else {
                     yield { type: 'error', content: `Unknown action: ${json.action}` };
                 }
                 return true; // Stop processing other payloads if action was taken
             } catch (e: any) {
                 yield { type: 'error', content: `❌ **Action Failed**: ${e.message}` };
                 return true;
             }
        }

        if (json.payloads && Array.isArray(json.payloads)) {
            let hasContent = false;
            for (const payload of json.payloads) {
                if (payload.text) {
                    const cleanText = payload.text.trim();
                    if (cleanText) {
                        // Check for embedded actions in the text
                        const embeddedAction = this.extractJsonFromText(cleanText);
                        if (embeddedAction && embeddedAction.action) {
                            // Recursively process the embedded action
                            const processed = yield* this._processJsonPayload(embeddedAction);
                            if (processed) return true;
                        }

                        yield { type: 'message', content: cleanText };
                        hasContent = true;
                    }
                }
                if (payload.mediaUrl) {
                    yield { type: 'message', content: `[Image: ${payload.mediaUrl}]` };
                    hasContent = true;
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Process a user message using OpenClaw and return a stream of responses
     */
    async *processMessage(message: string, sessionId: string = 'default'): AsyncGenerator<AgentResponse> {
        // Ensure workspace is ready with identity
        this.initializeWorkspace();

        // 1. Yield initial thought
        yield { type: 'thought', content: `Consulting BizMart Agent...` };

        try {
            // Prepend a forceful system reminder to the user message to ensure adherence
            // This overrides any potential context loss or model drift
            const systemReminder = `[SYSTEM: You are BizMart Agent (Identity: 🦞). 
If the user says "hello", introduce yourself as BizMart Agent and list your capabilities. 
If the user asks to "create a market", "deploy", or "bet", you MUST use the provided JSON tools (create_market, etc.). 
DO NOT respond as a web developer building a website. DO NOT mention localhost. 
DO NOT ask for the user's name or onboarding details. 
IMMEDIATELY generate the JSON action block for the requested task.]`;
            
            const fullMessage = `${systemReminder}\n\nUser: ${message}`;

            // 2. Call OpenClaw CLI
            const result = await this.callOpenClaw(fullMessage, sessionId);
            
            // 3. Process the result
            if (result.error) {
                 yield { type: 'error', content: `OpenClaw Error: ${result.error}` };
                 return;
            }

            // If OpenClaw returns JSON with specific structure, parse it
            if (result.json) {
                const processed = yield* this._processJsonPayload(result.json);
                if (processed) return;

                // Fallback for other JSON structures
                if (result.json.reply) {
                    yield { type: 'message', content: result.json.reply };
                } else if (result.json.message) {
                    yield { type: 'message', content: result.json.message };
                } else {
                     const text = result.json.text || result.json.content || result.json.response;
                     if (text) {
                         yield { type: 'message', content: text };
                     } else {
                         console.warn("Unrecognized JSON format:", result.json);
                         yield { type: 'message', content: "I received a response but couldn't parse the text. Please check the logs." };
                     }
                }
            } else {
                // Fallback for raw text
                const raw = result.raw?.trim() || "";
                
                // Try to extract JSON from raw text using smart extractor
                const parsed = this.extractJsonFromText(raw);
                if (parsed) {
                    const processed = yield* this._processJsonPayload(parsed);
                    if (processed) return;
                }
                
                yield { type: 'message', content: raw || "No response from agent." };
            }

        } catch (error: any) {
            console.error("OpenClaw execution failed:", error);
            
            // Fallback to mock if OpenClaw fails (e.g. not configured)
            yield { type: 'thought', content: "OpenClaw connection failed. Falling back to internal logic." };
            yield { type: 'error', content: `OpenClaw unavailable: ${error.message}. Switching to backup mode.` };
            
            yield* this.fallbackLogic(message);
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
                    // Check if it looks like an action or message payload
                    if (parsed.action || parsed.reply || parsed.message || parsed.text || parsed.content || parsed.payloads) {
                        return parsed;
                    }
                } catch (e) {
                    // Continue searching
                }
            }
            
            startIndex = text.indexOf('{', startIndex + 1);
        }
        return null;
    }

    private callOpenClaw(message: string, sessionId: string): Promise<{ json?: any, raw?: string, error?: string }> {
        return new Promise((resolve, reject) => {
            // Arguments for openclaw agent command
            // openclaw agent --local --message "msg" --session-id "id" --json
            const args = [
                'agent',
                '--local',
                '--agent', 'bizmart', // Explicitly use the configured 'bizmart' agent
                '--message', message,
                '--session-id', sessionId,
                '--json',
                '--thinking', 'minimal' // Optimize for speed
            ];

            // Set environment variables for OpenClaw
            const env = {
                ...process.env,
                OPENCLAW_STATE_DIR: this.stateDir,
                OPENCLAW_CONFIG_PATH: path.join(this.stateDir, 'config.json'),
                // Explicitly pass API keys to ensure they are available to the child process
                ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
                OPENAI_API_KEY: process.env.OPENAI_API_KEY,
                MOLTBOOK_API_KEY: process.env.MOLTBOOK_API_KEY,
            };

            const child = spawn(this.openclawBin, args, { env });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                console.log(`OpenClaw stdout length: ${stdout.length}`);
                // Try to extract JSON from stdout regardless of exit code
                const json = this.extractJsonFromText(stdout);
                
                if (json) {
                    console.log("Extracted JSON from stdout");
                    resolve({ json });
                    return;
                } else {
                    console.log("Failed to extract JSON from stdout");
                }

                if (code !== 0) {
                    if (json) {
                        resolve({ json });
                        return;
                    }
                    reject(new Error(`OpenClaw exited with code ${code}: ${stderr}`));
                    return;
                }

                if (json) {
                    resolve({ json });
                    return;
                }

                // Fallback: return raw stdout if no JSON found
                resolve({ raw: stdout });
            });

            child.on('error', (err) => {
                reject(err);
            });
        });
    }

    private async *fallbackLogic(message: string): AsyncGenerator<AgentResponse> {
        // Re-implement basic mock logic for robustness
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('tokenize') || lowerMsg.includes('business')) {
            yield { type: 'thought', content: "Processing tokenization request (Backup Mode)..." };
            await this.delay(500);
            yield { type: 'action', content: "tokenize_business", data: { name: "Example Corp", symbol: "EXMPL" } };
            yield { type: 'message', content: "I've prepared the tokenization for Example Corp." };
        } else if (lowerMsg.includes('moltbook')) {
             yield { type: 'thought', content: "Connecting to Moltbook..." };
             
             if (this.moltbook) {
                 try {
                     const posts = await this.moltbook.getPosts();
                     yield { type: 'message', content: `Here are the latest posts from Moltbook: ${posts.map(p => p.title).join(', ')}` };
                 } catch (e) {
                     yield { type: 'error', content: "Failed to fetch from Moltbook." };
                 }
             } else {
                 yield { type: 'message', content: "I can't connect to real Moltbook right now (API Key missing), but I can simulate a post." };
             }
        } else {
             yield { type: 'message', content: "I am the BizMart Agent (Backup Mode). Please configure OpenClaw keys to enable full AI." };
        }
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
