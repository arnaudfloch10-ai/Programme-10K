import { useApp } from '../store/AppContext'

// En-tête compact : chip du profil actif (accent) + accès au changement en 1 tap
// (→ sélecteur = 2 taps au total). Seul élément coloré par l'accent du profil.
export function ProfileHeader({ onSwitch }: { onSwitch: () => void }) {
  const { profil } = useApp()
  if (!profil) return null
  return (
    <header className="flex items-center justify-between px-4 pb-1 pt-3">
      <button
        onClick={onSwitch}
        className="tap flex items-center gap-2 rounded-full border px-3 py-1"
        style={{ borderColor: profil.accentColor }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: profil.accentColor }}
        >
          {profil.prenom[0]}
        </span>
        <span className="font-cond text-sm font-semibold">{profil.prenom}</span>
        <span className="text-xs text-ink-soft">changer</span>
      </button>
    </header>
  )
}
