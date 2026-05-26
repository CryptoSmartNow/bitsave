import { NextRequest, NextResponse } from 'next/server';
import { getBizSwapCollection } from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { wallet, instrument, investmentAmount, feeAmount, totalCharged } = await req.json();

    if (!wallet || !instrument || !investmentAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collection = await getBizSwapCollection();
    if (!collection) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // Determine Certificate Specs
    let entitlement = '';
    let status = 'Active';
    let nextPayment = '';
    let apr = '';
    let payoutFrequency = '';
    const now = new Date();
    
    // Mocking on-chain mint address
    const mockMintAddress = "Cert_" + crypto.randomBytes(16).toString('hex');
    const serialNumber = Math.floor(1000 + Math.random() * 9000).toString();

    if (instrument === 'BizYield') {
      // Entitlement: (Investment / $10,000) * 100 = % of the 20% pool
      const percentage = (investmentAmount / 10000) * 100;
      entitlement = `${percentage.toFixed(2)}% rev share`;
      status = 'Vesting — Aug 1';
      nextPayment = '2026-08-01T00:00:00Z'; // Mocking Aug 1, 2026
      apr = 'Variable';
      payoutFrequency = 'Monthly';
    } else if (instrument === 'BizCredit') {
      // 4% quarterly over 12 weeks = 16% annualized. $8.67 per week per $100
      const units = Math.floor(investmentAmount / 100);
      const weeklyPayout = units * 8.67;
      entitlement = `$${weeklyPayout.toFixed(2)} / week`;
      status = 'Active';
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      nextPayment = nextWeek.toISOString();
      apr = '16% Annualised';
      payoutFrequency = 'Weekly';
    } else if (instrument === 'BizBond') {
      // 10% fixed annual. Quarterly payment.
      const annualYield = investmentAmount * 0.10;
      const quarterlyPayout = annualYield / 4;
      entitlement = `$${quarterlyPayout.toFixed(2)} / quarter`;
      status = 'Vesting — Aug 1';
      nextPayment = '2026-08-01T00:00:00Z';
      apr = '10% Fixed';
      payoutFrequency = 'Quarterly';
    } else {
      return NextResponse.json({ error: 'Invalid instrument type' }, { status: 400 });
    }

    const purchaseRecord = {
      wallet,
      instrument,
      investmentAmount,
      feeAmount,
      totalCharged,
      entitlement,
      status,
      nextPayment,
      mintAddress: mockMintAddress,
      serialNumber,
      apr,
      payoutFrequency,
      purchaseDate: now.toISOString(),
      createdAt: now
    };

    await collection.insertOne(purchaseRecord);

    // MOCK: In a real environment, this would sign a Solana transaction to mint the NFT/SPL token
    // and wait for confirmation.

    return NextResponse.json({
      success: true,
      message: 'Certificate minted successfully',
      data: purchaseRecord
    });

  } catch (error: any) {
    console.error('Minting error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
