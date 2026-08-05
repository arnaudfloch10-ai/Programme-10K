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
        // Neutres — instrument de travail, pas de couleur décorative.
        ink: '#141414',
        'ink-soft': '#4a4a4a',
        paper: '#f7f7f5',
        line: '#d9d8d3',
        danger: '#a32e3d',
      },
      fontFamily: {
        // Titres et volumes : condensé. Corps : sans-serif classique.
        // Allures/temps/FC : monospace obligatoire (alignement des chiffres).
        cond: ['"Roboto Condensed"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Roboto Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
