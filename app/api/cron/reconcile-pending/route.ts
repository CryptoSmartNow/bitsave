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
    const wc26TransactionsCollection = db.collection('wc26_transactions');

    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const THREE_MINUTES_MS = 3 * 60 * 1000;
    const TEN_MINUTES_MS = 10 * 60 * 1000;

    // 2. Fetch all non-completed/non-terminal transactions across bizswap
    const pendingTransactions = await transactionsCollection.find({
      status: { $in: ['pending', 'failed_fulfillment', 'processing', 'awaiting_deposit'] }
    }).toArray();

    console.log(`[Cron] Found ${pendingTransactions.length} pending/processing BizSwap transactions to evaluate.`);

    let reconciledCount = 0;
    let expiredCount = 0;

    // 3. Reconcile each transaction
    for (const transaction of pendingTransactions) {
      const rawDate = transaction.timestamp || transaction.createdAt || transaction.created_at;
      const txTime = rawDate ? new Date(rawDate).getTime() : 0;
      const txAge = txTime > 0 ? (now - txTime) : TWENTY_FOUR_HOURS_MS + 1000;
      const isStaleExpired = txAge > TWENTY_FOUR_HOURS_MS;

      // Skip transactions that are very fresh (< 3 mins) unless they are already > 24h
      if (txAge < THREE_MINUTES_MS && !isStaleExpired && transaction.status !== 'failed_fulfillment') {
        continue;
      }

      // Handle orphaned transactions with no reference
      if (!transaction.reference) {
        if (isStaleExpired) {
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          expiredCount++;
          reconciledCount++;
        }
        continue;
      }

      try {
        let actualStatus = '';
        let txData: any = null;

        if (process.env.ONSWITCH_API_KEY) {
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
              console.warn(`[Cron] Onswitch API returned ${response.status} for reference ${transaction.reference}`);
            }
          } catch (apiErr) {
            console.error(`[Cron] Error fetching Onswitch status for ref=${transaction.reference}:`, apiErr);
          }
        }

        // Case A: If older than 24h and NOT completed on Onswitch -> Hard expire immediately
        if (isStaleExpired && actualStatus !== 'completed') {
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          if (transaction.reference) {
            await certsCollection.deleteMany({ reference: transaction.reference });
          }
          console.log(`[Cron] ref=${transaction.reference} was pending for >24h. Forcibly marked as expired.`);
          expiredCount++;
          reconciledCount++;

          const wallet = transaction.metadata?.wallet || transaction.userId;
          if (wallet) {
            try {
              await Promise.all([
                clearCache(`bizswap:holdings:${wallet}`),
                clearCache(`bizswap:payments:${wallet}`),
                clearCache('bizswap:analytics:global'),
                clearCache('bizswap:analytics:global:v2'),
              ]);
            } catch(e) {}
          }
          continue;
        }

        // Case B: Completed on Onswitch -> Fulfill and Mint
        if (actualStatus === 'completed') {
          // Acquire atomic processing lock
          const lockResult = await transactionsCollection.findOneAndUpdate(
            {
              _id: transaction._id,
              status: { $in: ['pending', 'failed_fulfillment', 'processing', 'awaiting_deposit'] },
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

          if (!lockResult) continue;

          // Verify payment amount
          const apiAmount = Number(txData.amount) || Number(txData.deposit?.amount);
          const expectedAmount = Number(lockResult.fiatAmount);
          const TOLERANCE = 0.5;

          if (apiAmount && expectedAmount && apiAmount < (expectedAmount - TOLERANCE)) {
            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'failed_underpaid', amount_received: apiAmount, updated_at: new Date() } }
            );
            continue;
          }

          // Mint certificate
          try {
            if (!lockResult.metadata) {
              throw new Error('No metadata found on transaction — cannot mint');
            }
            await handleMint({
              ...lockResult.metadata,
              originalPurchaseDate: lockResult.createdAt || lockResult.timestamp || new Date()
            });

            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'completed', completed_at: new Date(), updated_at: new Date() } }
            );

            reconciledCount++;
            console.log(`[Cron] ref=${transaction.reference} successfully fulfilled and minted!`);

            const wallet = lockResult.metadata?.wallet || lockResult.userId;
            if (wallet) {
              try {
                await Promise.all([
                  clearCache(`bizswap:holdings:${wallet}`),
                  clearCache(`bizswap:payments:${wallet}`),
                  clearCache('bizswap:analytics:global'),
                  clearCache('bizswap:analytics:global:v2'),
                ]);
              } catch(e) {}
            }
          } catch(mintErr: any) {
            await transactionsCollection.updateOne(
              { _id: lockResult._id },
              { $set: { status: 'failed_fulfillment', fulfillment_error: mintErr.message, updated_at: new Date() } }
            );
            console.error(`[Cron] Minting failed for ref=${transaction.reference}:`, mintErr.message);
          }
          continue;
        }

        // Case C: Terminal state on Onswitch
        if (['failed', 'cancelled', 'expired'].includes(actualStatus)) {
          await transactionsCollection.updateOne(
            { _id: transaction._id },
            { $set: { status: actualStatus, updated_at: new Date() } }
          );
          if (transaction.reference) {
            await certsCollection.deleteMany({ reference: transaction.reference });
          }
          console.log(`[Cron] ref=${transaction.reference} updated to terminal status "${actualStatus}".`);
          reconciledCount++;
          continue;
        }

        // Case D: Reset stuck 'processing' locks older than 10 minutes
        if (transaction.status === 'processing') {
          const lockStart = transaction.processing_started_at ? new Date(transaction.processing_started_at).getTime() : 0;
          if (now - lockStart > TEN_MINUTES_MS) {
            await transactionsCollection.updateOne(
              { _id: transaction._id, status: 'processing' },
              { $set: { status: 'pending', updated_at: new Date() } }
            );
            console.log(`[Cron] Released hung processing lock for ref=${transaction.reference}.`);
          }
        }

      } catch(err) {
        console.error(`[Cron] Error reconciling ref=${transaction.reference}:`, err);
      }
    }

    // 4. Also check WC26 stale pending transactions > 24 hours
    try {
      const staleWc26 = await wc26TransactionsCollection.find({
        status: { $in: ['pending', 'awaiting_deposit', 'processing'] }
      }).toArray();

      for (const wcTx of staleWc26) {
        const rawDate = wcTx.timestamp || wcTx.createdAt || wcTx.created_at;
        const txTime = rawDate ? new Date(rawDate).getTime() : 0;
        if (now - txTime > TWENTY_FOUR_HOURS_MS) {
          await wc26TransactionsCollection.updateOne(
            { _id: wcTx._id },
            { $set: { status: 'expired', updated_at: new Date() } }
          );
          expiredCount++;
        }
      }
    } catch(wc26Err) {
      console.warn('[Cron] WC26 stale check non-fatal error:', wc26Err);
    }

    // 5. Record Cron Execution Heartbeat for Dev-Admin Watch Tower
    try {
      await db.collection('system_cron_logs').updateOne(
        { job: 'reconcile-pending' },
        {
          $set: {
            job: 'reconcile-pending',
            lastRunAt: new Date(),
            reconciledCount,
            expiredCount,
            evaluatedCount: pendingTransactions.length,
            success: true,
            status: 'active',
          }
        },
        { upsert: true }
      );
    } catch (logErr) {
      console.warn('[Cron] Non-fatal log error:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Reconciled ${reconciledCount} transactions (${expiredCount} expired).`,
      evaluatedCount: pendingTransactions.length,
      reconciledCount,
      expiredCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Cron] Unhandled reconcile error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
