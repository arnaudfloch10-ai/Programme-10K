import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// En build (GitHub Pages), l'app est servie sous /Programme-10K/.
// En dev, on reste à la racine.
const BASE = '/Programme-10K/'

// PWA installable, fonctionnelle en mode avion.
// Aucun appel réseau au runtime : tout est précaché.
export default defineConfig(({ command }) => {
  const base = command === 'build' ? BASE : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png'],
        manifest: {
          name: 'Programme 10 km',
          short_name: '10K',
          description: "Suivi d'entraînement running — allures dérivées de la VMA, hors ligne",
          theme_color: '#111111',
          background_color: '#f7f7f5',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Aucune route réseau : navigation servie depuis le cache.
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
      }),
    ],
  }
})
