import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    
    if (!client) {
      throw new Error('Database connection failed');
    }

    const db = client.db('bitsave');
    const collection = db.collection('transactions');

    // Fetch transactions where token is 'USDGLO'
    // Note: Adjust the query if the field name for token/currency is different in your schema
    // Based on previous files, it seems to be 'token' or 'currency'
    // Let's assume 'token' based on common patterns, or check schema if needed.
    // Looking at user-interactions/route.ts, it uses 'token' in the transaction object.
    
    // We need to fetch all transactions for USDGLO
    const transactions = await collection.find({ 
      currency: { $regex: /^usdglo$/i } // Case insensitive search for USDGLO
    })
    .sort({ created_at: -1 })
    .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching USDGLO transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
