'use client'

import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    // Check if window exists (client-side)
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeinstallprompt', handler);
    }

    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('beforeinstallprompt', handler);
        }
    };
  }, []);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#81D7B4] text-white px-6 py-3 rounded-full shadow-xl font-semibold flex items-center space-x-2 hover:bg-[#6bc4a0] transition-colors whitespace-nowrap max-w-[90vw] justify-center"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Install BitSave App</span>
    </button>
  );
}
