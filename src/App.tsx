import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import { BottomNav, type ScreenId } from './components/BottomNav'
import { MedicalFooter } from './components/MedicalFooter'
import { ProfileHeader } from './components/ProfileHeader'
import { ProfileSelect } from './screens/ProfileSelect'
import { Today } from './screens/Today'
import { WeekView } from './screens/WeekView'
import { Plan } from './screens/Plan'
import { Zones } from './screens/Zones'
import { More } from './screens/More'
import { Journal } from './screens/Journal'
import { Measures } from './screens/Measures'
import { Settings } from './screens/Settings'

function Shell() {
  const { loading, profilId, profil, switchProfile } = useApp()
  const [screen, setScreen] = useState<ScreenId>('today')
  // Le sélecteur s'affiche à chaque lancement (dernier profil présélectionné),
  // et à la demande via le chip. `entered` = l'utilisateur a validé son choix.
  const [entered, setEntered] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  // Accent du profil actif (seul différenciateur visuel).
  useEffect(() => {
    if (profil) document.documentElement.style.setProperty('--accent', profil.accentColor)
  }, [profil])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="font-cond text-sm text-ink-soft">Chargement…</div>
      </div>
    )
  }

  // Sélecteur : à chaque lancement (avant d'entrer) et à la demande via le chip.
  if (!entered) {
    return (
      <ProfileSelect
        current={profilId}
        onSelect={async (id) => {
          await switchProfile(id)
          setScreen('today')
          setEntered(true)
        }}
        onCancel={profilId ? () => setEntered(true) : undefined}
      />
    )
  }

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col">
      <ProfileHeader onSwitch={() => setEntered(false)} />
      <main className="flex-1">
        {screen === 'today' && <Today />}
        {screen === 'week' && <WeekView />}
        {screen === 'plan' && <Plan />}
        {screen === 'zones' && <Zones />}
        {screen === 'more' && <More onNavigate={setScreen} />}
        {screen === 'journal' && <Journal />}
        {screen === 'measures' && <Measures />}
        {screen === 'settings' && <Settings dark={dark} onToggleDark={() => setDark((d) => !d)} />}
        <MedicalFooter />
      </main>
      <BottomNav active={screen} onNavigate={setScreen} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
