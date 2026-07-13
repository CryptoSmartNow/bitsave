import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No URI");
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('bitsave');
  const collection = db.collection('bizswap_certificates');
  
  const allHoldings = await collection.find({ instrument: 'BizYield' }).toArray();
  console.log("Total BizYield certificates:", allHoldings.length);
  
  let totalInvested = 0;
  for (const h of allHoldings) {
    totalInvested += h.investmentAmount || 0;
    console.log(`Bought ${h.investmentAmount} dollars`);
  }
  console.log("Total invested dollars:", totalInvested);
  console.log("Units calculated:", Math.floor(totalInvested / 10));
  
  await client.close();
}
main().catch(console.error);
