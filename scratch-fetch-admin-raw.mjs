import { Connection, PublicKey } from "@solana/web3.js";

async function run() {
  const c = new Connection("https://api.devnet.solana.com", "confirmed");
  const pid = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");
  const pda = PublicKey.findProgramAddressSync([Buffer.from("global_state")], pid)[0];
  
  const info = await c.getAccountInfo(pda);
  if (!info) {
    console.log("Account not found");
    return;
  }
  
  // admin pubkey is at offset 8 (after 8 byte discriminator)
  const adminPubkeyBytes = info.data.slice(8, 8 + 32);
  const realAdmin = new PublicKey(adminPubkeyBytes);
  console.log("Real Admin Pubkey from Global State:", realAdmin.toBase58());
}
run();
