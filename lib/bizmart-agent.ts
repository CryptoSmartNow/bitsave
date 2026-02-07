
import { spawn } from 'child_process';
import path from 'path';
import { MoltbookClient } from '@/utils/moltbook';

/**
 * BizMart Agent - Core Logic
 * 
 * This agent acts as an autonomous entity for the BizFi ecosystem.
 * It integrates with OpenClaw to provide real AI capabilities.
 */

export interface AgentResponse {
    type: 'thought' | 'action' | 'message' | 'error';
    content: string;
    data?: any;
}

export class BizMartAgent {
    private name: string;
    private openclawBin: string;
    private moltbook: MoltbookClient | null = null;

    constructor(name: string = "BizMart") {
        this.name = name;
        // Resolve the openclaw binary path relative to this file or CWD
        // In a Next.js environment, we might need to find where node_modules is
        this.openclawBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'openclaw');
        
        if (process.env.MOLTBOOK_API_KEY) {
            this.moltbook = new MoltbookClient(process.env.MOLTBOOK_API_KEY);
        }
    }

    /**
     * Process a user message using OpenClaw and return a stream of responses
     */
    async *processMessage(message: string, sessionId: string = 'default'): AsyncGenerator<AgentResponse> {
        // 1. Yield initial thought
        yield { type: 'thought', content: `Consulting OpenClaw agent...` };

        try {
            // 2. Call OpenClaw CLI
            const result = await this.callOpenClaw(message, sessionId);
            
            // 3. Process the result
            if (result.error) {
                 yield { type: 'error', content: `OpenClaw Error: ${result.error}` };
                 return;
            }

            // Helper to process JSON payload structure
            const processJsonPayload = function*(json: any): Generator<AgentResponse> {
                if (json.payloads && Array.isArray(json.payloads)) {
                    let hasContent = false;
                    for (const payload of json.payloads) {
                        if (payload.text) {
                            const cleanText = payload.text.trim();
                            if (cleanText) {
                                yield { type: 'message', content: cleanText };
                                hasContent = true;
                            }
                        }
                        if (payload.mediaUrl) {
                            yield { type: 'message', content: `[Image: ${payload.mediaUrl}]` }; // Or handle as image type if UI supports it
                            // Ideally: yield { type: 'image', content: payload.mediaUrl };
                            // But AgentResponse type is 'thought' | 'action' | 'message' | 'error'
                            // Let's assume 'message' is text. 
                            // If we want to support images, we need to update AgentResponse interface or send markdown image
                            // yield { type: 'message', content: `![Image](${payload.mediaUrl})` };
                            hasContent = true;
                        }
                    }
                    if (!hasContent) {
                         // yield { type: 'thought', content: "Agent returned empty payload." };
                    }
                    return true;
                }
                return false;
            };

            // If OpenClaw returns JSON with specific structure, parse it
            if (result.json) {
                const processed = yield* processJsonPayload(result.json);
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
                
                // Try to extract JSON from raw text (it might be surrounded by logs)
                // Find the first '{' and last '}'
                const firstBrace = raw.indexOf('{');
                const lastBrace = raw.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const potentialJson = raw.substring(firstBrace, lastBrace + 1);
                    try {
                        const parsed = JSON.parse(potentialJson);
                        const processed = yield* processJsonPayload(parsed);
                        if (processed) return;
                    } catch (e) {
                        // ignore JSON parse error
                    }
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

    private callOpenClaw(message: string, sessionId: string): Promise<{ json?: any, raw?: string, error?: string }> {
        return new Promise((resolve, reject) => {
            // Arguments for openclaw agent command
            // openclaw agent --local --message "msg" --session-id "id" --json
            const args = [
                'agent',
                '--local',
                '--message', message,
                '--session-id', sessionId,
                '--json'
            ];

            // Set environment variables for OpenClaw
            const env = {
                ...process.env,
                OPENCLAW_STATE_DIR: '/tmp/openclaw-state',
                OPENCLAW_CONFIG_PATH: '/tmp/openclaw-config.json',
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
                if (code !== 0) {
                    // Try to parse stdout even on error code
                    if (stdout.trim()) {
                         try {
                            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const json = JSON.parse(jsonMatch[0]);
                                resolve({ json });
                                return;
                            }
                         } catch (e) {
                             // ignore
                         }
                    }
                    
                    reject(new Error(`OpenClaw exited with code ${code}: ${stderr}`));
                    return;
                }

                try {
                    // Try to find the largest JSON object in stdout
                    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                         const json = JSON.parse(jsonMatch[0]);
                         resolve({ json });
                         return;
                    }

                    // Fallback to simple parse
                    const json = JSON.parse(stdout.trim());
                    resolve({ json });
                } catch (e) {
                    resolve({ raw: stdout });
                }
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
