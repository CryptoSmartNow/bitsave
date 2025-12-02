// Contract error handling utility focused on extracting precise contract errors

// Attempt to extract the most precise revert reason or custom error name
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

  // Check for custom error selectors in the data field
    if (e?.data && typeof e.data === 'string' && e.data.startsWith('0x')) {
      const selector = e.data.slice(0, 10); // First 4 bytes (8 hex chars + 0x)
      
      // Known custom error selectors
      const knownErrors: Record<string, string> = {
        '0xd63d1e48': 'InvalidSaving',
        '0x6f7eac26': 'InvalidTime',
        '0xcb6e851c': 'AmountNotEnough',
        '0xec866729': 'CanNotWithdrawToken',
        '0x229e1dbd': 'CallNotFromBitsave'
      };

      if (knownErrors[selector]) {
        const errorName = knownErrors[selector];
        if (errorName === 'InvalidSaving') {
          return 'Invalid Savings Plan: The savings plan does not exist or is invalid.';
        }
        if (errorName === 'InvalidTime') {
          return 'Withdrawal Locked: The savings plan has not yet reached its maturity date.';
        }
        if (errorName === 'AmountNotEnough') {
          return 'Insufficient Funds: The withdrawal amount exceeds the available balance.';
        }
        return `Contract Error: ${errorName}`;
      }

      if (selector.length === 10 && selector !== '0x') {
        return `Unknown custom error: ${selector}`;
      }
    }

  return '';
};

/**
 * Handles child contract custom errors and provides user-friendly error messages
 * @param error - The error object from the contract interaction
 * @returns A user-friendly error message
 */
export const handleChildContractError = (error: unknown): string => {
  // Prefer precise contract-derived reason or custom error name
  const precise = extractPreciseContractError(error);
  if (precise) return precise;

  const errorString = ((error as { message?: string })?.message || String(error || '')).toLowerCase();

  // Short, non-verbose fallbacks
  if (errorString.includes('callnotfrombitsave')) return 'CallNotFromBitsave';
  if (errorString.includes('invalidsaving')) return 'InvalidSaving';
  if (errorString.includes('invalidtime')) return 'InvalidTime';
  if (errorString.includes('insufficient funds')) return 'Insufficient funds';
  if (errorString.includes('user rejected') || errorString.includes('user denied')) return 'User rejected transaction';
  if (errorString.includes('gas')) return 'Gas estimation failed';
  if (errorString.includes('network')) return 'Network error';

  return 'Transaction failed';
};

/**
 * Handles main contract custom errors and provides user-friendly error messages
 * @param error - The error object from the contract interaction
 * @returns A user-friendly error message
 */
export const handleMainContractError = (error: unknown): string => {
  // Prefer precise contract-derived reason or custom error name
  const precise = extractPreciseContractError(error);
  if (precise) {
    // Check if this is an unknown custom error selector
    if (precise.includes('Unknown custom error: 0xd63d1e48')) {
      return 'Withdrawal failed: This savings plan may not be ready for withdrawal yet. Please check if the minimum time period has passed or if there are sufficient funds available.';
    }
    return precise;
  }

  const errorString = ((error as { message?: string })?.message || String(error || '')).toLowerCase();

  // Short, non-verbose fallbacks for known custom errors
  if (errorString.includes('amountnotenough')) return 'AmountNotEnough';
  if (errorString.includes('cannotwithdrawtoken')) return 'CanNotWithdrawToken';
  if (errorString.includes('mastercallrequired')) return 'MasterCallRequired';
  if (errorString.includes('notenoughtopaygasfee')) return 'NotEnoughToPayGasFee';
  if (errorString.includes('notsupported')) return 'NotSupported';
  if (errorString.includes('usernotregistered')) return 'UserNotRegistered';

  // Fall back to common short messages
  return handleChildContractError(error);
};

/**
 * Determines which error handler to use based on the contract type
 * @param error - The error object from the contract interaction
 * @param contractType - 'main' or 'child' contract type
 * @returns A user-friendly error message
 */
export const handleContractError = (error: unknown, contractType: 'main' | 'child' = 'main'): string => {
  if (contractType === 'child') {
    return handleChildContractError(error);
  }
  return handleMainContractError(error);
};