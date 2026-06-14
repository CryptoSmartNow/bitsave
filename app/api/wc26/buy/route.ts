import { NextRequest, NextResponse } from 'next/server';
import { getWc26PoolCollection, getWc26PositionsCollection, getWc26TransactionsCollection } from '@/lib/mongodb';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, shares } = body;

    if (!userId || !shares || shares <= 0 || !Number.isInteger(shares)) {
      return NextResponse.json({ error: 'Invalid request: userId and a positive integer for shares are required' }, { status: 400 });
    }

    const poolCollection = await getWc26PoolCollection();
    const posCollection = await getWc26PositionsCollection();
    const txCollection = await getWc26TransactionsCollection();

    if (!poolCollection || !posCollection || !txCollection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Validate pool state
    const poolState = await poolCollection.findOne({ _id: 'main_pool' as any });
    if (!poolState || !poolState.trading_open) {
      return NextResponse.json({ error: 'Trading is currently closed' }, { status: 403 });
    }

    // Shares are minted on request, so there's no fixed supply cap.
    const currentPrice = poolState.current_price_usd;
    const feeRate = poolState.fee_rate || 0.01;
    const grossAmount = shares * currentPrice;
    const feeAmount = grossAmount * feeRate;
    const totalCost = grossAmount + feeAmount;

    // Fetch user position to check USDC balance
    let position: any = await posCollection.findOne({ user_id: userId } as any);
    if (!position) {
      position = {
        user_id: userId,
        shares_held: 0,
        avg_buy_price: 0,
        total_invested_usd: 0,
        total_fees_paid: 0,
      };
      await posCollection.insertOne(position as any);
    }

    const txId = randomUUID();
    const now = new Date().toISOString();

    // In a real production system using MongoDB replica sets, this should be a transaction session.
    // For local development / single instances, we execute updates directly.

    // 1. Update user position
    const newSharesHeld = position.shares_held + shares;
    const newTotalInvestedUsd = position.total_invested_usd + grossAmount;
    const newAvgBuyPrice = newTotalInvestedUsd / newSharesHeld;

    await posCollection.updateOne(
      { user_id: userId } as any,
      {
        $set: {
          shares_held: newSharesHeld,
          avg_buy_price: newAvgBuyPrice,
          total_invested_usd: newTotalInvestedUsd,
          total_fees_paid: position.total_fees_paid + feeAmount,
          updated_at: now
        }
      }
    );

    // 2. Update pool
    await poolCollection.updateOne(
      { _id: 'main_pool' as any },
      {
        $inc: {
          total_shares_sold: shares,
          total_usdc_held: grossAmount,
          collected_fees: feeAmount
        },
        $set: { updated_at: now, sell_locked: false }
      }
    );

    // 3. Record transaction
    const txRecord = {
      _id: txId,
      user_id: userId,
      type: 'buy',
      shares: shares,
      price_per_share: currentPrice,
      gross_amount: grossAmount,
      fee_amount: feeAmount,
      net_amount: totalCost, // what user paid
      status: 'completed',
      created_at: now
    };

    await txCollection.insertOne(txRecord as any);

    return NextResponse.json({ success: true, transaction: txRecord });

  } catch (error: any) {
    console.error('WC26 buy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
