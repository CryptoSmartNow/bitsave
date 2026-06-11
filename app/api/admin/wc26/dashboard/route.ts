import { NextRequest, NextResponse } from "next/server";
import { getWc26PoolCollection, getWc26PositionsCollection, getWc26TransactionsCollection } from "@/lib/mongodb";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
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

        const poolCollection = await getWc26PoolCollection();
        const posCollection = await getWc26PositionsCollection();
        const txCollection = await getWc26TransactionsCollection();

        if (!poolCollection || !posCollection || !txCollection) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const poolState = await poolCollection.findOne({ _id: 'main_pool' as any });
        
        // Count users with active positions
        const activeUsersCount = await posCollection.countDocuments({ shares_held: { $gt: 0 } });

        // Total volume (gross_amount)
        const totalVolumeAgg = await txCollection.aggregate([
            { $group: { _id: null, totalVolume: { $sum: "$gross_amount" } } }
        ]).toArray();
        const totalVolume = totalVolumeAgg.length > 0 ? totalVolumeAgg[0].totalVolume : 0;

        return NextResponse.json({
            success: true,
            poolState: poolState || {},
            activeUsersCount: activeUsersCount,
            totalVolume: totalVolume,
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
    } catch (e: any) {
        console.error("Admin dashboard error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
