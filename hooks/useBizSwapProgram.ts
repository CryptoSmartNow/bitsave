import { useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import idl from "../idl/bizswap_solana.json";
import { BizswapSolana } from "../types/bizswap_solana";
import { BIZSWAP_PROGRAM_ID } from "../lib/bizswap-solana";

export function useBizSwapProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;
    
    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    
    return new Program(idl as Idl, provider) as unknown as Program<BizswapSolana>;
  }, [connection, wallet]);

  return program;
}
