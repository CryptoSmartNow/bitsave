import { PrivyClient } from '@privy-io/server-auth';
import { getSupabaseAdmin } from './supabase';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || '' // Will need to be added to .env if missing
);

/**
 * Validates a Privy JWT token from the Authorization header and returns the user
 * Also ensures the user exists in our Supabase database.
 */
export async function authenticateRequest(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'Missing or invalid Authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const verifiedClaims = await privy.verifyAuthToken(token);
    
    // Check if user exists in Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('privy_did', verifiedClaims.userId)
      .single();
      
    if (error || !user) {
      // User hasn't been synced to DB yet (or just signed up)
      // For now, we just return the claims. In a real app we might auto-create the user here
      return { user: { privy_did: verifiedClaims.userId }, error: null };
    }

    return { user, error: null };
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    return { user: null, error: error.message };
  }
}
