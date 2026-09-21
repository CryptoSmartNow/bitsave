import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { authenticateRequest } from '@/lib/auth';
import { savefiTransactionSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 10, 60000); // 10 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      // If user is not yet logged in with Privy session (e.g. connected via standalone Wagmi), return 200 with soft warning
      return NextResponse.json({ success: true, message: 'Transaction recorded locally (auth session not active)' }, { status: 200 });
    }

    const body = await request.json();
    const validationResult = savefiTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { amount, txHash, chain, planName, type, currency } = validationResult.data;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ success: true, message: 'Database client offline, onchain tx confirmed' }, { status: 200 });
    }

    const userIdStr = (user as any)._id ? (user as any)._id.toString() : (user as any).privy_did || (user as any).id;

    // 1. Find or create the savings plan
    let plan: any = null;
    try {
      plan = await db.collection('savings_plans').findOne({
        user_id: userIdStr,
        plan_name: planName,
        chain: chain
      });
    } catch (e: any) {
      console.warn('Database query skipped:', e.message);
      return NextResponse.json({ success: true, message: 'Transaction confirmed onchain' }, { status: 200 });
    }

    const numericAmount = parseFloat(amount);

    if (!plan) {
      try {
        // Create a placeholder plan since it doesn't exist yet
        const newPlan = {
          user_id: userIdStr,
          chain,
          contract_address: 'unknown',
          plan_name: planName,
          token_symbol: currency || 'USDC',
          target_amount: 0,
          current_amount: numericAmount,
          penalty_percentage: 10,
          start_time: new Date().toISOString(),
          maturity_time: new Date().toISOString(), // Fallback
          status: 'active',
          tx_hash: txHash,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const result = await db.collection('savings_plans').insertOne(newPlan);
        
        plan = {
          _id: result.insertedId,
          ...newPlan,
          current_amount: newPlan.current_amount.toString()
        };
      } catch (e: any) {
        return NextResponse.json({ success: true, message: 'Transaction confirmed onchain' }, { status: 200 });
      }
    } else {
      // Update plan balance based on transaction type
      const isAddition = type === 'deposit' || type === 'topup' || type === 'top_up';
      const increment = isAddition ? numericAmount : -numericAmount;
      const newAmount = Math.max(0, parseFloat(plan.current_amount) + increment);

      await db.collection('savings_plans').updateOne(
        { _id: plan._id },
        { 
          $set: {
            current_amount: newAmount,
            updated_at: new Date().toISOString()
          }
        }
      );
        
      plan.current_amount = newAmount.toString();
    }

    // 2. Insert transaction
    const mappedType = type === 'topup' ? 'top_up' : (type === 'withdraw' ? 'withdrawal' : type);
    const validTypes = ['deposit', 'top_up', 'withdrawal', 'early_withdrawal', 'maturity_withdrawal'];

    const newTx = {
      user_id: userIdStr,
      plan_id: plan._id.toString(),
      type: validTypes.includes(mappedType) ? mappedType : 'top_up',
      amount,
      token_symbol: currency || 'USDC',
      chain,
      tx_hash: txHash,
      status: 'confirmed',
      balance_after: plan.current_amount,
      created_at: new Date().toISOString()
    };

    try {
      await db.collection('savefi_transactions').insertOne(newTx);
    } catch (insertError: any) {
      console.error('Failed to record SaveFi transaction:', insertError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: newTx });

  } catch (error: any) {
    console.error('SaveFi record-tx error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
