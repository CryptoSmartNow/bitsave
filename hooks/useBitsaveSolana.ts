import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountIdempotentInstruction } from "@solana/spl-token";
import idl from "../app/abi/bitsave-solana.json";
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { useMemo } from 'react';

// You will need to update this with the actual deployed program ID
const PROGRAM_ID = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");

export function useBitsaveSolana() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { wallets } = useWallets();
  const { user } = usePrivy();

  const wallet = useMemo(() => {
    if (anchorWallet) return anchorWallet;
    
    // Check for Privy solana wallet using robust detection
    const privySolana = wallets?.find((w: any) => {
      if (w.chainType === 'solana') return true;
      if (['phantom', 'solflare', 'backpack'].includes(w.walletClientType)) return true;
      if (w.chainId && String(w.chainId).startsWith('solana')) return true;
      if (w.address && !w.address.startsWith('0x') && w.address.length >= 32 && w.address.length <= 44) return true;
      return false;
    });
    
    if (privySolana) {
      return {
        publicKey: new PublicKey(privySolana.address),
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          // Fallback if the standard Provider doesn't cast perfectly
          const provider = await (privySolana as any).getProvider();
          if (provider && provider.signTransaction) {
            return provider.signTransaction(tx);
          }
          throw new Error("signTransaction not supported by this Privy wallet provider");
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          const provider = await (privySolana as any).getProvider();
          if (provider && provider.signAllTransactions) {
            return provider.signAllTransactions(txs);
          }
          throw new Error("signAllTransactions not supported by this Privy wallet provider");
        }
      };
    }

    // Check linked accounts as absolute fallback (readonly operations)
    const privyLinkedSolanaAddress = (user as any)?.linkedAccounts?.find(
      (account: any) => (account.type === 'wallet' && account.chainType === 'solana') || account.chainId === 'solana:mainnet'
    )?.address;

    if (privyLinkedSolanaAddress) {
      return {
        publicKey: new PublicKey(privyLinkedSolanaAddress),
        signTransaction: async <T extends Transaction | VersionedTransaction>(tx: T): Promise<T> => {
          throw new Error("Cannot sign transactions with a read-only linked account");
        },
        signAllTransactions: async <T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> => {
          throw new Error("Cannot sign transactions with a read-only linked account");
        }
      };
    }

    return null;
  }, [anchorWallet, wallets, user]);

  const provider = wallet ? new AnchorProvider(connection, wallet as any, { preflightCommitment: "processed" }) : null;
  if (provider) setProvider(provider);

  const program = provider ? new Program(idl as any, provider) : null;

  const getGlobalStatePDA = () => {
    return PublicKey.findProgramAddressSync([Buffer.from("global_state")], PROGRAM_ID)[0];
  };

  const getUserVaultPDA = (userPubkey: PublicKey) => {
    return PublicKey.findProgramAddressSync([Buffer.from("user_vault"), userPubkey.toBuffer()], PROGRAM_ID)[0];
  };

  const getSavingPDA = (userVaultPDA: PublicKey, savingName: string) => {
    return PublicKey.findProgramAddressSync([Buffer.from("saving"), userVaultPDA.toBuffer(), Buffer.from(savingName)], PROGRAM_ID)[0];
  };

  const hasSavingPDA = async (savingName: string) => {
    if (!program || !wallet) return false;
    try {
      const userVaultPDA = getUserVaultPDA(wallet.publicKey);
      const savingPDA = getSavingPDA(userVaultPDA, savingName);
      // @ts-ignore
      await program.account.saving.fetch(savingPDA);
      return true;
    } catch (e) {
      return false;
    }
  };

  const ensureDevnetSOL = async (pubkey: PublicKey) => {
    try {
      let balance = await connection.getBalance(pubkey);
      if (balance < 50000000 && connection.rpcEndpoint.includes("devnet")) {
        try {
          console.log("Low devnet SOL detected. Requesting airdrop...");
          const sig = await connection.requestAirdrop(pubkey, 1 * 1e9); // 1 SOL
          await connection.confirmTransaction({
            signature: sig,
            ...(await connection.getLatestBlockhash())
          }, "confirmed");
          console.log("Airdrop successful.");
          balance = await connection.getBalance(pubkey);
        } catch (e) {
          console.warn("Auto-airdrop failed.", e);
        }
      }
      
      if (balance < 5000000) { // 0.005 SOL is bare minimum for rent
        throw new Error("INSUFFICIENT DEVNET SOL: Your wallet has zero SOL. Devnet airdrop failed due to rate limits. Please visit https://faucet.solana.com/ and paste your wallet address to get free SOL for testing.");
      }
    } catch (error: any) {
      if (error.message.includes("INSUFFICIENT DEVNET SOL")) {
        throw error;
      }
      console.warn("Could not check SOL balance", error);
    }
  };

  const joinBitsave = async (stablecoinMint: PublicKey, adminPubkey: PublicKey) => {
    if (!program || !wallet) throw new Error("Program or wallet not initialized");
    await ensureDevnetSOL(wallet.publicKey);

    const globalStatePDA = getGlobalStatePDA();
    const userVaultPDA = getUserVaultPDA(wallet.publicKey);
    
    const userTokenAta = await getAssociatedTokenAddress(stablecoinMint, wallet.publicKey);
    const adminTokenAta = await getAssociatedTokenAddress(stablecoinMint, adminPubkey);

    const tx = await program.methods
      .joinBitsave()
      .accountsStrict({
        globalState: globalStatePDA,
        userVault: userVaultPDA,
        user: wallet.publicKey,
        tokenMint: stablecoinMint,
        userTokenAccount: userTokenAta,
        adminTokenAccount: adminTokenAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          userTokenAta,
          wallet.publicKey,
          stablecoinMint
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          adminTokenAta,
          adminPubkey,
          stablecoinMint
        )
      ])
      .rpc();
    return tx;
  };

  const createSaving = async (
    name: string,
    amountInTokens: number,
    decimals: number,
    daysToMaturity: number,
    stablecoinMint: PublicKey,
    adminPubkey: PublicKey
  ) => {
    if (!program || !wallet) throw new Error("Program or wallet not initialized");
    await ensureDevnetSOL(wallet.publicKey);

    const globalStatePDA = getGlobalStatePDA();
    const userVaultPDA = getUserVaultPDA(wallet.publicKey);
    const savingPDA = getSavingPDA(userVaultPDA, name);

    const multiplier = new BN(10).pow(new BN(decimals));
    const amount = new BN(amountInTokens).mul(multiplier);
    const maturityTime = new BN(Math.floor(Date.now() / 1000) + daysToMaturity * 24 * 60 * 60);
    const penaltyPercentage = 10;
    const safeMode = false;

    const userTokenAta = await getAssociatedTokenAddress(stablecoinMint, wallet.publicKey);
    const vaultTokenAta = await getAssociatedTokenAddress(stablecoinMint, userVaultPDA, true);
    const adminTokenAta = await getAssociatedTokenAddress(stablecoinMint, adminPubkey);

    const tx = await program.methods
      .createTokenSaving(name, maturityTime, penaltyPercentage, safeMode, amount)
      .accountsStrict({
        globalState: globalStatePDA,
        userVault: userVaultPDA,
        saving: savingPDA,
        user: wallet.publicKey,
        tokenMint: stablecoinMint,
        userTokenAccount: userTokenAta,
        vaultTokenAccount: vaultTokenAta,
        adminTokenAccount: adminTokenAta,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          userTokenAta,
          wallet.publicKey,
          stablecoinMint
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          vaultTokenAta,
          userVaultPDA,
          stablecoinMint
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          adminTokenAta,
          adminPubkey,
          stablecoinMint
        )
      ])
      .rpc();
    return tx;
  };

  const incrementSaving = async (
    name: string,
    amountInTokens: number,
    decimals: number,
    stablecoinMint: PublicKey
  ) => {
    if (!program || !wallet) throw new Error("Program or wallet not initialized");
    await ensureDevnetSOL(wallet.publicKey);

    const globalStatePDA = getGlobalStatePDA();
    const userVaultPDA = getUserVaultPDA(wallet.publicKey);
    const savingPDA = getSavingPDA(userVaultPDA, name);

    const multiplier = new BN(10).pow(new BN(decimals));
    const amount = new BN(amountInTokens).mul(multiplier);

    const userTokenAta = await getAssociatedTokenAddress(stablecoinMint, wallet.publicKey);
    const vaultTokenAta = await getAssociatedTokenAddress(stablecoinMint, userVaultPDA, true);

    const tx = await program.methods
      .incrementTokenSaving(name, amount)
      .accountsStrict({
        globalState: globalStatePDA,
        userVault: userVaultPDA,
        saving: savingPDA,
        user: wallet.publicKey,
        tokenMint: stablecoinMint,
        userTokenAccount: userTokenAta,
        vaultTokenAccount: vaultTokenAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions([
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          userTokenAta,
          wallet.publicKey,
          stablecoinMint
        ),
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          vaultTokenAta,
          userVaultPDA,
          stablecoinMint
        )
      ])
      .rpc();
    return tx;
  };

  const hasJoinedBitsave = async () => {
    if (!program || !wallet) return false;
    try {
      const userVaultPDA = getUserVaultPDA(wallet.publicKey);
      // Ignore type checking on dynamic IDL accounts
      // @ts-ignore
      await program.account.userVault.fetch(userVaultPDA);
      return true;
    } catch (e) {
      return false;
    }
  };

  const getUserSavings = async () => {
    if (!program || !wallet) return [];
    try {
      console.log("Fetching Solana savings for user:", wallet.publicKey.toBase58());
      
      const userVaultPDA = getUserVaultPDA(wallet.publicKey);
      
      // Use memcmp filters to fetch only this user's savings (much faster than .all())
      // The Saving account layout: [8 bytes discriminator][32 bytes owner pubkey][...]
      // The owner field is at offset 8
      const ownerOffset = 8;
      
      // Fetch savings owned by user directly AND by their vault PDA in parallel
      // @ts-ignore
      const [userOwnedSavings, vaultOwnedSavings] = await Promise.all([
        // @ts-ignore
        program.account.saving.all([
          { memcmp: { offset: ownerOffset, bytes: wallet.publicKey.toBase58() } }
        ]),
        // @ts-ignore
        program.account.saving.all([
          { memcmp: { offset: ownerOffset, bytes: userVaultPDA.toBase58() } }
        ])
      ]);
      
      // Combine and deduplicate by public key
      const seenKeys = new Set<string>();
      const allUserSavings = [];
      
      for (const saving of [...userOwnedSavings, ...vaultOwnedSavings]) {
        const key = saving.publicKey.toBase58();
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allUserSavings.push(saving);
        }
      }
      
      console.log(`Found ${allUserSavings.length} savings for user (${userOwnedSavings.length} direct, ${vaultOwnedSavings.length} via vault)`);
      
      return allUserSavings;
    } catch (e) {
      console.error("Failed to fetch Solana savings:", e);
      return [];
    }
  };

  const createOrIncrementSaving = async (
    name: string,
    amountInTokens: number,
    decimals: number,
    daysToMaturity: number,
    stablecoinMint: PublicKey,
    adminPubkey: PublicKey
  ) => {
    const exists = await hasSavingPDA(name);
    if (exists) {
      return incrementSaving(name, amountInTokens, decimals, stablecoinMint);
    } else {
      return createSaving(name, amountInTokens, decimals, daysToMaturity, stablecoinMint, adminPubkey);
    }
  };

  return {
    program,
    getGlobalStatePDA,
    getUserVaultPDA,
    getSavingPDA,
    joinBitsave,
    createSaving,
    incrementSaving,
    createOrIncrementSaving,
    hasJoinedBitsave,
    getUserSavings
  };
}
