require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function reset() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bitsave";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    await db.collection('wc26_positions').updateMany(
      {},
      { $set: { usdc_balance: 0, shares_held: 0 } }
    );
    
    console.log("Reset wc26_positions to 0 successful");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
reset();
