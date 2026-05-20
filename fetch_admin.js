const { Connection, PublicKey } = require('@solana/web3.js');
const anchor = require('@coral-xyz/anchor');

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");

async function main() {
    const globalStatePDA = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      programId
    )[0];
    
    console.log("Global State PDA:", globalStatePDA.toBase58());

    const accountInfo = await connection.getAccountInfo(globalStatePDA);
    if (accountInfo) {
        // IDL says admin is the first pubkey after the discriminator
        // Discriminator is 8 bytes. Pubkey is 32 bytes.
        const adminPubkeyBytes = accountInfo.data.slice(8, 40);
        const adminPubkey = new PublicKey(adminPubkeyBytes);
        console.log("Admin Pubkey in Global State:", adminPubkey.toBase58());
    } else {
        console.log("Global state not found!");
    }
}

main().catch(console.error);
