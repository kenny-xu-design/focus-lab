import { useSyncExternalStore } from 'react'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const standalone = window.matchMedia('(display-mode: standalone)')
let snapshot: { prompt: InstallEvent | null; installed: boolean } = {
  prompt: null,
  installed: standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
}
const listeners = new Set<() => void>()
const update = (value: typeof snapshot) => { snapshot = value; listeners.forEach((listener) => listener()) }
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  update({ ...snapshot, prompt: event as InstallEvent })
})
window.addEventListener('appinstalled', () => update({ prompt: null, installed: true }))
standalone.addEventListener('change', (event) => {
  if (event.matches) update({ prompt: null, installed: true })
})

export function usePwaInstall() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener) }, () => snapshot)
}

export async function requestPwaInstall(): Promise<'accepted' | 'dismissed' | 'manual'> {
  const prompt = snapshot.prompt
  if (!prompt) return 'manual'
  // A browser prompt is single-use; all buttons must consume the same event.
  update({ ...snapshot, prompt: null })
  try {
    await prompt.prompt()
    return (await prompt.userChoice).outcome
  } catch { return 'manual' }
}
