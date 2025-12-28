import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

const COLLECTION_NAME = "businesses";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
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
    } catch (e) {
        console.error("Failed to save business record", e);
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
