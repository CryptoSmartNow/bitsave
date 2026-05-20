import { Connection, PublicKey } from "@solana/web3.js";
const c = new Connection("https://api.devnet.solana.com", "confirmed");
const pid = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");
const admin = new PublicKey("7rKx1F8gWv32B5eM3W7N5pPqW7q4n9X4Q9w7nZ6V4N5v");
const pda = PublicKey.findProgramAddressSync([Buffer.from("global_state")], pid)[0];
async function run() {
  const info = await c.getAccountInfo(pda);
  console.log("Global state initialized:", !!info);
  const adminBalance = await c.getBalance(admin);
  console.log("Admin balance:", adminBalance);
}
run();
