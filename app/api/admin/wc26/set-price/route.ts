import { NextRequest, NextResponse } from "next/server";
import { getWc26PoolCollection, getWc26PriceHistoryCollection } from "@/lib/mongodb";
import { jwtVerify } from "jose";
import { randomUUID } from "crypto";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("admin-token")?.value;
        let adminId = "Unknown Admin";

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.username) adminId = payload.username as string;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { price, reason } = body;

        if (!price || price <= 0 || !reason) {
            return NextResponse.json({ error: "Valid price and reason are required" }, { status: 400 });
        }

        const poolCollection = await getWc26PoolCollection();
        const historyCollection = await getWc26PriceHistoryCollection();

        if (!poolCollection || !historyCollection) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const now = new Date().toISOString();

        await poolCollection.updateOne(
            { _id: 'main_pool' as any },
            { 
                $set: { 
                    current_price_usd: price,
                    updated_at: now
                }
            },
            { upsert: true }
        );

        await historyCollection.insertOne({
            _id: randomUUID() as any,
            price_usd: price,
            set_by_admin_id: adminId,
            reason: reason,
            created_at: now
        });

        return NextResponse.json({ success: true, new_price: price });
    } catch (e: any) {
        console.error("Admin set-price error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
