// Pictogrammes plats, 24×24, blancs. Le négatif (var(--nb)) prend la couleur
// du badge : yeux du hibou, segments de carapace, etc. Style plat/semi-plat.
export const ICONS: Record<string, string> = {
  // Premiers pas
  foot: '<path d="M9 3.6c1.6 0 2.8 1.7 2.8 4.5 0 2.3-.7 4.6-.7 6.4 0 1.9 .5 2.6 .5 3.9 0 1.4-1 2-2.4 2s-2.5-.7-2.7-2.3c-.2-1.5-.9-2.4-1.6-3.9C3.9 12.4 3.4 10.8 3.4 9 3.4 5.6 6 3.6 9 3.6z"/><circle cx="15.4" cy="7" r="1.5"/><circle cx="17.6" cy="9.4" r="1.3"/><circle cx="18.3" cy="12.3" r="1.2"/>',
  // Régularité
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><rect x="4" y="5.5" width="16" height="4.2" rx="2.5" fill="var(--nb)"/><rect x="7" y="3" width="2.4" height="4.4" rx="1.2"/><rect x="14.6" y="3" width="2.4" height="4.4" rx="1.2"/><path d="M8 15.6l1.7 1.7 3.4-3.6" fill="none" stroke="var(--nb)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  return: '<path d="M5 12a7 7 0 107-7H8.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M10 2.2L6.5 5l3.5 2.8z"/>',
  sunrise: '<circle cx="12" cy="12.5" r="4.2"/><path d="M12 4.4v2.2M4.4 12.6H6.6M17.4 12.6h2.2M6.5 7.1l1.6 1.6M17.5 7.1l-1.6 1.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="3" y="18.4" width="18" height="2.2" rx="1.1"/>',
  seasons: '<path d="M12 3.2c-1.6 2.2-3 3.6-3 5.6a3 3 0 006 0c0-2-1.4-3.4-3-5.6z"/><path d="M12 20.8c1.6-2.2 3-3.6 3-5.6a3 3 0 00-6 0c0 2 1.4 3.4 3 5.6z" fill="var(--nb)"/><path d="M3.2 12c2.2-1.6 3.6-3 5.6-3a3 3 0 010 6c-2 0-3.4-1.4-5.6-3z"/><path d="M20.8 12c-2.2 1.6-3.6 3-5.6 3a3 3 0 010-6c2 0 3.4 1.4 5.6 3z" fill="var(--nb)"/>',
  // Progression
  arrowfar: '<circle cx="5.5" cy="12" r="2"/><path d="M9 12h8.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.1 4"/><path d="M16.5 7.5L21 12l-4.5 4.5z"/>',
  clock: '<circle cx="12" cy="12.5" r="8"/><circle cx="12" cy="12.5" r="5.6" fill="var(--nb)"/><path d="M12 9.2v3.5l2.4 1.4" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>',
  medal: '<path d="M8 3h8l-2.2 6.5h-3.6z"/><circle cx="12" cy="15.4" r="5.4"/><circle cx="12" cy="15.4" r="3" fill="var(--nb)"/><path d="M12 13.1l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"/>',
  lungs: '<path d="M12 3.4v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10.4 9c0 3-1.4 4-3.3 5.2C5.3 15.3 5 16.6 5 18.4c0 1.6 1.1 2.4 2.4 2.2 1.8-.3 3-1.6 3-4.2V9z"/><path d="M13.6 9c0 3 1.4 4 3.3 5.2 1.8 1.1 2.1 2.4 2.1 4.2 0 1.6-1.1 2.4-2.4 2.2-1.8-.3-3-1.6-3-4.2V9z" fill="var(--nb)"/>',
  run: '<circle cx="15" cy="5.4" r="2.1"/><path d="M13.6 8.6l-3.4 2.2-1.6 3.4M12.3 10.2l3.1 1.4 1.1 3.6M12.3 10.2l-1 4.4 2.4 3.2M8.6 14.2l-3 .8M15.4 11.6l3.1-.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  stopwatch: '<rect x="9.5" y="1.9" width="5" height="2.2" rx="1.1"/><circle cx="12" cy="13.4" r="7.5"/><circle cx="12" cy="13.4" r="5.2" fill="var(--nb)"/><path d="M12 10v3.4h2.6" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><rect x="17.4" y="4.4" width="2.1" height="3" rx="1" transform="rotate(45 18.4 5.9)"/>',
  // Écoute du corps (validés)
  pause: '<rect x="7.4" y="5.8" width="3.7" height="12.4" rx="1.85"/><rect x="12.9" y="5.8" width="3.7" height="12.4" rx="1.85"/>',
  turtle: '<path d="M3.8 14.2c0-3.4 3.2-5.6 7.1-5.6s7.1 2.2 7.1 5.6c0 .6-.5 1.05-1.15 1.05H4.95C4.3 15.25 3.8 14.8 3.8 14.2z"/><circle cx="19.6" cy="12.3" r="1.75"/><rect x="5" y="14.8" width="2.5" height="2.9" rx="1.25"/><rect x="14.6" y="14.8" width="2.5" height="2.9" rx="1.25"/><path d="M7.6 13.4c1-1.5 2.6-2.3 3.9-2.3s2.9 .8 3.9 2.3" fill="none" stroke="var(--nb)" stroke-width="1.1"/>',
  bars: '<rect x="4.6" y="13" width="3.1" height="5.2" rx="1"/><rect x="10.4" y="9.8" width="3.1" height="8.4" rx="1"/><rect x="16.2" y="6.2" width="3.1" height="12" rx="1"/>',
  heart: '<path d="M12 20.4l-1.35-1.24C6.15 15 3.6 12.75 3.6 9.8 3.6 7.5 5.45 5.65 7.75 5.65c1.35 0 2.65.63 3.45 1.62l.8 1 .8-1c.8-.99 2.1-1.62 3.45-1.62 2.3 0 4.15 1.85 4.15 4.15 0 2.95-2.55 5.2-7.05 9.36L12 20.4z"/>',
  feather: '<path d="M18.2 4.4C11.4 4.9 6.8 9 5.7 15.7l-1.6 1.6L5.6 18.8l1.6-1.6c6.7-1.1 10.8-5.7 11.3-12.5 .03-.35-.3-.66-.3-.3z"/><path d="M8.1 14.3l6.1-6.1" fill="none" stroke="var(--nb)" stroke-width="1.15" stroke-linecap="round"/>',
  refresh: '<path d="M6.1 12.2A5.9 5.9 0 0116 7.7M17.9 11.8A5.9 5.9 0 018 16.3" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M15.1 4.9l1.6 3.1-3.3 .3z"/><path d="M8.9 19.1l-1.6-3.1 3.3-.3z"/>',
  owl: '<path d="M12 4.1c-3.5 0-5.9 2.5-5.9 6.3 0 4.1 2.6 8.4 5.9 8.4s5.9-4.3 5.9-8.4C17.9 6.6 15.5 4.1 12 4.1z"/><path d="M6.5 5.6l2 2.4-2.9 .3z"/><path d="M17.5 5.6l-2 2.4 2.9 .3z"/><circle cx="9.5" cy="10.5" r="2.15" fill="var(--nb)"/><circle cx="14.5" cy="10.5" r="2.15" fill="var(--nb)"/><circle cx="9.5" cy="10.5" r=".9"/><circle cx="14.5" cy="10.5" r=".9"/><path d="M12 12.2l1.05 1.7h-2.1z" fill="var(--nb)"/>',
  moon: '<path d="M16.9 14.8A6.3 6.3 0 019.2 5 6.4 6.4 0 1016.9 14.8z"/><path d="M18.1 5.4l.55 1.45L20.1 7.4l-1.45 .6L18.1 9.4l-.55-1.4L16.1 7.4l1.45-.55z"/>',
  // Découverte
  map: '<path d="M12 3.4c-3 0-5.4 2.3-5.4 5.4 0 3.8 5.4 9.4 5.4 9.4s5.4-5.6 5.4-9.4c0-3.1-2.4-5.4-5.4-5.4z"/><circle cx="12" cy="8.8" r="2.1" fill="var(--nb)"/><path d="M8 19.6h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  compass: '<circle cx="12" cy="12.5" r="8.2"/><path d="M15.4 9.1l-1.6 4.7-4.7 1.6 1.6-4.7z" fill="var(--nb)"/><circle cx="12" cy="12.5" r="1.1"/>',
  rain: '<path d="M7.5 12.5A3.8 3.8 0 017.9 5a5 5 0 019.6 1.4 3.4 3.4 0 01-.6 6.1z"/><path d="M8.4 15.4l-1 2.6M12 15.4l-1 2.6M15.6 15.4l-1 2.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  snow: '<path d="M12 3.2v17.6M4.4 7.6l15.2 8.8M19.6 7.6L4.4 16.4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M12 6.4l-2 1.4 2 1.3 2-1.3zM12 17.6l-2-1.4 2-1.3 2 1.3z"/>',
  mountain: '<path d="M2.5 19.5L9 7.5l3.4 6 2-3.2 6.6 9.2z"/><path d="M9 7.5l2.1 3.9-1.7 2.7-2.1-3.4z" fill="var(--nb)"/>',
  trail: '<path d="M12 20.5c0-4 0-6-1.6-8.2C9.2 10.4 7 9.6 7 6.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 3.4c1.9 0 3 1.4 3 3.2-1.9 0-3-1.3-3-3.2z"/><path d="M17 7.2c-1.9 0-3 1.4-3 3.2 1.9 0 3-1.3 3-3.2z" fill="var(--nb)"/><path d="M12 12.4c1.7 0 2.7-1.2 2.7-2.9-1.7 0-2.7 1.2-2.7 2.9z"/>',
  // Bien-être
  leaf: '<path d="M18.5 4.5C10 4.8 5 9 5 15.5c0 1.4.3 2.6.3 2.6l1.5-1.5c.9.5 2.2.9 3.7.9 5.5 0 8.5-4.7 8.5-11 0-1.3-.2-2.1-.5-2z"/><path d="M8 17l7.5-8.5" fill="none" stroke="var(--nb)" stroke-width="1.2" stroke-linecap="round"/>',
  calendarheart: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><rect x="4" y="5.5" width="16" height="4.2" rx="2.5" fill="var(--nb)"/><rect x="7" y="3" width="2.4" height="4.4" rx="1.2"/><rect x="14.6" y="3" width="2.4" height="4.4" rx="1.2"/><path d="M12 18.4l-2.7-2.5c-1-1-.4-2.7 1-2.7.7 0 1.3.4 1.7.9.4-.5 1-.9 1.7-.9 1.4 0 2 1.7 1 2.7z" fill="var(--nb)"/>',
  bolt: '<path d="M13.4 2.5L5.5 13.2h5l-1.9 8.3 8.9-11.4h-5.4z"/>',
  heartpulse: '<path d="M12 20.4l-1.35-1.24C6.15 15 3.6 12.75 3.6 9.8 3.6 7.5 5.45 5.65 7.75 5.65c1.35 0 2.65.63 3.45 1.62l.8 1 .8-1c.8-.99 2.1-1.62 3.45-1.62 2.3 0 4.15 1.85 4.15 4.15 0 2.95-2.55 5.2-7.05 9.36L12 20.4z"/><path d="M3.8 11.2h3.4l1.3-2.4 2 4.6 1.5-3 .9 1.6h3.4" fill="none" stroke="var(--nb)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  // Ensemble
  duo: '<circle cx="8.4" cy="8" r="2.8"/><circle cx="15.6" cy="8" r="2.8"/><path d="M3.4 19.4c0-2.9 2.2-4.8 5-4.8s5 1.9 5 4.8z"/><path d="M10.6 19.4c0-2.9 2.2-4.8 5-4.8s5 1.9 5 4.8z" fill="var(--nb)"/>',
  bib: '<rect x="4.5" y="5" width="15" height="14" rx="2.5"/><circle cx="7.2" cy="7.7" r="1"/><circle cx="16.8" cy="7.7" r="1"/><circle cx="7.2" cy="16.3" r="1"/><circle cx="16.8" cy="16.3" r="1"/><path d="M9.2 15.6V9.2h1.5l2.6 4V9.2h1.5v6.4h-1.5l-2.6-4v4z" fill="var(--nb)"/>',
  thumbsup: '<path d="M7 10.5H4.5A1.5 1.5 0 003 12v6.5A1.5 1.5 0 004.5 20H7z"/><path d="M9 10.5l3.4-6.8c.3-.6 1-.9 1.6-.6.8.3 1.2 1.2 1 2L15.4 9h3.8a1.8 1.8 0 011.8 2.2l-1.3 6A1.8 1.8 0 0117.9 20H9z"/>',
}
