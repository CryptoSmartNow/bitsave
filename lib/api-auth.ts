import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import crypto from 'crypto';

/**
 * Validates the API key from the request header.
 * 
 * Secure implementation:
 * - Expects `x-api-key` header.
 * - For production, you should store SHA-256 hashed API keys in the `api_keys` collection.
 * - This function hashes the incoming key and checks against the DB.
 */
export async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return { error: 'Missing x-api-key header', status: 401 };
  }

  // Optional: Allow a master key from environment variables for internal/easy testing
  if (process.env.BIZBOND_MASTER_API_KEY && apiKey === process.env.BIZBOND_MASTER_API_KEY) {
    return { valid: true, developerId: 'master' };
  }

  // --- SANDBOX TEST KEYS ---
  
  // Scenario 1: Standard Developer (Full Access)
  if (apiKey === 'test_sandbox_standard') {
    return { valid: true, developerId: 'sandbox_std', role: 'standard' };
  }

  // Scenario 2: Read-Only Developer (Tracker/Dashboard Integration)
  if (apiKey === 'test_sandbox_readonly') {
    if (request.method !== 'GET') {
      return { error: 'Forbidden: This API key is restricted to Read-Only permissions.', status: 403 };
    }
    return { valid: true, developerId: 'sandbox_ro', role: 'readonly' };
  }

  // Scenario 3: Suspended/Expired Account
  if (apiKey === 'test_sandbox_suspended') {
    return { error: 'Forbidden: API key suspended due to unpaid invoices. Please visit your dashboard.', status: 403 };
  }
  
  // -------------------------

  try {
    const db = await getDatabase();
    if (!db) {
      return { error: 'Database unavailable', status: 503 };
    }

    // Hash the incoming key to compare with the stored hash
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const keyRecord = await db.collection('api_keys').findOne({ keyHash: hashedKey });
    
    if (!keyRecord || keyRecord.status !== 'active') {
      return { error: 'Invalid or inactive API key', status: 401 };
    }

    return { valid: true, developerId: keyRecord.developerId };
  } catch (error) {
    console.error('API Key validation error:', error);
    return { error: 'Internal server error during authentication', status: 500 };
  }
}

export function unauthorizedResponse(message = 'Unauthorized', status = 401) {
  return NextResponse.json({ error: message }, { status });
}
