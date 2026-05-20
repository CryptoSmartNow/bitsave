import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import fs from "fs";

async function run() {
  const c = new Connection("https://api.devnet.solana.com", "confirmed");
  const pid = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");
  const pda = PublicKey.findProgramAddressSync([Buffer.from("global_state")], pid)[0];
  
  const idl = JSON.parse(fs.readFileSync("./app/abi/bitsave-solana.json", "utf8"));
  const provider = new AnchorProvider(c, {}, {});
  const program = new Program(idl, pid, provider);
  
  const state = await program.account.globalState.fetch(pda);
  console.log("Real Admin Pubkey from Global State:", state.admin.toBase58());
}
run();
