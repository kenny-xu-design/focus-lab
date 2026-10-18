// scripts/pwa-build.js fills these values from the production build.
const CACHE_NAME = 'focus-lab-pwa-v4-dev'
const PRECACHE_ASSETS = []
const staticPaths = new Set(PRECACHE_ASSETS)

self.addEventListener('install', (event) => {
  // Keep the open session on its current bundle until all old windows close.
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('focus-lab-pwa-') && key !== CACHE_NAME).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname === '/api' || url.pathname.startsWith('/api/') || request.headers.has('authorization')) return

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME)
      // Serve HTML from the same build as the precached bundles. Check the
      // network first so an online error (such as a 404) is not hidden.
      try {
        const response = await fetch(request)
        if (response.ok && response.headers.get('content-type')?.includes('text/html')) return (await cache.match('/')) || response
        return response
      } catch {
        return (await cache.match('/')) || new Response('请联网后重新打开 Focus Lab。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }
    })())
    return
  }

  if (!staticPaths.has(url.pathname)) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    return (await cache.match(url.pathname)) || fetch(request)
  })())
})
