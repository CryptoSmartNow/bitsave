import { useDisconnect, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@solana/wallet-adapter-react';
import { trackWalletDisconnect } from './interactionTracker';
import toast from 'react-hot-toast';

/**
 * Optimized disconnect hook that provides immediate UI feedback
 * and faster disconnection experience
 */
export function useOptimizedDisconnect() {
  const router = useRouter();
  const { address } = useAccount();
  const { logout } = usePrivy();
  const { disconnect: solanaDisconnect } = useWallet();

  const { disconnect: wagmiDisconnect, isPending } = useDisconnect({
    mutation: {
      onSuccess: () => {
        toast.success('Disconnected successfully', {
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
          },
        });
        // Graceful redirect to logged-out screen
        router.push('/goodbye');
      },
      onError: (error) => {
        console.error('Disconnect error:', error);
        // Still redirect even on error to prevent stuck state
        router.push('/goodbye');
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
    
    // Disconnect solana wallet if present
    solanaDisconnect();

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