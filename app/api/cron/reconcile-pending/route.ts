import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { handleMint } from '@/lib/handleMint';
import { clearCache } from '@/lib/redis';

export const maxDuration = 300; // Allow 5 minutes for cron execution

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Vercel Cron Secret (if configured)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('[Cron] CRON_SECRET is not set in environment variables! Job ran unprotected.');
    }

    const client = await clientPromise;
    if (!client) {
      throw new Error('Database client is not available');
    }
    const db = client.db('bitsave');
    const transactionsCollection = db.collection('bizswap_transactions');

    const certsCollection = db.collection('bizswap_certificates');

    // 2. Fetch pending/failed_fulfillment transactions older than 3 minutes
    // This gives the webhook enough time to normally process things before the cron steps in
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const pendingTransactions = await transactionsCollection.find({
      status: { $in: ['pending', 'failed_fulfillment'] },
      timestamp: { $lte: threeMinutesAgo }
    }).toArray();

    if (pendingTransactions.length === 0) {
      return NextResponse.json({ success: true, message: 'No stale pending transactions found' });
    }

    console.log(`[Cron] Found ${pendingTransactions.length} stale pending transactions. Reconciling...`);

    let reconciledCount = 0;

    // 3. Reconcile each transaction
    for (const transaction of pendingTransactions) {
      const txAge = Date.now() - new Date(transaction.timestamp || transaction.createdAt || 0).getTime();
      const isStaleExpired = txAge > 24 * 60 * 60 * 1000;

      if (!transaction.reference) {
        if (isStaleExpired) {
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          reconciledCount++;
        }
        continue;
      }

      try {
        let actualStatus = '';
        let txData: any = null;

        try {
          const response = await fetch(`https://api.onswitch.xyz/payment/status?reference=${transaction.reference}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ONSWITCH_API_KEY}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            txData = data.data || data;
            actualStatus = (txData.status || '').toLowerCase();
          } else {
            console.error(`[Cron] Onswitch API returned ${response.status} for reference ${transaction.reference}`);
          }
        } catch (apiErr) {
          console.error(`[Cron] Error fetching Onswitch status:`, apiErr);
        }

        // If stale (>24h) and not completed, expire immediately and purge any premature certificates
        if (isStaleExpired && actualStatus !== 'completed') {
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          if (transaction.reference) {
            await certsCollection.deleteMany({ reference: transaction.reference });
          }
          console.log(`[Cron] ref=${transaction.reference} was pending for >24h. Forcibly expired.`);
          reconciledCount++;

          const wallet = transaction.metadata?.wallet || transaction.userId;
          if (wallet) {
            try {
              await Promise.all([
                clearCache(`bizswap:holdings:${wallet}`),
                clearCache(`bizswap:payments:${wallet}`),
                clearCache('bizswap:analytics:global'),
              ]);
            } catch(e) {}
          }
          continue;
        }

        // Use atomic processing lock (same as webhook) to prevent race conditions
        const lockResult = await transactionsCollection.findOneAndUpdate(
          {
            _id: transaction._id,
            status: { $in: ['pending', 'failed_fulfillment'] },
          },
          {
            $set: {
              status: 'processing',
              processing_started_at: new Date(),
              updated_at: new Date(),
            },
          },
          { returnDocument: 'after' }
        );

        if (!lockResult) {
          console.log(`[Cron] ref=${transaction.reference} — Could not acquire processing lock. Skipping.`);
          continue;
        }

        if (actualStatus === 'completed') {
          // Verify amount if provided
          const apiAmount = Number(txData.amount) || Number(txData.deposit?.amount);
          const expectedAmount = Number(lockResult.fiatAmount);
          const TOLERANCE = 0.5;

          if (apiAmount && apiAmount < (expectedAmount - TOLERANCE)) {
            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'failed_underpaid', amount_received: apiAmount, updated_at: new Date() } }
            );
            continue;
          }

          // Fulfill (mint certificate)
          try {
            if (!lockResult.metadata) {
              throw new Error('No metadata found — cannot mint');
            }
            await handleMint({
              ...lockResult.metadata,
              originalPurchaseDate: lockResult.createdAt || lockResult.timestamp
            });
            
            // Mark as completed
            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'completed', completed_at: new Date(), updated_at: new Date() } }
            );
            
            reconciledCount++;
            console.log(`[Cron] ref=${transaction.reference} successfully reconciled to completed and minted!`);

            // Clear cache
            try {
              const wallet = lockResult.metadata?.wallet || lockResult.userId;
              if (wallet) {
                await Promise.all([
                  clearCache(`bizswap:holdings:${wallet}`),
                  clearCache(`bizswap:payments:${wallet}`),
                  clearCache('bizswap:analytics:global'),
                ]);
              }
            } catch(e) {}
            
          } catch(mintError: any) {
            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'failed_fulfillment', fulfillment_error: mintError.message, updated_at: new Date() } }
            );
            console.error(`[Cron] Minting failed for ${transaction.reference}:`, mintError.message);
          }

        } else if (['failed', 'cancelled', 'expired'].includes(actualStatus)) {
          // Terminal state -> Update DB & purge any premature certificate
          await transactionsCollection.updateOne(
            { _id: lockResult._id },
            { $set: { status: actualStatus, updated_at: new Date() } }
          );
          if (transaction.reference) {
            await certsCollection.deleteMany({ reference: transaction.reference });
          }
          console.log(`[Cron] ref=${transaction.reference} reconciled to ${actualStatus}.`);
          reconciledCount++;
        } else if (isStaleExpired) {
          // It's still awaiting_deposit but it's older than 24 hours. Hard expire it & purge premature certificate
          await transactionsCollection.updateOne(
            { _id: lockResult._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          if (transaction.reference) {
            await certsCollection.deleteMany({ reference: transaction.reference });
          }
          console.log(`[Cron] ref=${transaction.reference} was pending for >24h. Forcibly expired.`);
          reconciledCount++;
        } else {
          // Still awaiting_deposit or pending and within 24h window. Revert the lock back to pending
          await transactionsCollection.updateOne(
            { _id: lockResult._id },
            { $set: { status: 'pending', updated_at: new Date() } }
          );
        }

      } catch(err) {
        console.error(`[Cron] Error reconciling ref=${transaction.reference}`, err);
        // Release lock
        await transactionsCollection.updateOne(
          { _id: transaction._id, status: 'processing' },
          { $set: { status: 'pending', updated_at: new Date() } }
        );
      }
    }

    return NextResponse.json({ success: true, message: `Reconciled ${reconciledCount} transactions.` });
  } catch (error: any) {
    console.error('[Cron] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
