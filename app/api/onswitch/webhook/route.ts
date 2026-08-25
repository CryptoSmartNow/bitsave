import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';
import { handleMint } from '@/lib/handleMint';
import { clearCache } from '@/lib/redis';

export async function POST(req: NextRequest) {
  let logReference = 'unknown';

  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-switch-signature');

    // ── Signature Verification ──────────────────────────────────────────
    const ONSWITCH_API_KEY = process.env.ONSWITCH_API_KEY;

    if (signature) {
      if (ONSWITCH_API_KEY) {
        const expectedSignature = crypto
          .createHmac('sha256', ONSWITCH_API_KEY)
          .update(rawBody)
          .digest('hex');

        if (expectedSignature !== signature.trim()) {
          console.error('[Webhook] Invalid Onswitch webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    } else {
      // In production, reject unsigned requests for security
      if (process.env.NODE_ENV === 'production') {
        console.error('[Webhook] Missing x-switch-signature header — rejecting in production');
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      console.warn('[Webhook] Missing x-switch-signature header (allowed in dev mode)');
    }

    const data = JSON.parse(rawBody);

    // ── Log raw payload for debugging ───────────────────────────────────
    console.log(`[Webhook] Raw payload:`, JSON.stringify(data, null, 2));

    // ── Validate & extract payload ──────────────────────────────────────
    // Onswitch may send payloads in different structures depending on event type:
    //   - { data: { reference, status, ... } }          — standard
    //   - { reference, status, data: { ... } }          — alternative
    //   - { event: "...", data: { reference, ... } }    — event-based
    const transactionData = data.data || data;
    const reference = transactionData.reference || data.reference;

    if (!reference) {
      console.warn('[Webhook] No reference found in payload — ignoring. Keys:', Object.keys(data));
      // Return 200 so Onswitch doesn't keep retrying non-transactional webhooks (e.g. health checks)
      return NextResponse.json({ success: true, message: 'No reference — ignored' });
    }

    logReference = reference;
    const incomingStatus = (transactionData.status || data.status || '').toLowerCase();

    console.log(`[Webhook] Received status="${incomingStatus}" for ref=${logReference}`);

    const client = await clientPromise;
    if (!client) {
      throw new Error('Database client is not available');
    }
    const db = client.db('bitsave');

    // ── Step 1: Find the transaction by reference ONLY (not by status) ──
    // This enables idempotent retry handling — we can find already-processed
    // transactions and short-circuit instead of silently swallowing retries.
    const transactionsCollection = db.collection('bizswap_transactions');
    const transaction = await transactionsCollection.findOne({
      reference,
    });

    if (!transaction) {
      console.warn(`[Webhook] ref=${logReference} — Transaction not found in bizswap_transactions. Ignoring.`);
      return NextResponse.json({ success: true });
    }

    // ── Step 2: Idempotency guard — already completed? ──────────────────
    if (transaction.status === 'completed') {
      console.log(`[Webhook] ref=${logReference} — Already completed. Idempotent skip.`);
      return NextResponse.json({ success: true });
    }

    // Already in a terminal failure state? Don't re-process.
    if (['failed_underpaid', 'failed', 'cancelled', 'expired'].includes(transaction.status)) {
      console.log(`[Webhook] ref=${logReference} — Already in terminal state "${transaction.status}". Skipping.`);
      return NextResponse.json({ success: true });
    }

    // Currently being processed by another webhook delivery?
    if (transaction.status === 'processing') {
      console.log(`[Webhook] ref=${logReference} — Currently being processed by another request. Skipping.`);
      return NextResponse.json({ success: true });
    }

    // ── Handle completed payments ───────────────────────────────────────
    if (incomingStatus === 'completed') {

      // ── Step 3: Atomic processing lock ────────────────────────────────
      // Use findOneAndUpdate with status:'pending' (or 'failed_fulfillment' for retries)
      // as a filter. Only ONE concurrent request can acquire this lock.
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
        // Another request already acquired the lock or transaction moved past pending
        console.log(`[Webhook] ref=${logReference} — Could not acquire processing lock. Another handler is processing this.`);
        return NextResponse.json({ success: true });
      }

      const lockedTransaction = lockResult;

      // ── Step 4: Verify amount ─────────────────────────────────────────
      const webhookAmount = Number(transactionData.amount) || Number(transactionData.deposit?.amount);
      const expectedAmount = Number(lockedTransaction.fiatAmount);

      const TOLERANCE = 0.5;
      if (webhookAmount && webhookAmount < (expectedAmount - TOLERANCE)) {
        console.error(`[Webhook] ref=${logReference} — Amount mismatch: Expected ${expectedAmount}, Got ${webhookAmount}`);

        await transactionsCollection.updateOne(
          { _id: lockedTransaction._id },
          {
            $set: {
              status: 'failed_underpaid',
              amount_received: webhookAmount,
              updated_at: new Date(),
            },
          }
        );

        return NextResponse.json({ success: true, message: 'Underpaid transaction recorded' });
      }

      // ── Step 5: Perform fulfillment ───────────────────────────────────
      try {
        if (!lockedTransaction.metadata) {
          throw new Error('No metadata found for bizswap transaction — cannot mint');
        }

        // Webhook might be delayed. Use the actual transaction creation time.
        await handleMint({
          ...lockedTransaction.metadata,
          originalPurchaseDate: lockedTransaction.createdAt || lockedTransaction.timestamp
        });
        console.log(`[Webhook] ref=${logReference} — Minted BizSwap certificate for ${lockedTransaction.userId}.`);

      } catch (fulfillmentError: any) {
        // ── Step 5b: Fulfillment failed — mark as failed_fulfillment ───
        // This is the KEY fix: instead of leaving the transaction as 'pending'
        // (which was causing the "stuck pending forever" bug), we move it to
        // a distinct 'failed_fulfillment' state with error details.
        // The processing lock filter above allows retries to re-attempt from this state.
        console.error(`[Webhook] ref=${logReference} — Fulfillment failed:`, fulfillmentError.message);

        await transactionsCollection.updateOne(
          { _id: lockedTransaction._id },
          {
            $set: {
              status: 'failed_fulfillment',
              fulfillment_error: fulfillmentError.message,
              fulfillment_attempts: (lockedTransaction.fulfillment_attempts || 0) + 1,
              updated_at: new Date(),
            },
          }
        );

        // Return 500 so Onswitch retries — and our lock filter allows
        // 'failed_fulfillment' to be re-processed on the next attempt.
        return NextResponse.json({ error: 'Fulfillment failed' }, { status: 500 });
      }

      // ── Step 6: Mark as completed ─────────────────────────────────────
      await transactionsCollection.updateOne(
        { _id: lockedTransaction._id },
        {
          $set: {
            status: 'completed',
            completed_at: new Date(),
            updated_at: new Date(),
          },
        }
      );

      console.log(`[Webhook] ref=${logReference} — Transaction completed successfully.`);

      // ── Step 7: Invalidate Redis caches ───────────────────────────────
      // This ensures the user's dashboard updates immediately instead of
      // waiting for the 60-120s cache TTL to expire.
      try {
        const wallet = lockedTransaction.metadata?.wallet || lockedTransaction.userId;
        if (wallet) {
          await Promise.all([
            clearCache(`bizswap:holdings:${wallet}`),
            clearCache(`bizswap:payments:${wallet}`),
            clearCache('bizswap:analytics:global'),
          ]);
        }
      } catch (cacheError) {
        // Non-critical — log but don't fail the webhook
        console.warn(`[Webhook] ref=${logReference} — Cache invalidation failed:`, cacheError);
      }

    } else {
      // ── Handle non-completed statuses (failed, cancelled, expired) ────
      await transactionsCollection.updateOne(
        { _id: transaction._id },
        { $set: { status: incomingStatus, updated_at: new Date() } }
      );
      console.log(`[Webhook] ref=${logReference} — Status updated to "${incomingStatus}".`);
    }

    // Always return 200 OK so the webhook provider doesn't retry unnecessarily
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[Webhook] ref=${logReference} — Unhandled error:`, error);
    // Return 500 so Onswitch retries if it's a real server error
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
