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
    
    // Update the user's position
    const positionsCollection = db.collection('wc26_positions');
    const updateRes = await positionsCollection.updateOne(
      { _id: new ObjectId('6a2c52651a30165d1d1982a4') },
      {
        $set: {
          total_invested_usd: 100.0, // Removed the 0.90 fee
          updated_at: new Date()
        }
      }
    );
    console.log(`Position updated: ${updateRes.modifiedCount} document(s)`);

    // Update the pool tvl as well if needed
    // But wait, the pool's tvl should maybe include the whole amount?
    // Let's also set the pool's tvl_usd down by 0.9 to be perfectly accurate for pure share value
    const poolCollection = db.collection('wc26_pool');
    const poolRes = await poolCollection.updateOne(
      { _id: 'main_pool' },
      {
        $inc: { current_tvl_usd: -0.9 }
      }
    );

  } finally {
    await client.close();
  }
}
run();
