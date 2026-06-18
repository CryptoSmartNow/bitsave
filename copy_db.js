const { MongoClient } = require('mongodb');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  let mongoUri = '';
  const match = env.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) mongoUri = match[1].trim();

  if (!mongoUri) {
    console.error("MONGODB_URI not found");
    return;
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    
    // Copy transactions
    const sourceTx = client.db('CryptoSmartNow').collection('wc26_transactions');
    const destTx = client.db('bitsave').collection('wc26_transactions');
    
    const transactions = await sourceTx.find({}).toArray();
    if (transactions.length > 0) {
      console.log(`Found ${transactions.length} transactions to copy.`);
      try {
        await destTx.insertMany(transactions, { ordered: false });
        console.log("Successfully copied transactions.");
      } catch (e) {
        console.log("Some transactions may already exist. Insert error:", e.message);
      }
    } else {
      console.log("No transactions to copy.");
    }

    // Is there any other collection created? e.g. wc26_positions in CryptoSmartNow?
    // Based on the webhook code, it might have updated wc26_positions or wc26_pool.
    // I should check if there are documents in CryptoSmartNow.wc26_positions
    const sourcePos = client.db('CryptoSmartNow').collection('wc26_positions');
    const destPos = client.db('bitsave').collection('wc26_positions');
    
    const positions = await sourcePos.find({}).toArray();
    if (positions.length > 0) {
      console.log(`Found ${positions.length} positions to copy. These were updated with wrong fields (userId vs user_id). We should probably just merge them or insert.`);
      // Actually we just insert them for now, but user ID is wrong.
      // Better to map them to correct schema.
      const mappedPositions = positions.map(p => {
        if (p.userId) {
          p.user_id = p.userId;
          delete p.userId;
        }
        if (p.shares) {
          p.shares_held = p.shares;
          delete p.shares;
        }
        if (p.totalInvestment) {
          p.total_invested_usd = p.totalInvestment;
          delete p.totalInvestment;
        }
        return p;
      });
      try {
        await destPos.insertMany(mappedPositions, { ordered: false });
        console.log("Copied positions.");
      } catch (e) {
        console.log("Some positions already exist. Error:", e.message);
      }
    } else {
      console.log("No positions to copy.");
    }

  } finally {
    await client.close();
  }
}
run();
