require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function run() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, { family: 4 });
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.close();
  }
}
run();
