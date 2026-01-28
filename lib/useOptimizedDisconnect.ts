import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { trackWalletDisconnect } from './interactionTracker';

/**
 * Optimized disconnect hook that provides immediate UI feedback
 * and faster disconnection experience
 */
export function useOptimizedDisconnect() {
  const router = useRouter();
  const { address } = useAccount();
  const { logout } = usePrivy();

  const { disconnect: wagmiDisconnect, isPending } = useDisconnect({
    mutation: {
      onSuccess: () => {
        // Immediate redirect on successful disconnect
        router.push('/');
      },
      onError: (error) => {
        console.error('Disconnect error:', error);
        // Still redirect even on error to prevent stuck state
        router.push('/');
      }
    }
  });

  const optimizedDisconnect = useCallback(async () => {
    // Track wallet disconnection before disconnecting
    if (address) {
      trackWalletDisconnect(address);
    }

    // Disconnect wagmi first to clear wallet state immediately
    wagmiDisconnect();

    // Then logout from Privy (wait for it to ensure clean state)
    try {
      await logout();
    } catch (e) {
      console.error('Privy logout error:', e);
    }
  }, [wagmiDisconnect, address, logout]);

  return {
    disconnect: optimizedDisconnect,
    isDisconnecting: isPending
  };
}