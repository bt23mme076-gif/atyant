import { useEffect, useState } from 'react';

export default function InstallPWAButton({ className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <button
      className={`resume-hero-cta ${className}`}
      onClick={async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setVisible(false);
      }}
    >
      Download App
    </button>
  );
}
