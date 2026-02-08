
import express from 'express';
import cors from 'cors';
import { BizMartAgent, AgentResponse } from '../lib/bizmart-agent';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const API_KEY = process.env.AGENT_SERVER_API_KEY;

app.use(cors());
app.use(express.json());

// Initialize the agent
const agent = new BizMartAgent();

// Auth middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (API_KEY && (!authHeader || authHeader !== `Bearer ${API_KEY}`)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'ok', agent: 'BizMart' });
});

app.post('/chat', authenticate, async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const sid = sessionId || 'default';
        console.log(`[${new Date().toISOString()}] Processing message for session ${sid}`);

        const steps: AgentResponse[] = [];
        
        // Process message and collect all steps
        for await (const step of agent.processMessage(message, sid)) {
            steps.push(step);
        }

        res.json({ steps });

    } catch (error: any) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Agent Server running on port ${port}`);
    console.log(`👉 Health check: http://localhost:${port}/health`);
});
