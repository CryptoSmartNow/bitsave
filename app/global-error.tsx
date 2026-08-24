'use client';

import React from 'react';
import Image from 'next/image';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070B11] text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center bg-[#0c121e] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Image src="/bitsavelogo.png" alt="BitSave Logo" width={28} height={28} className="object-contain" />
          </div>
          <h1 className="text-2xl font-black mb-2">Application Error</h1>
          <p className="text-xs text-gray-400 mb-6">
            A critical error occurred. Your vaults and funds remain safe onchain.
          </p>
          <button
            onClick={() => reset()}
            className="w-full py-3.5 rounded-2xl bg-[#81D7B4] hover:bg-[#6BC5A0] text-gray-900 font-bold text-sm transition-all cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
