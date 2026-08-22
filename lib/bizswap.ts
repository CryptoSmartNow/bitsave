import { getSupabaseAdmin } from './supabase';
import crypto from 'crypto';

interface MintParams {
  userId: string;
  wallet: string;
  instrument: string;
  investmentAmount: number;
  feeAmount: number;
  totalCharged: number;
  bizswapReferralCode?: string | null;
}

export async function mintBizSwapCertificate(params: MintParams) {
  const supabase = getSupabaseAdmin();
  const now = new Date();

  // Determine Certificate Specs
  let entitlement = '';
  let status = 'Active';
  let nextPayment: Date | null = null;
  let apr = '';
  let payoutFrequency = '';

  const serialNumber = Math.floor(1000 + Math.random() * 9000).toString();

  if (params.instrument === 'BizYield') {
    const percentage = (params.investmentAmount / 10000) * 100;
    entitlement = `${percentage.toFixed(2)}% rev share`;
    const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
    nextPayment = vestEnd;
    apr = 'Variable';
    payoutFrequency = 'Monthly';
  } else if (params.instrument === 'BizCredit') {
    const units = Math.floor(params.investmentAmount / 100);
    const weeklyPayout = units * 8.67;
    entitlement = `$${weeklyPayout.toFixed(2)} / week`;
    status = 'Active';
    nextPayment = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    apr = '16% Annualised';
    payoutFrequency = 'Weekly';
  } else if (params.instrument === 'BizBond') {
    const annualYield = params.investmentAmount * 0.10;
    const quarterlyPayout = annualYield / 4;
    entitlement = `$${quarterlyPayout.toFixed(2)} / quarter`;
    const vestEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    status = `Vesting — ${vestEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' })}`;
    nextPayment = vestEnd;
    apr = '10% Fixed';
    payoutFrequency = 'Quarterly';
  } else {
    throw new Error('Invalid instrument type');
  }

  const certificateId = `cert_${crypto.randomUUID().replace(/-/g, '')}`;
  const transactionId = `tx_${crypto.randomUUID().replace(/-/g, '')}`;

  const certData = {
    user_id: params.userId,
    wallet: params.wallet,
    instrument: params.instrument,
    investment_amount: params.investmentAmount,
    fee_amount: params.feeAmount,
    total_charged: params.totalCharged,
    entitlement,
    apr,
    payout_frequency: payoutFrequency,
    status,
    next_payment: nextPayment ? nextPayment.toISOString() : null,
    serial_number: serialNumber,
    certificate_id: certificateId,
    transaction_id: transactionId,
    referred_by_code: params.bizswapReferralCode || null,
    purchase_date: now.toISOString(),
  };

  // Insert certificate
  const { data: cert, error: certError } = await supabase
    .from('bizswap_certificates')
    .insert(certData)
    .select()
    .single();

  if (certError) {
    throw new Error(`Failed to mint certificate: ${certError.message}`);
  }

  // Process referral if applicable
  if (params.bizswapReferralCode) {
    const rewardAmount = params.investmentAmount * 0.001; // 0.1%

    // Find the referrer by code
    const { data: referrer, error: refError } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', params.bizswapReferralCode.toUpperCase())
      .single();

    if (referrer && !refError) {
      // Check if earnings row exists
      const { data: existingEarnings } = await supabase
        .from('bizswap_referral_earnings')
        .select('*')
        .eq('user_id', referrer.id)
        .single();

      if (existingEarnings) {
        // We use an RPC call or simple update to increment
        // Since Supabase REST doesn't support $inc out of the box, we can just read/write here or use an RPC
        await supabase
          .from('bizswap_referral_earnings')
          .update({
            pending_usdc: Number(existingEarnings.pending_usdc) + rewardAmount,
            total_earned_usdc: Number(existingEarnings.total_earned_usdc) + rewardAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', referrer.id);
      } else {
        await supabase
          .from('bizswap_referral_earnings')
          .insert({
            user_id: referrer.id,
            pending_usdc: rewardAmount,
            total_earned_usdc: rewardAmount
          });
      }
    }
  }

  return cert;
}
