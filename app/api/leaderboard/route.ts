import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const collection = await getLeaderboardCollection();
    
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Fetch all users from leaderboard collection
    // Sort by totalamount descending
    const leaderboard = await collection.find({})
      .sort({ totalamount: -1 })
      .toArray();

    // Return plain array as expected by frontend
    return NextResponse.json(leaderboard.map((user: any) => ({
      useraddress: user.useraddress,
      totalamount: parseFloat(user.totalamount) || 0, // Ensure number
      chain: user.chain,
      id: user.id || user._id.toString()
    })));

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch leaderboard'
    }, { status: 500 });
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
