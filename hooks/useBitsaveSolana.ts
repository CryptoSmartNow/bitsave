import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, setProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, VersionedTransaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import idl from "../app/abi/bitsave-solana.json";
import { useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

// You will need to update this with the actual deployed program ID
const PROGRAM_ID = new PublicKey("2yx2FXwxyskf3qhrknysyqNTuXXVsyC1nxyjuLUrVQuJ");

export function useBitsaveSolana() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const { wallets } = useWallets();

  const wallet = useMemo(() => {
    if (anchorWallet) return anchorWallet;
    
    // Check for Privy solana wallet
    const privySolana = wallets.find((w: any) => w.chainType === 'solana' || w.walletClientType === 'phantom');
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
    return null;
  }, [anchorWallet, wallets]);

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

  const joinBitsave = async (stablecoinMint: PublicKey, adminPubkey: PublicKey) => {
    if (!program || !wallet) throw new Error("Program or wallet not initialized");

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

  return {
    program,
    getGlobalStatePDA,
    getUserVaultPDA,
    getSavingPDA,
    joinBitsave,
    createSaving,
    incrementSaving,
    hasJoinedBitsave
  };
}
