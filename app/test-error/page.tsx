'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Simulated test error: Node encountered an execution exception.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070B11] text-white p-6">
      <div className="max-w-md w-full text-center bg-white/5 border border-white/10 p-8 rounded-3xl">
        <h1 className="text-xl font-bold mb-3">Error Boundary Test Page</h1>
        <p className="text-sm text-gray-400 mb-6">Click below to trigger a simulated application exception.</p>
        <button
          onClick={() => setShouldThrow(true)}
          className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all"
        >
          Trigger Test Error
        </button>
      </div>
    </div>
  );
}
