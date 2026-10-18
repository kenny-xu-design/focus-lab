export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if ('__TAURI__' in window || '__TAURI_INTERNALS__' in window || !window.isSecureContext) return

  // Dev source modules must not be served through a previous production cache.
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(registrations
      .filter((registration) => [registration.active, registration.waiting, registration.installing].some((worker) => worker?.scriptURL === `${window.location.origin}/sw.js`))
      .map((registration) => registration.unregister()))).catch(console.warn)
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error) => {
      console.warn('Focus Lab service worker registration failed:', error)
    })
  })
}
