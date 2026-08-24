// Contract error handling utility focused on extracting precise, user-friendly contract errors

const extractPreciseContractError = (error: unknown): string => {
  const e = error as Record<string, any> | undefined;

  // Ethers v6 custom error decoding
  if (e && typeof e === 'object') {
    if (e.errorName) {
      return String(e.errorName);
    }
    if (typeof e.reason === 'string' && e.reason.trim()) {
      return e.reason.replace(/execution reverted:?\s*/i, '').trim();
    }
    if (typeof e.shortMessage === 'string' && e.shortMessage.trim()) {
      const sm = e.shortMessage.trim();
      const match = sm.match(/execution reverted:?\s*(.+?)(?:\(|$)/i);
      return match ? match[1].trim() : sm;
    }
  }

  // Fallback to message string parsing
  const msg = (e && typeof e?.message === 'string') ? e.message : String(error ?? '');
  if (msg) {
    const match = msg.match(/execution reverted:?\s*(.+?)(?:\(|$)/i) || msg.match(/revert:?\s*(.+?)(?:\(|$)/i);
    if (match) return match[1].trim();
  }

  // Deep RPC error message
  const nestedMsg = (e?.data?.message || e?.error?.message || e?.info?.error?.message);
  if (typeof nestedMsg === 'string' && nestedMsg) {
    const m = nestedMsg.match(/execution reverted:?\s*(.+?)(?:\(|$)/i);
    if (m) return m[1].trim();
  }

  return '';
};

/**
 * Handles contract custom errors and converts technical RPC/EVM faults into crystal-clear explanations.
 */
export const handleContractError = (error: unknown, contractType: 'main' | 'child' = 'main'): string => {
  const precise = extractPreciseContractError(error);
  const errorString = ((error as { message?: string })?.message || String(error || '')).toLowerCase();

  // 1. User rejection
  if (errorString.includes('user rejected') || errorString.includes('user denied') || errorString.includes('action_rejected')) {
    return 'Transaction was cancelled in your wallet.';
  }

  // 2. Insufficient token / native funds
  if (errorString.includes('insufficient funds') || errorString.includes('insufficient balance') || errorString.includes('exceeds balance')) {
    return 'Insufficient balance in your wallet to cover the deposit amount and gas fees.';
  }

  // 3. Known custom contract errors
  if (precise === 'AmountNotEnough' || errorString.includes('amountnotenough')) {
    return 'The savings amount entered is below the minimum required deposit for this plan.';
  }
  if (precise === 'NotEnoughToPayGasFee' || errorString.includes('notenoughtopaygasfee')) {
    return 'Your wallet has insufficient native tokens to pay the protocol network fee.';
  }
  if (precise === 'InvalidTime' || errorString.includes('invalidtime')) {
    return 'Target unlock date must be in the future.';
  }
  if (precise === 'CallNotFromBitsave' || precise === 'UserNotRegistered' || errorString.includes('callnotfrombitsave')) {
    return 'Your BitSave vault account is not initialized yet. Please approve the initial vault setup transaction.';
  }
  if (precise === 'CanNotWithdrawToken' || errorString.includes('cannotwithdrawtoken')) {
    return 'This token cannot be withdrawn at this time.';
  }

  // 4. Missing revert data (estimateGas failure / simulation revert)
  if (errorString.includes('missing revert data') || errorString.includes('call_exception') || errorString.includes('cannot estimate gas')) {
    return 'Transaction simulation failed. Please ensure your wallet has sufficient stablecoins and native tokens (ETH/CELO/BNB/AVAX) for gas fees.';
  }

  // 5. Network / RPC errors
  if (errorString.includes('failed to fetch') || errorString.includes('econnrefused') || errorString.includes('network request failed') || errorString.includes('could not detect network') || (errorString.includes('network error') && !errorString.includes('switch'))) {
    return 'Network connection issue with the blockchain RPC node. Please check your internet connection and try again.';
  }

  if (precise && precise.length > 3) {
    return precise;
  }

  return ((error as { message?: string })?.message || 'Transaction failed onchain. Please check your wallet balance and try again.');
};

export const handleChildContractError = (error: unknown): string => handleContractError(error, 'child');
export const handleMainContractError = (error: unknown): string => handleContractError(error, 'main');