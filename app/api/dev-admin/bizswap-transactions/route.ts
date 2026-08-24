import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { clearCache } from '@/lib/redis';

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

export async function GET(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase()?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { 'metadata.wallet': { $regex: search, $options: 'i' } },
        { 'metadata.email': { $regex: search, $options: 'i' } },
        { 'metadata.instrument': { $regex: search, $options: 'i' } },
        { 'metadata.business': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [transactions, total, pendingCount, completedCount, failedCount, expiredCount] = await Promise.all([
      db.collection('bizswap_transactions').find(query).sort({ timestamp: -1, createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('bizswap_transactions').countDocuments(query),
      db.collection('bizswap_transactions').countDocuments({ status: { $in: ['pending', 'awaiting_deposit', 'processing'] } }),
      db.collection('bizswap_transactions').countDocuments({ status: 'completed' }),
      db.collection('bizswap_transactions').countDocuments({ status: { $in: ['failed', 'failed_fulfillment', 'cancelled'] } }),
      db.collection('bizswap_transactions').countDocuments({ status: 'expired' }),
    ]);

    return NextResponse.json({
      transactions: transactions.map((tx: any) => ({
        _id: tx._id.toString(),
        userId: tx.userId,
        type: tx.type,
        paymentMethod: tx.paymentMethod,
        usdcAmount: tx.usdcAmount,
        fiatAmount: tx.fiatAmount,
        currency: tx.currency,
        reference: tx.reference,
        status: tx.status,
        timestamp: tx.timestamp || tx.createdAt || tx.created_at,
        updated_at: tx.updated_at || tx.updatedAt,
        metadata: tx.metadata,
        raw: tx,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalAll: total,
        pending: pendingCount,
        completed: completedCount,
        failed: failedCount,
        expired: expiredCount,
      }
    });
  } catch (error: any) {
    console.error('Error fetching bizswap transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const body = await req.json();
    const { transactionId, status, metadata } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const updateDoc: any = { updated_at: new Date() };
    if (status) updateDoc.status = status;
    if (metadata) updateDoc.metadata = metadata;

    const result = await db.collection('bizswap_transactions').updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Invalidate caches
    await clearCache('bizswap:analytics:global:v2');

    return NextResponse.json({ success: true, message: `Transaction status updated to ${status}` });

  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    if (!client) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const db = client.db('bitsave');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.collection('bizswap_transactions').deleteOne({ _id: new ObjectId(id) });
    await clearCache('bizswap:analytics:global:v2');

    return NextResponse.json({ success: true, message: 'Transaction purged' });

  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
