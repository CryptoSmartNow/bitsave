import { Chainrails, crapi } from "@chainrails/sdk";

async function test() {
    console.log("Testing Chainrails SDK...");
    const apiKey = "cr_live_6ed20aec0cd96e0557dfdcadf097e67849d65800123540ddcb3b8dbb1c642924";
    Chainrails.config({
        api_key: apiKey,
    });

    try {
        const sessionPayload: any = {
            recipient: "0x7CE1DF67cc7e82cd8dE5D530d9396328325aEF96", // example dummy address
            destinationChain: "BASE",
            token: "USDC",
            amount: "10"
        };
        const session = await crapi.auth.getSessionToken(sessionPayload);
        console.log("Session generated successfully:", session);
    } catch (e) {
        console.error("Failed to generate session:", e);
    }
}

test();
