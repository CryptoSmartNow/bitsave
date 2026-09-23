import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminVerify';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
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
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // 2. Fetch all keys. 
    // IMPORTANT: We do not return the hash to the frontend for extra safety.
    const keys = await db.collection('api_keys')
      .find({})
      .sort({ createdAt: -1 })
      .project({ keyHash: 0 }) // Exclude the hash
      .toArray();

    return NextResponse.json({
      success: true,
      data: keys
    });
  } catch (error: any) {
    console.error('API /dev-admin/api-keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
