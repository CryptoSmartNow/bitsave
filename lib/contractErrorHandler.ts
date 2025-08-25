// Contract error handling utility for child contract custom errors

/**
 * Handles child contract custom errors and provides user-friendly error messages
 * @param error - The error object from the contract interaction
 * @returns A user-friendly error message
 */
export const handleChildContractError = (error: unknown): string => {
  // Check if error has a reason or data property that contains the custom error
  const errorString = (error as { reason?: string; message?: string })?.reason || 
                     (error as { message?: string })?.message || 
                     (typeof error === 'object' && error !== null ? error.toString() : String(error)) || '';
  
  // Handle specific child contract custom errors
  if (errorString.includes('CallNotFromBitsave')) {
    return 'This operation can only be called from the Bitsave platform. Please ensure you are using the correct interface.';
  }
  
  if (errorString.includes('InvalidSaving')) {
    return 'The savings plan you are trying to access does not exist or is invalid. Please check the plan name and try again.';
  }
  
  if (errorString.includes('InvalidTime')) {
    return 'This operation cannot be performed at this time. Please check the maturity date of your savings plan.';
  }
  
  // Handle common contract errors
  if (errorString.includes('insufficient funds')) {
    return 'Insufficient funds to complete this transaction. Please check your wallet balance.';
  }
  
  if (errorString.includes('user rejected')) {
    return 'Transaction was cancelled by user.';
  }
  
  if (errorString.includes('gas')) {
    return 'Transaction failed due to gas estimation issues. Please try again with a higher gas limit.';
  }
  
  if (errorString.includes('network')) {
    return 'Network error occurred. Please check your connection and try again.';
  }
  
  // Handle execution reverted errors
  if (errorString.includes('execution reverted')) {
    return 'Transaction was reverted by the smart contract. Please verify your input and try again.';
  }
  
  // Default error message
  return 'An unexpected error occurred. Please try again or contact support if the issue persists.';
};

/**
 * Handles main contract custom errors and provides user-friendly error messages
 * @param error - The error object from the contract interaction
 * @returns A user-friendly error message
 */
export const handleMainContractError = (error: unknown): string => {
  const errorString = (error as { reason?: string; message?: string })?.reason || 
                     (error as { message?: string })?.message || 
                     (typeof error === 'object' && error !== null ? error.toString() : String(error)) || '';
  
  // Handle specific main contract custom errors
  if (errorString.includes('AmountNotEnough')) {
    return 'The amount specified is not sufficient for this operation.';
  }
  
  if (errorString.includes('CanNotWithdrawToken')) {
    return 'This token cannot be withdrawn at this time. Please check the withdrawal conditions.';
  }
  
  if (errorString.includes('MasterCallRequired')) {
    return 'This operation requires master authorization.';
  }
  
  if (errorString.includes('NotEnoughToPayGasFee')) {
    return 'Insufficient funds to pay for gas fees. Please add more funds to your wallet.';
  }
  
  if (errorString.includes('NotSupported')) {
    return 'This operation is not supported for the specified token or configuration.';
  }
  
  if (errorString.includes('UserNotRegistered')) {
    return 'You need to join Bitsave first before performing this operation.';
  }
  
  // Fall back to child contract error handler for common errors
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