// Register service worker for PWA (for VitePWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        // Registration successful
      },
      (err) => {
        // Registration failed
        console.error('ServiceWorker registration failed: ', err);
      }
    );
  });
}
