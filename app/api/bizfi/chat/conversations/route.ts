import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

const MESSAGES_COLLECTION = "chat_messages";
const BUSINESSES_COLLECTION = "businesses";

interface Conversation {
    businessId: string;
    lastMessage: {
        timestamp: string | Date;
        [key: string]: any;
    };
    unreadCount: number;
    [key: string]: any;
}

export async function GET() {
    try {
        const db = await getDatabase();
        if (!db) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }

        // Aggregate messages to find unique conversations and the last message
        const conversations = await db.collection(MESSAGES_COLLECTION).aggregate([
            {
                $sort: { timestamp: -1 }
            },
            {
                $group: {
                    _id: "$businessId",
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$read", false] }, { $eq: ["$sender", "business"] }] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    businessId: "$_id",
                    lastMessage: 1,
                    unreadCount: 1
                }
            }
        ]).toArray() as unknown as Conversation[];

        // Fetch business details for each conversation
        const businessIds = conversations.map(c => c.businessId);
        const businesses = await db.collection(BUSINESSES_COLLECTION)
            .find({ 
                // businessId in messages could be transactionHash or owner address
                // We should probably check which one we are using.
                // For now assuming businessId maps to either transactionHash or owner.
                // Let's assume businessId is passed as business's transactionHash or owner from the frontend.
                // I will update the frontend to use transactionHash as the ID.
                $or: [
                    { transactionHash: { $in: businessIds } },
                    { owner: { $in: businessIds } }
                ]
            })
            .toArray();

        // Merge details
        const result = conversations.map(conv => {
            const business = businesses.find(b => 
                b.transactionHash === conv.businessId || b.owner === conv.businessId
            );
            return {
                ...conv,
                businessName: business?.businessName || "Unknown Business",
                businessOwner: business?.owner,
                businessTier: business?.tier,
                businessStatus: business?.status
            };
        });
        
        // Sort by last message time
        result.sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

        return NextResponse.json(result);
    } catch (e) {
        console.error("Error fetching conversations:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
