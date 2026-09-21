import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function setupIndexes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is missing.');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB.');
    const db = client.db(process.env.MONGODB_DB_NAME || 'bitsave');

    async function ensureIndex(collectionName, field, options) {
      const coll = db.collection(collectionName);
      const indexName = Object.keys(field)[0] + '_1';
      try {
        await coll.createIndex(field, options);
        console.log(`Created index ${indexName} on ${collectionName}`);
      } catch (err) {
        if (err.codeName === 'IndexKeySpecsConflict') {
          console.log(`Dropping conflicting index ${indexName} on ${collectionName}...`);
          await coll.dropIndex(indexName);
          await coll.createIndex(field, options);
          console.log(`Recreated index ${indexName} on ${collectionName}`);
        } else {
          throw err;
        }
      }
    }

    // 1. users Collection
    console.log('Setting up indexes for users...');
    await ensureIndex('users', { walletAddress: 1 }, { unique: true, sparse: true });
    await ensureIndex('users', { referralCode: 1 }, { unique: true, sparse: true });
    await ensureIndex('users', { evm_wallet: 1 }, { unique: true, sparse: true });
    await ensureIndex('users', { solana_wallet: 1 }, { unique: true, sparse: true });
    
    // 2. bizswap_certificates
    console.log('Setting up indexes for bizswap_certificates...');
    await ensureIndex('bizswap_certificates', { user_id: 1 }, {});
    await ensureIndex('bizswap_certificates', { wallet: 1 }, {});
    await ensureIndex('bizswap_certificates', { transaction_id: 1 }, { unique: true, sparse: true });

    // 3. bizswap_referral_earnings
    console.log('Setting up indexes for bizswap_referral_earnings...');
    await ensureIndex('bizswap_referral_earnings', { user_id: 1 }, { unique: true, sparse: true });
    await ensureIndex('bizswap_referral_earnings', { wallet: 1 }, { unique: true, sparse: true });

    // 4. bizswap_withdrawals
    console.log('Setting up indexes for bizswap_withdrawals...');
    await ensureIndex('bizswap_withdrawals', { user_id: 1 }, {});
    await ensureIndex('bizswap_withdrawals', { wallet: 1 }, {});
    await ensureIndex('bizswap_withdrawals', { status: 1 }, {});

    // 5. transactions
    console.log('Setting up indexes for transactions...');
    await ensureIndex('transactions', { _id: 1 }, {});
    await ensureIndex('transactions', { user_id: 1 }, {});

    console.log('✅ Index setup complete!');
  } catch (error) {
    console.error('Error setting up indexes:', error);
  } finally {
    await client.close();
  }
}

setupIndexes();
