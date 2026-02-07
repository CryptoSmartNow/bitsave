
import { BizMartAgent } from '../lib/bizmart-agent';

/**
 * BizMart Agent CLI Runner
 * 
 * Runs the agent in interactive terminal mode.
 */
async function main() {
    console.log("🦞 Starting BizMart Agent (CLI Mode)...\n");
    
    const agent = new BizMartAgent();
    const demoInputs = [
        "Help me understand what you can do",
        "I want to tokenize a coffee shop called JavaJoy",
        "Create a prediction market for JavaJoy revenue"
    ];

    for (const input of demoInputs) {
        console.log(`\n> User: ${input}\n`);
        
        // Process the stream
        for await (const response of agent.processMessage(input)) {
            switch (response.type) {
                case 'thought':
                    console.log(`🧠 [THOUGHT] ${response.content}`);
                    break;
                case 'action':
                    console.log(`⚡ [ACTION] ${response.content}`);
                    if (response.data) console.dir(response.data, { depth: null, colors: true });
                    break;
                case 'message':
                    console.log(`💬 [AGENT] ${response.content}`);
                    break;
                case 'error':
                    console.error(`❌ [ERROR] ${response.content}`);
                    break;
            }
        }
        
        // Pause between interactions
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}

main().catch(console.error);
