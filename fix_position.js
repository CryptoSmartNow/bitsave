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
    
    // 1. Update the user's position by ObjectId
    const positionsCollection = db.collection('wc26_positions');
    const updateRes = await positionsCollection.updateOne(
      { _id: new ObjectId('6a2c52651a30165d1d1982a4') },
      {
        $set: {
          shares_held: 10,
          total_invested_usd: 100.9,
          total_fees_paid: 1.0,
          updated_at: new Date()
        }
      }
    );
    console.log(`Position updated: ${updateRes.modifiedCount} document(s)`);
  } finally {
    await client.close();
  }
}
run();
