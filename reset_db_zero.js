require('dotenv').config({ path: '.env' });
const { MongoClient } = require('mongodb');

async function reset() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bitsave";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    
    // reset user balances to 0
    await db.collection('users').updateMany(
      {},
      { $set: { usdc_balance: 0, shares_held: 0 } }
    );
    
    console.log("Reset to 0 successful");
  } catch(e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
reset();
