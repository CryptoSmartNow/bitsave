

/**
 * Network Synchronization Hook
 * 
 * This hook provides automatic network synchronization between the user's wallet
 * and the application UI. It ensures that the active network tab always reflects
 * the wallet's current network state.
 * 
 * Features:
 * - Automatic network detection on app load
 * - Real-time wallet network change detection
 * - Seamless UI synchronization
 * - Network switching with validation
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAccount, useChainId, useSwitchChain, useConnectorClient } from 'wagmi';
import { useSavingsData } from './useSavingsData';

// Network configuration
const SUPPORTED_NETWORKS = {
  BASE: { chainId: 8453, name: 'Base' },
  CELO: { chainId: 42220, name: 'Celo' },
  LISK: { chainId: 1135, name: 'Lisk' },
  AVALANCHE: { chainId: 43114, name: 'Avalanche' },
  HEDERA: { chainId: 296, name: 'Hedera Testnet' }
} as const;

// Helper function to get network parameters for adding to wallet
const getNetworkParams = (networkName: string) => {
  switch (networkName) {
    case 'Base':
      return {
        chainIdHex: `0x${SUPPORTED_NETWORKS.BASE.chainId.toString(16)}`,
        chainName: 'Base',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
      };
    case 'Celo':
      return {
        chainIdHex: `0x${SUPPORTED_NETWORKS.CELO.chainId.toString(16)}`,
        chainName: 'Celo',
        nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
        rpcUrls: ['https://forno.celo.org'],
        blockExplorerUrls: ['https://explorer.celo.org'],
      };
    case 'Lisk':
      return {
        chainIdHex: `0x${SUPPORTED_NETWORKS.LISK.chainId.toString(16)}`,
        chainName: 'Lisk',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://rpc.api.lisk.com'],
        blockExplorerUrls: ['https://blockscout.lisk.com'],
      };
    case 'Avalanche':
      return {
        chainIdHex: `0x${SUPPORTED_NETWORKS.AVALANCHE.chainId.toString(16)}`,
        chainName: 'Avalanche',
        nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        blockExplorerUrls: ['https://snowtrace.io'],
      };
    default:
      throw new Error(`Unsupported network: ${networkName}`);
  }
};

interface UseNetworkSyncReturn {
  syncToWalletNetwork: () => Promise<void>;
  switchToNetwork: (networkName: string) => Promise<boolean>;
  isNetworkSynced: boolean;
  currentNetworkName: string | null;
  isNetworkSwitching: boolean;
  isSyncing: boolean;
}

export function useNetworkSync(): UseNetworkSyncReturn {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: connectorClient } = useConnectorClient();
  const {
    isBaseNetwork,
    isCeloNetwork,
    isLiskNetwork,
    isAvalancheNetwork,
    refetch: refetchSavingsData,
    forceRefreshNetworkState
  } = useSavingsData();

  // Track if we've performed initial sync
  const hasInitialSyncRef = useRef(false);
  const lastKnownChainIdRef = useRef<number | null>(null);

  // State for loading indicators
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get current network name based on chain ID
  const getCurrentNetworkName = useCallback((currentChainId?: number): string | null => {
    if (!currentChainId) return null;

    const network = Object.values(SUPPORTED_NETWORKS).find(
      net => net.chainId === currentChainId
    );
    return network?.name || `Unknown Network (${currentChainId})`;
  }, []);



  // Check if network is synced (UI state matches wallet state)
  const isNetworkSynced = useCallback((): boolean => {
    if (!chainId) return false;

    switch (chainId) {
      case SUPPORTED_NETWORKS.BASE.chainId:
        return isBaseNetwork;
      case SUPPORTED_NETWORKS.CELO.chainId:
        return isCeloNetwork;
      case SUPPORTED_NETWORKS.LISK.chainId:
        return isLiskNetwork;
      case SUPPORTED_NETWORKS.AVALANCHE.chainId:
        return isAvalancheNetwork;
      default:
        return false;
    }
  }, [chainId, isBaseNetwork, isCeloNetwork, isLiskNetwork, isAvalancheNetwork]);

  // Get current network name
  const currentNetworkName = getCurrentNetworkName(chainId);

  // Helper function to get current chain ID directly from wallet
  const getCurrentChainIdFromWallet = useCallback(async (): Promise<number | null> => {
    try {
      console.log('getCurrentChainIdFromWallet: connectorClient available:', !!connectorClient);

      if (!connectorClient) {
        console.log('getCurrentChainIdFromWallet: No connectorClient, falling back to hook chainId:', chainId);
        return chainId || null;
      }

      // Method 1: Try to get chain ID directly from the connector client chain property
      if (connectorClient.chain && connectorClient.chain.id) {
        console.log('getCurrentChainIdFromWallet: Got chain ID from connectorClient.chain.id:', connectorClient.chain.id);
        return connectorClient.chain.id;
      }

      // Method 2: Try to request chain ID from the provider using eth_chainId
      if (connectorClient.request) {
        try {
          const chainIdHex = await connectorClient.request({ method: 'eth_chainId' }) as string;
          const chainIdNum = parseInt(chainIdHex, 16);
          console.log('getCurrentChainIdFromWallet: Got chain ID from eth_chainId request:', chainIdNum);
          return chainIdNum;
        } catch (requestError) {
          console.warn('getCurrentChainIdFromWallet: eth_chainId request failed:', requestError);
        }
      }

      // Method 3: Try to access the provider directly if available
      if (connectorClient.transport && connectorClient.transport.request) {
        try {
          const chainIdHex = await connectorClient.transport.request({ method: 'eth_chainId' }) as string;
          const chainIdNum = parseInt(chainIdHex, 16);
          console.log('getCurrentChainIdFromWallet: Got chain ID from transport request:', chainIdNum);
          return chainIdNum;
        } catch (transportError) {
          console.warn('getCurrentChainIdFromWallet: transport request failed:', transportError);
        }
      }

      // Method 4: Try to access window.ethereum directly as last resort
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' }) as string;
          const chainIdNum = parseInt(chainIdHex, 16);
          console.log('getCurrentChainIdFromWallet: Got chain ID from window.ethereum:', chainIdNum);
          return chainIdNum;
        } catch (ethereumError) {
          console.warn('getCurrentChainIdFromWallet: window.ethereum request failed:', ethereumError);
        }
      }

      // Final fallback: use the hook's chainId
      console.log('getCurrentChainIdFromWallet: All methods failed, falling back to hook chainId:', chainId);
      return chainId || null;

    } catch (error) {
      console.error('getCurrentChainIdFromWallet: Unexpected error:', error);
      // Even in error case, return the hook's chainId as fallback
      return chainId || null;
    }
  }, [connectorClient, chainId]);

  // Enhanced helper to validate network state consistency
  const validateNetworkState = useCallback(async (expectedChainId: number, maxRetries: number = 3): Promise<boolean> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add a small initial delay to allow wallet state to stabilize
        if (attempt === 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const walletChainId = await getCurrentChainIdFromWallet();
        const hookChainId = chainId;

        console.log(`🔍 Network validation attempt ${attempt + 1}/${maxRetries}:`, {
          expected: expectedChainId,
          wallet: walletChainId,
          hook: hookChainId,
          walletMatch: walletChainId === expectedChainId,
          hookMatch: hookChainId === expectedChainId
        });

        // Primary validation: Check if wallet matches (most reliable)
        const walletMatches = walletChainId === expectedChainId;
        const hookMatches = hookChainId === expectedChainId;

        // Consider it valid if wallet matches (primary) or both wallet and hook are consistent
        const isValid = walletMatches || (hookMatches && walletChainId === hookChainId);

        if (isValid) {
          console.log(`✅ Network validation successful on attempt ${attempt + 1} (wallet: ${walletMatches ? 'match' : 'no-match'}, hook: ${hookMatches ? 'match' : 'no-match'})`);
          return true;
        }

        // Special case: If this is the last attempt and wallet matches but hook doesn't,
        // still consider it successful since wallet is the source of truth
        if (attempt === maxRetries - 1 && walletMatches) {
          console.log(`✅ Network validation successful on final attempt - wallet matches (hook may be delayed)`);
          return true;
        }

        // Wait before retry, with exponential backoff
        if (attempt < maxRetries - 1) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 4000);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        console.warn(`❌ Network validation attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) {
          return false;
        }
      }
    }

    return false;
  }, [chainId, getCurrentChainIdFromWallet]);

  // Notification timeout tracking for termination
  const notificationTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());

  // Clear all pending notifications and timeouts
  const clearAllNotifications = useCallback(() => {
    // Clear all existing timeouts
    notificationTimeouts.current.forEach(timeout => {
      clearTimeout(timeout);
    });
    notificationTimeouts.current.clear();

    // Remove all network sync notifications from DOM
    const existingToasts = document.querySelectorAll('[id^="network-sync-toast"]');
    existingToasts.forEach(toast => toast.remove());

    console.log('🧹 Cleared all pending network notifications');
  }, []);

  // Simplified sync notification - only for success
  const showSyncNotification = useCallback((message: string, type: 'success' = 'success') => {
    // Clear all pending notifications first
    clearAllNotifications();
    console.log(`✅ Success notification: ${message}`);

    const toast = document.createElement('div');
    toast.id = 'network-sync-toast';
    toast.className = 'fixed top-4 right-4 bg-white/90 backdrop-blur-xl border border-white/60 rounded-xl px-6 py-4 shadow-[0_20px_60px_rgba(129,215,180,0.4)] z-[9999] flex items-center space-x-3';

    const iconColor = 'bg-[#81D7B4]';
    const icon = `<svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
    </svg>`;

    toast.innerHTML = `
      <div class="w-5 h-5 ${iconColor} rounded-full flex items-center justify-center">
        ${icon}
      </div>
      <span class="text-gray-800 font-medium">${message}</span>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }, [clearAllNotifications]);

  // Specialized function for successful network synchronization
  const showSuccessfulSyncNotification = useCallback((networkName: string) => {
    // Clear ALL pending notifications (info, error, etc.) before showing success
    clearAllNotifications();

    // Show success notification
    showSyncNotification(`Successfully switched to ${networkName}`, 'success');

    console.log(`🎉 Network sync success: Terminated all pending notifications and showed success for ${networkName}`);
  }, [clearAllNotifications, showSyncNotification]);

  // Sync UI to match wallet's current network
  const syncToWalletNetwork = useCallback(async () => {
    if (!isConnected || !chainId) {
      console.log('Network sync: Wallet not connected or no chain ID');
      return;
    }

    const networkName = getCurrentNetworkName(chainId);
    if (!networkName) {
      console.log('Network sync: Unsupported network detected');
      return;
    }

    // Check if already synced
    if (isNetworkSynced()) {
      console.log(`Network sync: Already synced to ${networkName}`);
      return;
    }

    setIsSyncing(true);
    console.log(`Network sync: Syncing UI to ${networkName} network`);

    // Force refresh network state immediately
    console.log('Network sync: Force refreshing network state...');
    forceRefreshNetworkState();

    // Trigger data refetch to update network state
    try {
      // Use soft refresh (false) to avoid blocking UI with loading spinner
      await refetchSavingsData(false);
      showSyncNotification(`Synced to ${networkName} network`);
      setIsSyncing(false);
    } catch (error) {
      console.error('Network sync: Error during data refetch:', error);
      setIsSyncing(false);
    }
  }, [isConnected, chainId, getCurrentNetworkName, isNetworkSynced, refetchSavingsData, forceRefreshNetworkState, showSyncNotification]);

  // Enhanced network switching with immediate UI feedback and validation
  const switchToNetwork = useCallback(async (networkName: string) => {
    if (!isConnected || !switchChain) {
      console.error('Network switch: Wallet not connected or switchChain not available');
      return false;
    }

    const network = Object.values(SUPPORTED_NETWORKS).find(net => net.name === networkName);
    if (!network) {
      console.error('Network switch: Unsupported network:', networkName);
      return false;
    }

    // Check if already on the target network
    if (chainId === network.chainId) {
      console.log(`Network switch: Already on ${networkName} network`);
      showSyncNotification(`Already connected to ${networkName}`);
      await syncToWalletNetwork(); // Ensure UI is synced
      return true;
    }

    setIsNetworkSwitching(true);

    try {
      console.log(`Network switch: Switching to ${networkName} (${network.chainId})`);

      // Switch the wallet network
      await switchChain({ chainId: network.chainId });



      // Verify the switch was successful using enhanced validation
      console.log(`Network switch: Verifying switch to ${networkName}...`);

      // Use the enhanced validation function with built-in retries and exponential backoff
      const isValidated = await validateNetworkState(network.chainId, 5);

      if (isValidated) {
        console.log(`✅ Network switch: Successfully verified switch to ${networkName}`);

        // Force immediate network state refresh
        forceRefreshNetworkState();

        showSuccessfulSyncNotification(networkName);

        // Trigger a silent sync to ensure UI is updated without additional notifications
        setTimeout(async () => {
          try {
            // Silent sync - only refresh data without showing notifications
            if (isConnected && chainId) {
              console.log(`Network switch: Performing silent sync after successful switch to ${networkName}`);
              await refetchSavingsData(false);
            }
          } catch (error) {
            console.error('Network switch: Silent sync error (non-critical):', error);
            // Don't show notification for this error as the switch was already successful
          }
        }, 500);

        return true;
      } else {
        // Enhanced error handling with current state detection
        const currentWalletChainId = await getCurrentChainIdFromWallet();
        const currentHookChainId = chainId;

        console.error(`❌ Network switch: Validation failed after all attempts.`, {
          expected: network.chainId,
          walletChainId: currentWalletChainId,
          hookChainId: currentHookChainId,
          targetNetwork: networkName
        });

        // CRITICAL SAFETY CHECK: Double-check if wallet actually switched successfully
        // Sometimes validation fails due to timing but the switch actually worked
        if (currentWalletChainId === network.chainId) {
          console.log(`🔄 Network switch: Safety check detected successful switch - wallet is on correct network`);
          showSuccessfulSyncNotification(networkName);

          // Force refresh to sync UI
          forceRefreshNetworkState();
          setTimeout(async () => {
            try {
              await refetchSavingsData(false);
            } catch (error) {
              console.error('Network switch: Silent sync error after safety check (non-critical):', error);
            }
          }, 500);

          return true;
        }

        // Provide detailed user feedback only if wallet is truly on wrong network
        const currentNetworkName = currentWalletChainId ? getCurrentNetworkName(currentWalletChainId) : null;
        const message = currentWalletChainId
          ? `Could not switch to ${networkName}. Your wallet remains on ${currentNetworkName}.`
          : `Could not switch to ${networkName}. Please check your wallet connection.`;

        // Ensure UI syncs to actual wallet state
        await syncToWalletNetwork();

        return false;
      }

    } catch (error: any) {
      console.error(`Network switch: Error switching to ${networkName}:`, error);

      if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
        return false;
      } else if (error?.code === 4902 && connectorClient) {
        try {
          const params = getNetworkParams(networkName);
          await connectorClient.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: params.chainIdHex,
              chainName: params.chainName,
              nativeCurrency: params.nativeCurrency,
              rpcUrls: params.rpcUrls,
              blockExplorerUrls: params.blockExplorerUrls,
            }],
          });
          // Retry switch after adding
          await switchChain({ chainId: network.chainId });
          // Trigger silent verification after successful add and switch
          try {
            forceRefreshNetworkState();
            await refetchSavingsData(false);
          } catch (error) {
            console.error('Network switch: Silent sync error after adding network (non-critical):', error);
          }
          showSyncNotification(`Successfully added and switched to ${networkName}`);
          return true;
        } catch (addError) {
          console.error(`Failed to add ${networkName} network:`, addError);
          return false;
        }
      } else if (error?.message?.includes('rejected') || error?.message?.includes('denied')) {
        return false;
      } else if (error?.message?.includes('verification failed')) {
        // This is our custom verification error - implement smart recovery
        console.log('Network switch: Verification failed, attempting smart recovery...');

        // Smart recovery: Check if the switch actually succeeded despite verification failure
        try {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer

          const recoveryWalletChainId = await getCurrentChainIdFromWallet() ?? undefined;
          const recoveryHookChainId = chainId;

          console.log(`Network switch: Recovery check - Wallet: ${recoveryWalletChainId}, Hook: ${recoveryHookChainId}, Expected: ${network.chainId}`);

          if (recoveryWalletChainId === network.chainId || recoveryHookChainId === network.chainId) {
            console.log('Network switch: Recovery successful - switch actually worked');
            showSuccessfulSyncNotification(networkName);

            // Force silent sync to update UI without additional notifications
            try {
              forceRefreshNetworkState();
              await refetchSavingsData(false);
            } catch (error) {
              console.error('Network switch: Silent sync error during recovery (non-critical):', error);
            }
            return true;
          } else {
            // Try one more sync attempt
            console.log('Network switch: Attempting final sync to recover...');
            await syncToWalletNetwork();

            // Check again after sync
            const finalWalletChainId = await getCurrentChainIdFromWallet() ?? undefined;
            const finalHookChainId = chainId;

            if (finalWalletChainId === network.chainId || finalHookChainId === network.chainId) {
              console.log('Network switch: Recovery successful after sync');
              showSuccessfulSyncNotification(networkName);
              // Force silent refresh to ensure UI is updated
              forceRefreshNetworkState();
              return true;
            } else {
              // CRITICAL FIX: Ensure UI syncs to actual wallet state even when switch fails
              console.log('Network switch: Recovery failed - syncing UI to actual wallet state');
              await syncToWalletNetwork(); // Sync UI to current wallet state

              return false;
            }
          }
        } catch (recoveryError) {
          console.error('Network switch: Recovery failed:', recoveryError);
          // CRITICAL FIX: Ensure UI syncs to actual wallet state even when recovery fails
          await syncToWalletNetwork(); // Sync UI to current wallet state
          return false;
        }
      } else if (error?.message?.includes('unsupported') || error?.message?.includes('not supported')) {
        return false;
      } else if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        return false;
      } else if (error?.message?.includes('connection') || error?.message?.includes('network')) {
        return false;
      } else {
        // Generic error with helpful message
        const errorMessage = error?.message || 'Unknown error occurred';
        console.error('Network switch: Unexpected error:', errorMessage);
      }

      // CRITICAL FIX: Ensure UI always syncs to actual wallet state, even on errors
      await syncToWalletNetwork();

      return false;
    } finally {
      setIsNetworkSwitching(false);
    }
  }, [isConnected, switchChain, chainId, syncToWalletNetwork, showSyncNotification]);

  // Detect wallet network changes and auto-sync
  useEffect(() => {
    if (!isConnected) {
      hasInitialSyncRef.current = false;
      lastKnownChainIdRef.current = null;
      return;
    }

    // Perform initial sync on first connection
    if (!hasInitialSyncRef.current && chainId) {
      console.log('Network sync: Performing initial network sync');
      hasInitialSyncRef.current = true;
      lastKnownChainIdRef.current = chainId;

      // Delay initial sync to allow UI to stabilize
      setTimeout(() => {
        syncToWalletNetwork();
      }, 1000);
      return;
    }

    // Detect network changes
    if (chainId && lastKnownChainIdRef.current !== chainId) {
      const previousNetwork = getCurrentNetworkName(lastKnownChainIdRef.current || undefined);
      const currentNetwork = getCurrentNetworkName(chainId);

      console.log(`Network sync: Network changed from ${previousNetwork || 'unknown'} to ${currentNetwork || 'unknown'}`);
      lastKnownChainIdRef.current = chainId;

      if (currentNetwork) {
        // Auto-sync when network changes
        setTimeout(() => {
          syncToWalletNetwork();
        }, 500); // Small delay to allow wallet state to stabilize
      }
    }
  }, [isConnected, chainId, syncToWalletNetwork, getCurrentNetworkName]);

  // Monitor network state changes and ensure sync
  useEffect(() => {
    if (!isConnected || !chainId) return;

    // Check sync status periodically
    const checkSyncStatus = () => {
      if (!isNetworkSynced()) {
        console.log('Network sync: Detected desync, triggering auto-sync');
        syncToWalletNetwork();
      }
    };

    // Check sync status after network state updates
    const timeoutId = setTimeout(checkSyncStatus, 2000);

    return () => clearTimeout(timeoutId);
  }, [isConnected, chainId, isBaseNetwork, isCeloNetwork, isLiskNetwork, isNetworkSynced, syncToWalletNetwork]);

  // Cleanup notification timeouts on unmount
  useEffect(() => {
    return () => {
      // Clear all notification timeouts when component unmounts
      notificationTimeouts.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      notificationTimeouts.current.clear();
      console.log('🧹 Cleaned up notification timeouts on unmount');
    };
  }, []);

  return {
    syncToWalletNetwork,
    switchToNetwork,
    isNetworkSynced: isNetworkSynced(),
    currentNetworkName,
    isNetworkSwitching,
    isSyncing
  };
}