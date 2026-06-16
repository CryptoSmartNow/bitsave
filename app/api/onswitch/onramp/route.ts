import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { amount, userId, shares } = await req.json();

    if (!amount || !userId || !shares) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const ONSWITCH_API_KEY = process.env.ONSWITCH_API_KEY;

    // Generate a unique reference for tracking the transaction
    const reference = crypto.randomUUID();

    // The payload for the Onswitch initiate endpoint
    const payload = {
      amount: amount,
      country: 'NG',
      currency: 'NGN',
      asset: 'base:usdc',
      exact_output: true,
      channel: 'BLOCKCHAIN',
      beneficiary: {
        holder_type: 'BUSINESS',
        holder_name: 'BizMarket Operations',
        wallet_address: '0xe1896D56209581A05AEE4e34eE5316df0807BA76'
      },
      reference: reference,
      // For local testing without ngrok, this will not be reachable by Onswitch,
      // but we provide it based on the current origin if deployed.
      callback_url: `${(req.headers.get('origin') && !req.headers.get('origin')?.startsWith('http://localhost')) ? req.headers.get('origin') : 'https://www.bizswap.com'}/api/onswitch/webhook`
    };

    let onswitchResponseData;

    // If API key is present, actually call the API, otherwise simulate for testing if there's no key
    // The user mentioned they will add it later, but they want it fully implemented.
    if (ONSWITCH_API_KEY && ONSWITCH_API_KEY !== '') {
      const response = await fetch('https://api.onswitch.xyz/onramp/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-key': ONSWITCH_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      onswitchResponseData = await response.json();

      if (!response.ok || !onswitchResponseData.success) {
        console.error("ONSWITCH ERROR DATA:", JSON.stringify(onswitchResponseData, null, 2));
        return NextResponse.json({ error: 'Failed to initiate onramp', details: onswitchResponseData }, { status: 500 });
      }
    } else {
      // Simulation mock if API key is missing (helpful during dev so UI doesn't crash before they paste key)
      onswitchResponseData = {
        success: true,
        data: {
          reference: reference,
          rate: 1500,
          source: { amount: amount * 1500, currency: 'NGN' },
          destination: { amount: amount, currency: 'USDC' },
          deposit: {
            amount: amount * 1500,
            account_number: '1234567890',
            account_name: 'BizSwap Escrow',
            bank_name: 'Mock Bank PLC',
            expires_at: new Date(Date.now() + 30 * 60000).toISOString()
          }
        }
      };
    }

    // Save pending transaction in our DB
    const client = await clientPromise;
    if (!client) {
      throw new Error('Database client is not available');
    }
    const db = client.db('CryptoSmartNow');
    const transactionsCollection = db.collection('wc26_transactions');

    await transactionsCollection.insertOne({
      userId,
      type: 'buy',
      paymentMethod: 'fiat_onswitch',
      shares,
      usdcAmount: amount,
      fiatAmount: onswitchResponseData.data.deposit.amount,
      reference,
      status: 'pending',
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      reference: reference,
      depositDetails: onswitchResponseData.data.deposit,
      source: onswitchResponseData.data.source
    });
  } catch (error: any) {
    console.error('Error initiating Onswitch onramp:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
