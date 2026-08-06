import type { ExportBundle } from '../db/repo'

// Déclenche le téléchargement d'un export JSON (tout reste local).
export function downloadBundle(bundle: ExportBundle): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `programme-10k-${bundle.exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
