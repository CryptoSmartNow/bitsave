import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function removeDuplicates() {
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

    const users = db.collection('users');

    const fieldsToDedup = ['walletAddress', 'referralCode', 'evm_wallet', 'solana_wallet'];

    for (const field of fieldsToDedup) {
      console.log(`Deduplicating on field: ${field}...`);
      const duplicates = await users.aggregate([
        {
          $group: {
            _id: `$${field}`,
            dups: { $push: "$_id" },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 1 },
            _id: { $ne: null }
          }
        }
      ]).toArray();

      for (const doc of duplicates) {
        console.log(`Found ${doc.count} duplicates for ${field} = ${doc._id}. Keeping the first one, removing others.`);
        doc.dups.shift(); 
        await users.deleteMany({ _id: { $in: doc.dups } });
      }
    }

    console.log('✅ Duplicates removed.');
  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await client.close();
  }
}

removeDuplicates();
