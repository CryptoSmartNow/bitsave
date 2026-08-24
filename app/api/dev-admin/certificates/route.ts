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
    const instrument = searchParams.get('instrument');
    const search = searchParams.get('search')?.toLowerCase()?.trim();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: any = {};
    if (instrument && instrument !== 'all') {
      query.instrument = instrument;
    }

    if (search) {
      query.$or = [
        { wallet: { $regex: search, $options: 'i' } },
        { mintAddress: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { transactionSignature: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      db.collection('bizswap_certificates').find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      db.collection('bizswap_certificates').countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      certificates: certificates.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
      })),
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error: any) {
    console.error('Error fetching dev-admin certificates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
