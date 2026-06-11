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

    const currentPrice = poolState.current_price_usd;
    const feeRate = poolState.fee_rate || 0.01;
    const grossAmount = shares * currentPrice;
    const feeAmount = grossAmount * feeRate;
    const netPayout = grossAmount - feeAmount;

    // Fetch user position
    const position = await posCollection.findOne({ user_id: userId } as any);
    if (!position || position.shares_held < shares) {
      return NextResponse.json({ error: 'Insufficient shares' }, { status: 400 });
    }

    if (poolState.total_usdc_held < netPayout) {
      return NextResponse.json({ error: 'Insufficient pool liquidity to process sell' }, { status: 400 });
    }

    const txId = randomUUID();
    const now = new Date().toISOString();

    // 1. Update user position
    const newSharesHeld = position.shares_held - shares;
    
    // Pro-rata reduce total_invested_usd
    const averageCost = position.shares_held > 0 ? (position.total_invested_usd / position.shares_held) : 0;
    const costRemoved = averageCost * shares;
    const newTotalInvestedUsd = Math.max(0, position.total_invested_usd - costRemoved);

    await posCollection.updateOne(
      { user_id: userId } as any,
      {
        $set: {
          shares_held: newSharesHeld,
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
          total_shares_sold: -shares,
          total_usdc_held: -grossAmount, // remove the gross payout from custody
          collected_fees: feeAmount // add the fee back to custody/profits
        },
        $set: { updated_at: now }
      }
    );

    // 3. Record transaction
    const txRecord = {
      _id: txId,
      user_id: userId,
      type: 'sell',
      shares: shares,
      price_per_share: currentPrice,
      gross_amount: grossAmount,
      fee_amount: feeAmount,
      net_amount: netPayout, // what user received
      status: 'completed',
      created_at: now
    };

    await txCollection.insertOne(txRecord as any);

    return NextResponse.json({ success: true, transaction: txRecord });

  } catch (error: any) {
    console.error('WC26 sell error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
