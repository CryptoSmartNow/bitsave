import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminVerify';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';
import { z } from 'zod';

const generateSchema = z.object({
  partnerName: z.string().min(1, 'Partner name is required'),
  tier: z.enum(['standard', 'readonly']).default('standard'),
});

export async function POST(request: Request) {
  // 1. Strictly authenticate via Dev Admin token
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Super-admin access required.' }, { status: 401 });
  }

  // 1.5 Step-up Vault Authentication
  const vaultPasscode = request.headers.get('x-vault-passcode');
  const expectedPasscode = process.env.API_VAULT_PASSCODE || 'bitsave_vault_admin';
  
  if (vaultPasscode !== expectedPasscode) {
    return NextResponse.json({ error: 'Vault locked. Invalid passcode.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.format() }, { status: 400 });
    }

    const { partnerName, tier } = parsed.data;

    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // 2. Generate secure raw key with bespoke prefix
    // E.g. bsv_live_1234567890abcdef1234567890abcdef
    const rawSecret = crypto.randomBytes(32).toString('hex');
    const apiKey = `bsv_live_${rawSecret}`;

    // 3. Hash the key for storage (SHA-256)
    // When a request comes in, we will hash their provided key and compare it to this hash
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // 4. Save to MongoDB
    const result = await db.collection('api_keys').insertOne({
      partnerName,
      tier,
      keyHash,
      createdAt: new Date(),
      status: 'active'
    });

    if (!result.insertedId) {
      throw new Error('Failed to insert API key record');
    }

    // 5. Return the raw key EXACTLY ONCE to the admin
    return NextResponse.json({
      success: true,
      message: 'API Key generated successfully',
      data: {
        rawApiKey: apiKey,
        partnerName,
        tier
      }
    });
  } catch (error: any) {
    console.error('API /dev-admin/api-keys/generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
