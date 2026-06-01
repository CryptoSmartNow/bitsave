import { PublicKey } from "@solana/web3.js";

// Program ID from README
export const BIZSWAP_PROGRAM_ID = new PublicKey("4jTTCrJ9dMYHQpQtCSsgRQ7dE8JkHKs3XApYyhJjxSib");

// 1. Global Config PDA
export function getGlobalConfigPda() {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_config")],
    BIZSWAP_PROGRAM_ID
  );
  return pda;
}

// 2. Instrument Config PDA (0 = BizYield, 1 = BizCredit, 2 = BizBond)
export function getInstrumentConfigPda(instrumentType: number) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("instrument"), Buffer.from([instrumentType])],
    BIZSWAP_PROGRAM_ID
  );
  return pda;
}

// 3. Certificate Record PDA (derived from the unique NFT mint address)
export function getCertificateRecordPda(mintAddress: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("certificate"), mintAddress.toBuffer()],
    BIZSWAP_PROGRAM_ID
  );
  return pda;
}
