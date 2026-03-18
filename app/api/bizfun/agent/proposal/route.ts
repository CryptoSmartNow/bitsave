import { NextRequest, NextResponse } from 'next/server';
import { agentTools } from '@/lib/web3/agent-tools';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Use agentTools to create the proposal directly
        const proposalResult = await agentTools.createMarket({
            metadataUri: body.description || body.metadataUri,
            tradingDeadline: body.tradingDeadline,
            resolveTime: body.resolveTime,
            chain: body.chain
        });

        if (proposalResult && proposalResult.proposal) {
            // Include question as description for the UI if provided
            if (body.description) {
                proposalResult.proposal.description = body.description;
            }
            return NextResponse.json(proposalResult);
        }

        return NextResponse.json({ error: 'Failed to generate proposal' }, { status: 500 });

    } catch (error) {
        console.error('Proposal API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
