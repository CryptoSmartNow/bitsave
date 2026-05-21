const { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } = require('@solana/web3.js');

const connection = new Connection("https://api.devnet.solana.com");
const programId = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");
const fakeWallet = Keypair.generate();

async function main() {
    const globalStatePDA = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      programId
    )[0];
    const userVaultPDA = PublicKey.findProgramAddressSync(
      [Buffer.from("user_vault"), fakeWallet.publicKey.toBuffer()],
      programId
    )[0];
    const savingName = "testplan";
    const savingPDA = PublicKey.findProgramAddressSync(
      [Buffer.from("saving"), userVaultPDA.toBuffer(), Buffer.from(savingName)],
      programId
    )[0];

    const adminPubkey = new PublicKey("A5Ga4nzGc9iC3dWrSSB5NuCauhi965TYQP7AAo8X1ow5");
    const stablecoinMint = new PublicKey("Cb8mk8FAg4Qa3H6mHAhgHFnp86j15gWZHowVM9Jz9ZoD");

    // Replicate anchor.utils.token.associatedAddress
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
    const getAta = (owner) => PublicKey.findProgramAddressSync(
        [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), stablecoinMint.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];

    const userTokenAta = getAta(fakeWallet.publicKey);
    const vaultTokenAta = getAta(userVaultPDA);
    const adminTokenAta = getAta(adminPubkey);

    const data = Buffer.from([17, 65, 250, 243, 93, 165, 29, 128]);

    const ix = new TransactionInstruction({
        keys: [
            { pubkey: globalStatePDA, isSigner: false, isWritable: true },
            { pubkey: userVaultPDA, isSigner: false, isWritable: true },
            { pubkey: savingPDA, isSigner: false, isWritable: true },
            { pubkey: fakeWallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: userTokenAta, isSigner: false, isWritable: true },
            { pubkey: vaultTokenAta, isSigner: false, isWritable: true },
            { pubkey: adminTokenAta, isSigner: false, isWritable: true },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId,
        data,
    });

    const tx = new Transaction().add(ix);
    tx.feePayer = fakeWallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const sim = await connection.simulateTransaction(tx);
    console.log("Simulation logs:", sim.value.logs);
    console.log("Simulation err:", sim.value.err);
}

main().catch(console.error);
