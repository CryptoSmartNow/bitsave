const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'bitsave');
  const tx = await db.collection('bizswap_transactions').findOne({ reference: "37637af2-c433-49ef-983f-75e47adc9e39" });
  console.log(JSON.stringify(tx, null, 2));
  await client.close();
}
run().catch(console.error);
