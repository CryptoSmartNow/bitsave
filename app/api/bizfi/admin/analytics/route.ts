import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const COLLECTION_NAME = "businesses";

export async function GET(req: NextRequest) {
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

        // 2. Connect to Database
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const collection = db.collection(COLLECTION_NAME);

        // 3. Fetch Metrics
        const totalBusinesses = await collection.countDocuments();

        // Active / Approved Businesses
        const activeBusinesses = await collection.countDocuments({ 
            status: { $in: ['approved', 'active', 'Verified', 'Approved'] } 
        });

        // Total Revenue Calculation
        const allBusinesses = await collection.find({}, { projection: { tier: 1, feePaid: 1 } }).toArray();
        const totalRevenue = allBusinesses.reduce((acc, curr) => {
            if (curr.feePaid) {
                const parsed = parseFloat(curr.feePaid);
                if (!isNaN(parsed) && parsed > 0) return acc + parsed;
            }
            const tier = typeof curr.tier === 'string' ? curr.tier.toLowerCase() : '';
            if (tier === 'enterprise') return acc + 100;
            if (tier === 'scaler' || tier === 'premium') return acc + 50;
            if (tier === 'builder' || tier === 'standard') return acc + 10;
            return acc;
        }, 0);

        // Status Distribution
        const statusDistribution = await collection.aggregate([
            { $group: { _id: { $toLower: "$status" }, count: { $sum: 1 } } }
        ]).toArray();

        // Tier Distribution
        const tierDistribution = await collection.aggregate([
            { $group: { _id: { $toLower: "$tier" }, count: { $sum: 1 } } }
        ]).toArray();

        // Time Series Data (Growth over time)
        const growthData = await collection.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]).toArray();

        // Revenue Trend
        const revenueTrend = await collection.aggregate([
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: {
                        $switch: {
                            branches: [
                                { case: { $in: [{ $toLower: "$tier" }, ["enterprise"]] }, then: 100 },
                                { case: { $in: [{ $toLower: "$tier" }, ["scaler", "premium"]] }, then: 50 },
                                { case: { $in: [{ $toLower: "$tier" }, ["builder", "standard"]] }, then: 10 }
                            ],
                            default: 10
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$date",
                    totalRevenue: { $sum: "$revenue" }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]).toArray();

        // User Activity
        const userActivity = await collection.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    activeUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 30 }
        ]).toArray();

        // Recent Businesses (Sorted by newest)
        const recentBusinesses = await collection.find({})
            .sort({ createdAt: -1 })
            .limit(100)
            .toArray();

        return NextResponse.json({
            metrics: {
                totalBusinesses,
                activeBusinesses,
                totalRevenue,
                statusDistribution,
                tierDistribution,
                growthData,
                revenueTrend,
                userActivity
            },
            recentBusinesses
        });

    } catch (e: any) {
        console.error("[BizFi Admin API Error]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
