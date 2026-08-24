import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, getLeaderboardCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json([]);
    }

    const leaderboardCollection = db.collection('leaderboard');
    const usersCollection = db.collection('users');

    const GOODDOLLAR_PRICE = 0.0001086;
    const SUPPORTED_CHAINS = new Set(['base', 'celo', 'lisk', 'bsc', 'avalanche']);

    // 1. Fetch from leaderboard collection
    const rawLeaderboard = await leaderboardCollection.find({}).toArray();

    const validEntries = rawLeaderboard.filter((entry: any) => {
      const addr = (entry.useraddress || '').toLowerCase();
      let chain = (entry.chain || 'base').toLowerCase();
      if (chain === 'avax') chain = 'avalanche';
      return addr.startsWith('0x') && addr.length === 42 && addr !== 'string' && SUPPORTED_CHAINS.has(chain);
    });

    // 2. Fetch all related users for Savvy Names
    const allAddresses = validEntries.map((e: any) => e.useraddress.toLowerCase());
    const users = await usersCollection
      .find({ walletAddress: { $in: allAddresses } })
      .project({ walletAddress: 1, savvyName: 1 })
      .toArray();

    const savvyMap = users.reduce((acc: Record<string, string>, u) => {
      if (u.walletAddress && u.savvyName) {
        acc[u.walletAddress.toLowerCase()] = u.savvyName;
      }
      return acc;
    }, {});

    // 3. Format and return accurate rankings
    const enhancedLeaderboard = validEntries
      .map((entry: any) => {
        let totalUsd = parseFloat(entry.totalamount || 0);
        let chain = (entry.chain || 'base').toLowerCase();
        if (chain === 'avax') chain = 'avalanche';

        if (chain === 'celo' && totalUsd > 1000) {
          totalUsd = totalUsd * GOODDOLLAR_PRICE;
        }

        const addrLower = entry.useraddress.toLowerCase();
        return {
          useraddress: entry.useraddress,
          savvyName: savvyMap[addrLower] || null,
          totalamount: Number(totalUsd.toFixed(2)),
          chain: chain,
          id: entry._id ? entry._id.toString() : entry.id || entry.useraddress
        };
      })
      .filter((u: any) => u.totalamount > 0)
      .sort((a: any, b: any) => b.totalamount - a.totalamount);

    return NextResponse.json(enhancedLeaderboard);

  } catch (error) {
    console.warn('Leaderboard fetch fallback used:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { useraddress, totalamount, chain } = body;

    if (!useraddress || totalamount === undefined) {
      return NextResponse.json(
        { error: 'Missing useraddress or totalamount' },
        { status: 400 }
      );
    }

    const collection = await getLeaderboardCollection();

    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const newUser = {
      useraddress,
      totalamount: Number(totalamount),
      chain: chain || 'base',
      created_at: new Date()
    };

    const result = await collection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString()
    });

  } catch (error) {
    console.error('Error creating leaderboard entry:', error);
    return NextResponse.json({
      error: 'Failed to create entry'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, useraddress, totalamount, chain } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const collection = await getLeaderboardCollection();

    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Try to handle both ObjectId and string id
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    const updateData: any = {};
    if (useraddress) updateData.useraddress = useraddress;
    if (totalamount !== undefined) updateData.totalamount = Number(totalamount);
    if (chain) updateData.chain = chain;

    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      // Fallback try string id if ObjectId failed
      const result2 = await collection.updateOne({ id: id }, { $set: updateData });
      if (result2.matchedCount === 0) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json({
      error: 'Failed to update entry'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const collection = await getLeaderboardCollection();

    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { id: id };
    }

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      const result2 = await collection.deleteOne({ id: id });
      if (result2.deletedCount === 0) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting leaderboard entry:', error);
    return NextResponse.json({
      error: 'Failed to delete entry'
    }, { status: 500 });
  }
}
