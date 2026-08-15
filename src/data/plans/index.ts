import type { Week } from '../../types'
import { BLOC0_WEEKS } from '../seedBloc0'

// Résolution du plan (Week[]) à partir du planId d'un profil.
// Les plans sont des modules STATIQUES : c'est ici, et non en base, qu'ils vivent.
// Le plan FC de Charline (« reprise-aerobie ») n'utilise pas le modèle Week[] :
// il arrive en Phase B avec ses propres écrans. En Phase A il renvoie [].
export function weeksForPlan(planId: string): Week[] {
  switch (planId) {
    case 'bloc0-10km':
      return BLOC0_WEEKS
    default:
      return []
  }
}
