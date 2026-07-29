'use client';

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
    
    // Tick if window exists (client-side)
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
      className="fixed bottom-6 left-6 z-50 bg-[#81D7B4]/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-lg font-medium text-sm flex items-center space-x-2 hover:bg-[#81D7B4] hover:scale-105 transition-all whitespace-nowrap"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Install BitSave App</span>
    </button>
  );
}
