import { NextRequest, NextResponse } from "next/server";
import { getWc26PoolCollection } from "@/lib/mongodb";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("admin-token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            await jwtVerify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { quantity } = body;

        if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
            return NextResponse.json({ error: "Positive integer quantity is required" }, { status: 400 });
        }

        const poolCollection = await getWc26PoolCollection();

        if (!poolCollection) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const now = new Date().toISOString();

        const result = await poolCollection.updateOne(
            { _id: 'main_pool' as any },
            { 
                $inc: { 
                    total_shares_issued: quantity
                },
                $set: {
                    updated_at: now
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, added_shares: quantity });
    } catch (e: any) {
        console.error("Admin issue shares error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
