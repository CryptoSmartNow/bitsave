import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import clientPromise from '@/lib/mongodb';

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
    const search = searchParams.get('search')?.toLowerCase();
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = {};
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const transactions = await db
      .collection('bizswap_transactions')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    let filtered = transactions;
    if (search) {
      filtered = transactions.filter((tx: any) => {
        const email = tx.metadata?.email?.toLowerCase() || '';
        const wallet = tx.metadata?.wallet?.toLowerCase() || '';
        const ref = tx.reference?.toLowerCase() || '';
        const userId = tx.userId?.toLowerCase() || '';
        const business = tx.metadata?.business?.toLowerCase() || '';
        return (
          email.includes(search) ||
          wallet.includes(search) ||
          ref.includes(search) ||
          userId.includes(search) ||
          business.includes(search)
        );
      });
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      transactions: paginated.map((tx: any) => ({
        _id: tx._id.toString(),
        userId: tx.userId,
        type: tx.type,
        paymentMethod: tx.paymentMethod,
        usdcAmount: tx.usdcAmount,
        fiatAmount: tx.fiatAmount,
        reference: tx.reference,
        status: tx.status,
        timestamp: tx.timestamp,
        updated_at: tx.updated_at,
        metadata: tx.metadata,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Error fetching bizswap transactions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
