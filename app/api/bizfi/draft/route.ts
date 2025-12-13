import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

const COLLECTION_NAME = "bizfi_drafts";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    try {
        const db = await getDatabase();
        if (!db) {
            console.error("Database connection failed");
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        const draft = await db.collection(COLLECTION_NAME).findOne({ address: address.toLowerCase() });

        // Return empty object if no draft found, matching previous behavior
        return NextResponse.json(draft || {});
    } catch (e) {
        console.error("Failed to read draft", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { address, formData, step } = await req.json();

        if (!address) {
            return NextResponse.json({ error: "Address required" }, { status: 400 });
        }

        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        await db.collection(COLLECTION_NAME).updateOne(
            { address: address.toLowerCase() },
            {
                $set: {
                    formData,
                    step,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to save draft", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    try {
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ success: true }); // Fail silent if DB down on delete
        }

        await db.collection(COLLECTION_NAME).deleteOne({ address: address.toLowerCase() });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to delete draft", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
