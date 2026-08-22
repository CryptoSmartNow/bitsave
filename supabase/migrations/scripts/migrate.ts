import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// 1. Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB_NAME || 'bitsave';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!MONGODB_URI || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DATA_DIR = path.join(process.cwd(), 'scratch', 'migration', 'data');
const TRANSFORMED_DIR = path.join(process.cwd(), 'scratch', 'migration', 'transformed');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TRANSFORMED_DIR)) fs.mkdirSync(TRANSFORMED_DIR, { recursive: true });

// 2. Collections to migrate
const COLLECTIONS = [
  'users',
  'bizswap_users', // Note: data mapped into bizswap_referral_earnings and users
  'bizswap_certificates',
  'bizswap_transactions',
  'bizswap_payouts',
  'bizswap_withdrawals',
  'referral_visits',
  'push_subscriptions',
  'blog_posts',
  'updates',
  'user_read_updates'
];

async function exportMongoDB() {
  console.log("==> Starting MongoDB Export");
  const client = new MongoClient(MONGODB_URI!);
  await client.connect();
  const db = client.db(MONGODB_DB);

  for (const collName of COLLECTIONS) {
    console.log(`Exporting ${collName}...`);
    const collection = db.collection(collName);
    const data = await collection.find({}).toArray();
    fs.writeFileSync(path.join(DATA_DIR, `${collName}.json`), JSON.stringify(data, null, 2));
    console.log(`  Exported ${data.length} records.`);
  }

  await client.close();
  console.log("==> Export Complete\n");
}

function transformData() {
  console.log("==> Starting Data Transformation");
  
  // Load raw data
  const loadJson = (name: string) => {
    const p = path.join(DATA_DIR, `${name}.json`);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : [];
  };

  const usersRaw = loadJson('users');
  const bizswapUsersRaw = loadJson('bizswap_users');
  const certsRaw = loadJson('bizswap_certificates');
  const txRaw = loadJson('bizswap_transactions');
  const payoutsRaw = loadJson('bizswap_payouts');
  const withdrawalsRaw = loadJson('bizswap_withdrawals');
  const referralVisitsRaw = loadJson('referral_visits');
  const pushSubsRaw = loadJson('push_subscriptions');
  const blogPostsRaw = loadJson('blog_posts');
  const updatesRaw = loadJson('updates');
  const userReadUpdatesRaw = loadJson('user_read_updates');

  // Mapping structures
  const usersMap = new Map(); // wallet/privy_did -> Supabase UUID
  const transformed = {
    users: [] as any[],
    bizswap_certificates: [] as any[],
    bizswap_transactions: [] as any[],
    bizswap_payouts: [] as any[],
    bizswap_withdrawals: [] as any[],
    bizswap_referral_earnings: [] as any[],
    referral_visits: [] as any[],
    push_subscriptions: [] as any[],
    blog_posts: [] as any[],
    updates: [] as any[],
    user_read_updates: [] as any[]
  };

  // generate deterministic UUID for users based on mongo _id to keep relations
  const { v5: uuidv5 } = require('uuid');
  const NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  
  const getUserId = (mongoId: string) => uuidv5(mongoId.toString(), NAMESPACE);

  // 1. Transform Users
  for (const u of usersRaw) {
    const id = getUserId(u._id);
    usersMap.set(u.walletAddress?.toLowerCase(), id);
    if (u.privyDid) usersMap.set(u.privyDid, id);
    if (u._id) usersMap.set(u._id.toString(), id);

    let evm_wallet = null;
    let solana_wallet = null;
    if (u.walletAddress) {
      if (u.walletAddress.startsWith('0x')) evm_wallet = u.walletAddress;
      else solana_wallet = u.walletAddress;
    }

    transformed.users.push({
      id,
      privy_did: u.privyDid || `legacy:${u._id}`,
      email: u.email || null,
      evm_wallet,
      solana_wallet,
      savvy_name: u.savvyName || null,
      avatar_url: u.avatarUrl || null,
      created_at: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      updated_at: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString()
    });
  }

  // 2. Transform BizSwap Users (merges into users & bizswap_referral_earnings)
  for (const bu of bizswapUsersRaw) {
    let id = usersMap.get(bu.walletAddress?.toLowerCase());
    
    // If user exists in bizswap_users but not users (unlikely, but handle it)
    if (!id && bu.walletAddress) {
      id = getUserId(bu._id);
      usersMap.set(bu.walletAddress?.toLowerCase(), id);
      
      let evm_wallet = null;
      let solana_wallet = null;
      if (bu.walletAddress.startsWith('0x')) evm_wallet = bu.walletAddress;
      else solana_wallet = bu.walletAddress;

      transformed.users.push({
        id,
        privy_did: `legacy_bizswap:${bu._id}`,
        evm_wallet,
        solana_wallet,
        created_at: bu.createdAt ? new Date(bu.createdAt).toISOString() : new Date().toISOString(),
      });
    }

    if (id) {
      // Update user with referral code
      const user = transformed.users.find(u => u.id === id);
      if (user && bu.bizswapReferralCode) {
        user.referral_code = bu.bizswapReferralCode;
      }
      
      // Add to referral earnings
      transformed.bizswap_referral_earnings.push({
        user_id: id,
        pending_usdc: bu.bizswapPendingUsdcEarnings || 0,
        total_earned_usdc: bu.bizswapTotalUsdcEarned || 0,
        updated_at: bu.updatedAt ? new Date(bu.updatedAt).toISOString() : new Date().toISOString()
      });
    }
  }

  // 3. Transform Certificates
  for (const c of certsRaw) {
    const userId = usersMap.get(c.walletAddress?.toLowerCase());
    if (!userId) continue;

    transformed.bizswap_certificates.push({
      id: getUserId(c._id),
      user_id: userId,
      wallet: c.walletAddress,
      instrument: c.instrument,
      investment_amount: c.investmentAmount,
      fee_amount: c.feeAmount || 0,
      total_charged: c.totalCharged || c.investmentAmount,
      entitlement: c.entitlement,
      apr: c.apr,
      payout_frequency: c.payoutFrequency,
      status: c.status || 'active',
      next_payment: c.nextPaymentDate ? new Date(c.nextPaymentDate).toISOString() : null,
      serial_number: c.serialNumber,
      certificate_id: c.mintAddress,
      transaction_id: c.transactionSignature,
      referred_by_code: c.referredByCode || null,
      purchase_date: c.purchaseDate ? new Date(c.purchaseDate).toISOString() : new Date().toISOString(),
      created_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()
    });
  }

  // 4. Transform Transactions
  for (const t of txRaw) {
    const userId = usersMap.get(t.userId) || usersMap.get(t.walletAddress?.toLowerCase());
    if (!userId) continue;

    transformed.bizswap_transactions.push({
      id: getUserId(t._id),
      user_id: userId,
      type: t.type || 'buy',
      payment_method: t.paymentMethod,
      usdc_amount: t.usdcAmount,
      fiat_amount: t.fiatAmount,
      reference: t.reference,
      status: t.status,
      metadata: t.metadata || {},
      webhook_received_at: t.webhookReceivedAt ? new Date(t.webhookReceivedAt).toISOString() : null,
      created_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      updated_at: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString()
    });
  }

  // 5. Transform Payouts
  for (const p of payoutsRaw) {
    const userId = usersMap.get(p.walletAddress?.toLowerCase());
    if (!userId) continue;

    transformed.bizswap_payouts.push({
      id: getUserId(p._id),
      user_id: userId,
      // Find cert id if possible
      certificate_id: transformed.bizswap_certificates.find(c => c.wallet === p.walletAddress && c.instrument === p.instrument)?.id || null,
      wallet: p.walletAddress,
      amount: p.amount,
      currency: p.currency || 'USDC',
      tx_hash: p.transactionSignature,
      payout_date: p.payoutDate ? new Date(p.payoutDate).toISOString() : new Date().toISOString()
    });
  }

  // 6. Blog Posts
  for (const b of blogPostsRaw) {
    transformed.blog_posts.push({
      id: getUserId(b._id),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      category: b.category,
      tags: b.tags || [],
      cover_image: b.coverImage,
      author: b.author || 'Bitsave Team',
      published: b.published || false,
      published_at: b.publishedAt ? new Date(b.publishedAt).toISOString() : null,
      created_at: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      updated_at: b.updatedAt ? new Date(b.updatedAt).toISOString() : new Date().toISOString()
    });
  }

  // Write all transformed data
  for (const [key, val] of Object.entries(transformed)) {
    fs.writeFileSync(path.join(TRANSFORMED_DIR, `${key}.json`), JSON.stringify(val, null, 2));
    console.log(`  Transformed ${val.length} records for ${key}.`);
  }

  console.log("==> Transformation Complete\n");
}

async function importToSupabase() {
  console.log("==> Starting Supabase Import");
  
  const tables = [
    'users',
    'bizswap_referral_earnings',
    'bizswap_certificates',
    'bizswap_transactions',
    'bizswap_payouts',
    'blog_posts'
  ];

  for (const table of tables) {
    const filePath = path.join(TRANSFORMED_DIR, `${table}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (data.length === 0) {
      console.log(`Skipping ${table}, no records.`);
      continue;
    }

    console.log(`Importing ${data.length} records into ${table}...`);
    
    // Batch import (500 records at a time)
    const BATCH_SIZE = 500;
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from(table).insert(batch);
      
      if (error) {
        console.error(`Error importing batch for ${table}:`, error.message);
        console.error(error.details);
      } else {
        console.log(`  Inserted ${i + batch.length}/${data.length}`);
      }
    }
  }

  console.log("==> Import Complete\n");
}

async function run() {
  try {
    await exportMongoDB();
    transformData();
    await importToSupabase();
    console.log("All migration steps completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

// Run if called directly
if (require.main === module) {
  run();
}
