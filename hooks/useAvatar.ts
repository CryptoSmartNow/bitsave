import { useState, useEffect } from 'react';

const AVATAR_STORAGE_KEY = 'bitsave_user_avatar';
const DEFAULT_AVATAR = '/avatars/bitsave-1.png';

export function useAvatar() {
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    // Load initial avatar
    const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (stored) {
      setAvatar(stored);
    }

    // Listen for custom storage events from other components in the same window
    const handleAvatarChange = (e: CustomEvent) => {
      if (e.detail && typeof e.detail === 'string') {
        setAvatar(e.detail);
      }
    };

    window.addEventListener('bitsave_avatar_changed', handleAvatarChange as EventListener);

    // Standard storage event for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AVATAR_STORAGE_KEY && e.newValue) {
        setAvatar(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('bitsave_avatar_changed', handleAvatarChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const changeAvatar = (newAvatar: string) => {
    setAvatar(newAvatar);
    localStorage.setItem(AVATAR_STORAGE_KEY, newAvatar);
    window.dispatchEvent(new CustomEvent('bitsave_avatar_changed', { detail: newAvatar }));
  };

  return { avatar, changeAvatar };
}
