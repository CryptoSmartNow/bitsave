import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const COLLECTION_NAME = "businesses";

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const token = req.cookies.get("admin-token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            await jwtVerify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 2. Parse Body
        const { transactionHash, agreement } = await req.json();

        if (!transactionHash || !agreement) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Connect to Database
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const collection = db.collection(COLLECTION_NAME);

        // 4. Update Business
        const result = await collection.updateOne(
            { transactionHash: transactionHash },
            { $set: { loanAgreement: agreement } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Agreement updated successfully" });

    } catch (error) {
        console.error("Error updating agreement:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
