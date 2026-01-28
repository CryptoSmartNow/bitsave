import { NextRequest, NextResponse } from 'next/server';
import { getUserReadUpdatesCollection } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const address = params.address;
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const collection = await getUserReadUpdatesCollection();
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    // Find all read updates for this user
    const readUpdates = await collection.find({ 
      useraddress: { $regex: new RegExp(`^${address}$`, 'i') } 
    }).toArray();

    return NextResponse.json(readUpdates.map((update: any) => ({
      id: update.updateId,
      isNew: false // If it's in this collection, it's read (not new)
    })));

  } catch (error) {
    console.error('Error fetching user read updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user read updates' },
      { status: 500 }
    );
  }
}
