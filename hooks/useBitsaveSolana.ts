'use client';

// Solana has been deprecated in favor of unified EVM multi-chain support (Base, Celo, Lisk, BSC, Avalanche).
export function useBitsaveSolana() {
  return {
    joinSolanaBitsave: async () => { throw new Error("Solana is not supported."); },
    createOrIncrementSaving: async () => { throw new Error("Solana is not supported."); },
    incrementSaving: async () => { throw new Error("Solana is not supported."); },
    withdrawSaving: async () => { throw new Error("Solana is not supported."); },
    getUserSaving: async () => null,
    hasJoinedSolanaBitsave: async () => false,
  };
}
