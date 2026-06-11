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
        const { open } = body; // boolean

        if (typeof open !== 'boolean') {
            return NextResponse.json({ error: "'open' boolean is required" }, { status: 400 });
        }

        const poolCollection = await getWc26PoolCollection();

        if (!poolCollection) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const now = new Date().toISOString();

        await poolCollection.updateOne(
            { _id: 'main_pool' as any },
            { 
                $set: { 
                    trading_open: open,
                    is_active: open, // update both or handle logically
                    updated_at: now
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true, trading_open: open });
    } catch (e: any) {
        console.error("Admin trading toggle error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
