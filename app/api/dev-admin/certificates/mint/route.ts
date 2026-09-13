import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET_VALUE = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_VALUE || 'fallback-dev-only');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

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

    const { wallet, email, amount, channel, purchaseDate } = await req.json();

    if (!wallet && !email) {
      return NextResponse.json({ error: 'Wallet or Email is required' }, { status: 400 });
    }
    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const numShares = Number(amount);
    
    // Create new certificate entry
    const newCertificate = {
      _id: new ObjectId(),
      wallet: wallet || '',
      email: email || '',
      instrument: 'BizSwap Share',
      shares: numShares,
      amount: numShares * 100, // Assuming 1 share = 100 USDC for example
      currency: 'USDC',
      purchaseChannel: channel || 'fiat',
      serialNumber: `BZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      mintAddress: `mock_mint_${Date.now()}`,
      reference: `manual-${Date.now()}`,
      transactionSignature: `manual_txn_${Date.now()}`,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      createdAt: new Date(),
      createdBy: 'Dev Admin'
    };

    await db.collection('bizswap_certificates').insertOne(newCertificate);

    return NextResponse.json({
      success: true,
      message: 'Certificate minted successfully',
      certificate: newCertificate
    });

  } catch (error: any) {
    console.error('Error minting certificate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
