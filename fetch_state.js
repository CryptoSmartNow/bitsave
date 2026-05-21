const { Connection, PublicKey } = require('@solana/web3.js');

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");

async function main() {
    const globalStatePDA = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      programId
    )[0];
    
    const accountInfo = await connection.getAccountInfo(globalStatePDA);
    if (accountInfo) {
        // GlobalState: admin (32), usdc_mint (32), usdt_mint (32), cngn_mint (32)
        const adminPubkey = new PublicKey(accountInfo.data.slice(8, 40));
        const usdcMint = new PublicKey(accountInfo.data.slice(40, 72));
        const usdtMint = new PublicKey(accountInfo.data.slice(72, 104));
        const cngnMint = new PublicKey(accountInfo.data.slice(104, 136));
        
        console.log("Admin:", adminPubkey.toBase58());
        console.log("USDC Mint:", usdcMint.toBase58());
        console.log("USDT Mint:", usdtMint.toBase58());
        console.log("cNGN Mint:", cngnMint.toBase58());
    }
}

main().catch(console.error);
