import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-switch-signature');

    // Signature Verification
    if (signature) {
      let ONSWITCH_API_KEY = process.env.ONSWITCH_API_KEY;
      if (!ONSWITCH_API_KEY) {
        const fs = require('fs');
        const path = require('path');
        try {
          const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
          const match = envFile.match(/ONSWITCH_API_KEY=(.*)/);
          if (match && match[1]) ONSWITCH_API_KEY = match[1].trim();
        } catch (e) {}
      }

      if (ONSWITCH_API_KEY) {
        const expectedSignature = crypto
          .createHmac('sha256', ONSWITCH_API_KEY)
          .update(rawBody)
          .digest('hex');

        // Note: using crypto.timingSafeEqual is best practice but standard string comparison works
        if (expectedSignature !== signature.trim()) {
          console.error('Invalid Onswitch webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    } else {
      console.warn('Missing x-switch-signature header on incoming webhook');
    }

    const data = JSON.parse(rawBody);

    // Verify webhook payload
    if (!data || !data.data || !data.data.reference) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const transactionData = data.data;

    const incomingStatus = (transactionData.status || '').toLowerCase();

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

    if (!transaction) {
      console.warn(`Transaction reference ${transactionData.reference} not found or already processed.`);
      return NextResponse.json({ success: true });
    }

    if (incomingStatus === 'completed') {
      // 1. Verify the amount paid matches the expected amount
      // Webhook payload might contain amount in data.amount or data.deposit.amount
      const webhookAmount = Number(transactionData.amount) || Number(transactionData.deposit?.amount);
      const expectedAmount = Number(transaction.fiatAmount);

      // We allow a small tolerance (e.g., 0.5 fiat units) because Onswitch might quote an amount 
      // with 4 decimal places (15000.0929) but a user's bank might only allow transferring 2 decimal places (15000.09).
      const TOLERANCE = 0.5;
      if (webhookAmount && webhookAmount < (expectedAmount - TOLERANCE)) {
        console.error(`Amount mismatch for ${transactionData.reference}: Expected ${expectedAmount}, Got ${webhookAmount}`);
        
        // Mark transaction as failed due to underpayment
        await transactionsCollection.updateOne(
          { _id: transaction._id },
          { $set: { status: 'failed_underpaid', amount_received: webhookAmount, updated_at: new Date() } }
        );
        
        // Still return 200 so the provider doesn't keep retrying
        return NextResponse.json({ success: true, message: 'Underpaid transaction recorded' });
      }

      // 2. Perform fulfillment BEFORE marking as completed
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
          try {
            const { handleMint } = await import('@/lib/handleMint');
            await handleMint(transaction.metadata);
            console.log(`Successfully minted bizswap certificate for ${transaction.userId} from webhook.`);
          } catch (error: any) {
            console.error('Failed to mint bizswap certificate from webhook:', error.message);
            // Throw error to trigger a 500 response and force Onswitch to retry later
            throw new Error(`Minting failed: ${error.message}`);
          }
        } else {
          console.error(`No metadata found for bizswap transaction ${transaction.reference}`);
          throw new Error('No metadata found for bizswap transaction');
        }
      }

      // 3. Complete the transaction in DB ONLY after successful fulfillment
      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { status: 'completed', updated_at: new Date() } }
      );
    } else {
      // 4. Update the database with the real non-completed status (e.g. 'failed', 'cancelled', 'expired')
      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { status: incomingStatus, updated_at: new Date() } }
      );
      console.log(`Transaction ${transactionData.reference} status updated to ${incomingStatus}`);
    }

    // Always return 200 OK to the webhook provider so they don't retry unnecessarily
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing Onswitch webhook:', error);
    // Return 500 so Onswitch retries if it's a real server error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
