import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';
import { savefiTransactionSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = rateLimit(request, 10, 60000); // 10 requests per minute
    if (rateLimitResponse) return rateLimitResponse;

    const { user, error: authError } = await authenticateRequest(request);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: ' + authError }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = savefiTransactionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { amount, txHash, chain, planName, type, currency } = validationResult.data;

    const supabase = getSupabaseAdmin();

    // 1. Find or create the savings plan
    let { data: plan, error: planError } = await supabase
      .from('savings_plans')
      .select('id, current_amount')
      .eq('user_id', user.id)
      .eq('plan_name', planName)
      .eq('chain', chain)
      .single();

    if (!plan) {
      // Create a placeholder plan since it doesn't exist yet
      const { data: newPlan, error: createPlanError } = await supabase
        .from('savings_plans')
        .insert({
          user_id: user.id,
          chain,
          contract_address: 'unknown',
          plan_name: planName,
          token_symbol: currency || 'USDC',
          target_amount: 0,
          current_amount: amount,
          penalty_percentage: 10,
          start_time: new Date().toISOString(),
          maturity_time: new Date().toISOString(), // Fallback
          status: 'active',
          tx_hash: txHash
        })
        .select('id, current_amount')
        .single();

      if (createPlanError) {
        console.error('Failed to create savings plan:', createPlanError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
      plan = newPlan;
    } else {
      // Update plan balance based on transaction type
      const numericAmount = parseFloat(amount);
      const isAddition = type === 'deposit' || type === 'topup' || type === 'top_up';
      const increment = isAddition ? numericAmount : -numericAmount;
      const newAmount = Math.max(0, parseFloat(plan.current_amount) + increment);

      await supabase
        .from('savings_plans')
        .update({ 
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', plan.id);
        
      plan.current_amount = newAmount.toString();
    }

    // 2. Insert transaction
    const mappedType = type === 'topup' ? 'top_up' : (type === 'withdraw' ? 'withdrawal' : type);

    const { data: tx, error: insertError } = await supabase
      .from('savefi_transactions')
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        type: ['deposit', 'top_up', 'withdrawal', 'early_withdrawal', 'maturity_withdrawal'].includes(mappedType) ? mappedType : 'top_up',
        amount,
        token_symbol: currency || 'USDC',
        chain,
        tx_hash: txHash,
        status: 'confirmed',
        balance_after: plan.current_amount
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to record SaveFi transaction:', insertError.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: tx });

  } catch (error: any) {
    console.error('SaveFi record-tx error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
