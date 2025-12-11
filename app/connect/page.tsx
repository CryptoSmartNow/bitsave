'use client'

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import CustomConnectButton from '@/components/CustomConnectButton';

export default function ConnectPage() {
  const { login, ready, authenticated } = usePrivy();

  useEffect(() => {
    // If ready and not authenticated, we can optionally trigger login.
    // However, for better UX, we let the user click the button unless directed otherwise.
    // Given the previous code tried to auto-open, we can do it here too, but gently.
    if (ready && !authenticated) {
        // login(); // Uncomment to auto-open
    }
  }, [ready, authenticated, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6 p-4">
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Connect to BitSave</h1>
            <p className="text-gray-500">Please connect your wallet to continue.</p>
        </div>
        <div className="flex justify-center">
          <CustomConnectButton />
        </div>
      </div>
    </div>
  );
}
