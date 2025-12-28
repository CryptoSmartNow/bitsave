import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseErrorMessage = (error: any): string => {
  const errorMessage = error?.message || String(error);
  return errorMessage
    .replace(/^Error:\s*/i, '')
    .replace(/^MetaMask\s*/i, '')
    .replace(/^Web3\s*/i, '')
    .replace(/execution reverted:?\s*/i, '')
    .replace(/^VM Exception while processing transaction:\s*/i, '')
    .replace(/^Transaction failed:\s*/i, '')
    .trim();
};