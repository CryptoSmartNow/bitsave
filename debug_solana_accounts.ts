import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import idl from "./app/abi/bitsave-solana.json";

const connection = new Connection("https://api.devnet.solana.com");
// Mock wallet
const wallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => { throw new Error(); },
    signAllTransactions: async () => { throw new Error(); }
} as any;
const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
const program = new Program(idl as any, provider);

async function main() {
    const keys = [
        "8xtKdmsKDP2Lsmt22BVUojabiHTowvMfdfgAXSy9spco",
        "3repMvMP1H21vUPXw6CaFFQaUoxB2UtmJXGmBBUrMxSX"
    ];

    for (const key of keys) {
        console.log(`\nFetching ${key}...`);
        try {
            const pubkey = new PublicKey(key);
            const accountInfo = await connection.getAccountInfo(pubkey);
            if (!accountInfo) {
                console.log("Account not found on chain!");
                continue;
            }
            console.log("Data size:", accountInfo.data.length);
            
            try {
                const decoded = program.coder.accounts.decode('saving', accountInfo.data);
                console.log("Decoded with 'saving' successfully!");
            } catch (e: any) {
                console.error("Decode 'saving' error:", e.message);
                try {
                    const decoded2 = program.coder.accounts.decode('Saving', accountInfo.data);
                    console.log("Decoded with 'Saving' successfully!");
                } catch (e2: any) {
                    console.error("Decode 'Saving' error:", e2.message);
                    const discriminator = accountInfo.data.slice(0, 8);
                    console.log("Actual discriminator:", Array.from(discriminator));
                    const expectedDisc = idl.accounts.find((a: any) => a.name === "Saving")?.discriminator;
                    console.log("Expected discriminator in IDL:", expectedDisc);
                }
            }
        } catch (err) {
            console.error("Error:", err);
        }
    }
}

main();
