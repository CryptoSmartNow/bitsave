import { useMemo } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import idl from "../idl/bizswap_solana.json";
import { BizswapSolana } from "../types/bizswap_solana";
import { BIZSWAP_PROGRAM_ID } from "../lib/bizswap-solana";

export function useBizSwapProgram() {
  const program = useMemo(() => {
    const endpoint = typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SOLANA_RPC_URL && process.env.NEXT_PUBLIC_SOLANA_RPC_URL.startsWith("http")
          ? process.env.NEXT_PUBLIC_SOLANA_RPC_URL
          : `${window.location.origin}/api/rpc/solana`)
      : (process.env.SOLANA_RPC_URL && process.env.SOLANA_RPC_URL.startsWith("http")
          ? process.env.SOLANA_RPC_URL
          : "https://api.mainnet-beta.solana.com");
    const connection = new Connection(endpoint);
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
