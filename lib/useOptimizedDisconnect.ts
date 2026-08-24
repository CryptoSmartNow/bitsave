import { useDisconnect, useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { trackWalletDisconnect } from './interactionTracker';
import toast from 'react-hot-toast';

export function useOptimizedDisconnect() {
  const router = useRouter();
  const { address } = useAccount();
  const { logout } = usePrivy();
  const { disconnectAsync } = useDisconnect();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const optimizedDisconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      if (address) {
        trackWalletDisconnect(address);
      }

      try {
        await disconnectAsync();
      } catch (e) {
        // Continue even if wagmi was not connected
      }

      try {
        await logout();
      } catch (e) {
        // Continue
      }

      toast.success('Disconnected successfully', {
        style: {
          borderRadius: '16px',
          background: '#1A2538',
          color: '#F9F9FB',
        },
      });

      router.push('/goodbye');
    } catch (err) {
      console.error('Disconnect error:', err);
      router.push('/goodbye');
    } finally {
      setIsDisconnecting(false);
    }
  }, [disconnectAsync, address, logout, router]);

  return {
    disconnect: optimizedDisconnect,
    isDisconnecting
  };
}