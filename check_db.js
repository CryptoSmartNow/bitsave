const { MongoClient } = require('mongodb');
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
    const pos = await db.collection('wc26_positions').find({}).toArray();
    
    console.log("All wc26_positions:");
    pos.forEach(p => console.log(JSON.stringify(p)));
  } finally {
    await client.close();
  }
}
run();
