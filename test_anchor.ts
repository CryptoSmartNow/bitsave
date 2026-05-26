import { Program, Idl } from "@coral-xyz/anchor";
import idl from "./app/abi/bitsave-solana.json";

console.log("Account names in IDL:", (idl as any).accounts.map((a: any) => a.name));
