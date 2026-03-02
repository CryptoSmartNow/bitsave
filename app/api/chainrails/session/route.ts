import { NextResponse } from 'next/server';
import { Chainrails, crapi } from "@chainrails/sdk";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.CHAINRAILS_API_KEY;
        if (!apiKey) {
            console.error("Chainrails API Key not configured");
            return NextResponse.json({ error: 'Chainrails API key not configured on server' }, { status: 500 });
        }

        // Initialize Chainrails SDK
        Chainrails.config({
            api_key: apiKey,
        });

        // Request body could contain specifics like amount, token, chain.
        // For a general onramp session, we can leave amount empty so the modal prompts.
        let body = {};
        try {
            body = await request.json();
        } catch {
            // body is optional
        }

        const { amount, destinationChain = "BASE", token = "USDC", recipient } = body as any;

        // Note: The recipient address should strictly be the user's wallet address.
        // The modal UI will pass this on initialize or we read it here.
        if (!recipient) {
            return NextResponse.json({ error: 'Recipient address is required' }, { status: 400 });
        }

        const sessionPayload: any = {
            recipient: recipient,
            destinationChain: destinationChain,
            token: token,
        };

        if (amount && Number(amount) > 0) {
            sessionPayload.amount = amount.toString();
        }

        // Generate the secure session token
        const session = await crapi.auth.getSessionToken(sessionPayload);

        return NextResponse.json({ token: session });
    } catch (error) {
        console.error('Error creating Chainrails session:', error);
        return NextResponse.json({ error: 'Failed to create Chainrails session' }, { status: 500 });
    }
}
