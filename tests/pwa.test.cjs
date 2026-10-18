const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.join(__dirname, '..')
const workerSource = fs.readFileSync(path.join(root, 'dist/sw.js'), 'utf8')
const precache = JSON.parse(workerSource.match(/const PRECACHE_ASSETS = (\[[^\n]+\])/)[1])

function worker({ offline = false, status = 200 } = {}) {
  const events = {}, deleted = [], added = [], network = []
  const cached = new Map([['/', new Response('matching-build-shell')]])
  const cache = { addAll: async (urls) => added.push(...urls), match: async (request) => cached.get(typeof request === 'string' ? request : request.url)?.clone() }
  const caches = { open: async () => cache, keys: async () => ['unrelated-app', 'focus-lab-pwa-v3'], delete: async (key) => deleted.push(key) }
  vm.runInNewContext(workerSource, {
    self: { location: { origin: 'https://focus.example' }, clients: { claim: async () => {} }, addEventListener: (type, fn) => { events[type] = fn } },
    caches, URL, Response, Set,
    fetch: async (request) => { network.push(request.url); if (offline) throw new Error('offline'); return new Response('new-network-shell', { status, headers: { 'Content-Type': 'text/html' } }) },
  })
  return { events, deleted, added, cached, network, cache }
}

function fetchFrom(app, pathname, overrides = {}) {
  let response
  app.events.fetch({ request: { url: `https://focus.example${pathname}`, method: 'GET', mode: 'navigate', headers: new Headers(), ...overrides }, respondWith: (value) => { response = value } })
  return response
}

test('production manifest has mobile/desktop icons and a stable application identity', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/manifest.webmanifest')))
  assert.equal(manifest.id, '/popup')
  assert.equal(manifest.start_url, '/launcher')
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.orientation, 'any')
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((item) => item.sizes === `${size}x${size}` && item.purpose === 'any')
    assert.ok(icon)
    const bytes = fs.readFileSync(path.join(root, 'dist', icon.src))
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a')
    assert.equal(bytes.readUInt32BE(16), size)
    assert.equal(bytes.readUInt32BE(20), size)
  }
  const apple = fs.readFileSync(path.join(root, 'dist/icons/apple-touch-icon.png'))
  assert.equal(apple.readUInt32BE(16), 180)
  assert.equal(apple.readUInt32BE(20), 180)
  assert.match(fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8'), /apple-touch-icon[^>]+apple-touch-icon.png/)
})

test('install precaches every production chunk, CSS, icon and HTML shell before activation', async () => {
  assert.match(workerSource, /focus-lab-pwa-v4-[a-f0-9]{12}/)
  const app = worker()
  let work
  app.events.install({ waitUntil: (value) => { work = value } })
  await work
  assert.ok(app.added.includes('/'))
  for (const name of fs.readdirSync(path.join(root, 'dist/assets'))) {
    if (!name.endsWith('.map')) assert.ok(app.added.includes(`/assets/${name}`), `missing offline asset ${name}`)
  }
  for (const name of fs.readdirSync(path.join(root, 'dist/icons'))) assert.ok(app.added.includes(`/icons/${name}`))
  assert.deepEqual(app.added, precache)
  app.events.activate({ waitUntil: (value) => { work = value } })
  await work
  assert.deepEqual(app.deleted, ['focus-lab-pwa-v3'])
})

test('offline launch and a never-visited practice route use the cached SPA shell and bundle', async () => {
  const app = worker({ offline: true })
  assert.equal(await (await fetchFrom(app, '/launcher')).text(), 'matching-build-shell')
  assert.equal(await (await fetchFrom(app, '/learn/loci')).text(), 'matching-build-shell')
  const asset = precache.find((url) => url.endsWith('.js'))
  app.cached.set(asset, new Response('cached-script'))
  assert.equal(await (await fetchFrom(app, asset, { mode: 'cors' })).text(), 'cached-script')
  app.cached.delete('/')
  assert.equal((await fetchFrom(app, '/records')).status, 503)
})

test('worker keeps one build together, preserves HTTP errors and ignores API/auth/cross-origin requests', async () => {
  const app = worker()
  assert.equal(await (await fetchFrom(app, '/launcher')).text(), 'matching-build-shell')
  assert.equal((await fetchFrom(worker({ status: 404 }), '/missing')).status, 404)
  for (const url of ['/api', '/api/training']) assert.equal(fetchFrom(app, url), undefined)
  assert.equal(fetchFrom(app, '/private', { headers: new Headers({ authorization: 'test-only' }) }), undefined)
  assert.equal(fetchFrom(app, '/records', { method: 'POST' }), undefined)
  assert.equal(fetchFrom(app, '/', { url: 'https://third-party.example/' }), undefined)
  assert.equal(fetchFrom(app, '/future-user-data.json', { mode: 'cors' }), undefined)
})

function installation({ standalone = false, iosStandalone = false } = {}) {
  const events = {}
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(path.join(root, 'src/utils/pwaInstall.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(source, { module, exports: module.exports, require: () => ({ useSyncExternalStore: (_subscribe, get) => get() }),
    window: { matchMedia: () => ({ matches: standalone, addEventListener() {} }), addEventListener: (type, fn) => { events[type] = fn } },
    navigator: { standalone: iosStandalone }, Set,
  })
  return { events, ...module.exports }
}

test('one install event is shared and consumed once; dismissal does not claim installation', async () => {
  const app = installation()
  let prompted = 0
  app.events.beforeinstallprompt({ preventDefault() {}, prompt: async () => { prompted++ }, userChoice: Promise.resolve({ outcome: 'dismissed' }) })
  assert.ok(app.usePwaInstall().prompt)
  const first = app.requestPwaInstall()
  assert.equal(await app.requestPwaInstall(), 'manual')
  assert.equal(await first, 'dismissed')
  assert.equal(prompted, 1)
  assert.equal(app.usePwaInstall().installed, false)
  app.events.appinstalled()
  assert.equal(app.usePwaInstall().installed, true)
})

test('iOS/desktop standalone launches are recognized and failed browser prompts fall back to instructions', async () => {
  assert.equal(installation({ standalone: true }).usePwaInstall().installed, true)
  assert.equal(installation({ iosStandalone: true }).usePwaInstall().installed, true)
  const app = installation()
  app.events.beforeinstallprompt({ preventDefault() {}, prompt: async () => { throw new Error('not supported') } })
  assert.equal(await app.requestPwaInstall(), 'manual')
  assert.equal(app.usePwaInstall().installed, false)
})
