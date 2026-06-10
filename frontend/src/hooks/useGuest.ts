import { useState } from 'react';

export function useGuest(slug: string | undefined, queryName: string | null) {
  const [guestName, setGuestName] = useState<string | null>(queryName);
  const [hasOpened, setHasOpened] = useState(() => {
    if (slug) return sessionStorage.hasOpened === 'true';
    return false;
  });
  const [showPopup, setShowPopup] = useState(() => {
    if (slug || queryName) return !hasOpened;
    return false;
  });

  const handleOpen = () => {
    setShowPopup(false);
    setHasOpened(true);
    if (slug) sessionStorage.hasOpened = 'true';
  };

  return { guestName, showPopup, handleOpen, hasOpened };
}
