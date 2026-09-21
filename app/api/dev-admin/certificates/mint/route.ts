import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { handleMint } from '@/lib/handleMint';
import { verifyAdmin } from '@/lib/adminVerify';


const NGN_RATE = 1385; // Approximate NGN per USDC



export async function POST(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const { wallet, email, usdcAmount, instrument, channel, purchaseDate } = await req.json();

    if (!wallet && !email) {
      return NextResponse.json({ error: 'Wallet or Email is required' }, { status: 400 });
    }
    if (!usdcAmount || isNaN(Number(usdcAmount))) {
      return NextResponse.json({ error: 'Valid USDC amount is required' }, { status: 400 });
    }

    const investmentAmount = Number(usdcAmount);
    const instrumentName = instrument || 'BizYield';
    const fiatAmount = investmentAmount * NGN_RATE;

    // Mint the certificate using the real handleMint logic (same as normal flow)
    const certificate = await handleMint({
      wallet: wallet || '',
      email: email || '',
      instrument: instrumentName,
      investmentAmount,
      feeAmount: 0,
      totalCharged: investmentAmount,
      chain: 'base',
      originalPurchaseDate: purchaseDate || undefined,
    });

    // Add to bizswap_transactions so it shows in the admin Transactions tab
    const txReference = `manual-${Date.now()}`;
    const bizswapTransaction = {
      userId: wallet || email,
      type: 'buy',
      paymentMethod: channel || 'fiat',
      usdcAmount: investmentAmount,
      fiatAmount,
      currency: 'NGN',
      reference: txReference,
      status: 'completed',
      timestamp: purchaseDate ? new Date(purchaseDate) : new Date(),
      createdAt: new Date(),
      updated_at: new Date(),
      completedBy: 'admin_manual',
      metadata: {
        wallet: wallet || '',
        email: email || '',
        instrument: instrumentName,
        investmentAmount,
        selectedChainKey: 'base',
        purchaseChannel: channel || 'fiat',
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      },
    };
    await db.collection('bizswap_transactions').insertOne(bizswapTransaction);

    // Also add to general transactions collection for user dashboard
    if (wallet) {
      const dashboardTransaction = {
        id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        transaction_type: 'manual_mint',
        amount: investmentAmount.toString(),
        currency: 'USDC',
        created_at: new Date().toISOString(),
        savingsname: instrumentName,
        txnhash: `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`,
        chain: 'base',
        useraddress: wallet,
      };
      await db.collection('transactions').insertOne(dashboardTransaction);
    }

    return NextResponse.json({
      success: true,
      message: 'Certificate minted successfully',
      certificate,
    });

  } catch (error: any) {
    console.error('Error minting certificate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
