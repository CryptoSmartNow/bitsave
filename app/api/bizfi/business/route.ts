import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

const COLLECTION_NAME = "businesses";

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
        const {
            transactionHash,
            owner,
            businessName,
            metadata,
            tier,
            feePaid,
            referralCode
        } = body;

        if (!transactionHash || !owner || !businessName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const businessRecord = {
            transactionHash,
            owner: owner.toLowerCase(),
            businessName,
            metadata, // Full form data
            tier,
            feePaid,
            referralCode: referralCode || "",
            createdAt: new Date(),
            status: "pending" // Initial status
        };

        // Insert the business record
        await db.collection(COLLECTION_NAME).insertOne(businessRecord);

        return NextResponse.json({ success: true, id: businessRecord.transactionHash });
    } catch (e: any) {
        const timestamp = new Date().toISOString();
        console.error(`[Business API Error] ${timestamp} | Context: Save Record`);
        console.error(`[Business API Error] Payload Summary: Owner=${body?.owner}, Name=${body?.businessName}`);
        console.error(`[Business API Error] Details:`, e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");

    try {
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const query = owner ? { owner: owner.toLowerCase() } : {};
        const businesses = await db.collection(COLLECTION_NAME).find(query).sort({ createdAt: -1 }).toArray();

        return NextResponse.json(businesses);
    } catch (e) {
        console.error("Failed to fetch businesses", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    let body;
    try {
        body = await req.json();
        const { transactionHash, owner, updates } = body;

        if (!transactionHash || !owner || !updates) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const query = {
            transactionHash,
            owner: owner.toLowerCase()
        };

        const result = await db.collection(COLLECTION_NAME).updateOne(
            query,
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Business not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Failed to update business", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
