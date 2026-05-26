import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://devnet.helius-rpc.com/?api-key=cec20e90-197a-4e87-8219-4c1b6689dc11');
const programId = new PublicKey('2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ');

async function run() {
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [
      { memcmp: { offset: 8, bytes: 'A5Ga4nzGc9iC3dWrSSB5NuCauhi965TYQP7AAo8X1ow5' } }
    ],
    encoding: 'base64'
  });
  console.log('Found accounts:', accounts.length);
}
run();
