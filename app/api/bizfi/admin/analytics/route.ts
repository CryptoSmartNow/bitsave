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

        // Total Businesses
        const totalBusinesses = await collection.countDocuments();

        // Active Businesses
        const activeBusinesses = await collection.countDocuments({ status: { $regex: /^active$/i } });

        // Total Revenue (Estimated snapshot)
        const allBusinesses = await collection.find({}, { projection: { tier: 1 } }).toArray();
        const totalRevenue = allBusinesses.reduce((acc, curr) => {
            const tier = curr.tier?.toLowerCase();
            if (tier === 'enterprise') return acc + 100;
            if (tier === 'premium') return acc + 50;
            if (tier === 'standard') return acc + 10;
            return acc;
        }, 0);

        // Status Distribution
        const statusDistribution = await collection.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();

        // Tier Distribution
        const tierDistribution = await collection.aggregate([
            { $group: { _id: "$tier", count: { $sum: 1 } } }
        ]).toArray();

        // Time Series Data (Growth over time)
        // Group by Date (YYYY-MM-DD)
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
            { $limit: 30 } // Last 30 days/entries
        ]).toArray();

        // Revenue Trend (Estimated based on tiers)
        // Standard: $10, Premium: $50, Enterprise: $100
        const revenueTrend = await collection.aggregate([
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$tier", "enterprise"] }, then: 100 },
                                { case: { $eq: ["$tier", "premium"] }, then: 50 },
                                { case: { $eq: ["$tier", "standard"] }, then: 10 }
                            ],
                            default: 0
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

        // User Activity (New Business Joins per Day - same as growth but ensuring it's named for the chart)
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

        // Recent Businesses (Increased limit for robustness)
        const recentBusinesses = await collection.find({})
            .sort({ createdAt: -1 })
            .limit(100) // Fetch more for client-side search/pagination
            .toArray();

        // 4. Return Data
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
