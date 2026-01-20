'use client'

import CustomConnectButton from '@/components/CustomConnectButton';

export default function ConnectPage() {
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
