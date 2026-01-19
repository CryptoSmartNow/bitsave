import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

const COLLECTION_NAME = "businesses";
const AUDIT_COLLECTION = "audit_logs";

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const token = req.cookies.get("admin-token")?.value;
        let user = "Admin User";

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.username) user = payload.username as string;
        } catch (err) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { transactionHash, status } = body;

        if (!transactionHash || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const validStatuses = ['active', 'pending', 'inactive', 'hold', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // 3. Connect to Database
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const collection = db.collection(COLLECTION_NAME);
        const auditCollection = db.collection(AUDIT_COLLECTION);

        // Get business name for audit log
        const business = await collection.findOne({ transactionHash });
        const businessName = business ? business.businessName : "Unknown Business";

        // 4. Update Status
        const result = await collection.updateOne(
            { transactionHash: transactionHash },
            { $set: { status: status } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        // 5. Create Audit Log
        await auditCollection.insertOne({
            action: "Status Update",
            user: user,
            details: `Changed status of "${businessName}" to ${status}`,
            metadata: { transactionHash, oldStatus: business?.status, newStatus: status },
            timestamp: new Date()
        });

        return NextResponse.json({ 
            success: true, 
            message: "Status updated successfully",
            status 
        });

    } catch (e: any) {
        console.error("[BizFi Admin Status Update Error]", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
