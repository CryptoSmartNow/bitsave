import { ethers } from 'ethers';
import CONTRACT_ABI from '@/app/abi/contractABI.js';

/**
 * Fetches the saving fee from the contract
 * @param contractAddress - The contract address
 * @param provider - The ethers provider
 * @returns The saving fee in wei as a string
 */
export async function getSavingFeeFromContract(
  contractAddress: string,
  provider: ethers.Provider
): Promise<string> {
  try {
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
    const savingFee = await contract.SavingFee();
    return savingFee.toString();
  } catch (error) {
    console.error('Error fetching saving fee from contract:', error);
    throw new Error('Failed to fetch saving fee from contract');
  }
}

/**
 * Estimates gas for a contract transaction
 * @param contract - The contract instance
 * @param methodName - The method name to estimate gas for
 * @param args - The arguments for the method
 * @param overrides - Transaction overrides (like value)
 * @returns The estimated gas limit
 */
export async function estimateGasForTransaction(
  contract: ethers.Contract,
  methodName: string,
  args: any[],
  overrides: any = {}
): Promise<bigint> {
  try {
    const estimatedGas = await contract[methodName].estimateGas(...args, overrides);
    // Add 20% buffer to the estimated gas
    const gasWithBuffer = (estimatedGas * BigInt(120)) / BigInt(100);
    return gasWithBuffer;
  } catch (error) {
    console.error(`Error estimating gas for ${methodName}:`, error);
    // Fallback to a reasonable default based on the method
    const fallbackGasLimits: { [key: string]: bigint } = {
      'createSaving': BigInt(2717330),
      'incrementSaving': BigInt(2000000),
      'joinBitsave': BigInt(1500000),
      'withdrawSaving': BigInt(1000000),
    };
    
    const fallbackGas = fallbackGasLimits[methodName] || BigInt(2000000);
    console.warn(`Using fallback gas limit of ${fallbackGas} for ${methodName}`);
    return fallbackGas;
  }
}

/**
 * Gets the current gas price with a buffer
 * @param provider - The ethers provider
 * @returns The gas price with buffer
 */
export async function getGasPriceWithBuffer(provider: ethers.Provider): Promise<bigint> {
  try {
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    // Add 10% buffer to gas price
    return (gasPrice * BigInt(110)) / BigInt(100);
  } catch (error) {
    console.error('Error fetching gas price:', error);
    // Fallback gas price (20 gwei)
    return ethers.parseUnits('20', 'gwei');
  }
}

/**
 * Estimates the total transaction cost (gas + value)
 * @param provider - The ethers provider
 * @param gasLimit - The gas limit
 * @param value - The value to send (optional)
 * @returns The total cost in wei
 */
export async function estimateTransactionCost(
  provider: ethers.Provider,
  gasLimit: bigint,
  value: bigint = BigInt(0)
): Promise<bigint> {
  try {
    const gasPrice = await getGasPriceWithBuffer(provider);
    const gasCost = gasPrice * gasLimit;
    return gasCost + value;
  } catch (error) {
    console.error('Error estimating transaction cost:', error);
    throw new Error('Failed to estimate transaction cost');
  }
}

/**
 * Checks if user has sufficient balance for a transaction
 * @param provider - The ethers provider
 * @param userAddress - The user's address
 * @param totalCost - The total cost of the transaction
 * @returns True if user has sufficient balance
 */
export async function checkSufficientBalance(
  provider: ethers.Provider,
  userAddress: string,
  totalCost: bigint
): Promise<boolean> {
  try {
    const balance = await provider.getBalance(userAddress);
    return balance >= totalCost;
  } catch (error) {
    console.error('Error checking balance:', error);
    return false;
  }
}