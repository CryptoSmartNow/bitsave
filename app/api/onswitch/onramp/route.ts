import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { amount, userId, shares, reference: explicitReference, country, currency, payer, project, destinationWallet } = await req.json();

    if (!amount || !userId || !country || !currency || !project) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let ONSWITCH_API_KEY = process.env.ONSWITCH_API_KEY;

    if (!ONSWITCH_API_KEY) {
      const fs = require('fs');
      const path = require('path');
      try {
        const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
        const match = envFile.match(/ONSWITCH_API_KEY=(.*)/);
        if (match && match[1]) ONSWITCH_API_KEY = match[1].trim();
      } catch (e) {
        console.error("Could not read .env dynamically", e);
      }
    }

    if (!ONSWITCH_API_KEY) {
      return NextResponse.json({ error: 'ONSWITCH_API_KEY is missing' }, { status: 500 });
    }

    const reference = explicitReference || crypto.randomUUID();

    const isLocalhost = req.headers.get('origin')?.startsWith('http://localhost') || req.headers.get('origin')?.includes('ngrok');
    const callbackUrl = isLocalhost
      ? 'https://bitsave.io/bizswap/api/onswitch/webhook'
      : `${req.headers.get('origin')}/api/onswitch/webhook`;

    const targetWallet = destinationWallet || '0xe1896D5E7547D63e79861d53A3DaCb066769Dfb1';

    const payload: any = {
      amount: amount,
      country: country,
      currency: currency,
      asset: 'base:usdc',
      exact_output: true,
      beneficiary: {
        holder_type: 'BUSINESS',
        holder_name: 'BizMarket Operations',
        wallet_address: targetWallet,
        channel: 'BLOCKCHAIN'
      },
      reference: reference,
      callback_url: callbackUrl
    };

    if (payer && payer.name && payer.email) {
      payload.payer = {
        email: payer.email,
        name: payer.name,
        mobile_number: payer.phone,
        mobile_network: 'VODAFONE' // Required by Onswitch even for Open Banking compliance
      };
    }

    let onswitchResponseData;

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
      return NextResponse.json({
        error: onswitchResponseData.message || 'Failed to initiate onramp',
        details: onswitchResponseData
      }, { status: 500 });
    }

    // Save pending transaction in our DB
    const client = await clientPromise;
    if (!client) {
      throw new Error('Database client is not available');
    }
    const db = client.db('bitsave');

    // Dynamically save to a specific collection based on the project
    const collectionName = project ? `${project}_transactions` : 'wc26_transactions';
    const transactionsCollection = db.collection(collectionName);

    const transactionRecord: any = {
      userId,
      type: 'buy',
      paymentMethod: 'fiat_onswitch',
      usdcAmount: amount,
      fiatAmount: onswitchResponseData.data.deposit.amount,
      reference,
      status: 'pending',
      timestamp: new Date()
    };

    if (shares) {
      transactionRecord.shares = shares;
    }

    await transactionsCollection.insertOne(transactionRecord);

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
