import { Keypair, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';
dotenv.config();

const secret = process.env.MINT_AUTHORITY_SECRET;
if (secret) {
  const kp = Keypair.fromSecretKey(bs58.decode(secret));
  console.log("Mint Authority Pubkey:", kp.publicKey.toBase58());
  
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  connection.getBalance(kp.publicKey).then(balance => {
    console.log("Current Balance:", balance / LAMPORTS_PER_SOL, "SOL");
    if (balance < 0.05 * LAMPORTS_PER_SOL) {
      console.log("Requesting Airdrop...");
      connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL)
        .then(sig => console.log("Airdrop Signature:", sig))
        .catch(e => console.log("Airdrop failed:", e.message));
    }
  });
} else {
  console.log("No MINT_AUTHORITY_SECRET found");
}
