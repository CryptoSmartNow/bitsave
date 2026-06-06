import { useMemo } from "react";
import { Connection, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "../idl/bizswap_solana.json";
import { BizswapSolana } from "../types/bizswap_solana";
import { BIZSWAP_PROGRAM_ID } from "../lib/bizswap-solana";

export function useBizSwapProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    // If no native wallet is connected (e.g. using Privy), provide a dummy read-only wallet
    const readOnlyWallet = wallet || {
      publicKey: Keypair.generate().publicKey,
      signTransaction: async (tx: any) => tx,
      signAllTransactions: async (txs: any[]) => txs,
    };
    
    const provider = new AnchorProvider(connection, readOnlyWallet, {
      preflightCommitment: "confirmed",
    });
    
    return new Program(idl as Idl, provider) as unknown as Program<BizswapSolana>;
  }, [connection, wallet]);

  return program;
}
