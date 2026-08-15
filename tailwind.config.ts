import type { Config } from 'tailwindcss'

// Direction visuelle : sobre, dense, lisible en plein soleil.
// La couleur n'encode QUE l'intensité de zone. Le reste est neutre.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Zones — source de vérité dupliquée depuis lib/zones.ts pour Tailwind.
        z1: '#7b98a8',
        z2: '#3d6b7d',
        z3: '#5f7a3a',
        z4: '#8a6d1f',
        z5: '#a32e3d',
        force: '#a86a1f',
        rest: '#9aa2a8',
        // Neutres — routés vers les tokens de thème (voir index.css :root /
        // [data-theme]). Le thème est une propriété du profil actif.
        ink: 'var(--text-primary)',
        'ink-soft': 'var(--text-secondary)',
        'ink-faint': 'var(--text-tertiary)',
        paper: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        line: 'var(--border)',
        danger: 'var(--alert-high)',
        warn: 'var(--alert-warn)',
      },
      fontFamily: {
        // Direction « premium sport ». Interface et titres : Jost* (géométrique
        // variable façon Futura). Données chiffrées : JetBrains Mono.
        cond: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Jost', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Jost', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
