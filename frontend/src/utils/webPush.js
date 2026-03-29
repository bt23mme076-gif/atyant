// Utility to handle web push subscription in frontend
// Replace <YOUR_PUBLIC_VAPID_KEY> with your actual public VAPID key from backend

export const VAPID_PUBLIC_KEY = 'BOGOV5c557YGqPQJ5fhqi9e_h6H93fw2fBOI-5hEyHmH_2ZuzpIL2McnXMmwgJi4b-IaFBDqVd0qMnjnqsE8bK8';

export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    return subscription;
  }
  throw new Error('Push messaging is not supported');
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
