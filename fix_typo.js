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
    
    // 1. Delete the misspelled duplicate position
    const positionsCollection = db.collection('wc26_positions');
    await positionsCollection.deleteOne({ _id: new ObjectId('6a32a303fe0053fd47dbb57e') });
    console.log("Deleted the misspelled position.");

    // 2. Update the correct position document
    const posRes = await positionsCollection.updateOne(
      { _id: new ObjectId('6a2c6e903a967ca2009f1a8b') },
      {
        $set: { 
          shares_held: 1, 
          total_invested_usd: 10,
          total_fees_paid: 0.1,
          avg_buy_price: 10,
          lastUpdated: new Date()
        }
      }
    );
    console.log(`Updated correct position: ${posRes.modifiedCount} document(s)`);
    
  } finally {
    await client.close();
  }
}
run();
