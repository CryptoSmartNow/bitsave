import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { handleMint } from '@/lib/handleMint';

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
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    // Fetch the transaction
    const transaction = await db.collection('bizswap_transactions').findOne({
      _id: new ObjectId(transactionId),
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      return NextResponse.json({ error: 'Transaction already completed' }, { status: 400 });
    }

    if (!transaction.metadata) {
      return NextResponse.json({ error: 'Transaction has no metadata — cannot mint' }, { status: 400 });
    }

    // Mint the certificate using the existing handleMint logic
    const certificate = await handleMint(transaction.metadata);

    // Mark the transaction as completed
    await db.collection('bizswap_transactions').updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status: 'completed',
          updated_at: new Date(),
          completedBy: 'admin_manual',
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Certificate minted and transaction completed',
      certificate,
    });
  } catch (error: any) {
    console.error('Error minting transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
