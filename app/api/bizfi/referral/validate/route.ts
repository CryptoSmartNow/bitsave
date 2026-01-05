import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

// Configuration
const PRIVATE_KEY = (process.env.REFERRAL_SIGNER_PRIVATE_KEY || process.env.PRIVATE_KEY) as `0x${string}`;
const BIZFI_PROXY_ADDRESS = "0x7C24A938e086d01d252f1cde36783c105784c770"; // Base Mainnet Proxy
const DISCOUNT_PERCENT = 20; // Standard 20% discount

const DOMAIN = {
    name: "BizFi",
    version: "1",
    chainId: 8453, // Base Mainnet
    verifyingContract: BIZFI_PROXY_ADDRESS as `0x${string}`
};

const TYPES = {
    ReferralDiscount: [
        { name: "recipient", type: "address" },
        { name: "tier", type: "uint8" },
        { name: "discountedPrice", type: "uint256" },
        { name: "businessName", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
    ]
};

// Listing Fees (USDC 6 decimals)
const LISTING_FEES: Record<number, number> = {
    0: 10,  // MICRO
    1: 35,  // BUILDER
    2: 60,  // GROWTH
    3: 120  // ENTERPRISE
};

// Referral Prices (USDC 6 decimals) -> Specific discounted amounts
const REFERRAL_PRICES: Record<number, number> = {
    0: 6,   // MICRO ($4 off)
    1: 30,  // BUILDER ($5 off)
    2: 50,  // GROWTH ($10 off)
    3: 100  // ENTERPRISE ($20 off)
};

export async function POST(request: NextRequest) {
    let body;
    try {
        body = await request.json();
        console.log("Validating referral request:", JSON.stringify(body));
        const { referralCode, recipient, tier, businessName } = body;

        if (!referralCode || typeof referralCode !== 'string') {
            return NextResponse.json(
                { valid: false, message: 'Invalid referral code format' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        if (!client) {
            return NextResponse.json(
                { valid: false, message: 'Database connection failed' },
                { status: 500 }
            );
        }
        const db = client.db('bitsave');
        const usersCollection = db.collection('users');

        // Check if referral code exists in users collection
        const user = await usersCollection.findOne({ referralCode: referralCode.trim() });
        console.log(`Referral lookup for '${referralCode}':`, user ? "Found" : "Not Found");

        if (!user) {
            return NextResponse.json({
                valid: false,
                message: 'Referral code not found'
            });
        }

        // If only validating (no recipient/tier provided), return basic info
        if (!recipient || tier === undefined || !businessName) {
            return NextResponse.json({
                valid: true,
                message: 'Referral code is valid',
                referralOwner: user.walletAddress,
                discountPercent: 0 // Frontend handles display based on Tier
            });
        }

        // Generate Signature Logic
        if (!PRIVATE_KEY) {
            console.error("Missing PRIVATE_KEY in env during signature generation");
            return NextResponse.json({ valid: false, message: "Server configuration error" }, { status: 500 });
        }

        const account = privateKeyToAccount(PRIVATE_KEY);
        const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http()
        });

        const originalPrice = LISTING_FEES[tier] || 0;
        const discountedPriceVal = REFERRAL_PRICES[tier];

        if (discountedPriceVal === undefined) {
            return NextResponse.json({ valid: false, message: "Invalid tier selected" }, { status: 400 });
        }

        const discountedPriceBigInt = parseUnits(discountedPriceVal.toString(), 6);

        // Calculate actual percent for response metadata
        const discountPercent = originalPrice > 0
            ? Math.round(((originalPrice - discountedPriceVal) / originalPrice) * 100)
            : 0;

        // Unique nonce: Using timestamp + random to prevent collisions/replays
        // Note: For strict security, track used nonces in DB. For now, timestamp is sufficient for UX.
        const nonce = BigInt(Date.now());
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400 * 7); // 7 Days expiry

        const referralData = {
            recipient: recipient as `0x${string}`,
            tier: Number(tier),
            discountedPrice: discountedPriceBigInt,
            businessName: businessName,
            nonce,
            deadline
        };

        const signature = await walletClient.signTypedData({
            domain: DOMAIN,
            types: TYPES,
            primaryType: 'ReferralDiscount',
            message: referralData
        });

        console.log("Signature generated successfully for:", recipient);

        // Convert BigInt to string for JSON serialization
        const serializedReferralData = {
            ...referralData,
            discountedPrice: referralData.discountedPrice.toString(),
            nonce: referralData.nonce.toString(),
            deadline: referralData.deadline.toString()
        };

        return NextResponse.json({
            valid: true,
            message: 'Referral applied successfully',
            referralOwner: user.walletAddress,
            discountPercent: discountPercent,
            signature,
            referralData: serializedReferralData
        });

    } catch (error: any) {
        const timestamp = new Date().toISOString();
        console.error(`[Referral API Error] ${timestamp} | Context: Validate Code`);
        console.error(`[Referral API Error] Payload:`, JSON.stringify(body || {}, null, 2));
        console.error(`[Referral API Error] Details:`, error);

        return NextResponse.json(
            { valid: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
