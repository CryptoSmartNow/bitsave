import { redis } from './lib/redis';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  if (redis) {
    await redis.del('bizswap:analytics:global');
    console.log("Cache cleared!");
  }
  process.exit(0);
}
main();
