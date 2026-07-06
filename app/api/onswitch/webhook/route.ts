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
      const db = client.db('bitsave');

      const positionsCollection = db.collection('wc26_positions');
      const poolCollection = db.collection('wc26_pool');

      // Find the pending transaction in either wc26 or bizswap
      let project = 'wc26';
      let transactionsCollection = db.collection('wc26_transactions');
      let transaction = await transactionsCollection.findOne({
        reference: transactionData.reference,
        status: 'pending'
      });

      if (!transaction) {
        project = 'bizswap';
        transactionsCollection = db.collection('bizswap_transactions');
        transaction = await transactionsCollection.findOne({
          reference: transactionData.reference,
          status: 'pending'
        });
      }

      if (transaction) {
        // Complete the transaction in DB
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          { $set: { status: 'completed', updated_at: new Date() } }
        );

        if (project === 'wc26') {
          // Calculate investment vs fees based on a fixed $10 share price
          const pureInvestment = transaction.shares * 10;
          const feePaid = transaction.usdcAmount - pureInvestment;

          // Update the user's position
          await positionsCollection.updateOne(
            { user_id: transaction.userId },
            {
              $inc: { 
                shares_held: transaction.shares, 
                total_invested_usd: pureInvestment,
                total_fees_paid: feePaid > 0 ? feePaid : 0
              },
              $set: { lastUpdated: new Date() },
              $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true }
          );

          // Update the pool stats
          await poolCollection.updateOne(
            { _id: 'main_pool' as any },
            {
              $inc: { 
                current_supply: transaction.shares, 
                current_tvl_usd: pureInvestment 
              },
              $set: { last_updated: new Date() },
              $setOnInsert: { created_at: new Date() }
            },
            { upsert: true }
          );
          
          console.log(`Successfully credited user ${transaction.userId} with ${transaction.shares} shares from Onswitch webhook.`);
        } else if (project === 'bizswap') {
          if (transaction.metadata) {
            const baseUrl = req.nextUrl.origin || 'https://bitsave.io';
            const mintResponse = await fetch(`${baseUrl}/api/bizswap/mint`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(transaction.metadata)
            });
            if (!mintResponse.ok) {
              console.error('Failed to mint bizswap certificate from webhook:', await mintResponse.text());
            } else {
              console.log(`Successfully minted bizswap certificate for ${transaction.userId} from webhook.`);
            }
          } else {
            console.error(`No metadata found for bizswap transaction ${transaction.reference}`);
          }
        }
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
