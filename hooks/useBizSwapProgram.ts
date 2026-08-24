import { useMemo } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "../idl/bizswap_solana.json";
import { BizswapSolana } from "../types/bizswap_solana";
import { BIZSWAP_PROGRAM_ID } from "../lib/bizswap-solana";

export function useBizSwapProgram() {
  const program = useMemo(() => {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com");
    const readOnlyWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    };
    
    const provider = new AnchorProvider(connection, readOnlyWallet, {
      preflightCommitment: "confirmed",
    });
    
    return new Program(idl as Idl, provider) as unknown as Program<BizswapSolana>;
  }, []);

  return program;
}
