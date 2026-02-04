import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "chat_messages";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ error: "Missing businessId" }, { status: 400 });
        }

        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const messages = await db.collection(COLLECTION_NAME)
            .find({ businessId })
            .sort({ timestamp: 1 })
            .toArray();

        return NextResponse.json(messages);
    } catch (e) {
        console.error("Error fetching messages:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { businessId, content, sender, type = 'text', attachmentUrl } = body;

        if (!businessId || (!content && !attachmentUrl) || !sender) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const message = {
            businessId,
            content: content || '',
            sender, // 'admin' or 'business'
            type, // 'text', 'image'
            attachmentUrl,
            timestamp: new Date(),
            read: false
        };

        const result = await db.collection(COLLECTION_NAME).insertOne(message);

        return NextResponse.json({ success: true, message: { ...message, _id: result.insertedId } });
    } catch (e) {
        console.error("Error sending message:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
