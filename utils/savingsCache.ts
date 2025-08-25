/**
 * Savings Data Caching Utility
 * 
 * This utility provides a comprehensive caching mechanism for user savings data
 * using localStorage with timestamp validation and background updates.
 * 
 * Features:
 * - Fast initial display from cache
 * - Background data fetching and updates
 * - Timestamp-based staleness detection
 * - Graceful error handling
 * - Automatic cache invalidation
 */

import { ethers } from 'ethers';

// Cache configuration constants
const CACHE_KEY_PREFIX = 'bitsave_savings_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const BACKGROUND_REFRESH_THRESHOLD = 2 * 60 * 1000; // 2 minutes

// Type definitions for savings data structure
export interface SavingsPlan {
  id: string;
  address: string;
  name: string;
  currentAmount: string;
  targetAmount: string;
  progress: number;
  isEth: boolean;
  isGToken?: boolean;
  isUSDGLO?: boolean;
  startTime: number;
  maturityTime: number;
  penaltyPercentage: number;
  tokenName?: string;
  tokenLogo?: string;
  network?: string;
}

export interface SavingsData {
  totalLocked: string;
  deposits: number;
  rewards: string;
  currentPlans: SavingsPlan[];
  completedPlans: SavingsPlan[];
}

export interface CachedSavingsData {
  data: SavingsData;
  timestamp: number;
  userAddress: string;
  networkChainId: string;
}

// Cache key generation based on user address and network
function getCacheKey(userAddress: string, networkChainId: string): string {
  return `${CACHE_KEY_PREFIX}${userAddress.toLowerCase()}_${networkChainId}`;
}

// Check if cached data is still valid based on timestamp
function isCacheValid(cachedData: CachedSavingsData): boolean {
  const now = Date.now();
  const age = now - cachedData.timestamp;
  return age < CACHE_EXPIRY_MS;
}

// Check if cached data should trigger background refresh
function shouldRefreshInBackground(cachedData: CachedSavingsData): boolean {
  const now = Date.now();
  const age = now - cachedData.timestamp;
  return age > BACKGROUND_REFRESH_THRESHOLD;
}

// Safely parse JSON from localStorage with error handling
function safeParseCache(cacheString: string | null): CachedSavingsData | null {
  if (!cacheString) return null;
  
  try {
    const parsed = JSON.parse(cacheString) as CachedSavingsData;
    
    // Validate required properties
    if (!parsed.data || !parsed.timestamp || !parsed.userAddress || !parsed.networkChainId) {
      console.warn('Invalid cache structure, ignoring cached data');
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing cached savings data:', error);
    return null;
  }
}

// Store savings data in localStorage with metadata
export function cacheSavingsData(
  data: SavingsData,
  userAddress: string,
  networkChainId: string
): void {
  try {
    const cacheData: CachedSavingsData = {
      data,
      timestamp: Date.now(),
      userAddress: userAddress.toLowerCase(),
      networkChainId
    };
    
    const cacheKey = getCacheKey(userAddress, networkChainId);
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    

  } catch (error) {
    console.error('Error caching savings data:', error);
    // Don't throw error - caching failure shouldn't break the app
  }
}

// Retrieve cached savings data if valid
export function getCachedSavingsData(
  userAddress: string,
  networkChainId: string
): SavingsData | null {
  try {
    const cacheKey = getCacheKey(userAddress, networkChainId);
    const cachedString = localStorage.getItem(cacheKey);
    const cachedData = safeParseCache(cachedString);
    
    if (!cachedData) {

      return null;
    }
    
    // Verify cache is for the correct user and network
    if (cachedData.userAddress !== userAddress.toLowerCase() || 
        cachedData.networkChainId !== networkChainId) {
      console.warn('Cache mismatch - user or network changed');
      clearCachedSavingsData(userAddress, networkChainId);
      return null;
    }
    
    if (isCacheValid(cachedData)) {

      return cachedData.data;
    } else {

      clearCachedSavingsData(userAddress, networkChainId);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving cached savings data:', error);
    return null;
  }
}

// Check if background refresh is needed for cached data
export function needsBackgroundRefresh(
  userAddress: string,
  networkChainId: string
): boolean {
  try {
    const cacheKey = getCacheKey(userAddress, networkChainId);
    const cachedString = localStorage.getItem(cacheKey);
    const cachedData = safeParseCache(cachedString);
    
    if (!cachedData) return false;
    
    return shouldRefreshInBackground(cachedData);
  } catch (error) {
    console.error('Error checking background refresh need:', error);
    return false;
  }
}

// Clear cached data for specific user and network
export function clearCachedSavingsData(
  userAddress: string,
  networkChainId: string
): void {
  try {
    const cacheKey = getCacheKey(userAddress, networkChainId);
    localStorage.removeItem(cacheKey);

  } catch (error) {
    console.error('Error clearing cached savings data:', error);
  }
}

// Clear all cached savings data (useful for logout or cache reset)
export function clearAllCachedSavingsData(): void {
  try {
    const keysToRemove: string[] = [];
    
    // Find all keys that match our cache prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all matching keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    

  } catch (error) {
    console.error('Error clearing all cached savings data:', error);
  }
}

// Get cache statistics for debugging
export function getCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
} {
  let totalEntries = 0;
  let validEntries = 0;
  let expiredEntries = 0;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        totalEntries++;
        
        const cachedString = localStorage.getItem(key);
        const cachedData = safeParseCache(cachedString);
        
        if (cachedData) {
          if (isCacheValid(cachedData)) {
            validEntries++;
          } else {
            expiredEntries++;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error getting cache stats:', error);
  }
  
  return { totalEntries, validEntries, expiredEntries };
}

// Cleanup expired cache entries
export function cleanupExpiredCache(): void {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const cachedString = localStorage.getItem(key);
        const cachedData = safeParseCache(cachedString);
        
        if (cachedData && !isCacheValid(cachedData)) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {

    }
  } catch (error) {
    console.error('Error cleaning up expired cache:', error);
  }
}

// Initialize cache system (call on app startup)
export function initializeSavingsCache(): void {
  try {
    // Clean up any expired entries on startup
    cleanupExpiredCache();
    
    // Log cache statistics
    const stats = getCacheStats();

  } catch (error) {
    console.error('Error initializing savings cache:', error);
  }
}