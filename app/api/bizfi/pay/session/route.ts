import { NextRequest, NextResponse } from "next/server";
import { generateJwt } from "@coinbase/cdp-sdk/auth";

export async function POST(req: NextRequest) {
    try {
        const { address } = await req.json();

        const apiKeyName = process.env.COINBASE_CDP_API_KEY_NAME;
        const privateKey = process.env.COINBASE_CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!apiKeyName || !privateKey) {
            console.error("Missing Coinbase credentials");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const requestMethod = "POST";
        const requestHost = "api.developer.coinbase.com";
        const requestPath = "/onramp/v1/token";

        // Generate JWT securely
        const jwt = await generateJwt({
            apiKeyId: apiKeyName,
            apiKeySecret: privateKey,
            method: requestMethod,
            path: requestPath,
            host: requestHost
        } as any);

        // Make manual request to Coinbase API
        const response = await fetch(`https://${requestHost}${requestPath}`, {
            method: requestMethod,
            headers: {
                "Authorization": `Bearer ${jwt}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                destination_addresses: [{
                    address: address,
                    blockchains: ["ethereum", "optimism", "base", "polygon"]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Coinbase API Error:", response.status, errorText);
            return NextResponse.json({ error: `Coinbase API failed: ${response.status}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Coinbase Session Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
    }
}
