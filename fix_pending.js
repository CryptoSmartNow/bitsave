const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

async function run() {
  const env = fs.readFileSync('.env', 'utf8');
  let mongoUri = '';
  const match = env.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) mongoUri = match[1].trim();

  if (!mongoUri) return console.error("MONGODB_URI not found");

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db('bitsave');
    
    // 1. Mark Transaction as completed
    const txCollection = db.collection('wc26_transactions');
    const txRes = await txCollection.updateOne(
      { _id: new ObjectId('6a3193ad71bc8c689c57ce70') },
      { $set: { status: 'completed', updated_at: new Date() } }
    );
    console.log(`Transaction updated: ${txRes.modifiedCount} document(s)`);

    if (txRes.modifiedCount === 0 && txRes.matchedCount === 0) {
      console.log("Transaction not found. Please double check the ID.");
      return;
    }

    // 2. Update the user's position
    const positionsCollection = db.collection('wc26_positions');
    const posRes = await positionsCollection.updateOne(
      { user_id: "did:privy:cmqbe41p100o1o0ci3mqagbxfd" },
      {
        $inc: { 
          shares_held: 1, 
          total_invested_usd: 10,
          total_fees_paid: 0.1
        },
        $set: { lastUpdated: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    console.log(`Position updated: ${posRes.modifiedCount || posRes.upsertedCount} document(s)`);

    // 3. Update the pool
    const poolCollection = db.collection('wc26_pool');
    const poolRes = await poolCollection.updateOne(
      { _id: 'main_pool' },
      {
        $inc: {
          current_supply: 1,
          current_tvl_usd: 10
        },
        $set: { last_updated: new Date() }
      }
    );
    console.log(`Pool updated: ${poolRes.modifiedCount} document(s)`);
    
  } finally {
    await client.close();
  }
}
run();
