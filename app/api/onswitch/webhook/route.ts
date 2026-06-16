import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Verify webhook payload
    if (!data || !data.data || !data.data.reference) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const transactionData = data.data;

    // Only process if the transaction is completed
    if (transactionData.status === 'COMPLETED') {
      const client = await clientPromise;
      if (!client) {
        throw new Error('Database client is not available');
      }
      const db = client.db('CryptoSmartNow');
      const transactionsCollection = db.collection('wc26_transactions');
      const positionsCollection = db.collection('wc26_positions');
      const poolCollection = db.collection('wc26_pool');

      // Find the pending transaction
      const transaction = await transactionsCollection.findOne({
        reference: transactionData.reference,
        status: 'pending'
      });

      if (transaction) {
        // Complete the transaction in DB
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          { $set: { status: 'completed', updated_at: new Date() } }
        );

        // Update the user's position
        await positionsCollection.updateOne(
          { userId: transaction.userId },
          {
            $inc: { shares: transaction.shares, totalInvestment: transaction.usdcAmount },
            $set: { lastUpdated: new Date() },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );

        // Update the pool stats
        await poolCollection.updateOne(
          { name: 'WC26' },
          {
            $inc: { 
              totalShares: transaction.shares, 
              totalUSDC: transaction.usdcAmount 
            },
            $set: { lastUpdated: new Date() },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
        
        console.log(`Successfully credited user ${transaction.userId} with ${transaction.shares} shares from Onswitch webhook.`);
      } else {
        console.warn(`Transaction reference ${transactionData.reference} not found or already processed.`);
      }
    }

    // Always return 200 OK to the webhook provider so they don't retry unnecessarily
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Onswitch webhook:', error);
    // Return 500 so Onswitch retries if it's a real server error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
