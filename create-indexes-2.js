require('dotenv').config({ path: '.env.local' }) || require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'bitsave');
    
    console.log('Creating index on users...');
    await db.collection('users').createIndex({ walletAddress: 1 });
    
    console.log('Creating index on referral_visits...');
    await db.collection('referral_visits').createIndex({ referrerWalletAddress: 1, timestamp: -1 });
    await db.collection('referral_visits').createIndex({ referrerWalletAddress: 1, converted: 1 });

    console.log('Indexes created successfully!');
  } finally {
    await client.close();
  }
}

run().catch(console.error);
