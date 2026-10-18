import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

// Generate the worker from the actual production output, including lazy chunks.
export function pwaBuild() {
  let root
  let outDir
  return {
    name: 'focus-lab-offline-assets',
    apply: 'build',
    configResolved(config) { root = config.root; outDir = resolve(root, config.build.outDir) },
    async writeBundle() {
      const files = []
      const collect = async (folder) => {
        for (const entry of await readdir(resolve(outDir, folder), { withFileTypes: true })) {
          const name = `${folder}/${entry.name}`
          if (entry.isDirectory()) await collect(name)
          else if (!name.endsWith('.map')) files.push(name)
        }
      }
      await collect('assets')
      await collect('icons')
      const urls = ['/', '/manifest.webmanifest', ...files.map((file) => `/${file}`)].sort()
      const hash = createHash('sha256')
      const template = await readFile(resolve(root, 'public/sw.js'), 'utf8')
      hash.update(template)
      for (const url of urls) hash.update(await readFile(resolve(outDir, url === '/' ? 'index.html' : url.slice(1))))
      const worker = template
        .replace("'focus-lab-pwa-v4-dev'", `'focus-lab-pwa-v4-${hash.digest('hex').slice(0, 12)}'`)
        .replace('const PRECACHE_ASSETS = []', `const PRECACHE_ASSETS = ${JSON.stringify(urls)}`)
      await writeFile(resolve(outDir, 'sw.js'), worker)
    },
  }
}
